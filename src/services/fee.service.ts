import apiClient from './api';
import type { ApiResponse } from '@/types/api.types';

export interface FeeComponent {
  id?: string;
  label: string;
  amount: number;
  dueDay?: number;
}

export interface FeeStructure {
  id: string;
  academicYearId: string;
  gradeLevelId?: string;
  name: string;
  frequency: 'monthly' | 'term' | 'annual';
  components: FeeComponent[];
  gradeLevel?: {
    displayName: string;
  };
}

export interface FeeInvoice {
  id: string;
  studentId: string;
  feeStructureId: string;
  invoiceNo: string;
  status: 'paid' | 'partial' | 'due';
  totalAmount: number;
  feeStructure: FeeStructure;
  payments: any[];
}

export const feeService = {
  createStructure: async (data: any): Promise<ApiResponse<FeeStructure>> => {
    const response = await apiClient.post<ApiResponse<FeeStructure>>('/fees/structures', data);
    return response.data;
  },

  getStructures: async (academicYearId?: string): Promise<ApiResponse<FeeStructure[]>> => {
    const response = await apiClient.get<ApiResponse<FeeStructure[]>>('/fees/structures', {
      params: { academicYearId },
    });
    return response.data;
  },

  getStudentInvoices: async (studentId: string): Promise<ApiResponse<FeeInvoice[]>> => {
    const response = await apiClient.get<ApiResponse<FeeInvoice[]>>(`/fees/invoices/${studentId}`);
    return response.data;
  },

  recordPayment: async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>('/fees/payments', data);
    return response.data;
  },
};
