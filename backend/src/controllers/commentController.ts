import { Response } from 'express';
import { Types } from 'mongoose';
import { ApiResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { CommentService } from '../services';

const commentService = new CommentService();

/**
 * @desc    Create a comment
 * @route   POST /api/comments
 * @access  Private
 */
export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, videoId, parentCommentId } = req.body;
    const userId = (req.user._id as Types.ObjectId).toString();

    const comment = await commentService.createComment({
      content,
      videoId,
      userId,
      parentCommentId,
    });

    ApiResponse.created(res, { comment }, 'Comment created successfully');
  } catch (error: any) {
    console.error('Create comment error:', error);
    ApiResponse.error(res, error.message || 'Error creating comment', 500);
  }
};

/**
 * @desc    Get comments for a video
 * @route   GET /api/comments/video/:videoId
 * @access  Public
 */
export const getVideoComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const result = await commentService.getVideoComments(videoId, pageNum, limitNum);

    ApiResponse.success(res, result, 'Comments retrieved successfully');
  } catch (error: any) {
    console.error('Get comments error:', error);
    ApiResponse.error(res, error.message || 'Error getting comments', 500);
  }
};

/**
 * @desc    Get replies for a comment
 * @route   GET /api/comments/:commentId/replies
 * @access  Public
 */
export const getCommentReplies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const result = await commentService.getCommentReplies(commentId, pageNum, limitNum);

    ApiResponse.success(res, result, 'Replies retrieved successfully');
  } catch (error: any) {
    console.error('Get replies error:', error);
    ApiResponse.error(res, error.message || 'Error getting replies', 500);
  }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const commentId = req.params.id;
    const userId = (req.user._id as Types.ObjectId).toString();

    await commentService.deleteComment(commentId, userId);

    ApiResponse.success(res, null, 'Comment deleted successfully');
  } catch (error: any) {
    console.error('Delete comment error:', error);
    ApiResponse.error(res, error.message || 'Error deleting comment', 500);
  }
};

/**
 * @desc    Update a comment
 * @route   PUT /api/comments/:id
 * @access  Private
 */
export const updateComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const commentId = req.params.id;
    const userId = (req.user._id as Types.ObjectId).toString();

    const comment = await commentService.updateComment(commentId, userId, { content });

    ApiResponse.success(res, { comment }, 'Comment updated successfully');
  } catch (error: any) {
    console.error('Update comment error:', error);
    ApiResponse.error(res, error.message || 'Error updating comment', 500);
  }
};