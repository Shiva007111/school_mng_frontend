import apiClient from './api';
import type { ApiResponse } from '../types/api.types';
import type { 
  GradeLevel, 
  Subject, 
  ClassSection, 
  ClassSubject,
  ClassRoom,
  Enrollment,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  CreateClassSectionRequest,
  UpdateClassSectionRequest,
  AssignSubjectToClassRequest,
  UpdateClassSubjectRequest,
  TimetablePeriod,
  CreateTimetablePeriodRequest,
  UpdateTimetablePeriodRequest
} from '../types/academic.types';

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export const academicService = {
  // Grade Levels
  getGradeLevels: async (): Promise<ApiResponse<GradeLevel[]>> => {
    const response = await apiClient.get<ApiResponse<GradeLevel[]>>('/grade-levels');
    return response.data;
  },

  // Academic Years
  getAcademicYears: async (): Promise<ApiResponse<AcademicYear[]>> => {
    const response = await apiClient.get<ApiResponse<AcademicYear[]>>('/academic-years');
    return response.data;
  },

  getCurrentAcademicYear: async (): Promise<ApiResponse<AcademicYear>> => {
    const response = await apiClient.get<ApiResponse<AcademicYear>>('/academic-years/current');
    return response.data;
  },

  // Subjects
  getSubjects: async (): Promise<ApiResponse<Subject[]>> => {
    const response = await apiClient.get<ApiResponse<Subject[]>>('/subjects');
    return response.data;
  },

  getSubjectById: async (id: string): Promise<ApiResponse<Subject>> => {
    const response = await apiClient.get<ApiResponse<Subject>>(`/subjects/${id}`);
    return response.data;
  },

  createSubject: async (data: CreateSubjectRequest): Promise<ApiResponse<Subject>> => {
    const response = await apiClient.post<ApiResponse<Subject>>('/subjects', data);
    return response.data;
  },

  updateSubject: async (id: string, data: UpdateSubjectRequest): Promise<ApiResponse<Subject>> => {
    const response = await apiClient.put<ApiResponse<Subject>>(`/subjects/${id}`, data);
    return response.data;
  },

  deleteSubject: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/subjects/${id}`);
    return response.data;
  },

  // Class Sections
  getClassSections: async (filters?: { 
    academicYearId?: string; 
    gradeLevelId?: string; 
    classTeacherId?: string; 
  }): Promise<ApiResponse<ClassSection[]>> => {
    const response = await apiClient.get<ApiResponse<ClassSection[]>>('/class-sections', {
      params: filters,
    });
    return response.data;
  },

  getClassSectionById: async (id: string): Promise<ApiResponse<ClassSection>> => {
    const response = await apiClient.get<ApiResponse<ClassSection>>(`/class-sections/${id}`);
    return response.data;
  },

  createClassSection: async (data: CreateClassSectionRequest): Promise<ApiResponse<ClassSection>> => {
    const response = await apiClient.post<ApiResponse<ClassSection>>('/class-sections', data);
    return response.data;
  },

  updateClassSection: async (id: string, data: UpdateClassSectionRequest): Promise<ApiResponse<ClassSection>> => {
    const response = await apiClient.put<ApiResponse<ClassSection>>(`/class-sections/${id}`, data);
    return response.data;
  },

  deleteClassSection: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/class-sections/${id}`);
    return response.data;
  },

  // Class Subjects (Assignments)
  getClassSubjects: async (classSectionId: string): Promise<ApiResponse<ClassSubject[]>> => {
    const response = await apiClient.get<ApiResponse<ClassSubject[]>>('/class-subjects', {
      params: { classSectionId },
    });
    return response.data;
  },

  assignSubjectToClass: async (data: AssignSubjectToClassRequest): Promise<ApiResponse<ClassSubject>> => {
    const response = await apiClient.post<ApiResponse<ClassSubject>>('/class-subjects', data);
    return response.data;
  },

  updateClassSubject: async (id: string, data: UpdateClassSubjectRequest): Promise<ApiResponse<ClassSubject>> => {
    const response = await apiClient.put<ApiResponse<ClassSubject>>(`/class-subjects/${id}`, data);
    return response.data;
  },

  removeClassSubject: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/class-subjects/${id}`);
    return response.data;
  },

  // Enrollments
  getEnrollments: async (filters?: { classSectionId?: string; studentId?: string }): Promise<ApiResponse<Enrollment[]>> => {
    const response = await apiClient.get<ApiResponse<Enrollment[]>>('/enrollments', {
      params: filters,
    });
    return response.data;
  },

  // Rooms
  getRooms: async (): Promise<ApiResponse<ClassRoom[]>> => {
    const response = await apiClient.get<ApiResponse<ClassRoom[]>>('/class-rooms');
    return response.data;
  },

  // Timetable
  getTimetablePeriods: async (filters?: { 
    classSectionId?: string; 
    teacherId?: string; 
    weekday?: number; 
  }): Promise<ApiResponse<TimetablePeriod[]>> => {
    const response = await apiClient.get<ApiResponse<TimetablePeriod[]>>('/timetable-periods', {
      params: filters,
    });
    return response.data;
  },

  createTimetablePeriod: async (data: CreateTimetablePeriodRequest): Promise<ApiResponse<TimetablePeriod>> => {
    const response = await apiClient.post<ApiResponse<TimetablePeriod>>('/timetable-periods', data);
    return response.data;
  },

  updateTimetablePeriod: async (id: string, data: UpdateTimetablePeriodRequest): Promise<ApiResponse<TimetablePeriod>> => {
    const response = await apiClient.put<ApiResponse<TimetablePeriod>>(`/timetable-periods/${id}`, data);
    return response.data;
  },

  deleteTimetablePeriod: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/timetable-periods/${id}`);
    return response.data;
  },
};
