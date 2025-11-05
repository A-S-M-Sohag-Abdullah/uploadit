import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { User } from '../models';
import { generateToken } from '../utils/jwt';
import { ApiResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, channelName, channelDescription } = req.body;

    // Validation
    if (!username || !email || !password || !channelName) {
      ApiResponse.error(res, 'Please provide all required fields', 400);
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      ApiResponse.error(res, `${field} already exists`, 400);
      return;
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      channelName,
      channelDescription,
    });

    // Generate token
    const token = generateToken((user._id as Types.ObjectId).toString());

    ApiResponse.created(res, { user, token }, 'User registered successfully');
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

    // Validation
    if (!email || !password) {
      ApiResponse.error(res, 'Please provide email and password', 400);
      return;
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      ApiResponse.error(res, 'Invalid credentials', 401);
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      ApiResponse.error(res, 'Invalid credentials', 401);
      return;
    }

    // Generate token
    const token = generateToken((user._id as Types.ObjectId).toString());

    // Remove password from response
    const userWithoutPassword = user.toJSON();

    ApiResponse.success(res, { user: userWithoutPassword, token }, 'Login successful');
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
    const user = await User.findById(req.user._id);

    if (!user) {
      ApiResponse.error(res, 'User not found', 404);
      return;
    }

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
    const { username, channelName, channelDescription } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      ApiResponse.error(res, 'User not found', 404);
      return;
    }

    // Update fields
    if (username) user.username = username;
    if (channelName) user.channelName = channelName;
    if (channelDescription !== undefined) user.channelDescription = channelDescription;

    await user.save();

    ApiResponse.success(res, { user }, 'Profile updated successfully');
  } catch (error: any) {
    console.error('Update profile error:', error);
    ApiResponse.error(res, error.message || 'Error updating profile', 500);
  }
};
