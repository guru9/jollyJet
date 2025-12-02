import app from "./app";
import config from "./config";


//Start server
const startServer = () => {
    try {
        app.listen(config.port, () => {
            console.log(`🛫 jollyJet Server is running on port ${config.port}`);
        })
    } catch (error) {
        console.log('Failed to start server', error);
    }
}

startServer()