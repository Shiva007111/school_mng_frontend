import apiClient from './api';
import type { ApiResponse } from '@/types/api.types';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  targetRole?: string;
  targetGradeLevelId?: string;
  publishedAt: string;
  expiresAt?: string;
  author?: {
    email: string;
  };
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  priority?: 'low' | 'medium' | 'high';
  targetRole?: string;
  targetGradeLevelId?: string;
  expiresAt?: string;
}

export const announcementService = {
  getAnnouncements: async (params?: { role?: string; gradeLevelId?: string }): Promise<ApiResponse<Announcement[]>> => {
    const response = await apiClient.get<ApiResponse<Announcement[]>>('/announcements', { params });
    return response.data;
  },

  createAnnouncement: async (data: CreateAnnouncementRequest): Promise<ApiResponse<Announcement>> => {
    const response = await apiClient.post<ApiResponse<Announcement>>('/announcements', data);
    return response.data;
  },

  deleteAnnouncement: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete<ApiResponse<any>>(`/announcements/${id}`);
    return response.data;
  },
};
