import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, GraduationCap, BookOpen, TrendingUp, Loader2,
  Megaphone, Clock, ChevronRight, Check, X, CalendarDays,
  Settings, ClipboardList, ClipboardCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';
import { Link } from 'react-router-dom';
import { dashboardService } from '@/services/dashboard.service';
import { announcementService } from '@/services/announcement.service';
import { toast } from 'react-hot-toast';

// 1. COMPACT LEAVE ADMINISTRATION PANEL
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
      toast.success("Action authenticated");
    }
  });

  const calculateDays = (start: string, end: string) => {
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const leaves = leaveResponse?.data?.leaveRequests || [];

  return (
    <div className="flex flex-col h-full bg-white rounded-card shadow-grand border border-white overflow-hidden">
      <div className="px-6 py-4 border-b border-brand-slate-100 flex items-center justify-between bg-brand-slate-50/50">
        <div>
          <h3 className="text-lg font-heading font-bold text-brand-slate-900 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-brand-indigo" />
            Faculty Absence
          </h3>
        </div>
        <div className="flex gap-1 p-1 bg-brand-slate-100 rounded-xl">
          {(['Requested', 'Approved', 'Rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                activeStatus === s ? "bg-white text-brand-indigo shadow-sm" : "text-brand-slate-400 hover:text-brand-slate-600"
              )}
            >
              {s === 'Requested' ? 'Pending' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-brand-slate-50">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-brand-indigo opacity-20" /></div>
        ) : leaves.length === 0 ? (
          <div className="py-12 text-center opacity-40">
            <Check className="h-8 w-8 mx-auto mb-2 text-brand-slate-300" />
            <p className="text-[10px] font-black uppercase tracking-widest">No entries found</p>
          </div>
        ) : (
          leaves.map((leave: any) => (
            <div key={leave.id} className="p-4 hover:bg-brand-slate-50 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-indigo text-white flex items-center justify-center font-heading font-bold shadow-sm relative text-sm">
                    {leave.teacher?.user?.firstName[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-heading font-bold text-brand-slate-900 leading-tight">
                      {leave.teacher?.user?.firstName} {leave.teacher?.user?.lastName}
                    </h4>
                    <p className="text-[11px] text-brand-slate-500 line-clamp-1 italic mt-0.5">"{leave.reason}"</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-black text-brand-slate-400 uppercase tracking-tighter">
                        {new Date(leave.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — {new Date(leave.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="px-1.5 py-0.5 bg-brand-slate-100 rounded text-[9px] text-brand-slate-500 font-bold">{calculateDays(leave.startDate, leave.endDate)}D</span>
                    </div>
                  </div>
                </div>
                {activeStatus === 'Requested' && (
                  <div className="flex gap-2">
                    <button onClick={() => respondMutation.mutate({ id: leave.id, status: 'Rejected' })} className="p-2 text-brand-danger hover:bg-brand-danger/10 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
                    <button onClick={() => respondMutation.mutate({ id: leave.id, status: 'Approved' })} className="p-2 text-brand-success hover:bg-brand-success/10 rounded-lg transition-colors"><Check className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 2. MAIN ADMIN DASHBOARD WITH BENTO GRID
export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => dashboardService.getAdminStats(),
  });

  const { data: announcementsData, isLoading: announcementsLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementService.getAnnouncements(),
  });

  if (isLoadingStats || announcementsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 text-brand-indigo animate-spin" />
      </div>
    );
  }

  const stats = statsData?.data || {};

  const statCards = [
    { name: 'Total Students', value: stats.studentCount || '0', icon: Users, accent: 'brand-indigo' },
    { name: 'Total Teachers', value: stats.teacherCount || '0', icon: GraduationCap, accent: 'brand-indigo' },
    { name: 'Active Classes', value: stats.classCount || '0', icon: BookOpen, accent: 'brand-success' },
    { name: 'Attendance Rate', value: stats.attendanceRate || '0%', icon: TrendingUp, accent: 'brand-warning' },
  ];

  return (
    <div className="bg-brand-slate-50 min-h-screen -m-8 p-8 font-body">
      {/* 1. Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-indigo mb-2">
            <span>Executive Suite</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-brand-slate-500">System Control</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-slate-900 leading-tight">
            Institutional Oversight
          </h1>
          <p className="text-brand-slate-500 font-sans mt-1 text-sm">
            Welcome, {user?.email.split('@')[0] || 'Administrator'}. Global campus synchronization is currently <span className="text-brand-success font-black uppercase tracking-tighter">Active</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 bg-white rounded-2xl border border-brand-slate-300 shadow-grand flex items-center gap-4">
            <div className="h-10 w-10 bg-brand-indigo/10 rounded-xl flex items-center justify-center text-brand-indigo">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-slate-500 uppercase tracking-widest leading-none mb-1">Standard Time</p>
              <p className="text-base font-bold text-brand-slate-900 tabular-nums">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

        {/* Metric Cards (Row 1) */}
        {statCards.map((stat) => (
          <div key={stat.name} className="group bg-white p-6 rounded-card shadow-grand border border-white hover:border-brand-indigo/20 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl transition-colors", `text-${stat.accent} bg-${stat.accent}/5`)}>
                <stat.icon className="h-6 w-6 stroke-[1.5]" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-brand-success uppercase">
                <TrendingUp className="h-3 w-3" />
                Live
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-slate-500 uppercase tracking-widest leading-none mb-1">{stat.name}</p>
              <p className="text-3xl font-heading font-bold text-brand-slate-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}

        {/* Tall Card: Institutional Bulletin (Spans 2 columns, 2 rows) */}
        <div className="lg:col-span-2 lg:row-span-2 bg-white rounded-card shadow-grand border border-white overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-brand-slate-100 flex items-center justify-between bg-brand-slate-50/50">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-brand-indigo" />
              <h2 className="text-lg font-heading font-bold text-brand-slate-900">Institutional Bulletin</h2>
            </div>
            <Link to="/dashboard/announcements" className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-indigo hover:text-brand-indigo-dark transition-colors">
              VIEW ARCHIVE
            </Link>
          </div>
          <div className="divide-y divide-brand-slate-100 max-h-[600px] overflow-y-auto custom-scrollbar flex-1">
            {announcementsData?.data && announcementsData.data.length > 0 ? (
              announcementsData.data.map((announcement: any) => (
                <div key={announcement.id} className="p-6 hover:bg-brand-slate-50/50 transition-all group">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-1 h-8 rounded-full",
                        announcement.priority === 'high' ? 'bg-brand-danger shadow-[0_0_8px_rgba(198,40,40,0.4)]' :
                          announcement.priority === 'medium' ? 'bg-brand-warning' : 'bg-brand-indigo'
                      )} />
                      <div>
                        <h4 className="text-base font-heading font-bold text-brand-slate-900 group-hover:text-brand-indigo transition-colors leading-tight">
                          {announcement.title}
                        </h4>
                        <p className="text-[10px] font-bold text-brand-slate-400 uppercase tracking-widest mt-0.5">
                          {new Date(announcement.publishedAt).toLocaleDateString()} • {announcement.author?.email.split('@')[0] || 'Office'}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                      announcement.priority === 'high' ? 'bg-brand-danger/5 text-brand-danger border-brand-danger/10' :
                        announcement.priority === 'medium' ? 'bg-brand-warning/5 text-brand-warning border-brand-warning/10' :
                          'bg-brand-indigo/5 text-brand-indigo border-brand-indigo/10'
                    )}>
                      {announcement.priority}
                    </span>
                  </div>
                  <p className="text-sm text-brand-slate-600 leading-relaxed line-clamp-2 pl-4">
                    {announcement.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-20 opacity-40">
                <Megaphone className="h-10 w-10 mx-auto mb-2 text-brand-slate-300" />
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate-400">No active bulletins</p>
              </div>
            )}
          </div>
        </div>

        {/* System Health Status (Row 2) */}
        <div className="bg-brand-slate-900 rounded-card p-6 shadow-grand text-white border border-white/5 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Settings className="w-32 h-32" />
          </div>
          <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-3 relative z-10 text-brand-indigo-light">
            <div className="h-2 w-2 rounded-full bg-brand-success animate-pulse" />
            System Health
          </h3>
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Network Latency</span>
              <span className="text-lg font-heading font-bold text-brand-success">14ms</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Database Load</span>
              <span className="text-lg font-heading font-bold">24%</span>
            </div>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              Diagnostics
            </button>
          </div>
        </div>

        {/* Academic Calendar (Small Window) */}
        <div className="bg-white rounded-card p-6 border border-white shadow-grand overflow-hidden flex flex-col">
          <h4 className="text-md font-heading font-bold text-brand-slate-900 mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-brand-indigo" />
            Key Events
          </h4>
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 grayscale">
            <CalendarDays className="h-10 w-10 text-brand-slate-300 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate-400 leading-tight">No upcoming <br /> global events</p>
          </div>
        </div>

        {/* Leave Administration (Lower Row, Spans 2) */}
        <div className="lg:col-span-2 min-h-[400px]">
          <AdminLeavePanel />
        </div>

        {/* Card: System Control / Quick Actions (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-card p-6 shadow-grand border border-white relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ClipboardCheck className="w-32 h-32 text-brand-indigo" />
          </div>
          <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-3 relative z-10 text-brand-slate-900">
            <ClipboardCheck className="h-6 w-6 text-brand-indigo" />
            Institutional Control
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <Link
              to="/dashboard/users"
              className="flex items-center gap-4 p-4 bg-brand-slate-50 hover:bg-brand-indigo/5 rounded-xl border border-brand-slate-100 transition-all group"
            >
              <div className="h-10 w-10 rounded-lg bg-brand-indigo/10 flex items-center justify-center text-brand-indigo group-hover:bg-brand-indigo group-hover:text-white transition-all">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-slate-900">User Management</h4>
                <p className="text-[10px] text-brand-slate-400 font-black uppercase tracking-tighter mt-0.5">Faculty & Students</p>
              </div>
            </Link>
            <Link
              to="/dashboard/exams"
              className="flex items-center gap-4 p-4 bg-brand-slate-50 hover:bg-brand-indigo/5 rounded-xl border border-brand-slate-100 transition-all group"
            >
              <div className="h-10 w-10 rounded-lg bg-brand-slate-100 flex items-center justify-center text-brand-slate-900 group-hover:bg-brand-indigo group-hover:text-white transition-all">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-slate-900">Academic Records</h4>
                <p className="text-[10px] text-brand-slate-400 font-black uppercase tracking-tighter mt-0.5">Exams & Sessions</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};