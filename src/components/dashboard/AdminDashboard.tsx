
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, GraduationCap, BookOpen, TrendingUp, Loader2,
  Megaphone, Clock, ChevronRight, Check, X, CalendarDays
} from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { announcementService } from '@/services/announcement.service';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// 1. DYNAMIC LEAVE PANEL (WITH STATUS PARAMS)
const AdminLeavePanel = () => {
  const queryClient = useQueryClient();
  const [activeStatus, setActiveStatus] = useState<'Requested' | 'Approved' | 'Rejected'>('Requested');

  const { data: leaveResponse, isLoading } = useQuery({
    queryKey: ['admin-leaves', activeStatus],
    queryFn: () => dashboardService.getTeacherLeaves(activeStatus),
  });

  const respondMutation = useMutation({
    mutationFn: (data: { id: string, status: 'Approved' | 'Rejected' }) =>
      dashboardService.putAdminResponse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leaves'] });
      toast.success("Status updated!");
    }
  });

  const calculateDays = (start: string, end: string) => {
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const leaves = leaveResponse?.data?.leaveRequests || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
      <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-indigo-600" /> Leave Management
        </h3>
        <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
          {(['Requested', 'Approved', 'Rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeStatus === s ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {s === 'Requested' ? 'Pending' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-50 overflow-y-auto max-h-[450px]">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : leaves.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No {activeStatus.toLowerCase()} requests.</div>
        ) : (
          leaves.map((leave: any) => (
            <div key={leave.id} className="p-6 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold uppercase">
                    {leave.teacher?.user?.firstName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {leave.teacher?.user?.firstName} {leave.teacher?.user?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{leave.reason}</p>
                    <div className="flex flex-wrap gap-3 mt-2 items-center">
                      <span className="text-[13px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                        {calculateDays(leave.startDate, leave.endDate)} Days
                      </span>
                      <span className="text-[12px] text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Requested: {new Date(leave.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[12px] text-indigo-600 flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {activeStatus === 'Requested' ? (
                  <div className="flex gap-2">
                    <button onClick={() => respondMutation.mutate({ id: leave.id, status: 'Approved' })} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"><Check className="h-5 w-5" /></button>
                    <button onClick={() => respondMutation.mutate({ id: leave.id, status: 'Rejected' })} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><X className="h-5 w-5" /></button>
                  </div>
                ) : (
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    activeStatus === 'Approved' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {activeStatus}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 2. MAIN ADMIN DASHBOARD
export const AdminDashboard: React.FC = () => {
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => dashboardService.getAdminStats(),
  });

  const { data: announcementsData } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementService.getAnnouncements(),
  });

  if (isLoadingStats) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-indigo-600 animate-spin" /></div>;

  const stats = statsData?.data || {};

  const statCards = [
    { name: 'Total Students', value: stats.studentCount || '0', icon: Users, color: 'bg-blue-500' },
    { name: 'Total Teachers', value: stats.teacherCount || '0', icon: GraduationCap, color: 'bg-purple-500' },
    { name: 'Active Classes', value: stats.classCount || '0', icon: BookOpen, color: 'bg-green-500' },
    { name: 'Attendance Rate', value: stats.attendanceRate || '0%', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100">
            <div className="p-6 flex items-center">
              <div className={`flex-shrink-0 rounded-xl p-3 text-white ${stat.color}`}><stat.icon className="h-6 w-6" /></div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Announcements (Previous Large Size) & School Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden flex flex-col h-[400px]">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Megaphone className="h-5 w-5 text-indigo-600" /> Recent Announcements</h3>
            <Link to="/dashboard/announcements" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">Manage <ChevronRight className="h-4 w-4" /></Link>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {announcementsData?.data?.slice(0, 3).map((announcement: any) => (
              <div key={announcement.id} className="p-4 rounded-xl border border-gray-50 hover:border-indigo-100 transition-colors bg-gray-50/30">
                <div className="flex items-start gap-4">
                  <div className={clsx("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", announcement.priority === 'high' ? "bg-red-50 text-red-600" : announcement.priority === 'medium' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600")}>
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-gray-900 truncate">{announcement.title}</h4>
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(announcement.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{announcement.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-2xl border border-gray-100 flex flex-col">
          <div className="px-6 py-5 border-b border-gray-50"><h3 className="text-lg font-bold text-gray-900">School Overview</h3></div>
          <div className="p-6 flex-1 flex items-center justify-center border-2 border-dashed border-gray-100 m-6 rounded-xl text-gray-400 text-sm text-center">Detailed analytics coming soon.</div>
        </div>
      </div>

      {/* Leave Panel & Calendar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminLeavePanel />
        <div className="bg-white shadow-sm rounded-2xl border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-50"><h3 className="text-lg font-bold text-gray-900">Academic Calendar</h3></div>
          <div className="p-6 h-[400px] flex items-center justify-center border-2 border-dashed border-gray-100 m-6 rounded-xl text-gray-400">Calendar view coming soon.</div>
        </div>
      </div>
    </div>
  );
};