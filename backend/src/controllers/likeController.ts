import { Response } from 'express';
import { Types } from 'mongoose';
import { ApiResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { LikeService } from '../services';

const likeService = new LikeService();

/**
 * @desc    Toggle like on a video
 * @route   POST /api/likes/video/:videoId
 * @access  Private
 */
export const toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params;
    const { type } = req.body; // 'like' or 'dislike'
    const userId = (req.user._id as Types.ObjectId).toString();

    const result = await likeService.toggleLike(userId, videoId, type);

    let message = 'Like toggled successfully';
    if (result.action === 'added') {
      message = 'Like added successfully';
      ApiResponse.created(res, result, message);
    } else if (result.action === 'removed') {
      message = 'Like removed successfully';
      ApiResponse.success(res, result, message);
    } else {
      message = 'Like updated successfully';
      ApiResponse.success(res, result, message);
    }
  } catch (error: any) {
    console.error('Toggle like error:', error);
    ApiResponse.error(res, error.message || 'Error toggling like', 500);
  }
};

/**
 * @desc    Get user's like status for a video
 * @route   GET /api/likes/video/:videoId/status
 * @access  Private
 */
export const getLikeStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params;
    const userId = (req.user._id as Types.ObjectId).toString();

    const result = await likeService.getLikeStatus(userId, videoId);

    ApiResponse.success(res, result, 'Like status retrieved successfully');
  } catch (error: any) {
    console.error('Get like status error:', error);
    ApiResponse.error(res, error.message || 'Error getting like status', 500);
  }
};