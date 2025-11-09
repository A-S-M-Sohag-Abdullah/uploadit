import { Subscription, Video } from '../models';
import { ISubscription, IUser, IVideo } from '../types';
import { BaseService } from './base.service';
import { UserService } from './user.service';

/**
 * Subscription Service
 * Handles subscription-related business logic
 */
export class SubscriptionService extends BaseService {
  private userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  /**
   * Subscribe to a channel
   */
  async subscribe(subscriberId: string, channelId: string): Promise<ISubscription> {
    this.validateObjectId(subscriberId, 'Subscriber ID');
    this.validateObjectId(channelId, 'Channel ID');

    // Check if trying to subscribe to own channel
    if (subscriberId === channelId) {
      throw new Error('Cannot subscribe to your own channel');
    }

    // Check if channel exists
    await this.userService.getUserById(channelId);

    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({
      subscriber: subscriberId,
      channel: channelId,
    });

    if (existingSubscription) {
      throw new Error('Already subscribed to this channel');
    }

    // Create subscription
    const subscription = await Subscription.create({
      subscriber: subscriberId,
      channel: channelId,
    });

    // Increment subscriber count
    await this.userService.incrementSubscriberCount(channelId);

    return subscription;
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(subscriberId: string, channelId: string): Promise<void> {
    this.validateObjectId(subscriberId, 'Subscriber ID');
    this.validateObjectId(channelId, 'Channel ID');

    const subscription = await Subscription.findOne({
      subscriber: subscriberId,
      channel: channelId,
    });

    this.ensureExists(subscription, 'Subscription');

    await subscription!.deleteOne();

    // Decrement subscriber count
    await this.userService.decrementSubscriberCount(channelId);
  }

  /**
   * Check if user is subscribed to a channel
   */
  async isSubscribed(subscriberId: string, channelId: string): Promise<boolean> {
    this.validateObjectId(subscriberId, 'Subscriber ID');
    this.validateObjectId(channelId, 'Channel ID');

    const subscription = await Subscription.findOne({
      subscriber: subscriberId,
      channel: channelId,
    });

    return !!subscription;
  }

  /**
   * Get user's subscriptions
   */
  async getUserSubscriptions(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    subscriptions: IUser[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    this.validateObjectId(userId, 'User ID');

    const skip = (page - 1) * limit;

    const total = await Subscription.countDocuments({ subscriber: userId });

    const subscriptions = await Subscription.find({ subscriber: userId })
      .populate('channel', 'username channelName avatar subscriberCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const channels = subscriptions.map(sub => sub.channel) as IUser[];

    return {
      subscriptions: channels,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get channel's subscribers
   */
  async getChannelSubscribers(
    channelId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    subscribers: IUser[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    this.validateObjectId(channelId, 'Channel ID');

    const skip = (page - 1) * limit;

    const total = await Subscription.countDocuments({ channel: channelId });

    const subscriptions = await Subscription.find({ channel: channelId })
      .populate('subscriber', 'username channelName avatar subscriberCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const subscribers = subscriptions.map(sub => sub.subscriber) as IUser[];

    return {
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get subscribed channels' videos (subscription feed)
   */
  async getSubscriptionFeed(
    userId: string,
    page: number = 1,
    limit: number = 12
  ): Promise<{
    videos: IVideo[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    this.validateObjectId(userId, 'User ID');

    const skip = (page - 1) * limit;

    // Get user's subscribed channel IDs
    const subscriptions = await Subscription.find({ subscriber: userId }).select('channel');
    const channelIds = subscriptions.map(sub => sub.channel);

    if (channelIds.length === 0) {
      return {
        videos: [],
        pagination: { page, limit, total: 0, pages: 0 },
      };
    }

    // Get videos from subscribed channels
    const filter = {
      owner: { $in: channelIds },
      privacy: 'public',
      status: 'ready',
    };

    const total = await Video.countDocuments(filter);

    const videos = await Video.find(filter)
      .populate('owner', 'username channelName avatar subscriberCount')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats(userId: string): Promise<{
    totalSubscriptions: number;
    totalSubscribers: number;
  }> {
    this.validateObjectId(userId, 'User ID');

    const [totalSubscriptions, totalSubscribers] = await Promise.all([
      Subscription.countDocuments({ subscriber: userId }),
      Subscription.countDocuments({ channel: userId }),
    ]);

    return {
      totalSubscriptions,
      totalSubscribers,
    };
  }

  /**
   * Toggle subscription (subscribe if not subscribed, unsubscribe if subscribed)
   */
  async toggleSubscription(
    subscriberId: string,
    channelId: string
  ): Promise<{ subscribed: boolean }> {
    const isSubscribed = await this.isSubscribed(subscriberId, channelId);

    if (isSubscribed) {
      await this.unsubscribe(subscriberId, channelId);
      return { subscribed: false };
    } else {
      await this.subscribe(subscriberId, channelId);
      return { subscribed: true };
    }
  }
}
