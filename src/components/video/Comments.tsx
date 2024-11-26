import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import type { Comment } from '../../types';
import toast from 'react-hot-toast';

interface CommentsProps {
  videoId: string;
}

export default function Comments({ videoId }: CommentsProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ['comments', videoId],
    queryFn: async () => {
      const { data } = await api.get(`/videos/${videoId}/comments`);
      return data;
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/videos/${videoId}/comments`, { content });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
      setContent('');
      toast.success('Comment added!');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createCommentMutation.mutate();
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      
      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none"
            rows={3}
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Comment
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {comments?.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <img
                src={comment.user.avatar || `https://ui-avatars.com/api/?name=${comment.user.username}`}
                alt={comment.user.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{comment.user.username}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                  </span>
                </div>
                <p className="mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}