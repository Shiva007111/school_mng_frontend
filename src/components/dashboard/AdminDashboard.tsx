import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, GraduationCap, BookOpen, TrendingUp, Loader2,
  Megaphone, Clock, ChevronRight, Check, X, CalendarDays,
  Settings, ClipboardList
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';
import { Link } from 'react-router-dom';
import { dashboardService } from '@/services/dashboard.service';
import { announcementService } from '@/services/announcement.service';
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
      toast.success("Response authenticated successfully");
    }
  });

  const calculateDays = (start: string, end: string) => {
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const leaves = leaveResponse?.data?.leaveRequests || [];

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-grand overflow-hidden">
      <div className="px-10 py-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-grand-paper/50">
        <div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-grand-blue" />
            Leave Administration
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Review and authenticate faculty absence requests</p>
        </div>

        <div className="flex p-1.5 bg-gray-200/50 backdrop-blur-md rounded-2xl w-fit border border-gray-200/50">
          {(['Requested', 'Approved', 'Rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                activeStatus === s
                  ? "bg-white text-grand-blue shadow-lg shadow-grand-blue/10 scale-[1.05]"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {s === 'Requested' ? 'Pending Action' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-50 overflow-y-auto max-h-[600px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-40">
            <Loader2 className="h-10 w-10 animate-spin text-grand-blue mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Accessing records...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="py-24 text-center">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Check className="h-8 w-8 text-gray-200" />
            </div>
            <p className="text-gray-400 font-serif italic">No {activeStatus.toLowerCase()} entries found in the current ledger.</p>
          </div>
        ) : (
          leaves.map((leave: any) => (
            <div key={leave.id} className="p-10 hover:bg-grand-paper/30 transition-all group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                  <div className="h-16 w-16 shrink-0 rounded-2xl bg-grand-navy flex items-center justify-center text-grand-gold text-2xl font-serif font-bold border-4 border-white shadow-grand relative">
                    {leave.teacher?.user?.firstName[0]}
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-grand-gold border-2 border-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif font-bold text-gray-900 mb-1">
                      {leave.teacher?.user?.firstName} {leave.teacher?.user?.lastName}
                    </h4>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xl italic">
                      "{leave.reason}"
                    </p>

                    <div className="flex flex-wrap gap-6 mt-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-grand-blue/5 rounded-lg flex items-center justify-center text-grand-blue">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Application Date</p>
                          <p className="text-xs font-bold text-gray-700">{new Date(leave.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-grand-gold/5 rounded-lg flex items-center justify-center text-grand-gold">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Proposed Interval</p>
                          <p className="text-xs font-bold text-gray-700">
                            {new Date(leave.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — {new Date(leave.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-[9px] text-gray-500 font-black">{calculateDays(leave.startDate, leave.endDate)}D</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:self-center">
                  {activeStatus === 'Requested' ? (
                    <>
                      <button
                        onClick={() => respondMutation.mutate({ id: leave.id, status: 'Rejected' })}
                        className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 flex items-center gap-2 border border-red-100"
                      >
                        <X className="h-4 w-4" /> Decline
                      </button>
                      <button
                        onClick={() => respondMutation.mutate({ id: leave.id, status: 'Approved' })}
                        className="px-6 py-3 bg-grand-green text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-grand-green/20 transition-all active:scale-95 flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" /> Authenticate
                      </button>
                    </>
                  ) : (
                    <div className={cn(
                      "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm",
                      activeStatus === 'Approved' ? "bg-grand-green/10 text-grand-green border-grand-green/20" : "bg-red-100 text-red-700 border-red-200"
                    )}>
                      Archived: {activeStatus}
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
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-grand-navy rounded-3xl p-10 shadow-grand">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <GraduationCap className="w-64 h-64 text-white rotate-12" />
        </div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-grand-gold/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-grand-gold mb-2">
              <span>Administration</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/60">System Overview</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
              Institutional Control <br />
              <span className="text-grand-gold">Dashboard</span>
            </h1>
            <p className="text-white/60 max-w-lg font-sans text-sm">
              Welcome, {user?.email.split('@')[0]}. You have full oversight of the campus operations and academic progress.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="px-6 py-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="h-10 w-10 bg-grand-gold/20 rounded-xl flex items-center justify-center text-grand-gold">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">System Time</p>
                <p className="text-sm font-bold text-white tabular-nums">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => (
          <div key={stat.name} className={cn(
            "group bg-white p-6 rounded-2xl border-t-4 border border-gray-100 shadow-grand hover:shadow-xl transition-all",
            idx === 0 ? "border-t-grand-blue" :
              idx === 1 ? "border-t-grand-gold" :
                idx === 2 ? "border-t-grand-green" :
                  "border-t-indigo-400"
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "p-2.5 rounded-xl transition-colors",
                idx === 0 ? "text-grand-blue bg-grand-blue/5" :
                  idx === 1 ? "text-grand-gold bg-grand-gold/5" :
                    idx === 2 ? "text-grand-green bg-grand-green/5" :
                      "text-indigo-400 bg-indigo-50"
              )}>
                <stat.icon className="h-6 w-6 stroke-[1.5]" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-grand-green uppercase">
                <TrendingUp className="h-3 w-3" />
                2.4%
              </div>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.name}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-serif font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Announcements - Bulletin Style */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-grand overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-grand-paper/30">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-grand-blue" />
              <h3 className="text-xl font-serif font-bold text-gray-900">Institutional Bulletin</h3>
            </div>
            <Link to="/dashboard/announcements" className="text-xs font-black uppercase tracking-widest text-grand-blue hover:text-grand-navy flex items-center gap-2">
              Archive <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {announcementsData?.data?.slice(0, 3).map((announcement: any) => (
              <div key={announcement.id} className="p-8 hover:bg-grand-paper/50 transition-all group">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-1.5 h-12 rounded-full",
                      announcement.priority === 'high' ? 'bg-red-600' :
                        announcement.priority === 'medium' ? 'bg-amber-500' : 'bg-grand-blue'
                    )} />
                    <div>
                      <h4 className="text-lg font-serif font-bold text-gray-900 group-hover:text-grand-blue transition-colors">
                        {announcement.title}
                      </h4>
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tighter text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(announcement.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span>{announcement.author?.email.split('@')[0] || 'Provost Office'}</span>
                      </div>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest",
                    announcement.priority === 'high' ? 'bg-red-100 text-red-700' :
                      announcement.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-grand-blue/10 text-grand-blue'
                  )}>
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-4.5 border-l border-gray-100 line-clamp-2">
                  {announcement.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights / School Status */}
        <div className="flex flex-col gap-8">
          <div className="bg-grand-navy rounded-3xl p-8 text-white shadow-grand relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Settings className="w-24 h-24" />
            </div>
            <h4 className="text-xl font-serif font-bold mb-6 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-grand-gold animate-pulse" />
              System Health
            </h4>
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Server Latency</p>
                  <p className="text-2xl font-serif font-bold text-grand-gold">14ms</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-grand-green uppercase">Optimal</p>
                </div>
              </div>
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Storage Usage</p>
                  <p className="text-2xl font-serif font-bold">24%</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-white/60">Cloud Tier 1</p>
                </div>
              </div>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                System Diagnostics
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-grand">
            <h4 className="text-lg font-serif font-bold text-gray-900 mb-4">Academic Calendar</h4>
            <div className="aspect-[4/3] bg-grand-paper/50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-6 grayscale opacity-60">
              <CalendarDays className="h-8 w-8 text-gray-400 mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Quarterly View</p>
              <p className="text-[10px] text-gray-400 mt-1 italic">Under maintenance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section - Leave Management */}
      <div className="w-full">
        <AdminLeavePanel />
      </div>
    </div>
  );
};