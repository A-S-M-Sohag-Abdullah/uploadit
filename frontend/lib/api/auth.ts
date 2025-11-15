import { apiGet, apiPost, apiPut } from './client';
import type {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from '@/types';

export const authApi = {
  // Register new user
  register: async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    return apiPost<ApiResponse<AuthResponse>>('/auth/register', data);
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    return apiPost<ApiResponse<AuthResponse>>('/auth/login', credentials);
  },

  // Get current user
  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiGet<ApiResponse<{ user: User }>>('/auth/me');
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    return apiPut<ApiResponse<{ user: User }>>('/auth/profile', data);
  },

  // Logout user (clears httpOnly cookie)
  logout: async (): Promise<ApiResponse<null>> => {
    return apiPost<ApiResponse<null>>('/auth/logout');
  },
};