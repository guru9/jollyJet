import dotenv from 'dotenv';

/**
* Debug: Check if .env was loadeds
*
* console.log('Dotenv loaded:', dotenv.config().error ? 'FAILED' : 'SUCCESS');
* console.log('MONGO_URI from env:', process.env.MONGO_URI);
* console.log('PORT from env:', process.env.PORT);
*/

//Load environment variables
dotenv.config();


//Define config
const config = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/jollyjet',
    env: process.env.NODE_ENV || 'development',
}

export default config
