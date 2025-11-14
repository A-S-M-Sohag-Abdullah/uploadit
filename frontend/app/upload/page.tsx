'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Upload, X, Film, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MainLayout } from '@/components/layout/main-layout';
import { videosApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { VideoPrivacy } from '@/types';

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    privacy: VideoPrivacy.PUBLIC,
  });

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please sign in to upload videos');
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const uploadMutation = useMutation({
    mutationFn: ({
      data,
      onProgress,
    }: {
      data: {
        video: File;
        thumbnail?: File;
        title: string;
        description?: string;
        category?: string;
        privacy: VideoPrivacy;
        tags?: string[];
      };
      onProgress: (progress: number) => void;
    }) => videosApi.uploadVideo(data, onProgress),
    onSuccess: () => {
      toast.success('Video uploaded successfully!');
      router.push('/');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Upload failed. Please try again.');
      setUploadProgress(0);
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find((file) => file.type.startsWith('video/'));
    if (videoFile) {
      setVideoFile(videoFile);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!formData.title) {
      toast.error('Please provide a title');
      return;
    }

    const tags = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    uploadMutation.mutate({
      data: {
        video: videoFile,
        thumbnail: thumbnailFile || undefined,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags,
        privacy: formData.privacy,
      },
      onProgress: setUploadProgress,
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Video</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Video Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Video File</CardTitle>
                <CardDescription>
                  Upload your video file (MP4, AVI, MOV, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!videoFile ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                      dragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">
                      Drag and drop your video here
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse
                    </p>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      Select Video
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Film className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{videoFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setVideoFile(null)}
                      disabled={uploadMutation.isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Thumbnail Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail (Optional)</CardTitle>
                <CardDescription>
                  Upload a custom thumbnail or one will be generated automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!thumbnailFile ? (
                  <div>
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => thumbnailInputRef.current?.click()}
                      disabled={uploadMutation.isPending}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Select Thumbnail
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ImageIcon className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{thumbnailFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(thumbnailFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setThumbnailFile(null)}
                      disabled={uploadMutation.isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Details */}
            <Card>
              <CardHeader>
                <CardTitle>Video Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter video title..."
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={uploadMutation.isPending}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Tell viewers about your video..."
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={uploadMutation.isPending}
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    placeholder="e.g., Gaming, Education, Music"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={uploadMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="tag1, tag2, tag3"
                    value={formData.tags}
                    onChange={handleInputChange}
                    disabled={uploadMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacy">Privacy</Label>
                  <Select
                    value={formData.privacy}
                    onValueChange={(value: VideoPrivacy) =>
                      setFormData((prev) => ({ ...prev, privacy: value }))
                    }
                    disabled={uploadMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={VideoPrivacy.PUBLIC}>Public</SelectItem>
                      <SelectItem value={VideoPrivacy.UNLISTED}>Unlisted</SelectItem>
                      <SelectItem value={VideoPrivacy.PRIVATE}>Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {uploadMutation.isPending && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={!videoFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
