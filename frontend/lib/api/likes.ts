import { apiGet, apiPost } from './client';
import type { ApiResponse } from '@/types';

export const likesApi = {
  // Toggle like/dislike
  toggleLike: async (
    videoId: string,
    type: 'like' | 'dislike'
  ): Promise<ApiResponse<{ action: string; type: string }>> => {
    return apiPost<ApiResponse<{ action: string; type: string }>>(
      `/likes/video/${videoId}`,
      { type }
    );
  },

  // Get like status
  getLikeStatus: async (
    videoId: string
  ): Promise<ApiResponse<{ liked: boolean; disliked: boolean; type: string | null }>> => {
    return apiGet<
      ApiResponse<{ liked: boolean; disliked: boolean; type: string | null }>
    >(`/likes/video/${videoId}/status`);
  },
};