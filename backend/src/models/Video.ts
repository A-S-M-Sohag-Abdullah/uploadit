import mongoose, { Schema } from 'mongoose';
import { IVideo, VideoPrivacy, VideoStatus } from '../types';

const videoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Video duration is required'],
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
      min: 0,
    },
    privacy: {
      type: String,
      enum: Object.values(VideoPrivacy),
      default: VideoPrivacy.PUBLIC,
    },
    status: {
      type: String,
      enum: Object.values(VideoStatus),
      default: VideoStatus.PROCESSING,
    },
    category: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 20,
        message: 'Cannot have more than 20 tags',
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Video owner is required'],
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ views: -1 });
videoSchema.index({ privacy: 1, status: 1 });

export const Video = mongoose.model<IVideo>('Video', videoSchema);
