import dotenv from 'dotenv';
dotenv.config();

export const config = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/streamhub',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  port: process.env.PORT || 5000,
  mongodb: {
    options: {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 50,
      minPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    }
  }
};