import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, BookOpen, ClipboardCheck, Loader2, Clock, MapPin, ChevronRight, Megaphone } from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { announcementService } from '@/services/announcement.service';
import { useNavigate } from 'react-router-dom';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['teacher-stats'],
    queryFn: () => dashboardService.getTeacherStats(),
  });

  const { data: announcementsData, isLoading: announcementsLoading } = useQuery({
    queryKey: ['announcements', 'Teacher'],
    queryFn: () => announcementService.getAnnouncements({ role: 'Teacher' }),
  });

  const isLoading = statsLoading || announcementsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const { timetable = [], myClasses = [], activeExams = [], attendanceStatus = { total: 0, marked: 0 } } = statsData?.data || {};

  return (
    <div className="space-y-8">
      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Today's Periods</p>
            <p className="text-2xl font-bold text-gray-900">{timetable.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Attendance Marked</p>
            <p className="text-2xl font-bold text-gray-900">{attendanceStatus.marked} / {attendanceStatus.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">My Classes</p>
            <p className="text-2xl font-bold text-gray-900">{myClasses.length}</p>
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      {announcementsData?.data && announcementsData.data.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-900">Announcements</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {announcementsData.data.slice(0, 3).map((announcement) => (
              <div key={announcement.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-base font-semibold text-gray-900">{announcement.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${announcement.priority === 'high' ? 'bg-red-50 text-red-600' :
                      announcement.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-blue-50 text-blue-600'
                    }`}>
                    {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{announcement.content}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{new Date(announcement.publishedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{announcement.author?.email.split('@')[0] || 'Admin'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Timetable */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Today's Schedule</h3>
            <button onClick={() => navigate('/dashboard/timetable')} className="text-sm text-indigo-600 font-medium hover:underline">View Full</button>
          </div>
          <div className="p-6">
            {timetable.length === 0 ? (
              <p className="text-center py-10 text-gray-400 italic">No classes scheduled for today.</p>
            ) : (
              <div className="space-y-4">
                {timetable.map((period: any) => (
                  <div key={period.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{period.classSubject?.subject?.name}</p>
                      <p className="text-xs text-gray-500">
                        {period.classSection?.gradeLevel?.displayName} - {period.classSection?.section}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-900">{new Date(period.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 justify-end">
                        <MapPin className="h-3 w-3" />
                        {period.room?.name || 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Exams & Grading */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Active Grading</h3>
            <button onClick={() => navigate('/dashboard/exams/my-grading')} className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
          </div>
          <div className="p-6">
            {activeExams.length === 0 ? (
              <p className="text-center py-10 text-gray-400 italic">No active exams for grading.</p>
            ) : (
              <div className="space-y-4">
                {activeExams.map((exam: any) => (
                  <div key={exam.id} className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-gray-900">{exam.title}</h4>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {exam.classSection?.gradeLevel?.displayName} - {exam.classSection?.section}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {exam.examSubjects.map((es: any) => (
                        <button
                          key={es.id}
                          onClick={() => navigate(`/dashboard/exams/${exam.id}/marks/${es.id}`)}
                          className="w-full flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 transition-colors text-left"
                        >
                          <span className="text-xs font-medium text-gray-700">{es.classSubject?.subject?.name}</span>
                          <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-indigo-600" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
