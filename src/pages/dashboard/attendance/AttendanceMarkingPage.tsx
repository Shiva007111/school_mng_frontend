import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Filter,
  Loader2,
  Search,
  UserCheck,
  BarChart3
} from 'lucide-react';
import { academicService } from '@/services/academic.service';
import { attendanceService } from '@/services/attendance.service';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import type { AttendanceStatus } from '@/types/attendance.types';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils/cn';

export const AttendanceMarkingPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [searchQuery, setSearchQuery] = useState('');
  const [localAttendance, setLocalAttendance] = useState<Record<string, { status: AttendanceStatus, remarks?: string }>>({});

  // Fetch Class Sections
  const { data: sectionsData } = useQuery({
    queryKey: ['class-sections'],
    queryFn: () => academicService.getClassSections(),
  });

  // Fetch Students & Current Attendance
  const { data: reportData, isLoading: isLoadingReport } = useQuery({
    queryKey: ['attendance-report', selectedSectionId, selectedDate],
    queryFn: () => attendanceService.getClassDailyReport(selectedSectionId, selectedDate),
    enabled: !!selectedSectionId && !!selectedDate,
  });

  const sections = sectionsData?.data || [];
  const students = reportData?.data || [];

  // Initialize local state when data loads
  React.useEffect(() => {
    if (students.length > 0) {
      const initialState: Record<string, { status: AttendanceStatus, remarks?: string }> = {};
      students.forEach(item => {
        initialState[item.student.id] = {
          status: item.attendance?.status || 'present',
          remarks: item.attendance?.remarks || '',
        };
      });
      setLocalAttendance(initialState);
    }
  }, [students]);

  const bulkMarkMutation = useMutation({
    mutationFn: (data: any) => attendanceService.bulkMarkAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-report', selectedSectionId, selectedDate] });
      toast.success('Attendance saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    },
  });

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status: prev[studentId]?.status || 'present', remarks }
    }));
  };

  const handleSave = () => {
    const events = Object.entries(localAttendance).map(([studentId, data]) => ({
      studentId,
      date: selectedDate,
      status: data.status,
      remarks: data.remarks,
    }));

    bulkMarkMutation.mutate({ events });
  };

  const filteredStudents = students.filter(item =>
    item.student.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: students.length,
    present: Object.values(localAttendance).filter(a => a.status === 'present').length,
    absent: Object.values(localAttendance).filter(a => a.status === 'absent').length,
    late: Object.values(localAttendance).filter(a => a.status === 'late').length,
    excused: Object.values(localAttendance).filter(a => a.status === 'excused').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-500">Record daily attendance for your class sections.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/attendance/report')}
            className="text-gray-600"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Reports
          </Button>
          {selectedSectionId && (
            <Button
              onClick={handleSave}
              isLoading={bulkMarkMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Attendance
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        <select
          value={selectedSectionId}
          onChange={(e) => setSelectedSectionId(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
        >
          <option value="">Select Class Section</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.gradeLevel?.displayName} - {section.section}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
        />

        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {!selectedSectionId ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-20 text-center">
          <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Section Selected</h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">
            Please select a class section and date to start marking attendance.
          </p>
        </div>
      ) : isLoadingReport ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-500">Loading student list...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
              <p className="text-xs font-medium text-green-600 uppercase">Present</p>
              <p className="text-2xl font-bold text-green-700">{stats.present}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
              <p className="text-xs font-medium text-red-600 uppercase">Absent</p>
              <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm">
              <p className="text-xs font-medium text-amber-600 uppercase">Late/Excused</p>
              <p className="text-2xl font-bold text-amber-700">{stats.late + stats.excused}</p>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Admission No</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((item) => {
                  const current = localAttendance[item.student.id] || { status: 'present' };
                  return (
                    <tr key={item.student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {item.student.user?.email[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {item.student.user?.email.split('@')[0]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.student.admissionNo}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(item.student.id, 'present')}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              current.status === 'present'
                                ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                                : "text-gray-400 hover:bg-gray-100"
                            )}
                            title="Present"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.student.id, 'absent')}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              current.status === 'absent'
                                ? "bg-red-100 text-red-700 ring-1 ring-red-200"
                                : "text-gray-400 hover:bg-gray-100"
                            )}
                            title="Absent"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.student.id, 'late')}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              current.status === 'late'
                                ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                                : "text-gray-400 hover:bg-gray-100"
                            )}
                            title="Late"
                          >
                            <Clock className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.student.id, 'excused')}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              current.status === 'excused'
                                ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                                : "text-gray-400 hover:bg-gray-100"
                            )}
                            title="Excused"
                          >
                            <AlertCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          placeholder="Add note..."
                          value={current.remarks || ''}
                          onChange={(e) => handleRemarksChange(item.student.id, e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-600 placeholder:text-gray-400"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="p-10 text-center text-gray-500">
                No students found matching your search.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
