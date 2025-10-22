import mongoose, { Schema } from 'mongoose';
import { ILike, LikeType } from '../types';

const likeSchema = new Schema<ILike>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: [true, 'Video reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(LikeType),
      required: [true, 'Like type is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Ensure one like/dislike per user per video
likeSchema.index({ user: 1, video: 1 }, { unique: true });

export const Like = mongoose.model<ILike>('Like', likeSchema);
