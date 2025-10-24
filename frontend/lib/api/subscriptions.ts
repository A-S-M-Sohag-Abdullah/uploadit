import { apiGet, apiPost } from './client';
import type { ApiResponse, PaginatedResponse, User } from '@/types';

export const subscriptionsApi = {
  // Toggle subscription
  toggleSubscription: async (
    channelId: string
  ): Promise<ApiResponse<{ subscribed: boolean; subscriberCount: number }>> => {
    return apiPost<ApiResponse<{ subscribed: boolean; subscriberCount: number }>>(
      `/subscriptions/${channelId}`,
      {}
    );
  },

  // Get subscription status
  getSubscriptionStatus: async (
    channelId: string
  ): Promise<ApiResponse<{ subscribed: boolean }>> => {
    return apiGet<ApiResponse<{ subscribed: boolean }>>(
      `/subscriptions/${channelId}/status`
    );
  },

  // Get my subscriptions
  getMySubscriptions: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<User>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const queryString = searchParams.toString();
    return apiGet<PaginatedResponse<User>>(
      `/subscriptions/my-subscriptions${queryString ? `?${queryString}` : ''}`
    );
  },

  // Get channel subscribers
  getChannelSubscribers: async (
    channelId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<User>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const queryString = searchParams.toString();
    return apiGet<PaginatedResponse<User>>(
      `/subscriptions/channel/${channelId}/subscribers${queryString ? `?${queryString}` : ''}`
    );
  },
};