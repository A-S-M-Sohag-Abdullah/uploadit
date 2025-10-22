import { Response } from 'express';
import { Subscription, User } from '../models';
import { ApiResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

/**
 * @desc    Toggle subscription to a channel
 * @route   POST /api/subscriptions/:channelId
 * @access  Private
 */
export const toggleSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { channelId } = req.params;

    // Check if channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
      ApiResponse.error(res, 'Channel not found', 404);
      return;
    }

    // Prevent self-subscription
    if (channelId === req.user._id.toString()) {
      ApiResponse.error(res, 'Cannot subscribe to your own channel', 400);
      return;
    }

    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({
      subscriber: req.user._id,
      channel: channelId,
    });

    if (existingSubscription) {
      // Unsubscribe
      await existingSubscription.deleteOne();

      // Decrement subscriber count
      channel.subscriberCount = Math.max(0, channel.subscriberCount - 1);
      await channel.save();

      ApiResponse.success(
        res,
        { subscribed: false, subscriberCount: channel.subscriberCount },
        'Unsubscribed successfully'
      );
    } else {
      // Subscribe
      await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
      });

      // Increment subscriber count
      channel.subscriberCount += 1;
      await channel.save();

      ApiResponse.created(
        res,
        { subscribed: true, subscriberCount: channel.subscriberCount },
        'Subscribed successfully'
      );
    }
  } catch (error: any) {
    console.error('Toggle subscription error:', error);
    ApiResponse.error(res, error.message || 'Error toggling subscription', 500);
  }
};

/**
 * @desc    Check subscription status
 * @route   GET /api/subscriptions/:channelId/status
 * @access  Private
 */
export const getSubscriptionStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { channelId } = req.params;

    const subscription = await Subscription.findOne({
      subscriber: req.user._id,
      channel: channelId,
    });

    ApiResponse.success(
      res,
      { subscribed: !!subscription },
      'Subscription status retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get subscription status error:', error);
    ApiResponse.error(res, error.message || 'Error getting subscription status', 500);
  }
};

/**
 * @desc    Get user's subscriptions
 * @route   GET /api/subscriptions/my-subscriptions
 * @access  Private
 */
export const getMySubscriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const subscriptions = await Subscription.find({
      subscriber: req.user._id,
    })
      .populate('channel', 'username channelName avatar subscriberCount')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    const total = await Subscription.countDocuments({
      subscriber: req.user._id,
    });

    ApiResponse.success(
      res,
      {
        subscriptions: subscriptions.map((sub) => sub.channel),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      'Subscriptions retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get subscriptions error:', error);
    ApiResponse.error(res, error.message || 'Error getting subscriptions', 500);
  }
};

/**
 * @desc    Get channel's subscribers
 * @route   GET /api/subscriptions/channel/:channelId/subscribers
 * @access  Public
 */
export const getChannelSubscribers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const subscribers = await Subscription.find({
      channel: channelId,
    })
      .populate('subscriber', 'username avatar channelName')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    const total = await Subscription.countDocuments({
      channel: channelId,
    });

    ApiResponse.success(
      res,
      {
        subscribers: subscribers.map((sub) => sub.subscriber),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      'Subscribers retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get subscribers error:', error);
    ApiResponse.error(res, error.message || 'Error getting subscribers', 500);
  }
};