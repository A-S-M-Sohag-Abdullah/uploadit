import { Response } from 'express';
import { Comment, Video } from '../models';
import { ApiResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

/**
 * @desc    Create a comment
 * @route   POST /api/comments
 * @access  Private
 */
export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, videoId, parentCommentId } = req.body;

    if (!content || !videoId) {
      ApiResponse.error(res, 'Please provide content and videoId', 400);
      return;
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      ApiResponse.error(res, 'Video not found', 404);
      return;
    }

    // If replying to a comment, check if parent exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        ApiResponse.error(res, 'Parent comment not found', 404);
        return;
      }
    }

    const comment = await Comment.create({
      content,
      video: videoId,
      user: req.user._id,
      parentComment: parentCommentId || null,
    });

    await comment.populate('user', 'username avatar');

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
    const { page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get top-level comments (not replies)
    const comments = await Comment.find({
      video: videoId,
      parentComment: null,
    })
      .populate('user', 'username avatar')
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum);

    // Get reply counts for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replyCount = await Comment.countDocuments({
          parentComment: comment._id,
        });
        return {
          ...comment.toObject(),
          replyCount,
        };
      })
    );

    const total = await Comment.countDocuments({
      video: videoId,
      parentComment: null,
    });

    ApiResponse.success(
      res,
      {
        comments: commentsWithReplies,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      'Comments retrieved successfully'
    );
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
    const skip = (pageNum - 1) * limitNum;

    const replies = await Comment.find({
      parentComment: commentId,
    })
      .populate('user', 'username avatar')
      .sort('createdAt')
      .skip(skip)
      .limit(limitNum);

    const total = await Comment.countDocuments({
      parentComment: commentId,
    });

    ApiResponse.success(
      res,
      {
        replies,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      'Replies retrieved successfully'
    );
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
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      ApiResponse.error(res, 'Comment not found', 404);
      return;
    }

    // Check ownership
    if (comment.user.toString() !== req.user._id.toString()) {
      ApiResponse.error(res, 'Not authorized to delete this comment', 403);
      return;
    }

    // Delete comment and its replies
    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

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

    if (!content) {
      ApiResponse.error(res, 'Please provide content', 400);
      return;
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      ApiResponse.error(res, 'Comment not found', 404);
      return;
    }

    // Check ownership
    if (comment.user.toString() !== req.user._id.toString()) {
      ApiResponse.error(res, 'Not authorized to update this comment', 403);
      return;
    }

    comment.content = content;
    await comment.save();
    await comment.populate('user', 'username avatar');

    ApiResponse.success(res, { comment }, 'Comment updated successfully');
  } catch (error: any) {
    console.error('Update comment error:', error);
    ApiResponse.error(res, error.message || 'Error updating comment', 500);
  }
};