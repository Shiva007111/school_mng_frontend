import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Calendar,
  Filter,
  Loader2,
  Search,
  Download,
  FileText,
  TrendingUp,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { academicService } from '@/services/academic.service';
import { attendanceService } from '@/services/attendance.service';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { cn } from '@/utils/cn';

export const AttendanceReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Class Sections
  const { data: sectionsData } = useQuery({
    queryKey: ['class-sections'],
    queryFn: () => academicService.getClassSections(),
  });

  // Fetch Daily Report
  const { data: reportData, isLoading: isLoadingReport } = useQuery({
    queryKey: ['attendance-report', selectedSectionId, selectedDate],
    queryFn: () => attendanceService.getClassDailyReport(selectedSectionId, selectedDate),
    enabled: !!selectedSectionId && !!selectedDate,
  });

  const sections = sectionsData?.data || [];
  const students = reportData?.data || [];

  const filteredStudents = students.filter(item =>
    item.student.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: students.length,
    present: students.filter(a => a.attendance?.status === 'present').length,
    absent: students.filter(a => a.attendance?.status === 'absent').length,
    late: students.filter(a => a.attendance?.status === 'late').length,
    excused: students.filter(a => a.attendance?.status === 'excused').length,
    notMarked: students.filter(a => !a.attendance).length,
  };

  const attendancePercentage = stats.total > 0
    ? Math.round(((stats.present + stats.late) / stats.total) * 100)
    : 0;

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;

    const headers = ['Student Name', 'Admission No', 'Status', 'Remarks'];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(item => {
        const name = item.student.user?.firstName || item.student.user?.lastName
          ? `${item.student.user.firstName || ''} ${item.student.user.lastName || ''}`.trim()
          : item.student.user?.email.split('@')[0] || '';

        return [
          `"${name}"`,
          `"${item.student.admissionNo}"`,
          item.attendance?.status || 'Not Marked',
          `"${item.attendance?.remarks || ''}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    if (filteredStudents.length === 0) return;

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Attendance Report', 14, 22);

    // Add metadata
    doc.setFontSize(11);
    doc.text(`Date: ${selectedDate}`, 14, 32);
    const sectionName = sections.find(s => s.id === selectedSectionId);
    if (sectionName) {
      doc.text(`Class: ${sectionName.gradeLevel?.displayName} - ${sectionName.section}`, 14, 40);
    }

    // Add summary stats
    doc.text(`Present: ${stats.present} | Absent: ${stats.absent} | Late: ${stats.late} | Excused: ${stats.excused}`, 14, 48);

    // Add table
    const tableColumn = ["Student Name", "Admission No", "Status", "Remarks"];
    const tableRows = filteredStudents.map(item => {
      const name = item.student.user?.firstName || item.student.user?.lastName
        ? `${item.student.user.firstName || ''} ${item.student.user.lastName || ''}`.trim()
        : item.student.user?.email.split('@')[0] || '';

      return [
        name,
        item.student.admissionNo,
        item.attendance?.status ? item.attendance.status.charAt(0).toUpperCase() + item.attendance.status.slice(1) : 'Not Marked',
        item.attendance?.remarks || '-'
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [79, 70, 229] } // Indigo-600
    });

    doc.save(`attendance_report_${selectedDate}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-500">View and analyze attendance data across classes.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/attendance')}
            className="text-gray-600"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Mark Attendance
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-gray-600"
              onClick={handleExportCSV}
              disabled={filteredStudents.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              className="text-gray-600"
              onClick={handlePrintPDF}
              disabled={filteredStudents.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Print PDF
            </Button>
          </div>
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
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Section Selected</h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">
            Please select a class section and date to view the attendance report.
          </p>
        </div>
      ) : isLoadingReport ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-500">Generating report...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{attendancePercentage}%</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Present Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.present} / {stats.total}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Absent Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
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
                {filteredStudents.map((item) => (
                  <tr key={item.student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-xs">
                          {item.student.user?.email[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {item.student.user?.firstName || item.student.user?.lastName ?
                            `${item.student.user.firstName || ''} ${item.student.user.lastName || ''}`.trim() :
                            item.student.user?.email.split('@')[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.student.admissionNo}
                    </td>
                    <td className="px-6 py-4">
                      {item.attendance ? (
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium border",
                          item.attendance.status === 'present' && "bg-green-50 text-green-700 border-green-100",
                          item.attendance.status === 'absent' && "bg-red-50 text-red-700 border-red-100",
                          item.attendance.status === 'late' && "bg-amber-50 text-amber-700 border-amber-100",
                          item.attendance.status === 'excused' && "bg-blue-50 text-blue-700 border-blue-100"
                        )}>
                          {item.attendance.status.charAt(0).toUpperCase() + item.attendance.status.slice(1)}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100">
                          Not Marked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 italic">
                      {item.attendance?.remarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="p-10 text-center text-gray-500">
                No data available for the selected filters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
