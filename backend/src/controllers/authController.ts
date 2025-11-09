import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { ApiResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { AuthService } from '../services';

const authService = new AuthService();

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, channelName, channelDescription } = req.body;

    const result = await authService.register({
      username,
      email,
      password,
      channelName,
      channelDescription,
    });

    ApiResponse.created(res, result, 'User registered successfully');
  } catch (error: any) {
    console.error('Register error:', error);
    ApiResponse.error(res, error.message || 'Error registering user', 500);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    ApiResponse.success(res, result, 'Login successful');
  } catch (error: any) {
    console.error('Login error:', error);
    ApiResponse.error(res, error.message || 'Error logging in', 500);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await authService.getCurrentUser(
      (req.user._id as Types.ObjectId).toString()
    );

    ApiResponse.success(res, { user }, 'User retrieved successfully');
  } catch (error: any) {
    console.error('GetMe error:', error);
    ApiResponse.error(res, error.message || 'Error getting user', 500);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { channelName, channelDescription, avatar } = req.body;

    const user = await authService.updateProfile(
      (req.user._id as Types.ObjectId).toString(),
      { channelName, channelDescription, avatar }
    );

    ApiResponse.success(res, { user }, 'Profile updated successfully');
  } catch (error: any) {
    console.error('Update profile error:', error);
    ApiResponse.error(res, error.message || 'Error updating profile', 500);
  }
};
