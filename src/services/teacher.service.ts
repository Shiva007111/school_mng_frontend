import apiClient from './api';
import type { ApiResponse } from '../types/api.types';
import type { Teacher, CreateTeacherRequest, UpdateTeacherRequest, TeacherFilters } from '../types/teacher.types';

export const teacherService = {
  getTeachers: async (filters?: TeacherFilters): Promise<ApiResponse<Teacher[]>> => {
    const response = await apiClient.get<ApiResponse<Teacher[]>>('/teachers', {
      params: filters,
    });
    return response.data;
  },

  getTeacherById: async (id: string): Promise<ApiResponse<Teacher>> => {
    const response = await apiClient.get<ApiResponse<Teacher>>(`/teachers/${id}`);
    return response.data;
  },

  createTeacher: async (data: CreateTeacherRequest): Promise<ApiResponse<Teacher>> => {
    const response = await apiClient.post<ApiResponse<Teacher>>('/teachers', data);
    return response.data;
  },

  updateTeacher: async (id: string, data: UpdateTeacherRequest): Promise<ApiResponse<Teacher>> => {
    const response = await apiClient.put<ApiResponse<Teacher>>(`/teachers/${id}`, data);
    return response.data;
  },

  deleteTeacher: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/teachers/${id}`);
    return response.data;
  },
};
