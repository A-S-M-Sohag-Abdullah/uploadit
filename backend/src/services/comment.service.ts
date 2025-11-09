import { Types } from 'mongoose';
import { Comment, Video } from '../models';
import { IComment } from '../types';
import { BaseService } from './base.service';

interface CreateCommentData {
  content: string;
  videoId: string;
  userId: string;
  parentCommentId?: string;
}

interface UpdateCommentData {
  content: string;
}

/**
 * Comment Service
 * Handles all comment-related business logic
 */
export class CommentService extends BaseService {
  /**
   * Create a new comment
   */
  async createComment(data: CreateCommentData): Promise<IComment> {
    // Validate required fields
    this.validateRequired(data, ['content', 'videoId', 'userId']);
    this.validateObjectId(data.videoId, 'Video ID');
    this.validateObjectId(data.userId, 'User ID');

    // Check if video exists
    const video = await Video.findById(data.videoId);
    this.ensureExists(video, 'Video');

    // If it's a reply, check if parent comment exists
    if (data.parentCommentId) {
      this.validateObjectId(data.parentCommentId, 'Parent Comment ID');
      const parentComment = await Comment.findById(data.parentCommentId);
      this.ensureExists(parentComment, 'Parent comment');
    }

    // Create comment
    const comment = await Comment.create({
      content: data.content,
      video: data.videoId,
      user: data.userId,
      parentComment: data.parentCommentId,
    });

    // Populate user information
    await comment.populate('user', 'username avatar');

    return comment;
  }

  /**
   * Get comments for a video
   */
  async getVideoComments(
    videoId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    comments: IComment[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    this.validateObjectId(videoId, 'Video ID');

    const skip = (page - 1) * limit;

    // Get only top-level comments (no parent)
    const filter = {
      video: videoId,
      parentComment: null,
    };

    const total = await Comment.countDocuments(filter);

    const comments = await Comment.find(filter)
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get replies for a comment
   */
  async getCommentReplies(
    commentId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    replies: IComment[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    this.validateObjectId(commentId, 'Comment ID');

    const skip = (page - 1) * limit;

    const filter = {
      parentComment: commentId,
    };

    const total = await Comment.countDocuments(filter);

    const replies = await Comment.find(filter)
      .populate('user', 'username avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    return {
      replies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update a comment
   */
  async updateComment(
    commentId: string,
    userId: string,
    data: UpdateCommentData
  ): Promise<IComment> {
    this.validateObjectId(commentId, 'Comment ID');
    this.validateObjectId(userId, 'User ID');
    this.validateRequired(data, ['content']);

    const comment = await Comment.findById(commentId);
    this.ensureExists(comment, 'Comment');

    // Check ownership
    this.ensureAuthorized(
      comment!.user as Types.ObjectId,
      userId,
      'Not authorized to update this comment'
    );

    comment!.content = data.content;
    await comment!.save();
    await comment!.populate('user', 'username avatar');

    return comment!;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    this.validateObjectId(commentId, 'Comment ID');
    this.validateObjectId(userId, 'User ID');

    const comment = await Comment.findById(commentId);
    this.ensureExists(comment, 'Comment');

    // Check ownership
    this.ensureAuthorized(
      comment!.user as Types.ObjectId,
      userId,
      'Not authorized to delete this comment'
    );

    // Delete comment and its replies
    await Comment.deleteMany({ parentComment: comment!._id });
    await comment!.deleteOne();
  }

  /**
   * Like a comment
   */
  async likeComment(commentId: string): Promise<void> {
    this.validateObjectId(commentId, 'Comment ID');

    await Comment.findByIdAndUpdate(commentId, {
      $inc: { likes: 1 },
    });
  }

  /**
   * Unlike a comment
   */
  async unlikeComment(commentId: string): Promise<void> {
    this.validateObjectId(commentId, 'Comment ID');

    await Comment.findByIdAndUpdate(commentId, {
      $inc: { likes: -1 },
    });
  }

  /**
   * Get comment by ID
   */
  async getCommentById(commentId: string): Promise<IComment> {
    this.validateObjectId(commentId, 'Comment ID');

    const comment = await Comment.findById(commentId).populate('user', 'username avatar');
    return this.ensureExists(comment, 'Comment');
  }

  /**
   * Get total comments count for a video
   */
  async getVideoCommentsCount(videoId: string): Promise<number> {
    this.validateObjectId(videoId, 'Video ID');

    return await Comment.countDocuments({ video: videoId });
  }
}
