export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail: string;
  videoUrl: string;
  user: User;
  views: number;
  likes: number;
  dislikes: number;
  createdAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  user: User;
  video: string;
  createdAt: string;
}

export interface ChatRoom {
  _id: string;
  name: string;
  password?: string;
  activeUsers: User[];
}

export interface ChatMessage {
  _id: string;
  content: string;
  user: User;
  room: string;
  createdAt: string;
}

export interface LiveStream {
  _id: string;
  title: string;
  description: string;
  user: User;
  isLive: boolean;
  viewers: number;
  streamKey: string;
  playbackUrl: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  type: 'upload' | 'live' | 'comment' | 'like';
  message: string;
  user: User;
  read: boolean;
  createdAt: string;
}