import mongoose from "mongoose";
import config from "../../config";

class MongoDBConnection {
    private static instance: MongoDBConnection
    private isConnected: boolean = false;

    private constructor() { }

    //Get Instance Method (Singleton Pattern)
    public static getInstance(): MongoDBConnection {
        if (!this.instance) {
            this.instance = new MongoDBConnection();
        }
        return this.instance;
    }

    //Connect to MongoDB
    public async connect(): Promise<void> {
        //Guard clause:If already connected, don't connect again
        if (this.isConnected) {
            console.log('MongoDB is already connected');
            return;    //Exit early
        }

        try {
            await mongoose.connect(config.mongoUri, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000
            });

            this.isConnected = true;
            console.log('✅ MongoDB connected successfully');

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
                console.log('MongoDB connection error:', error);
                this.isConnected = false;   //update status
            })

            /**
             * 'disconnected' event - Fires when connection is lost
             * 
             * Example scenarios:
             * - MongoDB server stops
             * - Network connection lost
             * - Manual disconnect
             */
            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected');
                this.isConnected = false; // Update status
            });

            /**
              * 'reconnected' event - Fires when connection is restored
              * 
              * Mongoose automatically tries to reconnect when connection is lost.
              * This event fires when reconnection succeeds.
              */
            mongoose.connection.on('reconnected', () => {
                console.log('MongoDB reconnected');
                this.isConnected = true; // Update status
            });
        } catch (error) {
            console.log('MongoDB connection error', error);
            throw error;
        }
    }

    //Disconnect from MongoDB
    public async disconnect(): Promise<void> {
        // Guard clause: If not connected, nothing to disconnect
        if (!this.isConnected) {
            console.log('MongoDB is not connected');
            return;     // Exit early
        }

        try {
            // Close the mongoose connection
            await mongoose.connection.close();
            this.isConnected = false;       // Update our status
            console.log('MongoDB disconnected');
        } catch (error) {
            console.log('Error closing MongoDB connection:', error);
            throw error;
        }
    }

    //Get Connection Status
    public getConnectionStatus(): boolean {
        return this.isConnected;
    }
}


export default MongoDBConnection.getInstance();
