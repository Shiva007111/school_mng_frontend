import type { AcademicYear, ClassSection, ClassSubject, Subject } from './academic.types';
import type { Student } from './student.types';

export interface ExamSession {
  id: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  publishAt?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  academicYear?: AcademicYear;
  _count?: {
    exams: number;
  };
}

export interface Exam {
  id: string;
  examSessionId: string;
  classSectionId: string;
  title: string;
  examDate: string;
  maxTotal?: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  examSession?: ExamSession;
  classSection?: ClassSection;
  examSubjects?: ExamSubject[];
}

export interface ExamSubject {
  id: string;
  examId: string;
  classSubjectId: string;
  maxScore: number;
  weight?: number;
  examDate?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  exam?: Exam;
  classSubject?: ClassSubject;
  subject?: Subject;
}

export interface StudentMark {
  id: string;
  studentId: string;
  examSubjectId: string;
  score: number | null;
  isAbsent: boolean;
  gradeBandId?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  student?: Student;
  examSubject?: ExamSubject;
}

// Request Types
export interface CreateExamSessionRequest {
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface CreateExamRequest {
  examSessionId: string;
  classSectionId?: string;
  classSectionIds?: string[];
  title: string;
  examDate: string;
  maxTotal?: number;
}

export interface CreateExamSubjectRequest {
  examId: string;
  classSubjectId: string;
  maxScore: number;
  weight?: number;
  examDate?: string;
}

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  marks: Array<{
    examTitle: string;
    score: number;
    maxScore: number;
  }>;
  totalObtained: number;
  totalMax: number;
}

export interface ReportCard {
  studentId: string;
  examSessionId: string;
  subjects: SubjectResult[];
  overallTotalObtained: number;
  overallTotalMax: number;
}

export interface MarkEntry {
  studentId: string;
  examSubjectId: string;
  score: number;
}

export interface BulkMarkEntryRequest {
  marks: MarkEntry[];
}
