/**
import dotenv from 'dotenv';

 * Load environment variables
   const result = dotenv.config();

* Debug: Check if .env was loadeds
*
* console.log('Dotenv loaded:', result.error ? 'FAILED' : 'SUCCESS');
* console.log('MONGO_URI from env:', process.env.MONGO_URI);
* console.log('PORT from env:', process.env.PORT);
*/

const config = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/jollyjet',
    env: process.env.NODE_ENV || 'development',
}

export default config
