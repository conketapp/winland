/**
 * Auth API Service
 * All authentication-related API calls
 */

import { apiRequest } from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { LoginAdminDto, AuthResponse, User } from '../types/auth.types';

export const authApi = {
  /**
   * Login as Admin
   */
  loginAdmin: async (data: LoginAdminDto): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>({
      method: 'POST',
      url: API_ENDPOINTS.AUTH.LOGIN_ADMIN,
      data,
    });
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<User> => {
    return apiRequest<User>({
      method: 'GET',
      url: API_ENDPOINTS.AUTH.ME,
    });
  },
};

