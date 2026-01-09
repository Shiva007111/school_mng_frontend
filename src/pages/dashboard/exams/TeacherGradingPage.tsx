import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Calendar,
  Users,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { examService } from '@/services/exam.service';
import { academicService } from '@/services/academic.service';
import { useAuth } from '@/context/AuthContext';

export const TeacherGradingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch Class Sections where this teacher is assigned
  // For now, we'll fetch all and filter by classTeacherId if we have the teacher's ID
  // In a real app, the backend should provide a /my-classes endpoint
  const { data: sectionsData, isLoading: isLoadingSections } = useQuery({
    queryKey: ['teacher-sections', user?.id],
    queryFn: () => academicService.getClassSections(),
  });

  // Fetch Active Exam Sessions
  const { data: sessionsData } = useQuery({
    queryKey: ['active-exam-sessions'],
    queryFn: () => examService.getExamSessions(),
  });

  const sections = sectionsData?.data || [];
  const allSessions = sessionsData?.data || [];
  const activeSessions = allSessions.filter(s => !s.publishAt);
  const pastSessions = allSessions.filter(s => s.publishAt);

  if (isLoadingSections) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Grading Dashboard</h1>
        <p className="text-gray-500">Manage exams and enter marks for your assigned classes.</p>
      </div>

      {activeSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Active Exam Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSessions.map((session) => (
              <div key={session.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-gray-900">{session.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Starts: {new Date(session.startDate).toLocaleDateString()}
                </p>
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Classes</p>
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => navigate(`/dashboard/exams/${session.id}?classSectionId=${section.id}`)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">{section.gradeLevel?.displayName} - {section.section}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pastSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            Past Exam Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastSessions.map((session) => (
              <div key={session.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow opacity-75 hover:opacity-100">
                <h3 className="font-bold text-gray-900">{session.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Published: {new Date(session.publishAt!).toLocaleDateString()}
                </p>
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">View Results</p>
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => navigate(`/dashboard/exams/${session.id}?classSectionId=${section.id}&viewOnly=true`)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">{section.gradeLevel?.displayName} - {section.section}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-green-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/dashboard/attendance')}
            className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all text-left"
          >
            <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Mark Attendance</h4>
              <p className="text-sm text-gray-500">Quickly mark daily attendance for your class.</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/dashboard/timetable')}
            className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left"
          >
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">View Timetable</h4>
              <p className="text-sm text-gray-500">Check your teaching schedule for the week.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
