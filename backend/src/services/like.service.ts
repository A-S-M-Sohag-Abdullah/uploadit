import { Like } from '../models';
import { ILike, LikeType } from '../types';
import { BaseService } from './base.service';
import { VideoService } from './video.service';

interface ToggleLikeResult {
  action: 'added' | 'removed' | 'switched';
  type: LikeType;
  oldType?: LikeType;
}

interface LikeStatusResult {
  liked: boolean;
  disliked: boolean;
  type: LikeType | null;
}

/**
 * Like Service
 * Handles like/dislike operations for videos
 */
export class LikeService extends BaseService {
  private videoService: VideoService;

  constructor() {
    super();
    this.videoService = new VideoService();
  }

  /**
   * Toggle like/dislike on a video
   */
  async toggleLike(
    userId: string,
    videoId: string,
    type: LikeType
  ): Promise<ToggleLikeResult> {
    this.validateObjectId(userId, 'User ID');
    this.validateObjectId(videoId, 'Video ID');

    // Validate like type
    if (!type || ![LikeType.LIKE, LikeType.DISLIKE].includes(type)) {
      throw new Error('Please provide valid type (like or dislike)');
    }

    // Check if video exists (will throw if not found)
    await this.videoService.getVideoById(videoId);

    // Check if user already liked/disliked this video
    const existingLike = await Like.findOne({
      user: userId,
      video: videoId,
    });

    if (existingLike) {
      // If same type, remove the like/dislike (toggle off)
      if (existingLike.type === type) {
        await existingLike.deleteOne();

        // Update video counts
        if (type === LikeType.LIKE) {
          await this.videoService.toggleLike(videoId, false);
        } else {
          await this.videoService.toggleDislike(videoId, false);
        }

        return { action: 'removed', type };
      } else {
        // If different type, switch like to dislike or vice versa
        const oldType = existingLike.type;
        existingLike.type = type;
        await existingLike.save();

        // Update video counts
        if (type === LikeType.LIKE) {
          await this.videoService.toggleLike(videoId, true);
          await this.videoService.toggleDislike(videoId, false);
        } else {
          await this.videoService.toggleDislike(videoId, true);
          await this.videoService.toggleLike(videoId, false);
        }

        return { action: 'switched', type, oldType };
      }
    }

    // Create new like/dislike
    await Like.create({
      user: userId,
      video: videoId,
      type,
    });

    // Update video counts
    if (type === LikeType.LIKE) {
      await this.videoService.toggleLike(videoId, true);
    } else {
      await this.videoService.toggleDislike(videoId, true);
    }

    return { action: 'added', type };
  }

  /**
   * Get user's like status for a video
   */
  async getLikeStatus(userId: string, videoId: string): Promise<LikeStatusResult> {
    this.validateObjectId(userId, 'User ID');
    this.validateObjectId(videoId, 'Video ID');

    const like = await Like.findOne({
      user: userId,
      video: videoId,
    });

    return {
      liked: like ? like.type === LikeType.LIKE : false,
      disliked: like ? like.type === LikeType.DISLIKE : false,
      type: like?.type || null,
    };
  }

  /**
   * Get all likes by a user
   */
  async getUserLikes(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    likes: ILike[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    this.validateObjectId(userId, 'User ID');

    const skip = (page - 1) * limit;

    const filter = {
      user: userId,
      type: LikeType.LIKE,
    };

    const total = await Like.countDocuments(filter);

    const likes = await Like.find(filter)
      .populate({
        path: 'video',
        select: 'title thumbnailUrl duration views owner',
        populate: {
          path: 'owner',
          select: 'username channelName avatar',
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      likes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Remove all likes for a video (used when video is deleted)
   */
  async removeAllVideoLikes(videoId: string): Promise<void> {
    this.validateObjectId(videoId, 'Video ID');

    await Like.deleteMany({ video: videoId });
  }

  /**
   * Get video like/dislike counts
   */
  async getVideoLikeCounts(videoId: string): Promise<{
    likes: number;
    dislikes: number;
  }> {
    this.validateObjectId(videoId, 'Video ID');

    const [likesCount, dislikesCount] = await Promise.all([
      Like.countDocuments({ video: videoId, type: LikeType.LIKE }),
      Like.countDocuments({ video: videoId, type: LikeType.DISLIKE }),
    ]);

    return {
      likes: likesCount,
      dislikes: dislikesCount,
    };
  }
}
