import express from 'express';
import { auth } from '../middleware/auth';
import {
  getRooms,
  getRoom,
  getRoomMessages,
  createMessage,
} from '../controllers/chat';

const router = express.Router();

router.get('/rooms', getRooms);
router.get('/rooms/:roomId', auth, getRoom);
router.get('/rooms/:roomId/messages', auth, getRoomMessages);
router.post('/rooms/:roomId/messages', auth, createMessage);

export default router;