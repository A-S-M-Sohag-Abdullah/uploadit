import { Types } from 'mongoose';
import { User } from '../models';
import { IUser } from '../types';
import { generateToken } from '../utils/jwt';
import { BaseService } from './base.service';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  channelName: string;
  channelDescription?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: IUser;
  token: string;
}

/**
 * Authentication Service
 * Handles user registration, login, and authentication logic
 */
export class AuthService extends BaseService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // Validate required fields
    this.validateRequired(data, ['username', 'email', 'password', 'channelName']);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });

    if (existingUser) {
      const field = existingUser.email === data.email ? 'Email' : 'Username';
      throw new Error(`${field} already exists`);
    }

    // Create new user
    const user = await User.create({
      username: data.username,
      email: data.email,
      password: data.password,
      channelName: data.channelName,
      channelDescription: data.channelDescription,
    });

    // Generate token
    const token = generateToken((user._id as Types.ObjectId).toString());

    return { user, token };
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    // Validate required fields
    this.validateRequired(data, ['email', 'password']);

    // Find user with password field
    const user = await User.findOne({ email: data.email }).select('+password');

    // Check if user exists
    this.ensureExists(user, 'User');

    // Check password
    const isPasswordValid = await user!.comparePassword(data.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken((user!._id as Types.ObjectId).toString());

    // Remove password from response
    const userObject = user!.toObject();
    // Remove password from the object
    delete (userObject as any).password;

    return { user: userObject, token };
  }

  /**
   * Get current user by ID
   */
  async getCurrentUser(userId: string): Promise<IUser> {
    this.validateObjectId(userId, 'User ID');

    const user = await User.findById(userId);
    return this.ensureExists(user, 'User');
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: Partial<Pick<IUser, 'channelName' | 'channelDescription' | 'avatar'>>
  ): Promise<IUser> {
    this.validateObjectId(userId, 'User ID');

    const user = await User.findById(userId);
    this.ensureExists(user, 'User');

    // Update fields
    if (data.channelName !== undefined) user!.channelName = data.channelName;
    if (data.channelDescription !== undefined) user!.channelDescription = data.channelDescription;
    if (data.avatar !== undefined) user!.avatar = data.avatar;

    await user!.save();

    return user!;
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    this.validateObjectId(userId, 'User ID');
    this.validateRequired({ currentPassword, newPassword }, ['currentPassword', 'newPassword']);

    const user = await User.findById(userId).select('+password');
    this.ensureExists(user, 'User');

    // Verify current password
    const isPasswordValid = await user!.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user!.password = newPassword;
    await user!.save();
  }
}
