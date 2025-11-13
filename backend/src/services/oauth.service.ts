import { Types } from 'mongoose';
import { IUser, AuthProvider } from '../types';
import { generateToken } from '../utils/jwt';
import { BaseService } from './base.service';

interface AuthResponse {
  user: IUser;
  token: string;
}

/**
 * OAuth Service
 * Handles OAuth authentication callbacks and user creation/linking
 */
export class OAuthService extends BaseService {
  /**
   * Handle OAuth callback - create or link user account
   */
  async handleOAuthCallback(user: IUser): Promise<AuthResponse> {
    this.ensureExists(user, 'User');

    // Generate JWT token
    const token = generateToken((user._id as Types.ObjectId).toString());

    return { user, token };
  }

  /**
   * Check if email is already registered with different provider
   */
  async isEmailRegisteredWithDifferentProvider(
    email: string,
    provider: AuthProvider
  ): Promise<boolean> {
    const { User } = await import('../models');

    const existingUser = await User.findOne({
      email,
      authProvider: { $ne: provider },
    });

    return !!existingUser;
  }

  /**
   * Link social account to existing user
   */
  async linkSocialAccount(
    userId: string,
    socialId: string,
    provider: AuthProvider
  ): Promise<IUser> {
    const { User } = await import('../models');

    this.validateObjectId(userId, 'User ID');

    const user = await User.findById(userId);
    this.ensureExists(user, 'User');

    // Check if this social account is already linked to another user
    const existingSocialAccount = await User.findOne({
      socialId,
      authProvider: provider,
      _id: { $ne: userId },
    });

    if (existingSocialAccount) {
      throw new Error('This social account is already linked to another user');
    }

    // Update user with social account info
    user!.socialId = socialId;
    user!.authProvider = provider;
    await user!.save();

    return user!;
  }

  /**
   * Unlink social account from user
   */
  async unlinkSocialAccount(userId: string): Promise<IUser> {
    const { User } = await import('../models');

    this.validateObjectId(userId, 'User ID');

    const user = await User.findById(userId).select('+password');
    this.ensureExists(user, 'User');

    // Ensure user has a password before unlinking social account
    if (!user!.password && user!.authProvider !== 'local') {
      throw new Error(
        'Cannot unlink social account. Please set a password first.'
      );
    }

    // Reset to local auth
    user!.socialId = undefined;
    user!.authProvider = 'local';
    await user!.save();

    return user!;
  }
}
