import config from '@/config';
import { logger, MONGODB_LOG_MESSAGES } from '@/shared';
import mongoose from 'mongoose';

class MongoDBConnection {
  private static instance: MongoDBConnection;
  private isConnected: boolean = false;

  private constructor() {}

  //Get Instance Method (Singleton Pattern)
  public static getInstance(): MongoDBConnection {
    if (!this.instance) {
      this.instance = new MongoDBConnection();
    }
    return this.instance;
  }

  //Connect to MongoDB
  public async connect(): Promise<void> {
    // Guard clause: If MongoDB is disabled, don't attempt connection
    if (config.mongoConfig.disabled) {
      logger.warn(MONGODB_LOG_MESSAGES.CONNECTION_DISABLED);
      return;
    }

    //Guard clause: If already connected, don't connect again
    if (this.isConnected) {
      return; //Exit early
    }

    try {
      let uri = config.mongoConfig.uri;

      // If we have detailed config, prefer constructing the URI for clarity and flexibility
      // This supports the modular configuration style requested:
      // mongodb+srv://${username}:${password}@${cluster}/?authSource=${authSource}
      if (
        config.mongoConfig.username &&
        config.mongoConfig.password &&
        config.mongoConfig.host &&
        !config.mongoConfig.host.includes('localhost')
      ) {
        const protocol = config.mongoConfig.srv ? 'mongodb+srv' : 'mongodb';
        // When using SRV, simple host is enough. For standard, we might need port.
        const host = config.mongoConfig.srv
          ? config.mongoConfig.host
          : `${config.mongoConfig.host}:${config.mongoConfig.port}`;

        uri = `${protocol}://${config.mongoConfig.username}:${config.mongoConfig.password}@${host}/${config.mongoConfig.dbName}?authSource=${config.mongoConfig.authSource}&retryWrites=true&w=majority`;

        if (config.mongoConfig.authMechanism) {
          uri += `&authMechanism=${config.mongoConfig.authMechanism}`;
        }
      }

      const connectOptions: mongoose.ConnectOptions & Record<string, unknown> = {
        dbName: config.mongoConfig.dbName,
        maxPoolSize: config.mongoConfig.maxPoolSize,
        minPoolSize: config.mongoConfig.minPoolSize,
        serverSelectionTimeoutMS: config.mongoConfig.serverSelectionTimeout,
        socketTimeoutMS: config.mongoConfig.socketTimeout,
        connectTimeoutMS: config.mongoConfig.connectionTimeout,
      };

      // If we constructed the URI with credentials in it, 'auth' option is technically redundant
      // but harmless. However, for SRV connections, credentials MUST be in the URI usually.

      if (config.mongoConfig.ssl) {
        connectOptions['tls'] = true;
      }

      if (config.mongoConfig.replicaSet) {
        connectOptions['replicaSet'] = config.mongoConfig.replicaSet;
      }

      await mongoose.connect(uri, connectOptions);

      this.isConnected = true;

      /**
       * Event Listeners
       */

      /**
       * 'error' event - Fires when there's a connection error
       *
       * Example scenarios:
       * - Network issues
       * - MongoDB server crashes
       * - Authentication failures
       */
      mongoose.connection.on('error', (error) => {
        logger.error(
          { err: error },
          MONGODB_LOG_MESSAGES.CONNECTION_ERROR(
            error instanceof Error ? error.message : String(error)
          )
        );
        this.isConnected = false; //update status
      });

      /**
       * 'disconnected' event - Fires when connection is lost
       *
       * Example scenarios:
       * - MongoDB server stops
       * - Network connection lost
       * - Manual disconnect
       */
      mongoose.connection.on('disconnected', () => {
        this.isConnected = false; // Update status
      });

      /**
       * 'reconnected' event - Fires when connection is restored
       *
       * Mongoose automatically tries to reconnect when connection is lost.
       * This event fires when reconnection succeeds.
       */
      mongoose.connection.on('reconnected', () => {
        this.isConnected = true; // Update status
      });
    } catch (error) {
      logger.error(
        { err: error },
        MONGODB_LOG_MESSAGES.CONNECTION_ERROR(
          error instanceof Error ? error.message : String(error)
        )
      );
      throw error;
    }
  }

  //Disconnect from MongoDB
  public async disconnect(): Promise<void> {
    // Guard clause: If MongoDB is disabled, nothing to disconnect
    if (config.mongoConfig.disabled) {
      logger.warn(MONGODB_LOG_MESSAGES.CONNECTION_DISABLED);
      return;
    }

    // Guard clause: If not connected, nothing to disconnect
    if (!this.isConnected) {
      return; // Exit early
    }

    try {
      // Close mongoose connection
      await mongoose.connection.close();
      this.isConnected = false; // Update our status
    } catch (error) {
      logger.info(
        { err: error },
        MONGODB_LOG_MESSAGES.DISCONNECT_ERROR(
          error instanceof Error ? error.message : String(error)
        )
      );
      throw error;
    }
  }

  //Get Connection Status
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export default MongoDBConnection.getInstance();
