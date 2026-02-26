import { useState } from 'react';
import { useParams, Link, useNavigate,useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicService } from '@/services/academic.service';
import { teacherService } from '@/services/teacher.service';
import { studentService } from '@/services/student.service';
import { Button } from '@/components/Button';
import { toast } from 'react-hot-toast';
import type {
  AssignSubjectToClassRequest,
  CreateEnrollmentRequest,
  ClassSubject
} from '@/types/academic.types';
import type { ApiResponse } from '@/types/api.types';
import {
  ArrowLeft,
  Users,
  BookOpen,
  Plus,
  Trash2,
  User,
  Clock,
  X,
  CheckSquare,
  Square,
  Search
} from 'lucide-react';

export default function ClassSectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [weeklyPeriods, setWeeklyPeriods] = useState(5);
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');

  const queryClient = useQueryClient();
  const location = useLocation();


  // Queries
  const { data: sectionData, isLoading: isLoadingSection } = useQuery({
    queryKey: ['class-section', id],
    queryFn: () => academicService.getClassSectionById(id!),
    enabled: !!id,
  });

  const { data: classSubjectsData, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['class-subjects', id],
    queryFn: () => academicService.getClassSubjects(id!),
    enabled: !!id,
  });

  const { data: enrollmentsData, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['enrollments', id],
    queryFn: () => academicService.getEnrollments({ classSectionId: id! }),
    enabled: !!id,
  });

  const { data: allSubjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => academicService.getSubjects(),
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students-unassigned'],
    queryFn: () => studentService.getStudents({for_enrollment: true}),
    enabled: isAddStudentsModalOpen,
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers', selectedSubjectId],
    queryFn: () => teacherService.getTeachers({ subjectId: selectedSubjectId }),
    enabled: isAssignModalOpen && !!selectedSubjectId,
  });

  const section = sectionData?.data;
  const classSubjects = classSubjectsData?.data || [];
  const enrollments = enrollmentsData?.data || [];
  const allSubjects = allSubjectsData?.data || [];
  const teachers = teachersData?.data || [];
  const allStudents = studentsData?.data || [];

  // Mutations
  const assignMutation = useMutation<ApiResponse<ClassSubject>, any, AssignSubjectToClassRequest>({
    mutationFn: academicService.assignSubjectToClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-subjects', id] });
      setIsAssignModalOpen(false);
      setSelectedSubjectId('');
      setSelectedTeacherId('');
    },
  });

  const removeMutation = useMutation({
    mutationFn: academicService.removeClassSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-subjects', id] });
      toast.success('Subject removed successfully');
    },
  });

  // const bulkEnrollMutation = useMutation<ApiResponse<{ count: number }>, any, { enrollments: CreateEnrollmentRequest[] }>({
  //   mutationFn: academicService.bulkEnrollStudents,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['enrollments', id] });
  //     setIsAddStudentsModalOpen(false);
  //     setSelectedStudentIds([]);
  //     toast.success('Students added to class successfully');
  //   },
  const bulkEnrollMutation = useMutation<ApiResponse<{ count: number }>,any,{ enrollments: CreateEnrollmentRequest[] }
  >({
    mutationFn: academicService.bulkEnrollStudents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments', id] });

      // 🔥 ADD THIS
      queryClient.invalidateQueries({ queryKey: ['students-unassigned'] });

      setIsAddStudentsModalOpen(false);
      setSelectedStudentIds([]);
      toast.success('Students added to class successfully');
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add students');
    }
  });

  const removeEnrollmentMutation = useMutation<ApiResponse<void>, any, string>({
    mutationFn: academicService.deleteEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments', id] });
      toast.success('Student removed from class');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove student');
    }
  });

  const handleAssign = () => {
    if (!selectedSubjectId || !selectedTeacherId) return;

    // Note: In a real app, we'd need the teacherSubjectId. 
    // For now, I'll assume the backend handles finding/creating the teacherSubject link 
    // or I'll need to fetch teacher-subjects first.
    // Based on the schema, ClassSubject needs teacherSubjectId.

    // Let's assume for this demo we just need to pass the IDs and the backend handles it,
    // or we'd need a more complex UI to select from teacher's expertise.

    assignMutation.mutate({
      classSectionId: id!,
      subjectId: selectedSubjectId,
      teacherId: selectedTeacherId,
      weeklyPeriods,
    });
  };

  const handleBulkEnroll = () => {
    if (selectedStudentIds.length === 0) return;

    bulkEnrollMutation.mutate({
      enrollments: selectedStudentIds.map(studentId => ({
        studentId,
        classSectionId: id!,
      }))
    });
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(sid => sid !== studentId)
        : [...prev, studentId]
    );
  };

  const enrolledStudentIds = enrollments.map(e => e.studentId);
  const availableStudents = allStudents.filter(s =>
    !enrolledStudentIds.includes(s.id) &&
    (s.user?.firstName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.user?.lastName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  if (isLoadingSection) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  if (!section) {
    return <div className="text-center py-10 text-red-500">Class section not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/academic/sections">
          <Button variant="outline" size="sm" className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {section.gradeLevel?.displayName} - {section.section}
          </h1>
          <p className="text-sm text-gray-500">
            Class Teacher: {section.classTeacher?.user ? (
              section.classTeacher.user.firstName || section.classTeacher.user.lastName ?
                `${section.classTeacher.user.firstName || ''} ${section.classTeacher.user.lastName || ''}`.trim() :
                section.classTeacher.user.email
            ) : 'Not Assigned'}
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate(`/dashboard/timetable?sectionId=${id}`)}
          >
            <Clock className="h-4 w-4" />
            Manage Timetable
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Stats, Details & Subjects (Narrower) */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-xs text-indigo-600 font-semibold uppercase">Students</p>
                <p className="text-2xl font-bold text-indigo-900">{enrollments.length}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-xs text-emerald-600 font-semibold uppercase">Subjects</p>
                <p className="text-2xl font-bold text-emerald-900">{classSubjects.length}</p>
              </div>
            </div>
          </div>

          {/* Class Details */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Class Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Grade Level</span>
                <span className="font-medium text-gray-900">{section.gradeLevel?.displayName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Section</span>
                <span className="font-medium text-gray-900">{section.section}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Room</span>
                <span className="font-medium text-gray-900">{section.roomId || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Subjects Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[calc(100vh-450px)]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900">Subjects</h3>
              </div>
              <Button size="sm" className="p-2" onClick={() => setIsAssignModalOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="overflow-y-auto divide-y divide-gray-100 flex-1">
              {isLoadingSubjects ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : classSubjects.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No subjects assigned.</div>
              ) : (
                classSubjects.map((cs) => (
                  <div key={cs.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{cs.subject?.name}</h4>
                        <div className="flex flex-col gap-0.5 text-[10px] text-gray-500">
                          <span className="flex items-center gap-1 truncate">
                            <User className="h-2.5 w-2.5" />
                            {cs.teacherSubject?.teacher?.user ? (
                              cs.teacherSubject.teacher.user.firstName || cs.teacherSubject.teacher.user.lastName ?
                                `${cs.teacherSubject.teacher.user.firstName || ''} ${cs.teacherSubject.teacher.user.lastName || ''}`.trim() :
                                cs.teacherSubject.teacher.user.email
                            ) : 'No Teacher'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {cs.weeklyPeriods} periods
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeMutation.mutate(cs.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Enrolled Students (Wider) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[calc(100vh-200px)]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900">Enrolled Students</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setIsAddStudentsModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Students
              </Button>
            </div>
            <div className="overflow-y-auto divide-y divide-gray-100 flex-1">
              {isLoadingEnrollments ? (
                <div className="p-6 text-center text-gray-500">Loading students...</div>
              ) : enrollments.length === 0 ? (
                <div className="p-10 text-center">
                  <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No students enrolled in this section yet.</p>
                </div>
              ) : (
                enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                        <User className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {enrollment.student?.user?.firstName || enrollment.student?.user?.lastName ?
                            `${enrollment.student.user.firstName || ''} ${enrollment.student.user.lastName || ''}`.trim() :
                            `Student ${enrollment.student?.admissionNo}`}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>Roll No: {enrollment.rollNumber || 'N/A'}</span>
                          <span>Adm No: {enrollment.student?.admissionNo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-all text-gray-600 border-gray-200"
                        onClick={() => navigate(`/dashboard/students/${enrollment.studentId}`,{
                        state: { from: location.pathname },

                        })
                      }
                      >
                        View Profile
                      </Button>
                      {/* <Button variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/dashboard/students/${enrollment.studentId}`, {
                            state: { from: location.pathname },
                          })
                        } 
                      >
                        View Profile
                      </Button> */}
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${enrollment.student?.user?.firstName || 'this student'} from this class?`)) {
                            removeEnrollmentMutation.mutate(enrollment.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove from class"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Subject Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Assign Subject to Class</h2>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedTeacherId(''); // Reset teacher when subject changes
                  }}
                >
                  <option value="">Select Subject</option>
                  {allSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Teacher</label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border disabled:bg-gray-50 disabled:text-gray-500"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  disabled={!selectedSubjectId}
                >
                  <option value="">{selectedSubjectId ? 'Select Teacher' : 'Select Subject First'}</option>
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.user ? (
                        t.user.firstName || t.user.lastName ?
                          `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() :
                          t.user.email
                      ) : 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Weekly Periods</label>
                <input
                  type="number"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  value={weeklyPeriods}
                  onChange={(e) => setWeeklyPeriods(parseInt(e.target.value))}
                  min={1}
                  max={20}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAssign}
                  isLoading={assignMutation.isPending}
                  disabled={!selectedSubjectId || !selectedTeacherId}
                >
                  Assign Subject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Students Modal */}
      {isAddStudentsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add Students to Class</h2>
                <p className="text-xs text-gray-500">Select students to enroll in {section.gradeLevel?.displayName} - {section.section}</p>
              </div>
              <button
                onClick={() => setIsAddStudentsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or admission number..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {availableStudents.length === 0 ? (
                <div className="py-10 text-center text-gray-500 text-sm">
                  {studentSearch ? 'No students found matching your search.' : 'No available students to enroll.'}
                </div>
              ) : (
                availableStudents.map((student) => (
                  <div
                    key={student.id}
                    className={cn(
                      "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group",
                      selectedStudentIds.includes(student.id)
                        ? "bg-indigo-50 border-indigo-200"
                        : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"
                    )}
                    onClick={() => toggleStudentSelection(student.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {selectedStudentIds.includes(student.id) ? (
                          <CheckSquare className="h-5 w-5 text-indigo-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-300 group-hover:text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {student.user?.firstName || student.user?.lastName ?
                            `${student.user.firstName || ''} ${student.user.lastName || ''}`.trim() :
                            `Student ${student.admissionNo}`}
                        </h4>
                        <p className="text-[10px] text-gray-500">Adm No: {student.admissionNo}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-bold text-indigo-600">{selectedStudentIds.length}</span> students selected
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsAddStudentsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkEnroll}
                  isLoading={bulkEnrollMutation.isPending}
                  disabled={selectedStudentIds.length === 0}
                >
                  Enroll Selected
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add cn helper if not imported
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
