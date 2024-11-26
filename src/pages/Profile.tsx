import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Video as VideoIcon, Eye, ThumbsUp } from 'lucide-react';
import type { Video } from '../types';

export default function Profile() {
  const { user } = useAuthStore();

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ['userVideos'],
    queryFn: async () => {
      const { data } = await api.get(`/videos/user/${user?._id}`);
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center gap-6">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}`}
            alt={user?.username}
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{user?.username}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Member since {formatDistanceToNow(new Date(user?.createdAt || ''))} ago
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold">Your Videos</h2>
        {videos?.length === 0 ? (
          <div className="text-center py-12">
            <VideoIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              You haven't uploaded any videos yet
            </p>
            <Link
              to="/upload"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload Your First Video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos?.map((video) => (
              <Link
                key={video._id}
                to={`/watch/${video._id}`}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{video.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{video.likes.length}</span>
                    </div>
                    <span>
                      {formatDistanceToNow(new Date(video.createdAt))} ago
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}