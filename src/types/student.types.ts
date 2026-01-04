import type { User } from './api.types';

export type Gender = 'Male' | 'Female' | 'Other';
export type StudentStatus = 'active' | 'inactive' | 'suspended' | 'graduated' | 'transferred';
export type ParentRelationship = 'father' | 'mother' | 'guardian' | 'other';

export interface Student {
  id: string;
  userId: string;
  admissionNo: string;
  dob: string;
  gender: Gender;
  bloodGroup?: string;
  status: StudentStatus;
  user: User;
  createdAt: string;
  updatedAt: string;
  enrollments?: Enrollment[];
  studentParents?: StudentParent[];
}

export interface Enrollment {
  id: string;
  studentId: string;
  classSectionId: string;
  rollNumber: number;
  joinedOn: string;
  leftOn?: string;
  status: 'active' | 'completed' | 'withdrawn' | 'transferred';
  classSection?: ClassSection;
}

export interface ClassSection {
  id: string;
  academicYearId: string;
  gradeLevelId: string;
  section: string;
  classTeacherId?: string;
  academicYear?: AcademicYear;
  gradeLevel?: GradeLevel;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface GradeLevel {
  id: string;
  code: string;
  displayName: string;
  sequence: number;
}

export interface Parent {
  id: string;
  userId: string;
  occupation?: string;
  preferredContact: 'email' | 'phone' | 'both';
  user: User;
}

export interface StudentParent {
  studentId: string;
  parentId: string;
  relationship: ParentRelationship;
  isPrimary: boolean;
  parent: Parent;
}

export interface CreateStudentRequest {
  email: string;
  phone?: string;
  password?: string;
  admissionNo: string;
  dob: string;
  gender: Gender;
  bloodGroup?: string;
  status?: StudentStatus;
}

export interface UpdateStudentRequest {
  email?: string;
  phone?: string;
  admissionNo?: string;
  dob?: string;
  gender?: Gender;
  bloodGroup?: string;
  status?: StudentStatus;
}

export interface StudentFilters {
  search?: string;
  status?: StudentStatus;
  gradeLevelId?: string;
  classSectionId?: string;
  gender?: string;
  page?: number;
  limit?: number;
}
