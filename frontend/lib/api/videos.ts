import { apiGet, apiPut, apiDelete, apiPostFormData } from './client';
import type { ApiResponse, PaginatedResponse, Video, VideoUploadData } from '@/types';

export const videosApi = {
  // Upload video
  uploadVideo: async (
    data: VideoUploadData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ video: Video }>> => {
    const formData = new FormData();
    formData.append('video', data.video);
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    if (data.privacy) formData.append('privacy', data.privacy);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));

    return apiPostFormData<ApiResponse<{ video: Video }>>(
      '/videos/upload',
      formData,
      onProgress
    );
  },

  // Get all videos with filters
  getVideos: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sort?: string;
  }): Promise<PaginatedResponse<Video>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const queryString = searchParams.toString();
    return apiGet<PaginatedResponse<Video>>(
      `/videos${queryString ? `?${queryString}` : ''}`
    );
  },

  // Get single video
  getVideo: async (id: string): Promise<ApiResponse<{ video: Video }>> => {
    return apiGet<ApiResponse<{ video: Video }>>(`/videos/${id}`);
  },

  // Update video
  updateVideo: async (
    id: string,
    data: Partial<Video>
  ): Promise<ApiResponse<{ video: Video }>> => {
    return apiPut<ApiResponse<{ video: Video }>>(`/videos/${id}`, data);
  },

  // Delete video
  deleteVideo: async (id: string): Promise<ApiResponse<null>> => {
    return apiDelete<ApiResponse<null>>(`/videos/${id}`);
  },

  // Get user's videos
  getUserVideos: async (
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Video>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const queryString = searchParams.toString();
    return apiGet<PaginatedResponse<Video>>(
      `/videos/user/${userId}${queryString ? `?${queryString}` : ''}`
    );
  },
};