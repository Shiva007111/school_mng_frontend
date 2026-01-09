import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Save,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  ArrowLeft
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { academicService } from '@/services/academic.service';
import { examService } from '@/services/exam.service';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { toast } from 'react-hot-toast';

export const MarkEntryPage: React.FC = () => {
  const { examId, examSubjectId } = useParams<{ examId: string, examSubjectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [localMarks, setLocalMarks] = useState<Record<string, number>>({});

  const roles = user?.roles.map(r => r.role.name) || [];
  const isTeacher = roles.includes('Teacher');
  const isAdmin = roles.includes('Admin');

  // Fetch Exam Subject Details
  const { data: examSubjectData } = useQuery({
    queryKey: ['exam-subject', examSubjectId],
    queryFn: () => examService.getExamSubjects(examId!), // This returns all subjects for the exam
    enabled: !!examId,
  });

  const currentExamSubject = examSubjectData?.data?.find(es => es.id === examSubjectId);

  // Authorization check
  React.useEffect(() => {
    if (currentExamSubject && isTeacher && !isAdmin) {
      const isSubjectTeacher =
        currentExamSubject.classSubject?.teacherId === user?.teacher?.id ||
        currentExamSubject.classSubject?.teacherSubject?.teacherId === user?.teacher?.id;

      if (!isSubjectTeacher) {
        toast.error('You are not authorized to enter marks for this subject');
        navigate('/dashboard/exams');
      }
    }
  }, [currentExamSubject, isTeacher, isAdmin, user, navigate]);

  const maxScore = currentExamSubject?.maxScore || 100;

  // Fetch Students for the class section
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students', currentExamSubject?.classSubject?.classSectionId],
    queryFn: () => academicService.getEnrollments({ classSectionId: currentExamSubject?.classSubject?.classSectionId! }),
    enabled: !!currentExamSubject?.classSubject?.classSectionId,
  });

  // Fetch Existing Marks
  const { data: marksData } = useQuery({
    queryKey: ['marks', examSubjectId],
    queryFn: () => examService.getExamSubjectMarks(examSubjectId!),
    enabled: !!examSubjectId,
  });

  // Initialize local marks when data is fetched
  React.useEffect(() => {
    if (marksData?.data) {
      const marksMap: Record<string, number> = {};
      marksData.data.forEach((m: any) => {
        if (m.score !== null) marksMap[m.studentId] = Number(m.score);
      });
      setLocalMarks(marksMap);
    }
  }, [marksData]);

  const students = studentsData?.data || [];

  const bulkSaveMutation = useMutation({
    mutationFn: (marks: any[]) => examService.bulkEnterMarks({ marks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks', examSubjectId] });
      toast.success('Marks saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save marks');
    },
  });

  const handleMarkChange = (studentId: string, value: string) => {
    const score = parseFloat(value);
    if (isNaN(score)) {
      const newMarks = { ...localMarks };
      delete newMarks[studentId];
      setLocalMarks(newMarks);
      return;
    }

    if (score > maxScore) {
      toast.error(`Score cannot exceed maximum (${maxScore})`);
      return;
    }

    setLocalMarks({ ...localMarks, [studentId]: score });
  };

  const handleSave = () => {
    const marksToSave = Object.entries(localMarks).map(([studentId, score]) => ({
      studentId,
      examSubjectId: examSubjectId!,
      score,
    }));

    if (marksToSave.length === 0) {
      toast.error('No marks to save');
      return;
    }

    bulkSaveMutation.mutate(marksToSave);
  };

  const filteredStudents = students.filter(s =>
    s.student?.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNumber?.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mark Entry</h1>
          <p className="text-gray-500">
            {currentExamSubject?.classSubject?.subject?.name} • Max Score: {maxScore}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[300px]">
          <Input
            placeholder="Search students by name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Button
          onClick={handleSave}
          isLoading={bulkSaveMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Save All Marks
        </Button>
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
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Roll No</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Student Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 w-48">Score / {maxScore}</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {enrollment.rollNumber || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {enrollment.student?.user?.email.split('@')[0]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Input
                      type="number"
                      min="0"
                      max={maxScore}
                      step="0.5"
                      placeholder="0.0"
                      value={localMarks[enrollment.studentId] ?? ''}
                      onChange={(e) => handleMarkChange(enrollment.studentId, e.target.value)}
                      className="w-32"
                    />
                  </td>
                  <td className="px-6 py-4">
                    {localMarks[enrollment.studentId] !== undefined ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle2 className="h-3 w-3" />
                        Entered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                        <AlertCircle className="h-3 w-3" />
                        Pending
                      </span>
                    )}
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
