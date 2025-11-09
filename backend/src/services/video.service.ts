import { Types } from 'mongoose';
import { Video } from '../models';
import { IVideo, VideoPrivacy, VideoStatus } from '../types';
import { BaseService } from './base.service';
import { getVideoDuration, generateThumbnail, deleteFile } from '../utils/ffmpeg';
import path from 'path';

interface CreateVideoData {
  title: string;
  description?: string;
  videoFile: Express.Multer.File;
  thumbnailFile?: Express.Multer.File;
  category?: string;
  tags?: string[];
  privacy: VideoPrivacy;
  ownerId: string;
}

interface UpdateVideoData {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  privacy?: VideoPrivacy;
}

interface GetVideosQuery {
  page?: number;
  limit?: number;
  category?: string;
  privacy?: VideoPrivacy;
  status?: VideoStatus;
  ownerId?: string;
}

/**
 * Video Service
 * Handles all video-related business logic
 */
export class VideoService extends BaseService {
  /**
   * Upload and create a new video
   */
  async createVideo(data: CreateVideoData): Promise<IVideo> {
    // Validate required fields
    this.validateRequired(data, ['title', 'videoFile', 'privacy', 'ownerId']);
    this.validateObjectId(data.ownerId, 'Owner ID');

    const videoPath = data.videoFile.path;
    const videoUrl = `/${videoPath.replace(/\\/g, '/')}`;

    // Get video duration
    const duration = await getVideoDuration(videoPath);

    // Handle thumbnail
    let thumbnailUrl: string;
    if (data.thumbnailFile) {
      thumbnailUrl = `/${data.thumbnailFile.path.replace(/\\/g, '/')}`;
    } else {
      // Generate thumbnail from video
      const thumbnailPath = path.join(
        'uploads/thumbnails',
        `thumb-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`
      );
      await generateThumbnail(videoPath, thumbnailPath);
      thumbnailUrl = `/${thumbnailPath.replace(/\\/g, '/')}`;
    }

    // Parse tags if string
    const tags = typeof data.tags === 'string'
      ? JSON.parse(data.tags as string)
      : data.tags || [];

    // Create video document
    const video = await Video.create({
      title: data.title,
      description: data.description,
      videoUrl,
      thumbnailUrl,
      duration,
      owner: data.ownerId,
      category: data.category,
      tags,
      privacy: data.privacy,
      status: VideoStatus.READY,
      publishedAt: data.privacy === VideoPrivacy.PUBLIC ? new Date() : undefined,
    });

    // Populate owner information
    await video.populate('owner', 'username channelName avatar subscriberCount');

    return video;
  }

  /**
   * Get video by ID
   */
  async getVideoById(videoId: string, userId?: string): Promise<IVideo> {
    this.validateObjectId(videoId, 'Video ID');

    const video = await Video.findById(videoId).populate(
      'owner',
      'username channelName avatar subscriberCount'
    );

    this.ensureExists(video, 'Video');

    // Check privacy settings
    if (video!.privacy === VideoPrivacy.PRIVATE) {
      if (!userId || typeof video!.owner === 'object' && video!.owner !== null && '_id' in video!.owner) {
        const ownerId = (video!.owner as any)._id.toString();
        if (ownerId !== userId) {
          throw new Error('This video is private');
        }
      } else if ((video!.owner as Types.ObjectId).toString() !== userId) {
        throw new Error('This video is private');
      }
    }

    return video!;
  }

  /**
   * Get videos with pagination and filters
   */
  async getVideos(query: GetVideosQuery): Promise<{
    videos: IVideo[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { status: VideoStatus.READY };

    if (query.category) {
      filter.category = query.category;
    }

    if (query.privacy) {
      filter.privacy = query.privacy;
    } else {
      // Default to public videos only
      filter.privacy = VideoPrivacy.PUBLIC;
    }

    if (query.ownerId) {
      this.validateObjectId(query.ownerId, 'Owner ID');
      filter.owner = query.ownerId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    // Get total count
    const total = await Video.countDocuments(filter);

    // Get videos
    const videos = await Video.find(filter)
      .populate('owner', 'username channelName avatar subscriberCount')
      .sort({ createdAt: -1 })
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
   * Get trending videos
   */
  async getTrendingVideos(limit: number = 12): Promise<IVideo[]> {
    const videos = await Video.find({
      privacy: VideoPrivacy.PUBLIC,
      status: VideoStatus.READY,
    })
      .populate('owner', 'username channelName avatar subscriberCount')
      .sort({ views: -1, likes: -1 })
      .limit(limit);

    return videos;
  }

  /**
   * Search videos
   */
  async searchVideos(
    query: string,
    page: number = 1,
    limit: number = 12
  ): Promise<{
    videos: IVideo[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
      privacy: VideoPrivacy.PUBLIC,
      status: VideoStatus.READY,
    };

    const total = await Video.countDocuments(filter);

    const videos = await Video.find(filter)
      .populate('owner', 'username channelName avatar subscriberCount')
      .sort({ views: -1, createdAt: -1 })
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
   * Update video
   */
  async updateVideo(
    videoId: string,
    userId: string,
    data: UpdateVideoData,
    thumbnailFile?: Express.Multer.File
  ): Promise<IVideo> {
    this.validateObjectId(videoId, 'Video ID');
    this.validateObjectId(userId, 'User ID');

    const video = await Video.findById(videoId);
    this.ensureExists(video, 'Video');

    // Check ownership
    this.ensureAuthorized(
      video!.owner as Types.ObjectId,
      userId,
      'Not authorized to update this video'
    );

    // Update fields
    if (data.title) video!.title = data.title;
    if (data.description !== undefined) video!.description = data.description;
    if (data.category !== undefined) video!.category = data.category;
    if (data.tags) video!.tags = typeof data.tags === 'string' ? JSON.parse(data.tags as string) : data.tags;

    if (data.privacy) {
      video!.privacy = data.privacy;
      if (data.privacy === VideoPrivacy.PRIVATE) {
        video!.publishedAt = undefined;
      } else if (!video!.publishedAt) {
        video!.publishedAt = new Date();
      }
    }

    // Update thumbnail if provided
    if (thumbnailFile) {
      video!.thumbnailUrl = `/${thumbnailFile.path.replace(/\\/g, '/')}`;
    }

    await video!.save();
    await video!.populate('owner', 'username channelName avatar');

    return video!;
  }

  /**
   * Delete video
   */
  async deleteVideo(videoId: string, userId: string): Promise<void> {
    this.validateObjectId(videoId, 'Video ID');
    this.validateObjectId(userId, 'User ID');

    const video = await Video.findById(videoId);
    this.ensureExists(video, 'Video');

    // Check ownership
    this.ensureAuthorized(
      video!.owner as Types.ObjectId,
      userId,
      'Not authorized to delete this video'
    );

    // Delete files
    const videoPath = video!.videoUrl.substring(1);
    const thumbnailPath = video!.thumbnailUrl.substring(1);
    deleteFile(videoPath);
    deleteFile(thumbnailPath);

    await video!.deleteOne();
  }

  /**
   * Increment video views
   */
  async incrementViews(videoId: string): Promise<void> {
    this.validateObjectId(videoId, 'Video ID');

    await Video.findByIdAndUpdate(videoId, {
      $inc: { views: 1 },
    });
  }

  /**
   * Toggle video like/dislike
   */
  async toggleLike(videoId: string, increment: boolean): Promise<void> {
    this.validateObjectId(videoId, 'Video ID');

    await Video.findByIdAndUpdate(videoId, {
      $inc: { likes: increment ? 1 : -1 },
    });
  }

  /**
   * Toggle video dislike
   */
  async toggleDislike(videoId: string, increment: boolean): Promise<void> {
    this.validateObjectId(videoId, 'Video ID');

    await Video.findByIdAndUpdate(videoId, {
      $inc: { dislikes: increment ? 1 : -1 },
    });
  }
}
