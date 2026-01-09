import apiClient from './api';
import type { ApiResponse } from '@/types/api.types';
import type {
  Student,
  StudentFilters,
  CreateStudentRequest,
  UpdateStudentRequest
} from '@/types/student.types';

export const studentService = {
  // Get all students with filtering and pagination
  getStudents: async (filters: StudentFilters = {}): Promise<ApiResponse<Student[]>> => {
    const response = await apiClient.get<ApiResponse<Student[]>>('/students', {
      params: filters,
    });
    return response.data;
  },

  // Get current student profile
  getMe: async (): Promise<ApiResponse<Student>> => {
    const response = await apiClient.get<ApiResponse<Student>>('/students/me');
    return response.data;
  },

  // Get student by ID
  getStudentById: async (id: string): Promise<ApiResponse<Student>> => {
    const response = await apiClient.get<ApiResponse<Student>>(`/students/${id}`);
    return response.data;
  },

  // Create a new student
  createStudent: async (data: CreateStudentRequest): Promise<ApiResponse<Student>> => {
    const response = await apiClient.post<ApiResponse<Student>>('/students', data);
    return response.data;
  },

  // Update student information
  updateStudent: async (id: string, data: UpdateStudentRequest): Promise<ApiResponse<Student>> => {
    const response = await apiClient.put<ApiResponse<Student>>(`/students/${id}`, data);
    return response.data;
  },

  // Delete student (soft delete)
  deleteStudent: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/students/${id}`);
    return response.data;
  },

  // Link parent to student
  linkParent: async (
    studentId: string,
    parentId: string,
    relationship: string
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/students/${studentId}/parents`, {
      parentId,
      relationship,
    });
    return response.data;
  },
};
