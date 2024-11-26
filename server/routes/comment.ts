import express from 'express';
import { auth } from '../middleware/auth';
import { getComments, createComment } from '../controllers/comment';

const router = express.Router();

router.get('/videos/:videoId/comments', getComments);
router.post('/videos/:videoId/comments', auth, createComment);

export default router;