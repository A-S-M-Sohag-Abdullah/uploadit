import mongoose, { Schema } from 'mongoose';
import { ISubscription } from '../types';

const subscriptionSchema = new Schema<ISubscription>(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Subscriber reference is required'],
      index: true,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Channel reference is required'],
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Ensure one subscription per user per channel
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

// Prevent self-subscription
subscriptionSchema.pre('save', function (next) {
  if (this.subscriber.equals(this.channel)) {
    next(new Error('Cannot subscribe to your own channel'));
  } else {
    next();
  }
});

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
