import { Response } from 'express';
import { Types } from 'mongoose';
import { ApiResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { SubscriptionService } from '../services';

const subscriptionService = new SubscriptionService();

/**
 * @desc    Toggle subscription to a channel
 * @route   POST /api/subscriptions/:channelId
 * @access  Private
 */
export const toggleSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { channelId } = req.params;
    const subscriberId = (req.user._id as Types.ObjectId).toString();

    const result = await subscriptionService.toggleSubscription(subscriberId, channelId);

    const message = result.subscribed ? 'Subscribed successfully' : 'Unsubscribed successfully';
    ApiResponse.success(res, result, message);
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
    const subscriberId = (req.user._id as Types.ObjectId).toString();

    const subscribed = await subscriptionService.isSubscribed(subscriberId, channelId);

    ApiResponse.success(
      res,
      { subscribed },
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
    const userId = (req.user._id as Types.ObjectId).toString();

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const result = await subscriptionService.getUserSubscriptions(userId, pageNum, limitNum);

    ApiResponse.success(res, result, 'Subscriptions retrieved successfully');
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

    const result = await subscriptionService.getChannelSubscribers(channelId, pageNum, limitNum);

    ApiResponse.success(res, result, 'Subscribers retrieved successfully');
  } catch (error: any) {
    console.error('Get subscribers error:', error);
    ApiResponse.error(res, error.message || 'Error getting subscribers', 500);
  }
};