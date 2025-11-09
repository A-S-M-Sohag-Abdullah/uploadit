import { Types } from 'mongoose';

/**
 * Base service class with common utility methods
 */
export abstract class BaseService {
  /**
   * Validate MongoDB ObjectId
   */
  protected validateObjectId(id: string, fieldName: string = 'ID'): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid ${fieldName}`);
    }
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: Record<string, any>, fields: string[]): void {
    const missing = fields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Convert to ObjectId safely
   */
  protected toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (typeof id === 'string') {
      return new Types.ObjectId(id);
    }
    return id;
  }

  /**
   * Check if entity exists
   */
  protected ensureExists<T>(entity: T | null, entityName: string): T {
    if (!entity) {
      throw new Error(`${entityName} not found`);
    }
    return entity;
  }

  /**
   * Check authorization
   */
  protected ensureAuthorized(
    ownerId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    message: string = 'Not authorized to perform this action'
  ): void {
    const ownerIdStr = ownerId.toString();
    const userIdStr = userId.toString();

    if (ownerIdStr !== userIdStr) {
      throw new Error(message);
    }
  }
}
