import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { auth } from '../middleware/auth';
import { config } from '../config';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, config.jwtSecret);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: 'Error creating user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error();
    }
    
    const token = jwt.sign({ userId: user._id }, config.jwtSecret);
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('watchHistory')
      .populate('likedVideos');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

export default router;