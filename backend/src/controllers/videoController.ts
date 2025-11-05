import { Response } from 'express';
import { Types } from 'mongoose';
import { Video } from '../models';
import { ApiResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { getVideoDuration, generateThumbnail, deleteFile } from '../utils/ffmpeg';
import { VideoPrivacy, VideoStatus } from '../types';
import path from 'path';

/**
 * @desc    Upload a new video
 * @route   POST /api/videos/upload
 * @access  Private
 */
export const uploadVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, tags, privacy } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || !files.video || !files.video[0]) {
      ApiResponse.error(res, 'Please upload a video file', 400);
      return;
    }

    const videoFile = files.video[0];
    const videoPath = videoFile.path;
    const videoUrl = `/${videoPath.replace(/\\/g, '/')}`;

    // Get video duration
    const duration = await getVideoDuration(videoPath);

    // Generate or use uploaded thumbnail
    let thumbnailUrl = '';
    if (files.thumbnail && files.thumbnail[0]) {
      const thumbnailPath = files.thumbnail[0].path;
      thumbnailUrl = `/${thumbnailPath.replace(/\\/g, '/')}`;
    } else {
      // Auto-generate thumbnail
      const thumbnailFileName = `thumbnail-${Date.now()}.jpg`;
      const thumbnailPath = path.join('uploads', 'thumbnails', thumbnailFileName);
      await generateThumbnail(videoPath, thumbnailPath);
      thumbnailUrl = `/${thumbnailPath.replace(/\\/g, '/')}`;
    }

    // Parse tags if string
    let parsedTags: string[] = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }

    // Create video document
    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      category,
      tags: parsedTags,
      privacy: privacy || VideoPrivacy.PUBLIC,
      status: VideoStatus.READY,
      owner: req.user._id,
      publishedAt: privacy === VideoPrivacy.PRIVATE ? null : new Date(),
    });

    await video.populate('owner', 'username channelName avatar');

    ApiResponse.created(res, { video }, 'Video uploaded successfully');
  } catch (error: any) {
    console.error('Upload video error:', error);
    ApiResponse.error(res, error.message || 'Error uploading video', 500);
  }
};

/**
 * @desc    Get all videos (with filters)
 * @route   GET /api/videos
 * @access  Public
 */
export const getVideos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      sort = '-createdAt',
      privacy,
    } = req.query;

    const query: any = {
      status: VideoStatus.READY,
    };

    // Only show public videos for non-authenticated users
    if (!req.user) {
      query.privacy = VideoPrivacy.PUBLIC;
    } else if (privacy) {
      query.privacy = privacy;
    } else {
      // Authenticated users can see public and unlisted videos
      query.privacy = { $in: [VideoPrivacy.PUBLIC, VideoPrivacy.UNLISTED] };
    }

    // Search filter
    if (search) {
      query.$text = { $search: search as string };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const videos = await Video.find(query)
      .populate('owner', 'username channelName avatar subscriberCount')
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum);

    const total = await Video.countDocuments(query);

    ApiResponse.success(
      res,
      {
        videos,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      'Videos retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get videos error:', error);
    ApiResponse.error(res, error.message || 'Error getting videos', 500);
  }
};

/**
 * @desc    Get single video by ID
 * @route   GET /api/videos/:id
 * @access  Public
 */
export const getVideoById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const video = await Video.findById(req.params.id).populate(
      'owner',
      'username channelName avatar subscriberCount'
    );

    if (!video) {
      ApiResponse.error(res, 'Video not found', 404);
      return;
    }

    // Check privacy settings
    if (video.privacy === VideoPrivacy.PRIVATE) {
      const ownerId = typeof video.owner === 'object' && video.owner !== null && '_id' in video.owner
        ? (video.owner._id as Types.ObjectId).toString()
        : (video.owner as Types.ObjectId).toString();
      if (!req.user || ownerId !== (req.user._id as Types.ObjectId).toString()) {
        ApiResponse.error(res, 'This video is private', 403);
        return;
      }
    }

    // Increment views
    video.views += 1;
    await video.save();

    ApiResponse.success(res, { video }, 'Video retrieved successfully');
  } catch (error: any) {
    console.error('Get video error:', error);
    ApiResponse.error(res, error.message || 'Error getting video', 500);
  }
};

/**
 * @desc    Update video
 * @route   PUT /api/videos/:id
 * @access  Private
 */
export const updateVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      ApiResponse.error(res, 'Video not found', 404);
      return;
    }

    // Check ownership
    if ((video.owner as Types.ObjectId).toString() !== (req.user._id as Types.ObjectId).toString()) {
      ApiResponse.error(res, 'Not authorized to update this video', 403);
      return;
    }

    const { title, description, category, tags, privacy } = req.body;

    // Update fields
    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (category !== undefined) video.category = category;
    if (tags) video.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (privacy) {
      video.privacy = privacy;
      if (privacy === VideoPrivacy.PRIVATE) {
        video.publishedAt = undefined;
      } else if (!video.publishedAt) {
        video.publishedAt = new Date();
      }
    }

    await video.save();
    await video.populate('owner', 'username channelName avatar');

    ApiResponse.success(res, { video }, 'Video updated successfully');
  } catch (error: any) {
    console.error('Update video error:', error);
    ApiResponse.error(res, error.message || 'Error updating video', 500);
  }
};

/**
 * @desc    Delete video
 * @route   DELETE /api/videos/:id
 * @access  Private
 */
export const deleteVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      ApiResponse.error(res, 'Video not found', 404);
      return;
    }

    // Check ownership
    if ((video.owner as Types.ObjectId).toString() !== (req.user._id as Types.ObjectId).toString()) {
      ApiResponse.error(res, 'Not authorized to delete this video', 403);
      return;
    }

    // Delete files
    const videoPath = video.videoUrl.substring(1);
    const thumbnailPath = video.thumbnailUrl.substring(1);
    deleteFile(videoPath);
    deleteFile(thumbnailPath);

    await video.deleteOne();

    ApiResponse.success(res, null, 'Video deleted successfully');
  } catch (error: any) {
    console.error('Delete video error:', error);
    ApiResponse.error(res, error.message || 'Error deleting video', 500);
  }
};

/**
 * @desc    Get user's videos
 * @route   GET /api/videos/user/:userId
 * @access  Public
 */
export const getUserVideos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const query: any = {
      owner: userId,
      status: VideoStatus.READY,
    };

    // Show private videos only to owner
    if (!req.user || req.user._id.toString() !== userId) {
      query.privacy = { $in: [VideoPrivacy.PUBLIC, VideoPrivacy.UNLISTED] };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const videos = await Video.find(query)
      .populate('owner', 'username channelName avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    const total = await Video.countDocuments(query);

    ApiResponse.success(
      res,
      {
        videos,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      'User videos retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get user videos error:', error);
    ApiResponse.error(res, error.message || 'Error getting user videos', 500);
  }
};