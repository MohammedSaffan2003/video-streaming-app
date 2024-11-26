import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { Video, Users } from 'lucide-react';
import type { LiveStream } from '../types';
import toast from 'react-hot-toast';

export default function Live() {
  const { user } = useAuthStore();
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');

  const { data: stream } = useQuery<LiveStream>({
    queryKey: ['userStream'],
    queryFn: async () => {
      const { data } = await api.get('/streams/user');
      return data;
    },
  });

  const startStreamMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/streams', {
        title: streamTitle,
        description: streamDescription,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Stream started successfully!');
    },
  });

  const endStreamMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/streams/end');
      return data;
    },
    onSuccess: () => {
      toast.success('Stream ended');
    },
  });

  const handleStartStream = (e: React.FormEvent) => {
    e.preventDefault();
    startStreamMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {stream?.isLive ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{stream.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {stream.description}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{stream.viewers} viewers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>LIVE</span>
              </div>
            </div>
          </div>

          <div className="aspect-video bg-black rounded-lg mb-6">
            {/* Video player will be implemented here */}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="font-semibold mb-2">Stream Key</h2>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={stream.streamKey}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(stream.streamKey);
                    toast.success('Stream key copied to clipboard');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>

            <button
              onClick={() => endStreamMutation.mutate()}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              End Stream
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Start Streaming</h1>

          <form onSubmit={handleStartStream} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Stream Title
              </label>
              <input
                type="text"
                id="title"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={streamDescription}
                onChange={(e) => setStreamDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                rows={4}
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Streaming
            </button>
          </form>
        </div>
      )}
    </div>
  );
}