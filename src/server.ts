import app from './app';
import config from './config';
import mongoDBConnection from './infrastructure/database/mongodb';

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Closing gracefully...`);
  try {
    await mongoDBConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

//Start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await mongoDBConnection.connect();

    app.listen(config.port, () => {
      console.log(`🛫 jollyJet Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.log('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
