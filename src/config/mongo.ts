import mongoose from 'mongoose';
import { config } from './env';

export const connectToMongo = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      dbName: config.mongoDbName,
    });
    console.log(`MongoDB connected successfully: ${config.mongoDbName}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
