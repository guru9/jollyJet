import app from "./app";
import config from "./config";
import mongoDBConnection from "./infrastructure/database/mongodb";

//Start server
const startServer = async () => {
    try {
        // Connect to MongoDB first
        await mongoDBConnection.connect();

        app.listen(config.port, () => {
            console.log(`🛫 jollyJet Server is running on port ${config.port}`);
        })
    } catch (error) {
        console.log('Failed to start server', error);
        process.exit(1);
    }
}

startServer()