import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Calendar,
    BookOpen,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { examService } from '@/services/exam.service';
import { studentService } from '@/services/student.service';
import { attendanceService } from '@/services/attendance.service';
import { Button } from '@/components/Button';

export const StudentGradesPage: React.FC = () => {
    const navigate = useNavigate();

    // Fetch Student Profile
    const { data: studentProfileData, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['student-profile'],
        queryFn: () => studentService.getMe(),
    });

    const studentProfile = studentProfileData?.data;
    const studentId = studentProfile?.id;
    const classSectionId = studentProfile?.enrollments?.[0]?.classSectionId;

    // Fetch Exam Sessions
    const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
        queryKey: ['student-exam-sessions'],
        queryFn: () => examService.getExamSessions(),
    });

    // Fetch All Exams (to get subjects for sessions)
    const { data: examsData, isLoading: isLoadingExams } = useQuery({
        queryKey: ['all-exams', classSectionId],
        queryFn: () => examService.getExams({ classSectionId }),
        enabled: !!classSectionId,
    });

    // Fetch Student Attendance History
    const { data: attendanceData, isLoading: isLoadingAttendance } = useQuery({
        queryKey: ['student-attendance-history', studentId],
        queryFn: () => attendanceService.getStudentHistory(studentId!),
        enabled: !!studentId,
    });

    const sessions = sessionsData?.data || [];
    const allExams = examsData?.data || [];
    const attendanceHistory = attendanceData?.data || [];

    const getAttendanceStatus = (date: string) => {
        const examDate = new Date(date).toDateString();
        const attendance = attendanceHistory.find(a => new Date(a.date).toDateString() === examDate);

        if (!attendance) return { label: 'Not Marked', icon: AlertCircle, color: 'text-gray-400' };

        switch (attendance.status.toLowerCase()) {
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

    if (!studentProfile && !isLoadingProfile) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-semibold text-gray-900">Student Profile Not Found</h2>
                <p className="text-gray-500 mt-2">We couldn't find a student profile associated with your account.</p>
            </div>
        );
    }

    if (isLoadingSessions || isLoadingAttendance || isLoadingExams || isLoadingProfile) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Grades & Exams</h1>
                <p className="text-gray-500">View your upcoming exam schedules and past results.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {sessions.length === 0 ? (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-20 text-center">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No Exam Sessions Found</h3>
                        <p className="text-gray-500 mt-2">There are no exam sessions scheduled for your class yet.</p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div key={session.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shadow-sm ${session.publishAt ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-indigo-600'}`}>
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{session.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/dashboard/exams/${session.id}?viewOnly=true${classSectionId ? `&classSectionId=${classSectionId}` : ''}&studentId=${studentId}`)}
                                    >
                                        Full Schedule
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                    {session.publishAt && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/dashboard/exams/report-card/${studentId}/${session.id}`)}
                                        >
                                            View Report Card
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Quick View of Subjects */}
                            <div className="p-6">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Exam Subjects & Attendance</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allExams
                                        .filter(exam => exam.examSessionId === session.id)
                                        .flatMap(exam => exam.examSubjects || [])
                                        .map((es: any) => {
                                            const status = getAttendanceStatus(es.examDate);
                                            const Icon = status.icon;
                                            return (
                                                <div key={es.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{es.classSubject?.subject?.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Calendar className="h-3 w-3 text-gray-400" />
                                                            <p className="text-xs text-gray-500">
                                                                {es.examDate ? new Date(es.examDate).toLocaleDateString() : 'No date set'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-gray-100 shadow-sm ${status.color}`}>
                                                            <Icon className="h-3.5 w-3.5" />
                                                            <span className="text-xs font-bold">{status.label}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    {allExams.filter(exam => exam.examSessionId === session.id).length === 0 && (
                                        <div className="col-span-full p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <BookOpen className="h-5 w-5 text-indigo-600" />
                                                <span className="text-sm font-medium text-indigo-900">No subjects scheduled for this session yet.</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
