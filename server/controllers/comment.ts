import { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { AuthRequest } from '../middleware/auth';

export const getComments = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({ video: req.params.videoId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching comments' });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const comment = new Comment({
      content: req.body.content,
      user: req.user._id,
      video: req.params.videoId,
    });

    await comment.save();
    await comment.populate('user', 'username avatar');
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: 'Error creating comment' });
  }
};