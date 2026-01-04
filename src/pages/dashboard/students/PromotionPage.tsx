import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  ArrowRight,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  GraduationCap
} from 'lucide-react';
import { promotionService } from '@/services/promotion.service';
import { academicService } from '@/services/academic.service';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';

export const PromotionPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [sourceClassId, setSourceClassId] = useState('');
  const [targetClassId, setTargetClassId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Class Sections
  const { data: sectionsData } = useQuery({
    queryKey: ['class-sections'],
    queryFn: () => academicService.getClassSections(),
  });

  // Fetch Students from source class
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['eligible-students', sourceClassId],
    queryFn: () => promotionService.getEligibleStudents(sourceClassId),
    enabled: !!sourceClassId,
  });

  const promotionMutation = useMutation({
    mutationFn: (data: any) => promotionService.promoteStudents(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligible-students', sourceClassId] });
      toast.success('Students promoted successfully');
      setSelectedStudents([]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to promote students');
    }
  });

  const filteredStudents = studentsData?.data?.filter(s =>
    (s.student?.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.student?.admissionNo || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.studentId));
    }
  };

  const handlePromote = () => {
    if (!targetClassId) {
      toast.error('Please select a target class');
      return;
    }
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    promotionMutation.mutate({
      studentIds: selectedStudents,
      targetClassSectionId: targetClassId
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Promotion</h1>
          <p className="text-gray-500">Bulk promote students to the next grade or academic year.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Filter className="h-4 w-4 text-indigo-600" />
              Promotion Setup
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Source Class (Current)</label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={sourceClassId}
                  onChange={(e) => setSourceClassId(e.target.value)}
                >
                  <option value="">Select Source Class</option>
                  {sectionsData?.data?.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.gradeLevel?.displayName} - {s.section}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center py-2">
                <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <ArrowRight className="h-4 w-4 rotate-90 lg:rotate-0" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Target Class (Next)</label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                >
                  <option value="">Select Target Class</option>
                  {sectionsData?.data?.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.gradeLevel?.displayName} - {s.section}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handlePromote}
                disabled={!sourceClassId || !targetClassId || selectedStudents.length === 0}
                isLoading={promotionMutation.isPending}
              >
                Promote {selectedStudents.length} Students
              </Button>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-bold uppercase tracking-wider">Important Note</p>
              <p>Promotion creates new enrollments for the selected students in the target class. This action cannot be easily undone.</p>
            </div>
          </div>
        </div>

        {/* Student Selection Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {selectedStudents.length} of {filteredStudents.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredStudents.length === 0}
              >
                {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!sourceClassId ? (
              <div className="h-full flex flex-col items-center justify-center p-10 text-center text-gray-400">
                <Users className="h-12 w-12 mb-4 opacity-20" />
                <p>Select a source class to view students eligible for promotion.</p>
              </div>
            ) : isLoadingStudents ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-10 text-center text-gray-400">
                <Users className="h-12 w-12 mb-4 opacity-20" />
                <p>No students found in this class.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-10">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Admission No</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Roll No</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((enrollment) => (
                    <tr
                      key={enrollment.id}
                      className={clsx(
                        "hover:bg-gray-50 transition-colors cursor-pointer",
                        selectedStudents.includes(enrollment.studentId) && "bg-indigo-50/30"
                      )}
                      onClick={() => handleToggleStudent(enrollment.studentId)}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedStudents.includes(enrollment.studentId)}
                          onChange={() => handleToggleStudent(enrollment.studentId)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <Users className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {enrollment.student?.user?.email ? enrollment.student.user.email.split('@')[0] : 'No Email'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {enrollment.student?.admissionNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {enrollment.rollNumber || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
