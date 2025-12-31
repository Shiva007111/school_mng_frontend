import apiClient from './api';
import type { ApiResponse } from '@/types/api.types';
import type { Enrollment } from '@/types/academic.types';

export interface PromotionRequest {
  studentIds: string[];
  targetClassSectionId: string;
  rollNumbers?: number[];
}

export const promotionService = {
  getEligibleStudents: async (classSectionId: string): Promise<ApiResponse<Enrollment[]>> => {
    const response = await apiClient.get<ApiResponse<Enrollment[]>>(`/promotions/eligible/${classSectionId}`);
    return response.data;
  },

  promoteStudents: async (data: PromotionRequest): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>('/promotions', data);
    return response.data;
  },
};
