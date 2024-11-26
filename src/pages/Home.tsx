import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/axios';
import type { Video } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { Play, ThumbsUp, Eye } from 'lucide-react';

export default function Home() {
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data } = await api.get('/videos');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos?.map((video) => (
        <Link
          key={video._id}
          to={`/watch/${video._id}`}
          className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="relative aspect-video">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <img
                src={video.user.avatar || `https://ui-avatars.com/api/?name=${video.user.username}`}
                alt={video.user.username}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span>{video.user.username}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{video.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                <span>{video.likes.length}</span>
              </div>
              <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}