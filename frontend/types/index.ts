// User Types
export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  channelName: string;
  channelDescription?: string;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
}

// Video Types
export enum VideoPrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
}

export enum VideoStatus {
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export interface Video {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  likes: number;
  dislikes: number;
  privacy: VideoPrivacy;
  status: VideoStatus;
  category?: string;
  tags: string[];
  owner: User;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Comment Types
export interface Comment {
  _id: string;
  content: string;
  video: string;
  user: User;
  parentComment?: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
  replyCount?: number;
}

// Subscription Types
export interface Subscription {
  _id: string;
  subscriber: string;
  channel: User;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    [key: string]: T[] | {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  channelName: string;
  channelDescription?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Upload Types
export interface VideoUploadData {
  video: File;
  thumbnail?: File;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  privacy?: VideoPrivacy;
}