import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { verifyToken } from '../utils/jwt';
import { ApiResponse } from '../utils/response';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from httpOnly cookie
    const token = req.cookies?.token;

    if (!token) {
      ApiResponse.error(res, 'Not authorized to access this route', 401);
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      ApiResponse.error(res, 'Invalid or expired token', 401);
      return;
    }

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      ApiResponse.error(res, 'User not found', 404);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    ApiResponse.error(res, 'Not authorized to access this route', 401);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from httpOnly cookie
    const token = req.cookies?.token;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};
