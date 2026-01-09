import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Trash2,
  Loader2,
  BookOpen,
  LayoutGrid,
  Settings,
  ArrowLeft,
  Edit2,
  CheckCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { academicService } from '@/services/academic.service';
import { examService } from '@/services/exam.service';
import { attendanceService } from '@/services/attendance.service';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { toast } from 'react-hot-toast';

export const ExamManagementPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const viewOnlyParam = searchParams.get('viewOnly') === 'true';
  const classSectionIdFromUrl = searchParams.get('classSectionId');
  const studentIdFromUrl = searchParams.get('studentId');
  const roles = user?.roles.map(r => r.role.name) || [];
  const userRole = roles.includes('Admin') ? 'Admin' :
    roles.includes('Teacher') ? 'Teacher' :
      roles.includes('Parent') ? 'Parent' :
        roles.includes('Student') ? 'Student' : undefined;
  const isAdmin = userRole === 'Admin';
  const isTeacher = userRole === 'Teacher';
  const isParent = userRole === 'Parent';
  const isStudent = userRole === 'Student';

  const isViewOnly = viewOnlyParam || isParent || isStudent;
  const canManageExams = (isAdmin || isTeacher) && !isViewOnly;
  const canCreateExams = (isAdmin || isTeacher) && !isViewOnly;

  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  // Exam Form State
  const [examFormData, setExamFormData] = useState({
    title: '',
    classSectionIds: [] as string[],
    examDate: '',
    maxTotal: '',
  });

  // Subject Form State
  const [subjectFormData, setSubjectFormData] = useState({
    classSubjectId: '',
    maxScore: '',
    weight: '1',
    examDate: '',
  });

  // Fetch Session Details
  const { data: sessionData } = useQuery({
    queryKey: ['exam-session', sessionId],
    queryFn: () => examService.getExamSessionById(sessionId!),
    enabled: !!sessionId,
  });


  // Fetch Exams for this session
  const { data: examsData, isLoading: isLoadingExams } = useQuery({
    queryKey: ['exams', sessionId, classSectionIdFromUrl],
    queryFn: () => examService.getExams({
      examSessionId: sessionId,
      ...(classSectionIdFromUrl && { classSectionId: classSectionIdFromUrl })
    }),
    enabled: !!sessionId,
    refetchInterval: 60000, // Refetch every minute to show latest changes from Admin
  });

  // Fetch Class Sections (for creating exams)
  const { data: sectionsData } = useQuery({
    queryKey: ['class-sections'],
    queryFn: () => academicService.getClassSections(),
  });

  // Fetch Class Subjects (for adding subjects to exam)
  const { data: classSubjectsData } = useQuery({
    queryKey: ['class-subjects', selectedExam?.classSectionId],
    queryFn: () => academicService.getClassSubjects(selectedExam?.classSectionId),
    enabled: !!selectedExam?.classSectionId,
  });

  // Fetch Attendance History (for parents/students)
  const targetStudentId = studentIdFromUrl || (isStudent ? user?.id : null);
  const { data: attendanceData } = useQuery({
    queryKey: ['attendance-history', targetStudentId],
    queryFn: () => attendanceService.getStudentHistory(targetStudentId!),
    enabled: !!targetStudentId && isViewOnly,
  });

  const attendanceHistory = attendanceData?.data || [];

  const exams = examsData?.data || [];
  const sections = sectionsData?.data || [];
  const classSubjects = classSubjectsData?.data || [];

  const createExamMutation = useMutation({
    mutationFn: (data: any) => examService.createExam({ ...data, examSessionId: sessionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', sessionId] });
      toast.success('Exam created successfully');
      setIsExamModalOpen(false);
    },
  });

  const addSubjectMutation = useMutation({
    mutationFn: (data: any) => examService.createExamSubject({ ...data, examId: selectedExam.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', sessionId] });
      toast.success('Subject added to exam');
      setIsSubjectModalOpen(false);
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id: string) => examService.deleteExamSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', sessionId] });
      toast.success('Subject removed from exam');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove subject');
    }
  });

  const updateExamMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => examService.updateExam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', sessionId] });
      toast.success('Exam updated successfully');
      setIsExamModalOpen(false);
    },
  });

  const addAllSubjectsMutation = useMutation({
    mutationFn: async (exam: any) => {
      // Fetch class subjects for this exam's class section
      const subjects = await academicService.getClassSubjects(exam.classSectionId);
      const existingSubjectIds = exam.examSubjects?.map((es: any) => es.classSubjectId) || [];

      const newSubjects = subjects.data.filter((cs: any) => !existingSubjectIds.includes(cs.id));

      if (newSubjects.length === 0) {
        throw new Error('All class subjects are already added to this exam');
      }

      // Add each subject with sequential dates
      let currentDate = new Date(exam.examDate);

      for (const subject of newSubjects) {
        await examService.createExamSubject({
          examId: exam.id,
          classSubjectId: subject.id,
          maxScore: 100,
          weight: 1,
          examDate: currentDate.toISOString()
        });
        // Increment date by 1 day for the next subject
        currentDate.setDate(currentDate.getDate() + 1);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', sessionId] });
      toast.success('All class subjects added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add subjects');
    }
  });

  const getAttendanceStatus = (date: string) => {
    if (!date) return null;
    const examDate = new Date(date).toDateString();
    const attendance = attendanceHistory.find(a => new Date(a.date).toDateString() === examDate);

    if (!attendance) return { label: 'Not Marked', icon: AlertCircle, color: 'text-gray-400' };

    switch (attendance.status) {
      case 'present':
        return { label: 'Present', icon: CheckCircle2, color: 'text-green-600' };
      case 'absent':
        return { label: 'Absent', icon: XCircle, color: 'text-red-600' };
      case 'late':
        return { label: 'Late', icon: Clock, color: 'text-amber-600' };
      default:
        return { label: attendance.status, icon: AlertCircle, color: 'text-gray-400' };
    }
  };

  const handleOpenExamModal = (exam?: any) => {
    setSelectedExam(exam || null);
    if (exam) {
      setExamFormData({
        title: exam.title,
        classSectionIds: [exam.classSectionId],
        examDate: exam.examDate.split('T')[0],
        maxTotal: exam.maxTotal?.toString() || '',
      });
    } else {
      setExamFormData({
        title: '',
        classSectionIds: [],
        examDate: '',
        maxTotal: '',
      });
    }
    setIsExamModalOpen(true);
  };

  const handleOpenSubjectModal = (exam: any) => {
    setSelectedExam(exam);
    setSubjectFormData({
      classSubjectId: '',
      maxScore: '100',
      weight: '1',
      examDate: exam.examDate.split('T')[0],
    });
    setIsSubjectModalOpen(true);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">
            {sessionData?.data?.name || 'Manage Exams'}
          </h1>
          <p className="text-gray-500">Configure exams and subjects for this session.</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Scheduled Exams</h2>
        {canCreateExams && (
          <Button onClick={() => handleOpenExamModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Exam
          </Button>
        )}
      </div>

      {isLoadingExams ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-20 text-center">
          <LayoutGrid className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Exams Scheduled</h3>
          <p className="text-gray-500 mt-2">Start by adding an exam for a class section.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-indigo-600 shadow-sm">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{exam.title}</h3>
                    <p className="text-sm text-gray-500">
                      {exam.classSection?.gradeLevel?.displayName} - {exam.classSection?.section} • {new Date(exam.examDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {canManageExams && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addAllSubjectsMutation.mutate(exam)}
                        isLoading={addAllSubjectsMutation.isPending && selectedExam?.id === exam.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Add All Subjects
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenSubjectModal(exam)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Subject
                      </Button>
                    </>
                  )}
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenExamModal(exam)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {exam.examSubjects?.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-4">No subjects added to this exam yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exam.examSubjects?.map((es: any) => (
                      <div key={es.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{es.classSubject?.subject?.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <p className="text-xs text-gray-500">
                              {es.examDate ? new Date(es.examDate).toLocaleDateString() : 'No date set'}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">Max Score: {es.maxScore}</p>
                          {isViewOnly && es.examDate && (
                            <div className="mt-2 flex items-center gap-2">
                              {(() => {
                                const status = getAttendanceStatus(es.examDate);
                                if (!status) return null;
                                const Icon = status.icon;
                                return (
                                  <>
                                    <Icon className={`h-3 w-3 ${status.color}`} />
                                    <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!isViewOnly && (
                            <button
                              onClick={() => navigate(`/dashboard/exams/${exam.id}/marks/${es.id}`)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2"
                              title="Enter Marks"
                            >
                              <Edit2 className="h-4 w-4" />
                              <span className="text-xs font-medium">Enter Marks</span>
                            </button>
                          )}
                          {canManageExams && (
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to remove this subject?')) {
                                  deleteSubjectMutation.mutate(es.id);
                                }
                              }}
                              disabled={deleteSubjectMutation.isPending}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              {deleteSubjectMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exam Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Add Exam</h3>
              <button onClick={() => setIsExamModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (examFormData.classSectionIds.length === 0) {
                  toast.error('Please select at least one class section');
                  return;
                }
                if (selectedExam) {
                  updateExamMutation.mutate({ id: selectedExam.id, data: examFormData });
                } else {
                  createExamMutation.mutate(examFormData);
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
                <Input
                  required
                  placeholder="e.g. Mid-Term Examination"
                  value={examFormData.title}
                  onChange={(e) => setExamFormData({ ...examFormData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class Sections</label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2 bg-white">
                  {sections.map(s => (
                    <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={examFormData.classSectionIds.includes(s.id)}
                        onChange={(e) => {
                          const ids = e.target.checked
                            ? [...examFormData.classSectionIds, s.id]
                            : examFormData.classSectionIds.filter(id => id !== s.id);
                          setExamFormData({ ...examFormData, classSectionIds: ids });
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        {s.gradeLevel?.displayName} - {s.section}
                      </span>
                    </label>
                  ))}
                </div>
                {examFormData.classSectionIds.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">Please select at least one class section.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                <input
                  type="date"
                  required
                  value={examFormData.examDate}
                  onChange={(e) => setExamFormData({ ...examFormData, examDate: e.target.value })}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setIsExamModalOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" isLoading={createExamMutation.isPending || updateExamMutation.isPending} className="flex-1 bg-indigo-600 text-white">
                  {selectedExam ? 'Update Exam' : 'Create Exam'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Add Subject to {selectedExam?.title}</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); addSubjectMutation.mutate(subjectFormData); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  required
                  value={subjectFormData.classSubjectId}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, classSubjectId: e.target.value })}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                >
                  <option value="">Select Subject</option>
                  {classSubjects.map(cs => (
                    <option key={cs.id} value={cs.id}>{cs.subject?.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Score</label>
                <Input
                  type="number"
                  required
                  value={subjectFormData.maxScore}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, maxScore: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                <input
                  type="date"
                  required
                  value={subjectFormData.examDate}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, examDate: e.target.value })}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setIsSubjectModalOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" isLoading={addSubjectMutation.isPending} className="flex-1 bg-indigo-600 text-white">Add Subject</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
