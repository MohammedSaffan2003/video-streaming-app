import React from 'react';
import ReactPlayer from 'react-player';
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import type { Video } from '../types';

interface VideoPlayerProps {
  video: Video;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <ReactPlayer
          url={video.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
          width="100%"
          height="100%"
          controls
          playing
        />
      </div>
      
      <div className="mt-4">
        <h1 className="text-2xl font-bold">{video.title}</h1>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <img
              src={video.creator.avatarUrl}
              alt={video.creator.name}
              className="h-10 w-10 rounded-full"
            />
            <div className="ml-3">
              <p className="font-medium">{video.creator.name}</p>
              <p className="text-sm text-gray-500">
                {video.views.toLocaleString()} views • {video.createdAt}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100">
              <ThumbsUp className="h-5 w-5" />
              <span>Like</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100">
              <MessageCircle className="h-5 w-5" />
              <span>Comment</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100">
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
        
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-800">{video.description}</p>
        </div>
      </div>
    </div>
  );
}