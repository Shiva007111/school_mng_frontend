import apiClient from './api';
import type { ApiResponse } from '@/types/api.types';
import type { 
  ExamSession, 
  Exam, 
  ExamSubject, 
  StudentMark,
  CreateExamSessionRequest,
  CreateExamRequest,
  CreateExamSubjectRequest,
  BulkMarkEntryRequest,
  ReportCard
} from '@/types/exam.types';

export const examService = {
  // Exam Sessions
  getExamSessions: async (academicYearId?: string): Promise<ApiResponse<ExamSession[]>> => {
    const response = await apiClient.get<ApiResponse<ExamSession[]>>('/exam-sessions', {
      params: { academicYearId },
    });
    return response.data;
  },

  getExamSessionById: async (id: string): Promise<ApiResponse<ExamSession>> => {
    const response = await apiClient.get<ApiResponse<ExamSession>>(`/exam-sessions/${id}`);
    return response.data;
  },

  createExamSession: async (data: CreateExamSessionRequest): Promise<ApiResponse<ExamSession>> => {
    const response = await apiClient.post<ApiResponse<ExamSession>>('/exam-sessions', data);
    return response.data;
  },

  updateExamSession: async (id: string, data: Partial<CreateExamSessionRequest>): Promise<ApiResponse<ExamSession>> => {
    const response = await apiClient.put<ApiResponse<ExamSession>>(`/exam-sessions/${id}`, data);
    return response.data;
  },

  deleteExamSession: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/exam-sessions/${id}`);
    return response.data;
  },

  // Exams
  getExams: async (filters?: { examSessionId?: string; classSectionId?: string }): Promise<ApiResponse<Exam[]>> => {
    const response = await apiClient.get<ApiResponse<Exam[]>>('/exams', { params: filters });
    return response.data;
  },

  getExamById: async (id: string): Promise<ApiResponse<Exam>> => {
    const response = await apiClient.get<ApiResponse<Exam>>(`/exams/${id}`);
    return response.data;
  },

  createExam: async (data: CreateExamRequest): Promise<ApiResponse<Exam>> => {
    const response = await apiClient.post<ApiResponse<Exam>>('/exams', data);
    return response.data;
  },

  // Exam Subjects
  getExamSubjects: async (examId: string): Promise<ApiResponse<ExamSubject[]>> => {
    const response = await apiClient.get<ApiResponse<ExamSubject[]>>(`/exam-subjects/exam/${examId}`);
    return response.data;
  },

  createExamSubject: async (data: CreateExamSubjectRequest): Promise<ApiResponse<ExamSubject>> => {
    const response = await apiClient.post<ApiResponse<ExamSubject>>('/exam-subjects', data);
    return response.data;
  },

  // Marks
  getExamSubjectMarks: async (examSubjectId: string): Promise<ApiResponse<StudentMark[]>> => {
    const response = await apiClient.get<ApiResponse<StudentMark[]>>(`/student-marks/exam-subject/${examSubjectId}`);
    return response.data;
  },

  bulkEnterMarks: async (data: BulkMarkEntryRequest): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.post<ApiResponse<{ count: number }>>('/student-marks/bulk', data);
    return response.data;
  },

  getStudentMarks: async (studentId: string, examId: string): Promise<ApiResponse<StudentMark[]>> => {
    const response = await apiClient.get<ApiResponse<StudentMark[]>>(`/student-marks/student/${studentId}/exam/${examId}`);
    return response.data;
  },

  getReportCard: async (studentId: string, examSessionId: string): Promise<ApiResponse<ReportCard>> => {
    const response = await apiClient.get<ApiResponse<ReportCard>>(`/exams/report-card/${studentId}/${examSessionId}`);
    return response.data;
  },
};
