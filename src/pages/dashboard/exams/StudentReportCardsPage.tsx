import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    User,
    ChevronRight,
    FileText,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import { studentService } from '@/services/student.service';
import { examService } from '@/services/exam.service';
import { academicService } from '@/services/academic.service';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

const StudentReportCardsPage: React.FC = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [selectedGrade, setSelectedGrade] = useState<string>('all');

    const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
        queryKey: ['students-for-reports', search, selectedGrade],
        queryFn: () => studentService.getStudents({ search, gradeLevelId: selectedGrade === 'all' ? undefined : selectedGrade }),
    });

    const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
        queryKey: ['exam-sessions'],
        queryFn: () => examService.getExamSessions(),
    });

    const { data: gradesData } = useQuery({
        queryKey: ['grade-levels'],
        queryFn: () => academicService.getGradeLevels(),
    });

    const students = studentsData?.data || [];
    const sessions = sessionsData?.data || [];
    const grades = gradesData?.data || [];

    // Set default session if not selected
    React.useEffect(() => {
        if (sessions.length > 0 && !selectedSession) {
            const activeSession = sessions.find(s => !s.publishAt) || sessions[0];
            setSelectedSession(activeSession.id);
        }
    }, [sessions, selectedSession]);

    const isLoading = isLoadingStudents || isLoadingSessions;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Report Cards</h1>
                    <p className="text-gray-500">View academic performance reports for all students</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Input
                            placeholder="Search students..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search className="h-4 w-4" />}
                        />
                    </div>
                    <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                        <option value="all">All Grades</option>
                        {grades.map((grade) => (
                            <option key={grade.id} value={grade.id}>
                                {grade.displayName}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedSession}
                        onChange={(e) => setSelectedSession(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                        <option value="">Select Session</option>
                        {sessions.map((session) => (
                            <option key={session.id} value={session.id}>
                                {session.name} {session.publishAt ? '(Published)' : '(Active)'}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                </div>
            ) : students.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No students found matching your search</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map((student) => {
                        const currentEnrollment = student.enrollments?.[0];
                        const section = currentEnrollment?.classSection;

                        return (
                            <div key={student.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                            {student.user?.firstName?.[0]}{student.user?.lastName?.[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                {student.user?.firstName} {student.user?.lastName}
                                            </h3>
                                            <p className="text-xs text-gray-500">Adm: {student.admissionNo}</p>
                                        </div>
                                    </div>
                                    {section && (
                                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                            {section.gradeLevel?.displayName} - {section.section}
                                        </span>
                                    )}
                                </div>

                                <Button
                                    className="w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border-none transition-all"
                                    onClick={() => navigate(`/dashboard/exams/report-card/${student.id}/${selectedSession}`)}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Report Card
                                    <ChevronRight className="h-4 w-4 ml-auto" />
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentReportCardsPage;
