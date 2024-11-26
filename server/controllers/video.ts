import { Request, Response } from 'express';
import { Video } from '../models/Video';
import { AuthRequest } from '../middleware/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const getVideos = async (req: Request, res: Response) => {
  try {
    const videos = await Video.find()
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching videos' });
  }
};

export const getVideo = async (req: Request, res: Response) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('user', 'username avatar');
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    video.views += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching video' });
  }
};

export const createVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, tags, thumbnail, videoUrl } = req.body;

    const video = new Video({
      title,
      description,
      tags,
      thumbnail,
      videoUrl,
      user: req.user._id,
    });

    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(400).json({ error: 'Error creating video' });
  }
};

export const getUploadUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { fileType, fileName } = req.body;
    const key = `${req.user._id}/${Date.now()}-${fileName}`;

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Conditions: [
        ['content-length-range', 0, 104857600], // up to 100 MB
        ['starts-with', '$Content-Type', fileType],
      ],
      Expires: 600,
    });

    res.json({ url, fields, key });
  } catch (error) {
    res.status(500).json({ error: 'Error generating upload URL' });
  }
};

export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const userId = req.user._id;
    const likeIndex = video.likes.indexOf(userId);
    const dislikeIndex = video.dislikes.indexOf(userId);

    if (likeIndex === -1) {
      video.likes.push(userId);
      if (dislikeIndex !== -1) {
        video.dislikes.splice(dislikeIndex, 1);
      }
    } else {
      video.likes.splice(likeIndex, 1);
    }

    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: 'Error updating video' });
  }
};