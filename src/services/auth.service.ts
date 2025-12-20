import apiClient from './api';
import type { LoginRequest, LoginResponse, User, ApiResponse } from '@/types/api.types';

export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<{ token: string; user: User }> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    // Backend returns: { success, message, data: { token, user } }
    return response.data.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    // Backend returns: { success, data: { user } }
    return response.data.data;
  },

  // Store token
  storeToken: (token: string) => {
    localStorage.setItem('auth_token', token);
  },

  // Clear token
  clearToken: () => {
    localStorage.removeItem('auth_token');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
};
