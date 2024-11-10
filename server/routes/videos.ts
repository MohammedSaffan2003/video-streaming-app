import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Video from '../models/Video';
import User from '../models/User';
import { auth } from '../middleware/auth';
import { config } from '../config';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

cloudinary.config(config.cloudinary);

router.post('/', auth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const videoUpload = await cloudinary.uploader.upload(files.video[0].path, {
      resource_type: 'video'
    });
    
    const thumbnailUpload = await cloudinary.uploader.upload(files.thumbnail[0].path);

    const video = new Video({
      title,
      description,
      videoUrl: videoUpload.secure_url,
      thumbnailUrl: thumbnailUpload.secure_url,
      creator: req.user.userId,
      tags: tags ? tags.split(',') : [],
      duration: videoUpload.duration
    });

    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(400).json({ message: 'Error uploading video' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    let query = {};
    
    if (search) {
      query = { $text: { $search: search as string } };
    }
    
    const videos = await Video.find(query)
      .populate('creator', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
      
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('creator', 'username avatarUrl');
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    video.views += 1;
    await video.save();
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching video' });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const likeIndex = video.likes.indexOf(req.user.userId);
    if (likeIndex === -1) {
      video.likes.push(req.user.userId);
      user.likedVideos.push(video._id);
    } else {
      video.likes.splice(likeIndex, 1);
      user.likedVideos = user.likedVideos.filter(id => id.toString() !== video._id.toString());
    }

    await Promise.all([video.save(), user.save()]);
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Error liking video' });
  }
});

export default router;