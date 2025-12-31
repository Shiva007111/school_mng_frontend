import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  IndianRupee, 
  Calendar,
  Download,
  Filter,
  Loader2
} from 'lucide-react';
import { reportService } from '@/services/report.service';
import { academicService } from '@/services/academic.service';
import { Button } from '@/components/Button';

export const ReportsPage: React.FC = () => {
  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');

  // Fetch Academic Years
  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicService.getAcademicYears(),
  });

  // Fetch Class Sections
  const { data: sectionsData } = useQuery({
    queryKey: ['class-sections'],
    queryFn: () => academicService.getClassSections(),
  });

  // Fetch Fee Report
  const { data: feeReport, isLoading: isLoadingFees } = useQuery({
    queryKey: ['fee-report', selectedYearId],
    queryFn: () => reportService.getFeeReport(selectedYearId),
    enabled: !!selectedYearId,
  });

  // Fetch Attendance Report
  const { data: attendanceReport, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendance-report', selectedClassId],
    queryFn: () => reportService.getAttendanceReport({ classSectionId: selectedClassId }),
    enabled: !!selectedClassId,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">School Reports</h1>
          <p className="text-gray-500">View and export academic and financial summaries.</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fee Collection Report */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-green-600" />
              Fee Collection
            </h2>
            <select 
              className="text-sm border-none bg-gray-50 rounded-lg px-2 py-1 focus:ring-0"
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
            >
              <option value="">Select Year</option>
              {yearsData?.data?.map(y => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>
          </div>

          {!selectedYearId ? (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400 text-sm">
              <Filter className="h-8 w-8 mb-2 opacity-20" />
              <p>Select an academic year to view fee reports.</p>
            </div>
          ) : isLoadingFees ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Collected</p>
                  <p className="text-xl font-bold text-green-700">₹{feeReport?.data?.totalCollected.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Pending</p>
                  <p className="text-xl font-bold text-amber-700">₹{feeReport?.data?.pendingAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Invoice Status Breakdown</p>
                <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${(feeReport?.data?.statusBreakdown.paid || 0) / (Object.values(feeReport?.data?.statusBreakdown || {}).reduce((a, b) => a + b, 0) || 1) * 100}%` }} 
                  />
                  <div 
                    className="bg-amber-400" 
                    style={{ width: `${(feeReport?.data?.statusBreakdown.partial || 0) / (Object.values(feeReport?.data?.statusBreakdown || {}).reduce((a, b) => a + b, 0) || 1) * 100}%` }} 
                  />
                  <div 
                    className="bg-red-400" 
                    style={{ width: `${(feeReport?.data?.statusBreakdown.due || 0) / (Object.values(feeReport?.data?.statusBreakdown || {}).reduce((a, b) => a + b, 0) || 1) * 100}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-green-500" /> Paid</span>
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-amber-400" /> Partial</span>
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-red-400" /> Due</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Attendance Summary Report */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Attendance Summary
            </h2>
            <select 
              className="text-sm border-none bg-gray-50 rounded-lg px-2 py-1 focus:ring-0"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="">Select Class</option>
              {sectionsData?.data?.map(s => (
                <option key={s.id} value={s.id}>{s.gradeLevel?.displayName} - {s.section}</option>
              ))}
            </select>
          </div>

          {!selectedClassId ? (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400 text-sm">
              <Filter className="h-8 w-8 mb-2 opacity-20" />
              <p>Select a class to view attendance reports.</p>
            </div>
          ) : isLoadingAttendance ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="relative h-32 w-32">
                  {/* Simple Pie Chart Representation */}
                  <div className="absolute inset-0 rounded-full border-[12px] border-blue-100" />
                  <div 
                    className="absolute inset-0 rounded-full border-[12px] border-blue-500" 
                    style={{ clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((attendanceReport?.data?.present || 0) / (attendanceReport?.data?.total || 1) * 2 * Math.PI - Math.PI / 2)}% ${50 + 50 * Math.sin((attendanceReport?.data?.present || 0) / (attendanceReport?.data?.total || 1) * 2 * Math.PI - Math.PI / 2)}%)` }} 
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">
                      {Math.round(((attendanceReport?.data?.present || 0) / (attendanceReport?.data?.total || 1)) * 100)}%
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Present</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="text-sm text-gray-500">Present</span>
                  <span className="text-sm font-bold text-gray-900">{attendanceReport?.data?.present}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="text-sm text-gray-500">Absent</span>
                  <span className="text-sm font-bold text-gray-900">{attendanceReport?.data?.absent}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="text-sm text-gray-500">Late</span>
                  <span className="text-sm font-bold text-gray-900">{attendanceReport?.data?.late}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <span className="text-sm text-gray-500">Excused</span>
                  <span className="text-sm font-bold text-gray-900">{attendanceReport?.data?.excused}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Academic Performance Placeholder */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center space-y-4">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <TrendingUp className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Academic Performance Analytics</h3>
          <p className="text-gray-500 max-w-md mx-auto mt-2">
            Detailed performance trends, subject-wise analysis, and student progress tracking will be available in the next update.
          </p>
        </div>
        <Button variant="outline" disabled className="mt-4">
          Enable Advanced Analytics
        </Button>
      </div>
    </div>
  );
};
