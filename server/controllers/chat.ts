import { Request, Response } from 'express';
import { ChatRoom } from '../models/ChatRoom';
import { ChatMessage } from '../models/ChatMessage';
import { AuthRequest } from '../middleware/auth';

export const getRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await ChatRoom.find().populate('activeUsers', 'username avatar');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat rooms' });
  }
};

export const getRoom = async (req: Request, res: Response) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId)
      .populate('activeUsers', 'username avatar');
    
    if (!room) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat room' });
  }
};

export const getRoomMessages = async (req: Request, res: Response) => {
  try {
    const messages = await ChatMessage.find({ room: req.params.roomId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
};

export const createMessage = async (req: AuthRequest, res: Response) => {
  try {
    const message = new ChatMessage({
      content: req.body.content,
      user: req.user._id,
      room: req.params.roomId,
    });

    await message.save();
    await message.populate('user', 'username avatar');
    
    // Socket.io will handle real-time message broadcast
    req.app.get('io').to(req.params.roomId).emit('message', message);
    
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: 'Error creating message' });
  }
};