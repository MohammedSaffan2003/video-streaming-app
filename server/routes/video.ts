import express from 'express';
import { auth } from '../middleware/auth';
import {
  getVideos,
  getVideo,
  createVideo,
  getUploadUrl,
  toggleLike,
} from '../controllers/video';

const router = express.Router();

router.get('/', getVideos);
router.get('/:id', getVideo);
router.post('/', auth, createVideo);
router.post('/upload-url', auth, getUploadUrl);
router.post('/:id/like', auth, toggleLike);

export default router;