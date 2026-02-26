import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Loader2,
  User,
  FileText,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '@/services/student.service';
import { examService } from '@/services/exam.service';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import type { Student } from '@/types/student.types';

import { academicService } from '@/services/academic.service';

export const SessionReportListPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Fetch Session Details
  const { data: sessionData } = useQuery({
    queryKey: ['exam-session', sessionId],
    queryFn: () => examService.getExamSessionById(sessionId!),
    enabled: !!sessionId,
  });

  // Fetch Grades
  const { data: gradesData } = useQuery({
    queryKey: ['grade-levels'],
    queryFn: () => academicService.getGradeLevels(),
  });

  // Fetch Sections when Grade is selected
  const { data: sectionsData } = useQuery({
    queryKey: ['class-sections', selectedGrade],
    queryFn: () => academicService.getClassSections({ gradeLevelId: selectedGrade }),
    enabled: selectedGrade !== 'all',
  });

  // Fetch All Students with Filters
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['filtered-students', searchQuery, selectedGrade, selectedSection],
    queryFn: () => studentService.getStudents({
      search: searchQuery,
      gradeLevelId: selectedGrade === 'all' ? undefined : selectedGrade,
      classSectionId: selectedSection === 'all' ? undefined : selectedSection
    }),
  });

  const students = studentsData?.data || [];
  const session = sessionData?.data;
  const grades = gradesData?.data || [];
  const sections = sectionsData?.data || [];

  // Manual filtering is no longer needed as backend handles it, but we can keep it for extra safety or remove it.
  // We'll rely on backend filtering for now.
  const filteredStudents = students;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/exams')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Cards</h1>
          <p className="text-gray-500">{session?.name} • Select a student to view their report card.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
          <select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              setSelectedSection('all');
            }}
            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="all">All Grades</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.displayName}
              </option>
            ))}
          </select>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            disabled={selectedGrade === 'all'}
            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Sections</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.section}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoadingStudents ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Admission No</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Student Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.map((student: Student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {student.admissionNo}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {student.user?.email.split('@')[0]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/exams/report-card/${student.id}/${sessionId}`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Report
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
