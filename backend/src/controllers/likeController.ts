import { Response } from 'express';
import { Like, Video } from '../models';
import { ApiResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { LikeType } from '../types';

/**
 * @desc    Toggle like on a video
 * @route   POST /api/likes/video/:videoId
 * @access  Private
 */
export const toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params;
    const { type } = req.body; // 'like' or 'dislike'

    if (!type || ![LikeType.LIKE, LikeType.DISLIKE].includes(type)) {
      ApiResponse.error(res, 'Please provide valid type (like or dislike)', 400);
      return;
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      ApiResponse.error(res, 'Video not found', 404);
      return;
    }

    // Check if user already liked/disliked this video
    const existingLike = await Like.findOne({
      user: req.user._id,
      video: videoId,
    });

    if (existingLike) {
      // If same type, remove the like/dislike (toggle off)
      if (existingLike.type === type) {
        await existingLike.deleteOne();

        // Update video counts
        if (type === LikeType.LIKE) {
          video.likes = Math.max(0, video.likes - 1);
        } else {
          video.dislikes = Math.max(0, video.dislikes - 1);
        }
        await video.save();

        ApiResponse.success(res, { action: 'removed', type }, 'Like removed successfully');
        return;
      } else {
        // If different type, switch like to dislike or vice versa
        const oldType = existingLike.type;
        existingLike.type = type;
        await existingLike.save();

        // Update video counts
        if (type === LikeType.LIKE) {
          video.likes += 1;
          video.dislikes = Math.max(0, video.dislikes - 1);
        } else {
          video.dislikes += 1;
          video.likes = Math.max(0, video.likes - 1);
        }
        await video.save();

        ApiResponse.success(
          res,
          { action: 'switched', type, oldType },
          'Like updated successfully'
        );
        return;
      }
    }

    // Create new like/dislike
    await Like.create({
      user: req.user._id,
      video: videoId,
      type,
    });

    // Update video counts
    if (type === LikeType.LIKE) {
      video.likes += 1;
    } else {
      video.dislikes += 1;
    }
    await video.save();

    ApiResponse.created(res, { action: 'added', type }, 'Like added successfully');
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

    const like = await Like.findOne({
      user: req.user._id,
      video: videoId,
    });

    ApiResponse.success(
      res,
      {
        liked: like ? like.type === LikeType.LIKE : false,
        disliked: like ? like.type === LikeType.DISLIKE : false,
        type: like?.type || null,
      },
      'Like status retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get like status error:', error);
    ApiResponse.error(res, error.message || 'Error getting like status', 500);
  }
};