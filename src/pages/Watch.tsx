import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import Hls from 'hls.js';
import Comments from '../components/video/Comments';
import type { Video } from '../types';
import toast from 'react-hot-toast';

export default function Watch() {
  const { id } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: video, isLoading } = useQuery<Video>({
    queryKey: ['video', id],
    queryFn: async () => {
      const { data } = await api.get(`/videos/${id}`);
      return data;
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/videos/${id}/like`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video', id] });
      toast.success('Video liked!');
    },
  });

  useEffect(() => {
    if (!video?.videoUrl || !videoRef.current) return;

    if (Hls.isSupported()) {
      hlsRef.current = new Hls();
      hlsRef.current.loadSource(video.videoUrl);
      hlsRef.current.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = video.videoUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [video?.videoUrl]);

  if (isLoading || !video) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              playsInline
            />
          </div>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <img
                  src={video.user.avatar || `https://ui-avatars.com/api/?name=${video.user.username}`}
                  alt={video.user.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">{video.user.username}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDistanceToNow(new Date(video.createdAt))} ago
                  </p>
                </div>
              </div>
              
              {user && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => likeMutation.mutate()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ThumbsUp className={`w-5 h-5 ${video.likes.includes(user._id) ? 'text-blue-500' : ''}`} />
                    <span>{video.likes.length}</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ThumbsDown className="w-5 h-5" />
                    <span>{video.dislikes.length}</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="whitespace-pre-wrap">{video.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Comments videoId={video._id} />
        </div>

        <div className="lg:col-span-1">
          {/* Related videos will be implemented later */}
        </div>
      </div>
    </div>
  );
}