import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Loader2,
  Megaphone,
  Clock,
  ChevronRight
} from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { announcementService } from '@/services/announcement.service';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => dashboardService.getAdminStats(),
  });

  const { data: announcementsData, isLoading: isLoadingAnnouncements } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementService.getAnnouncements(),
  });

  if (isLoadingStats || isLoadingAnnouncements) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const stats = statsData?.data || {};

  const statCards = [
    { name: 'Total Students', value: stats.studentCount || '0', icon: Users, color: 'bg-blue-500' },
    { name: 'Total Teachers', value: stats.teacherCount || '0', icon: GraduationCap, color: 'bg-purple-500' },
    { name: 'Active Classes', value: stats.classCount || '0', icon: BookOpen, color: 'bg-green-500' },
    { name: 'Attendance Rate', value: stats.attendanceRate || '0%', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-xl p-3 text-white ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-indigo-600" />
              Recent Announcements
            </h3>
            <Link to="/dashboard/announcements" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Manage
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {announcementsData?.data?.slice(0, 3).map((announcement) => (
              <div key={announcement.id} className="p-4 rounded-xl border border-gray-50 hover:border-indigo-100 transition-colors bg-gray-50/30">
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    announcement.priority === 'high' ? "bg-red-50 text-red-600" :
                    announcement.priority === 'medium' ? "bg-amber-50 text-amber-600" :
                    "bg-blue-50 text-blue-600"
                  )}>
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-gray-900 truncate">{announcement.title}</h4>
                      <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(announcement.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {announcement.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!announcementsData?.data || announcementsData.data.length === 0) && (
              <div className="py-10 text-center text-gray-400">
                <p>No recent announcements.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-2xl border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="text-lg font-bold text-gray-900">School Overview</h3>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-gray-400">Detailed analytics coming soon.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
