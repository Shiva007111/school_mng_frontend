import type { Teacher } from './teacher.types';

export interface GradeLevel {
  id: string;
  code: string;
  displayName: string;
  sequence: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description?: string;
  isElective: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSection {
  id: string;
  academicYearId: string;
  gradeLevelId: string;
  section: string;
  classTeacherId?: string;
  roomId?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  gradeLevel?: GradeLevel;
  classTeacher?: Teacher;
  room?: ClassRoom;
}

export interface ClassRoom {
  id: string;
  name: string;
  capacity?: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSubject {
  id: string;
  classSectionId: string;
  subjectId: string;
  teacherSubjectId: string;
  weeklyPeriods: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  subject?: Subject;
  teacher?: Teacher;
  teacherSubject?: TeacherSubject;
}

export interface TeacherSubject {
  id: string;
  teacherId: string;
  subjectId: string;
  expertise?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  teacher?: Teacher;
  subject?: Subject;
}

export interface Enrollment {
  id: string;
  studentId: string;
  classSectionId: string;
  rollNumber?: number;
  joinedOn?: string;
  leftOn?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  student?: {
    id: string;
    admissionNo: string;
    user?: {
      email: string;
    };
  };
}

// Request Types
export interface CreateSubjectRequest {
  code: string;
  name: string;
  description?: string;
  isElective?: boolean;
}

export interface UpdateSubjectRequest {
  code?: string;
  name?: string;
  description?: string;
  isElective?: boolean;
}

export interface CreateClassSectionRequest {
  academicYearId: string;
  gradeLevelId: string;
  section: string;
  classTeacherId?: string;
  roomId?: string;
}

export interface UpdateClassSectionRequest {
  section?: string;
  classTeacherId?: string;
  roomId?: string;
}

export interface AssignSubjectToClassRequest {
  classSectionId: string;
  subjectId: string;
  teacherSubjectId: string;
  weeklyPeriods: number;
}

export interface UpdateClassSubjectRequest {
  teacherSubjectId?: string;
  weeklyPeriods?: number;
}
