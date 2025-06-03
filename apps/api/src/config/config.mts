import dotenv from 'dotenv';

dotenv.config();

export default {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    // Add other configuration settings here
};