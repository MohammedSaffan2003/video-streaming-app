import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth';
import videoRoutes from './routes/videos';

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(config.mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});