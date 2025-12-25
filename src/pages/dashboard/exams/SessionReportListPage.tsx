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

export const SessionReportListPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Session Details
  const { data: sessionData } = useQuery({
    queryKey: ['exam-session', sessionId],
    queryFn: () => examService.getExamSessionById(sessionId!),
    enabled: !!sessionId,
  });

  // Fetch All Students
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['all-students'],
    queryFn: () => studentService.getStudents(),
  });

  const students = studentsData?.data || [];
  const session = sessionData?.data;

  const filteredStudents = students.filter((s: Student) => 
    s.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admissionNo.includes(searchQuery)
  );

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
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search students by name or admission no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
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
