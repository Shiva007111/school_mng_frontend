import type { User } from './api.types';

export interface Teacher {
  id: string;
  userId: string;
  employeeCode: string | null;
  hireDate: string | null;
  qualification: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: User;
  classSections?: any[]; // Will be typed more specifically when ClassSection types are defined
  teacherSubjects?: any[]; // Will be typed more specifically when Subject types are defined
}

export interface CreateTeacherRequest {
  email: string;
  phone?: string;
  password?: string;
  employeeCode?: string;
  hireDate?: string;
  qualification?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UpdateTeacherRequest {
  email?: string;
  phone?: string;
  employeeCode?: string;
  hireDate?: string;
  qualification?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface TeacherFilters {
  search?: string;
  status?: string;
  userId?: string;
  page?: number;
  limit?: number;
}
