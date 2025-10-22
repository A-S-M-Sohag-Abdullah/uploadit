import { Document } from 'mongoose';

// User Types
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  channelName: string;
  channelDescription?: string;
  subscriberCount: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
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

export interface IVideo extends Document {
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
  owner: IUser['_id'];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Comment Types
export interface IComment extends Document {
  content: string;
  video: IVideo['_id'];
  user: IUser['_id'];
  parentComment?: IComment['_id'];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

// Like Types
export enum LikeType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

export interface ILike extends Document {
  user: IUser['_id'];
  video: IVideo['_id'];
  type: LikeType;
  createdAt: Date;
}

// Subscription Types
export interface ISubscription extends Document {
  subscriber: IUser['_id'];
  channel: IUser['_id'];
  createdAt: Date;
}

// View History Types
export interface IViewHistory extends Document {
  user: IUser['_id'];
  video: IVideo['_id'];
  watchedAt: Date;
  watchDuration: number;
}

// Request Types
export interface AuthRequest extends Express.Request {
  user?: IUser;
}
