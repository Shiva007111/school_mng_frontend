import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  User,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  BookOpen,
  Calendar,
  Clock,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { dashboardService } from '@/services/dashboard.service';
import { announcementService } from '@/services/announcement.service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['parent-stats'],
    queryFn: () => dashboardService.getParentStats(),
  });

  const { data: announcementsData, isLoading: announcementsLoading } = useQuery({
    queryKey: ['announcements', 'Parent'],
    queryFn: () => announcementService.getAnnouncements({ role: 'Parent' }),
  });

  const isLoading = childrenLoading || announcementsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 text-brand-indigo animate-spin" />
      </div>
    );
  }

  const children = childrenData?.data || [];
  // Select first child by default if none selected
  const activeChild = children.find((c: any) => c.studentId === selectedChildId) || children[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="bg-brand-slate-50 min-h-screen -m-8 p-8 font-body">
      {/* 1. Refined Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-indigo mb-2">
            <span>Guardian Portal</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-brand-slate-500">Family Overview</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-slate-900 leading-tight">
            {getGreeting()}, {user?.email.split('@')[0]}
          </h1>
          <p className="text-brand-slate-500 font-sans mt-1">
            Monitoring academic progress for {children.length} {children.length === 1 ? 'child' : 'children'}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 bg-white rounded-2xl border border-brand-slate-300 shadow-grand flex items-center gap-4">
            <div className="h-10 w-10 bg-brand-indigo/10 rounded-xl flex items-center justify-center text-brand-indigo">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-slate-500 uppercase tracking-widest leading-none mb-1">Campus Time</p>
              <p className="text-base font-bold text-brand-slate-900 tabular-nums">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

        {/* Child Selection Row / Small Metrics */}
        {children.map((child: any) => (
          <button
            key={child.studentId}
            onClick={() => setSelectedChildId(child.studentId)}
            className={cn(
              "group bg-white p-5 rounded-card shadow-grand border-2 transition-all flex flex-col items-start text-left",
              activeChild?.studentId === child.studentId
                ? "border-brand-indigo bg-indigo-50/30"
                : "border-white hover:border-brand-indigo/20"
            )}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                activeChild?.studentId === child.studentId ? "bg-brand-indigo text-white" : "bg-brand-slate-100 text-brand-slate-500"
              )}>
                <User className="h-5 w-5" />
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-brand-slate-400 uppercase tracking-widest leading-none">Attendance</p>
                <p className={cn("text-sm font-bold mt-1", parseFloat(child.attendanceRate) > 90 ? "text-brand-success" : "text-brand-warning")}>
                  {child.attendanceRate}
                </p>
              </div>
            </div>
            <h3 className="text-base font-heading font-bold text-brand-slate-900 truncate w-full">{child.name}</h3>
            <p className="text-[10px] font-bold text-brand-slate-400 uppercase tracking-widest mt-0.5">{child.class}</p>
          </button>
        ))}

        {/* Tall Card: Official Bulletin (Spans 2 columns, 2 rows) */}
        <div className="lg:col-span-2 lg:row-span-2 bg-white rounded-card shadow-grand border border-white overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-brand-slate-100 flex items-center justify-between bg-brand-slate-50/50">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-brand-indigo" />
              <h2 className="text-lg font-heading font-bold text-brand-slate-900">Official Bulletin</h2>
            </div>
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
                          {new Date(announcement.publishedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
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

        {/* Academic Progress Window (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-card shadow-grand border border-white overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-brand-slate-100 flex items-center justify-between bg-brand-slate-50/50">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-brand-indigo" />
              <h2 className="text-lg font-heading font-bold text-brand-slate-900">Academic Progress • {activeChild?.name.split(' ')[0]}</h2>
            </div>
            <button onClick={() => navigate('/dashboard/exams/my-children')} className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-indigo hover:text-brand-indigo-dark transition-colors">
              REPORT CARD
            </button>
          </div>
          <div className="p-6 flex-1">
            {activeChild?.recentMarks.length === 0 ? (
              <div className="text-center py-12 opacity-40">
                <GraduationCap className="h-10 w-10 mx-auto mb-2 text-brand-slate-300" />
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate-400">No recent evaluations</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeChild.recentMarks.map((mark: any) => (
                  <div key={mark.id} className="p-4 rounded-xl border border-brand-slate-100 bg-brand-slate-50/50 hover:bg-white transition-all flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-heading font-bold text-brand-slate-900 leading-tight">
                        {mark.examSubject?.classSubject?.subject?.name}
                      </h4>
                      <p className="text-[10px] font-bold text-brand-slate-400 uppercase tracking-widest mt-0.5">Recent Assessment</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-heading font-bold text-brand-indigo tabular-nums">{mark.score}</p>
                      <p className="text-[9px] font-black text-brand-slate-300 uppercase">Max: {mark.examSubject?.maxScore}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Attendance Breakdown (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-card shadow-grand border border-white overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-brand-slate-100 flex items-center justify-between bg-brand-slate-50/50">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-brand-indigo" />
              <h2 className="text-lg font-heading font-bold text-brand-slate-900">Attendance Log</h2>
            </div>
            <button onClick={() => navigate('/dashboard/attendance/my-children')} className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-indigo hover:text-brand-indigo-dark transition-colors">
              HISTORY
            </button>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {activeChild?.recentAttendance.length === 0 ? (
              <div className="text-center py-8 opacity-40">
                <p className="text-sm text-brand-slate-400 italic">No recent attendance recorded.</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                {activeChild.recentAttendance.map((event: any) => (
                  <div
                    key={event.id}
                    title={`${new Date(event.date).toLocaleDateString()}: ${event.status}`}
                    className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all cursor-help hover:scale-110 shadow-sm",
                      event.status === 'present' ? 'bg-brand-success/10 border-brand-success/20 text-brand-success' :
                        event.status === 'absent' ? 'bg-brand-danger/10 border-brand-danger/20 text-brand-danger' :
                          'bg-brand-warning/10 border-brand-warning/20 text-brand-warning'
                    )}
                  >
                    {event.status === 'present' ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                  </div>
                ))}
              </div>
            )}
            <p className="text-center text-[10px] font-bold text-brand-slate-400 uppercase tracking-widest mt-6">
              Last 5 instructional days recorded
            </p>
          </div>
        </div>

        {/* Profiles Link Block (Visual Impact) */}
        <div className="lg:col-span-2 bg-brand-slate-900 rounded-card p-8 shadow-grand text-white border border-white/5 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <User className="w-32 h-32" />
          </div>
          <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-3 relative z-10 text-brand-indigo-light">
            Family Portfolios
          </h3>
          <p className="text-sm text-white/50 mb-8 relative z-10 font-sans max-w-sm">
            Access exhaustive academic portfolios, faculty remarks, and complete institutional records for your ward.
          </p>
          <div className="flex flex-wrap gap-3 relative z-10">
            {children.map((child: any) => (
              <button
                key={child.studentId}
                onClick={() => navigate(`/dashboard/students/${child.studentId}`, { state: { from: 'parent' } })}
                className="flex items-center gap-3 py-3 px-5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-all text-xs font-black uppercase tracking-widest"
              >
                PROFILING: {child.name.split(' ')[0]}
                <ChevronRight className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
