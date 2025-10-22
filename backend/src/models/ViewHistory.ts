import mongoose, { Schema } from 'mongoose';
import { IViewHistory } from '../types';

const viewHistorySchema = new Schema<IViewHistory>(
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
    watchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    watchDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: false,
  }
);

// Index for efficient querying
viewHistorySchema.index({ user: 1, watchedAt: -1 });
viewHistorySchema.index({ video: 1, watchedAt: -1 });

export const ViewHistory = mongoose.model<IViewHistory>('ViewHistory', viewHistorySchema);
