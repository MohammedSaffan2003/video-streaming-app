import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';
import type { ChatRoom, ChatMessage } from '../types';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

export default function Chat() {
  const { roomId } = useParams();
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: room } = useQuery<ChatRoom>({
    queryKey: ['chatRoom', roomId],
    queryFn: async () => {
      const { data } = await api.get(`/chat/rooms/${roomId}`);
      return data;
    },
  });

  const { data: messages } = useQuery<ChatMessage[]>({
    queryKey: ['chatMessages', roomId],
    queryFn: async () => {
      const { data } = await api.get(`/chat/rooms/${roomId}/messages`);
      return data;
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/chat/rooms/${roomId}/messages`, {
        content: message,
      });
      return data;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chatMessages', roomId] });
    },
  });

  useEffect(() => {
    if (!user || !roomId) return;

    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: {
        token: useAuthStore.getState().token,
      },
    });

    socketRef.current.emit('joinRoom', roomId);

    socketRef.current.on('message', (newMessage: ChatMessage) => {
      queryClient.setQueryData(['chatMessages', roomId], (old: ChatMessage[] = []) => [
        ...old,
        newMessage,
      ]);
    });

    socketRef.current.on('userJoined', (username: string) => {
      toast.success(`${username} joined the chat`);
    });

    socketRef.current.on('userLeft', (username: string) => {
      toast.info(`${username} left the chat`);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveRoom', roomId);
        socketRef.current.disconnect();
      }
    };
  }, [roomId, user, queryClient]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate();
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <h1 className="text-xl font-bold">{room.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {room.activeUsers.length} active users
            </span>
            <div className="flex -space-x-2">
              {room.activeUsers.map((user) => (
                <img
                  key={user._id}
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`}
                  alt={user.username}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                  title={user.username}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          ref={chatContainerRef}
          className="h-[60vh] overflow-y-auto p-4 space-y-4"
        >
          {messages?.map((message) => (
            <div
              key={message._id}
              className={`flex gap-4 ${
                message.user._id === user?._id ? 'flex-row-reverse' : ''
              }`}
            >
              <img
                src={message.user.avatar || `https://ui-avatars.com/api/?name=${message.user.username}`}
                alt={message.user.username}
                className="w-8 h-8 rounded-full"
              />
              <div
                className={`max-w-[70%] ${
                  message.user._id === user?._id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                } rounded-lg p-3`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {message.user.username}
                  </span>
                  <span className="text-xs opacity-75">
                    {formatDistanceToNow(new Date(message.createdAt))} ago
                  </span>
                </div>
                <p>{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
          <div className="flex gap-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}