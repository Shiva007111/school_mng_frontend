import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    TrendingUp
} from 'lucide-react';
import { studentService } from '@/services/student.service';
import { attendanceService } from '@/services/attendance.service';
import { cn } from '@/utils/cn';

export const StudentAttendancePage: React.FC = () => {
    // Fetch Student Profile
    const { data: studentData, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['student-me'],
        queryFn: () => studentService.getMe(),
    });

    const student = studentData?.data;

    // Fetch Attendance History
    const { data: attendanceData, isLoading: isLoadingAttendance } = useQuery({
        queryKey: ['my-attendance', student?.id],
        queryFn: () => attendanceService.getStudentHistory(student!.id),
        enabled: !!student?.id,
    });

    const attendanceEvents = attendanceData?.data || [];

    // Calculate stats
    const stats = {
        present: attendanceEvents.filter(e => e.status === 'present').length,
        absent: attendanceEvents.filter(e => e.status === 'absent').length,
        late: attendanceEvents.filter(e => e.status === 'late').length,
        total: attendanceEvents.length,
    };

    const attendancePercentage = stats.total > 0
        ? Math.round(((stats.present + stats.late) / stats.total) * 100)
        : 0;

    if (isLoadingProfile) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-semibold text-gray-900">Profile Not Found</h2>
                <p className="text-gray-500 mt-2">We couldn't find your student profile.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
                <p className="text-gray-500">Track your daily attendance records.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-indigo-600" />
                        <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
                    </div>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">{attendancePercentage}%</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium text-gray-500">Present</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <p className="text-sm font-medium text-gray-500">Absent</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <p className="text-sm font-medium text-gray-500">Late</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
                </div>
            </div>

            {/* History List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        Attendance History
                    </h2>
                </div>

                {isLoadingAttendance ? (
                    <div className="p-8 text-center">
                        <Loader2 className="h-6 w-6 text-indigo-600 animate-spin mx-auto" />
                    </div>
                ) : attendanceEvents.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {attendanceEvents.map((event) => (
                            <div key={event.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-10 w-10 rounded-lg flex items-center justify-center",
                                        event.status === 'present' && "bg-green-100 text-green-600",
                                        event.status === 'absent' && "bg-red-100 text-red-600",
                                        event.status === 'late' && "bg-orange-100 text-orange-600",
                                        event.status === 'excused' && "bg-blue-100 text-blue-600",
                                    )}>
                                        {event.status === 'present' && <CheckCircle2 className="h-5 w-5" />}
                                        {event.status === 'absent' && <XCircle className="h-5 w-5" />}
                                        {event.status === 'late' && <Clock className="h-5 w-5" />}
                                        {event.status === 'excused' && <Calendar className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                        {event.markedAt && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Marked at {new Date(event.markedAt).toLocaleString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </p>
                                        )}
                                        {event.remarks && (
                                            <p className="text-sm text-gray-500">{event.remarks}</p>
                                        )}
                                    </div>
                                </div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-semibold",
                                    event.status === 'present' && "bg-green-50 text-green-700",
                                    event.status === 'absent' && "bg-red-50 text-red-700",
                                    event.status === 'late' && "bg-orange-50 text-orange-700",
                                    event.status === 'excused' && "bg-blue-50 text-blue-700",
                                )}>
                                    {event.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">No attendance records found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
