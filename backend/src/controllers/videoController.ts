import { Response } from 'express';
import { Types } from 'mongoose';
import { ApiResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { VideoPrivacy } from '../types';
import { VideoService } from '../services';

const videoService = new VideoService();

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
    const thumbnailFile = files.thumbnail ? files.thumbnail[0] : undefined;
    const ownerId = (req.user._id as Types.ObjectId).toString();

    const video = await videoService.createVideo({
      title,
      description,
      videoFile,
      thumbnailFile,
      category,
      tags,
      privacy: privacy || VideoPrivacy.PUBLIC,
      ownerId,
    });

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
    const { page = 1, limit = 12, category, privacy } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const result = await videoService.getVideos({
      page: pageNum,
      limit: limitNum,
      category: category as string,
      privacy: privacy as VideoPrivacy,
    });

    ApiResponse.success(res, result, 'Videos retrieved successfully');
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
    const videoId = req.params.id;
    const userId = req.user ? (req.user._id as Types.ObjectId).toString() : undefined;

    const video = await videoService.getVideoById(videoId, userId);

    // Increment views
    await videoService.incrementViews(videoId);

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
    const videoId = req.params.id;
    const userId = (req.user._id as Types.ObjectId).toString();
    const { title, description, category, tags, privacy } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const thumbnailFile = files?.thumbnail ? files.thumbnail[0] : undefined;

    const video = await videoService.updateVideo(
      videoId,
      userId,
      { title, description, category, tags, privacy },
      thumbnailFile
    );

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
    const videoId = req.params.id;
    const userId = (req.user._id as Types.ObjectId).toString();

    await videoService.deleteVideo(videoId, userId);

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

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const result = await videoService.getVideos({
      page: pageNum,
      limit: limitNum,
      ownerId: userId,
    });

    ApiResponse.success(res, result, 'User videos retrieved successfully');
  } catch (error: any) {
    console.error('Get user videos error:', error);
    ApiResponse.error(res, error.message || 'Error getting user videos', 500);
  }
};