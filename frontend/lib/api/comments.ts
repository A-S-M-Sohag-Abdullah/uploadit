import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { ApiResponse, PaginatedResponse, Comment } from '@/types';

export const commentsApi = {
  // Create comment
  createComment: async (data: {
    content: string;
    videoId: string;
    parentCommentId?: string;
  }): Promise<ApiResponse<{ comment: Comment }>> => {
    return apiPost<ApiResponse<{ comment: Comment }>>('/comments', data);
  },

  // Get video comments
  getVideoComments: async (
    videoId: string,
    params?: { page?: number; limit?: number; sort?: string }
  ): Promise<PaginatedResponse<Comment>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const queryString = searchParams.toString();
    return apiGet<PaginatedResponse<Comment>>(
      `/comments/video/${videoId}${queryString ? `?${queryString}` : ''}`
    );
  },

  // Get comment replies
  getReplies: async (
    commentId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Comment>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const queryString = searchParams.toString();
    return apiGet<PaginatedResponse<Comment>>(
      `/comments/${commentId}/replies${queryString ? `?${queryString}` : ''}`
    );
  },

  // Update comment
  updateComment: async (
    id: string,
    content: string
  ): Promise<ApiResponse<{ comment: Comment }>> => {
    return apiPut<ApiResponse<{ comment: Comment }>>(`/comments/${id}`, { content });
  },

  // Delete comment
  deleteComment: async (id: string): Promise<ApiResponse<null>> => {
    return apiDelete<ApiResponse<null>>(`/comments/${id}`);
  },
};