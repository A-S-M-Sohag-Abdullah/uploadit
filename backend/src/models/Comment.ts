import mongoose, { Schema } from 'mongoose';
import { IComment } from '../types';

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: [true, 'Video reference is required'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching comments efficiently
commentSchema.index({ video: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: -1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
