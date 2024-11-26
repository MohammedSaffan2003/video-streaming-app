import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { Upload as UploadIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Upload() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !thumbnail) throw new Error('Please select a video and thumbnail');

      setUploading(true);
      try {
        // Get presigned URL for video upload
        const { data: videoUploadData } = await api.post('/videos/upload-url', {
          fileType: file.type,
          fileName: file.name,
        });

        // Upload video to S3
        const formData = new FormData();
        Object.entries(videoUploadData.fields).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
        formData.append('file', file);

        await fetch(videoUploadData.url, {
          method: 'POST',
          body: formData,
        });

        // Get presigned URL for thumbnail upload
        const { data: thumbnailUploadData } = await api.post('/videos/upload-url', {
          fileType: thumbnail.type,
          fileName: thumbnail.name,
        });

        // Upload thumbnail to S3
        const thumbnailFormData = new FormData();
        Object.entries(thumbnailUploadData.fields).forEach(([key, value]) => {
          thumbnailFormData.append(key, value as string);
        });
        thumbnailFormData.append('file', thumbnail);

        await fetch(thumbnailUploadData.url, {
          method: 'POST',
          body: thumbnailFormData,
        });

        // Create video record
        const { data } = await api.post('/videos', {
          title: formData.title,
          description: formData.description,
          tags: formData.tags.split(',').map(tag => tag.trim()),
          videoUrl: `https://${process.env.VITE_AWS_BUCKET_NAME}.s3.${process.env.VITE_AWS_REGION}.amazonaws.com/${videoUploadData.key}`,
          thumbnail: `https://${process.env.VITE_AWS_BUCKET_NAME}.s3.${process.env.VITE_AWS_REGION}.amazonaws.com/${thumbnailUploadData.key}`,
        });

        return data;
      } finally {
        setUploading(false);
      }
    },
    onSuccess: (data) => {
      toast.success('Video uploaded successfully!');
      navigate(`/watch/${data._id}`);
    },
    onError: () => {
      toast.error('Failed to upload video');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Video</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <UploadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {file ? file.name : 'Click to upload video'}
            </p>
          </div>

          <div
            onClick={() => thumbnailInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400"
          >
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
              className="hidden"
            />
            {thumbnail ? (
              <img
                src={URL.createObjectURL(thumbnail)}
                alt="Thumbnail preview"
                className="max-h-40 mx-auto"
              />
            ) : (
              <>
                <UploadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload thumbnail
                </p>
              </>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            rows={4}
            required
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            placeholder="gaming, tutorial, vlog"
          />
        </div>

        <button
          type="submit"
          disabled={uploading || !file || !thumbnail}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
}