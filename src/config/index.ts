import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/jollyjet',
    env: process.env.NODE_ENV || 'development',
}

export default config
