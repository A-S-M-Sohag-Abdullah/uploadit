import { User } from '../models';
import { IUser } from '../types';
import { BaseService } from './base.service';

/**
 * User Service
 * Handles user-related operations
 */
export class UserService extends BaseService {
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUser> {
    this.validateObjectId(userId, 'User ID');

    const user = await User.findById(userId);
    return this.ensureExists(user, 'User');
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<IUser> {
    const user = await User.findOne({ username });
    return this.ensureExists(user, 'User');
  }

  /**
   * Search users by query
   */
  async searchUsers(query: string, limit: number = 10): Promise<IUser[]> {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { channelName: { $regex: query, $options: 'i' } },
      ],
    })
      .limit(limit)
      .select('username channelName avatar subscriberCount');

    return users;
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<IUser> {
    this.validateObjectId(userId, 'User ID');

    const user = await User.findById(userId);
    this.ensureExists(user, 'User');

    user!.avatar = avatarUrl;
    await user!.save();

    return user!;
  }

  /**
   * Increment subscriber count
   */
  async incrementSubscriberCount(channelId: string): Promise<void> {
    this.validateObjectId(channelId, 'Channel ID');

    await User.findByIdAndUpdate(channelId, {
      $inc: { subscriberCount: 1 },
    });
  }

  /**
   * Decrement subscriber count
   */
  async decrementSubscriberCount(channelId: string): Promise<void> {
    this.validateObjectId(channelId, 'Channel ID');

    await User.findByIdAndUpdate(channelId, {
      $inc: { subscriberCount: -1 },
    });
  }

  /**
   * Get channel statistics
   */
  async getChannelStats(channelId: string): Promise<{
    subscriberCount: number;
    totalViews: number;
    totalVideos: number;
  }> {
    this.validateObjectId(channelId, 'Channel ID');

    const user = await User.findById(channelId);
    this.ensureExists(user, 'Channel');

    // These would be aggregated from Video model in a real scenario
    // For now, returning basic stats
    return {
      subscriberCount: user!.subscriberCount,
      totalViews: 0, // TODO: Aggregate from videos
      totalVideos: 0, // TODO: Count from videos
    };
  }
}
