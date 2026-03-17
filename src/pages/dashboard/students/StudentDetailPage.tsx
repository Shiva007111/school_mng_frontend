import { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import { studentService } from '@/services/student.service';
import { attendanceService } from '@/services/attendance.service';
import { examService } from '@/services/exam.service';
import { feeService } from '@/services/fee.service';
import { Button } from '@/components/Button';
import EnrollmentModal from './EnrollmentModal';
import LinkParentModal from './LinkParentModal';
import {
  User,
  Calendar,
  Mail,
  Phone,
  ArrowLeft,
  Edit,
  GraduationCap,
  Users,
  Receipt,
  IndianRupee,
  Clock
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { academicService } from '@/services/academic.service';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isLinkParentModalOpen, setIsLinkParentModalOpen] = useState(false);
  const location = useLocation();
  const from = location.state?.from;

  const { data, isLoading, error } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getStudentById(id!),
    enabled: !!id,
  });

  const { data: currentYearData } = useQuery({
    queryKey: ['current-academic-year'],
    queryFn: () => academicService.getCurrentAcademicYear(),
  });

  const academicYear = currentYearData?.data;

  // Fetch attendance history (Full Academic Year if available, otherwise last 30 days)
  const { data: attendanceData } = useQuery({
    queryKey: ['attendance', id, academicYear?.id],
    queryFn: () => {
      const now = new Date();
      const endDate = now;
      let startDate: Date;

      if (academicYear?.startDate) {
        const ayStart = new Date(academicYear.startDate);
        // If academic year starts in the future, or we just want a fallback if it's too far back
        if (ayStart > now) {
          startDate = new Date(new Date().setDate(now.getDate() - 30));
        } else {
          startDate = ayStart;
        }
      } else {
        startDate = new Date(new Date().setDate(now.getDate() - 30));
      }

      return attendanceService.getStudentHistory(
        id!,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
    },
    enabled: !!id,
  });

  const student = data?.data;

  // Get academic year from student's active enrollment
  const enrollmentAcademicYearId = student?.enrollments?.[0]?.classSection?.academicYearId;

  // Fetch exam sessions for the student's academic year
  const { data: examSessionsData } = useQuery({
    queryKey: ['exam-sessions', enrollmentAcademicYearId],
    queryFn: () => examService.getExamSessions(enrollmentAcademicYearId),
    enabled: !!enrollmentAcademicYearId,
  });


  // Fetch report cards for ALL available exam sessions
  const reportCardsResults = useQueries({
    queries: (examSessionsData?.data || []).map((session: any) => ({
      queryKey: ['report-card', id, session.id],
      queryFn: () => examService.getReportCard(id!, session.id),
      enabled: !!id && !!session.id,
    })),
  });


  // Extract the most recent successful report card for the primary pie chart (optional fallback)
  const reportCardData = reportCardsResults.find(r => r.data)?.data;

  // Fetch fee invoices
  const { data: feeData } = useQuery({
    queryKey: ['student-fees', id],
    queryFn: () => feeService.getStudentInvoices(id!),
    enabled: !!id,
  });


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading student details...</div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-500 font-medium">Error loading student details.</div>
        <Link to="/dashboard/students">
          <Button variant="outline">Back to Students</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="p-2"
            onClick={() => {
              if (location.state?.from) {
                navigate(location.state.from);
              } else {
                navigate("/dashboard/students"); // fallback
              }
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
            <p className="text-sm text-gray-500">Viewing profile for {student.user?.firstName} {student.user?.lastName}</p>
          </div>
        </div>
        {from !== 'parent' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate(`/dashboard/students/${id}/edit`)}
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column: Basic Info */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{student.user?.firstName} {student.user?.lastName}</h2>
              <p className="text-sm text-gray-500 mb-4">{student.admissionNo}</p>
              <span className={cn(
                "px-3 py-1 text-xs font-semibold rounded-full",
                student.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              )}>
                {student.status.toUpperCase()}
              </span>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                {student.user?.email || 'No Email'}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                {student.user?.phone || 'No phone provided'}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                Born on {new Date(student.dob).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Users className="h-4 w-4 text-gray-400" />
                {student.gender}
              </div>
            </div>
          </div>

          {/* Parents Info */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Parents / Guardians</h3>
            {student.studentParents && student.studentParents.length > 0 ? (
              <div className="space-y-4">
                {student.studentParents.map((sp) => (
                  <div key={sp.parentId} className="flex items-start gap-3 p-3 rounded-md bg-gray-50">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {sp.parent.user.firstName} {sp.parent.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{sp.relationship}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No parent information linked.</p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => setIsLinkParentModalOpen(true)}
            >
              Link Parent
            </Button>

          </div>
        </div>

        {/* Right Column: Academic Info */}
        <div className="xl:col-span-3 space-y-6">
          {/* Current Enrollment */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-indigo-600" />
              Academic Enrollment
            </h3>
            {student.enrollments && student.enrollments.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 border border-gray-100 rounded-lg bg-indigo-50/30">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Grade & Section</p>
                  <p className="text-base font-bold text-gray-900">
                    {student.enrollments[0].classSection?.gradeLevel?.displayName || 'N/A'} - {student.enrollments[0].classSection?.section || 'N/A'}
                  </p>
                </div>
                <div className="p-3 border border-gray-100 rounded-lg bg-indigo-50/30">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Roll Number</p>
                  <p className="text-base font-bold text-gray-900">
                    #{student.enrollments[0].rollNumber}
                  </p>
                </div>
                <div className="p-3 border border-gray-100 rounded-lg bg-indigo-50/30">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Joined On</p>
                  <p className="text-base font-bold text-gray-900">
                    {new Date(student.enrollments[0].joinedOn).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-sm text-gray-500 mb-3">Student is not currently enrolled in any class.</p>
                <Button size="sm" onClick={() => setIsEnrollModalOpen(true)}>Enroll Now</Button>
              </div>
            )}
          </div>

          {/* Student Fee Details */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-indigo-600" />
              Fee Details
            </h3>
            {feeData?.data && feeData.data.length > 0 ? (
              <div className="space-y-3">
                {feeData.data.map((invoice: any) => {
                  const totalPaid = invoice.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
                  const balance = Number(invoice.totalAmount) - totalPaid;

                  return (
                    <div key={invoice.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-3 bg-gray-50/50 flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-white rounded-lg border border-gray-200">
                            <Receipt className="h-3 w-3 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{invoice.feeStructure.name}</p>
                            <p className="text-xs text-gray-500">#{invoice.invoiceNo}</p>
                          </div>
                        </div>
                        <div className={cn(
                          "px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                          invoice.status === 'paid' ? "bg-green-100 text-green-700" :
                            invoice.status === 'partial' ? "bg-amber-100 text-amber-700" :
                              "bg-red-100 text-red-700"
                        )}>
                          {invoice.status}
                        </div>
                      </div>
                      <div className="p-3 grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400 uppercase font-semibold">Total</p>
                          <p className="text-sm font-bold text-gray-900">₹{Number(invoice.totalAmount).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400 uppercase font-semibold">Paid</p>
                          <p className="text-sm font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400 uppercase font-semibold">Balance</p>
                          <p className="text-sm font-bold text-red-600">₹{balance.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-500">No fee invoices found for this student.</p>
              </div>
            )}
          </div>

          {/* Performance & Academic Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attendance Pie Chart */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Academic Year Attendance
              </h3>
              <div className="h-[250px] w-full">
                {attendanceData?.data && attendanceData.data.length > 0 ? (() => {
                  const attendancePieData = [
                    { name: 'Present', value: attendanceData.data.filter((r: any) => r.status === 'present').length, color: '#10b981' },
                    { name: 'Absent', value: attendanceData.data.filter((r: any) => r.status === 'absent').length, color: '#ef4444' },
                    { name: 'Late', value: attendanceData.data.filter((r: any) => r.status === 'late').length, color: '#f59e0b' },
                    { name: 'Excused', value: attendanceData.data.filter((r: any) => r.status === 'excused').length, color: '#3b82f6' },
                  ].filter(d => d.value > 0);

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={attendancePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {attendancePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  );
                })() : (
                  <div className="h-full flex items-center justify-center text-gray-400 italic">
                    No attendance data for this year
                  </div>
                )}
              </div>
            </div>

            {/* Performance Report Chart */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                Academic Performance
              </h3>
              <div className="h-[250px] w-full">
                {reportCardData?.data?.subjects && reportCardData.data.subjects.length > 0 ? (() => {
                  const performancePieData = [
                    { name: 'Excellent (90%+)', value: reportCardData.data.subjects.filter((s: any) => (s.totalObtained / s.totalMax) >= 0.9).length, color: '#10b981' },
                    { name: 'Good (75-90%)', value: reportCardData.data.subjects.filter((s: any) => (s.totalObtained / s.totalMax) >= 0.75 && (s.totalObtained / s.totalMax) < 0.9).length, color: '#3b82f6' },
                    { name: 'Average (60-75%)', value: reportCardData.data.subjects.filter((s: any) => (s.totalObtained / s.totalMax) >= 0.6 && (s.totalObtained / s.totalMax) < 0.75).length, color: '#f59e0b' },
                    { name: 'Below Avg (<60%)', value: reportCardData.data.subjects.filter((s: any) => (s.totalObtained / s.totalMax) < 0.6).length, color: '#ef4444' },
                  ].filter(d => d.value > 0);

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={performancePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {performancePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  );
                })() : (
                  <div className="h-full flex items-center justify-center text-gray-400 italic">
                    No report card data available
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Session-wise Performance Summary */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Academic Session Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {examSessionsData?.data?.map((session: any, idx: number) => {
                const sessionReport = reportCardsResults[idx]?.data?.data;
                const percentage = sessionReport ? ((sessionReport.overallTotalObtained / sessionReport.overallTotalMax) * 100) : null;

                return (
                  <div key={session.id} className="relative p-5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-200 overflow-hidden group">
                    {/* Decorative Background Element */}
                    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                      <GraduationCap className="h-24 w-24 text-indigo-600 rotate-12" />
                    </div>

                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{session.name}</span>
                        {percentage !== null && (
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                            percentage >= 40 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}>
                            {percentage >= 40 ? 'Pass' : 'Fail'}
                          </span>
                        )}
                      </div>

                      {percentage !== null && sessionReport ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-gray-900 tracking-tight">{percentage.toFixed(1)}%</span>
                          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                            {sessionReport.overallTotalObtained}/{sessionReport.overallTotalMax} Marks
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="h-2 w-2 rounded-full bg-gray-300 animate-pulse" />
                          <span className="text-sm font-medium italic">Pending/No Data</span>
                        </div>
                      )}

                      {/* Progress bar */}
                      {percentage !== null && (
                        <div className="mt-4 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              percentage >= 75 ? "bg-green-500" : percentage >= 40 ? "bg-indigo-500" : "bg-red-500"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {(!examSessionsData?.data || examSessionsData.data.length === 0) && (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <Clock className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">No academic sessions scheduled for this year</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {isEnrollModalOpen && (
        <EnrollmentModal
          studentId={student.id}
          studentName={`${student.user?.firstName} ${student.user.lastName}` || student.admissionNo}
          onClose={() => setIsEnrollModalOpen(false)}
        />
      )}
      {isLinkParentModalOpen && (
        <LinkParentModal
          studentId={student.id}
          studentName={`${student.user?.firstName} ${student.user?.lastName}` || student.admissionNo}
          onClose={() => setIsLinkParentModalOpen(false)}
        />
      )}
    </div>
  );
}
