import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  BookOpen,
  ClipboardCheck,
  Loader2,
  Clock,
  MapPin,
  ChevronRight,
  Megaphone,
  User,
  Settings,
  ClipboardList,
  X
} from 'lucide-react';
import { cn } from '@/utils/cn';

import { dashboardService } from '@/services/dashboard.service';
import { announcementService } from '@/services/announcement.service';
import { useNavigate } from 'react-router-dom';
import { attendanceService } from '@/services/attendance.service';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['teacher-stats'],
    queryFn: () => dashboardService.getTeacherStats(),
  });

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const viewLeaves = useQuery({
    queryKey: ["teacher-leaves", statsData?.data?.teacherId],
    queryFn: () => dashboardService.getTeacherLeavesById(statsData?.data?.teacherId || ""),
    enabled: false,
  });

  // Calculate days for the UI popup
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 0;
  };

  // Mutation for POSTing leave
  const leaveMutation = useMutation({
    mutationFn: (data: any) => dashboardService.postTeacherLeaveRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-stats'] });
      toast.success("Leave request submitted!");
      setIsLeaveModalOpen(false);
    },
    onError: () => toast.error("Failed to submit request")
  });

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate) {
      toast.error("Please select both dates.");
      return;
    }
    const toISO = (dateStr: string) => new Date(dateStr).toISOString();

    leaveMutation.mutate({
      startDate: toISO(leaveForm.startDate),
      endDate: toISO(leaveForm.endDate),
      reason: leaveForm.reason,
      status: 'Requested',
      teacherId: statsData?.data?.teacherId,
      schoolId: statsData?.data?.schoolId,
    });
  };

  const markedAt = statsData?.data?.Tchrattendance?.markedAt || null;
  const markedTime = markedAt ? new Date(markedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }) : null;

  const markAttendance = async (latitude: number, longitude: number) => {
    try {
      const response = await attendanceService.markTeacherAttendance({
        latitude,
        longitude,
        teacherId: statsData?.data?.teacherId || "",
        date: new Date().toISOString().split("T")[0],
      });
      queryClient.setQueryData(['teacher-stats'], (oldData: any) => {
        if (oldData && oldData.data) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              Tchrattendance: {
                ...oldData.data.Tchrattendance,
                markedAt: new Date().toISOString(),
              },
            },
          };
        }
        return oldData;
      });
      if (response.data.marked === false) {
        toast.success("Attendance already marked for today");
      } else {
        toast.success("Attendance marked successfully");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to mark attendance");
    }
  };

  const handleMarkAttendance = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await markAttendance(latitude, longitude);
      },
      (error) => {
        console.error(error);
        switch (error.code) {
          case error.PERMISSION_DENIED: alert("Please allow location access."); break;
          case error.POSITION_UNAVAILABLE: alert("Location information unavailable."); break;
          case error.TIMEOUT: alert("Location request timed out."); break;
          default: alert("Unknown location error.");
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const { data: announcementsData, isLoading: announcementsLoading } = useQuery({
    queryKey: ['announcements', 'Teacher'],
    queryFn: () => announcementService.getAnnouncements({ role: 'Teacher' }),
  });

  const isLoading = statsLoading || announcementsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 text-brand-indigo animate-spin" />
      </div>
    );
  }

  const totalPeriodsToday = statsData?.data?.totalPeriods || 0;
  const attendanceStatus = statsData?.data?.attendanceStatus || { total: 0, marked: 0 };
  const myClasses = statsData?.data?.myClasses || [];
  const activeExams = statsData?.data?.activeExams || [];
  const todayShedule = statsData?.data?.todayShedule || [];

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
            <span>Faculty Portal</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-brand-slate-500">Overview</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-brand-slate-900 leading-tight">
            {getGreeting()}, {user?.email.split('@')[0]}
          </h1>
          <p className="text-brand-slate-500 font-sans mt-1">
            Welcome back. You have {totalPeriodsToday} sessions scheduled for the current academic cycle.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 bg-white rounded-2xl border border-brand-slate-300 shadow-grand flex items-center gap-4">
            <div className="h-10 w-10 bg-brand-indigo/10 rounded-xl flex items-center justify-center text-brand-indigo">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-slate-500 uppercase tracking-widest leading-none mb-1">Session Time</p>
              <p className="text-base font-bold text-brand-slate-900 tabular-nums">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

        {/* Metric: My Attendance (Check-in) */}
        <div className="group bg-white p-6 rounded-card shadow-grand border border-white hover:border-brand-indigo/20 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl text-brand-success bg-brand-success/5 transition-colors">
              <MapPin className="h-6 w-6 stroke-[1.5]" />
            </div>
            {markedTime && (
              <span className="text-[10px] font-black text-brand-success bg-brand-success/10 px-2 py-0.5 rounded-full uppercase tracking-widest">VERIFIED</span>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-slate-500 uppercase tracking-[0.1em] mb-1">My Attendance</p>
            <p className={cn("text-lg font-heading font-bold mt-1", markedTime ? "text-brand-success" : "text-brand-warning")}>
              {markedTime ? `Marked at ${markedTime}` : "Pending Check-in"}
            </p>
          </div>
          <button
            onClick={handleMarkAttendance}
            disabled={!!markedTime}
            className={cn(
              "mt-4 w-full py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all border shadow-sm",
              markedTime
                ? 'bg-brand-slate-50 text-brand-slate-400 border-brand-slate-200 cursor-not-allowed'
                : 'bg-brand-indigo text-white border-brand-indigo hover:bg-brand-indigo-dark hover:shadow-lg'
            )}
          >
            {markedTime ? 'RECORDED' : 'MARK ATTENDANCE'}
          </button>
        </div>

        {/* Metric: Today's Periods */}
        <div className="group bg-white p-6 rounded-card shadow-grand border border-white hover:border-brand-indigo/20 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl text-brand-indigo bg-brand-indigo/5 transition-colors">
              <Calendar className="h-6 w-6 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-black text-brand-success bg-brand-success/10 px-2 py-0.5 rounded-full uppercase tracking-widest">LIVE</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-slate-500 uppercase tracking-[0.1em] mb-1">Today's Periods</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-4xl font-heading font-bold text-brand-slate-900">{totalPeriodsToday}</p>
              <p className="text-xs text-brand-slate-400 font-medium">Classes Scheduled</p>
            </div>
          </div>
        </div>

        {/* Metric: Attendance Rate */}
        <div className="group bg-white p-6 rounded-card shadow-grand border border-white hover:border-brand-indigo/20 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl text-brand-warning bg-brand-warning/5 transition-colors">
              <ClipboardCheck className="h-6 w-6 stroke-[1.5]" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-slate-500 uppercase tracking-[0.1em] mb-1">Attendance Rate</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-4xl font-heading font-bold text-brand-slate-900">
                {attendanceStatus.total > 0 ? Math.round((attendanceStatus.marked / attendanceStatus.total) * 100) : 0}%
              </p>
            </div>
            <p className="text-xs text-brand-slate-400 font-medium mt-1">
              {attendanceStatus.marked} of {attendanceStatus.total} classes marked
            </p>
          </div>
        </div>

        {/* Metric: My Classes */}
        <div className="group bg-white p-6 rounded-card shadow-grand border border-white hover:border-brand-indigo/20 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl text-brand-slate-500 bg-brand-slate-100 transition-colors">
              <BookOpen className="h-6 w-6 stroke-[1.5]" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-slate-500 uppercase tracking-[0.1em] mb-1">My Primary Class</p>
            <div className="mt-1">
              <p className="text-2xl font-heading font-bold text-brand-slate-900 truncate">
                {myClasses.length > 0 ? `${myClasses[0].gradeLevel?.displayName} - ${myClasses[0].section}` : 'No Class Assigned'}
              </p>
              {myClasses.length > 1 && <p className="text-xs text-brand-slate-400 mt-1">+{myClasses.length - 1} other sections</p>}
            </div>
          </div>
        </div>

        {/* Card: Today's Schedule (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-card shadow-grand border border-white overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-brand-slate-100 flex items-center justify-between bg-brand-slate-50/50">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-brand-indigo" />
              <h2 className="text-lg font-heading font-bold text-brand-slate-900">Today's Schedule</h2>
            </div>
            <button onClick={() => navigate('/dashboard/timetable')} className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-indigo hover:text-brand-indigo-dark transition-colors">
              VIEW FULL TIMETABLE
            </button>
          </div>
          <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar flex-1">
            {todayShedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 bg-brand-slate-50 rounded-2xl border border-dashed border-brand-slate-300">
                <Calendar className="h-10 w-10 text-brand-slate-300 mb-4" />
                <p className="text-sm text-brand-slate-500 font-heading italic text-center">No formal sessions scheduled for today.</p>
              </div>
            ) : (
              <div className="relative space-y-4">
                <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-brand-slate-100" />
                {todayShedule.map((period: any) => {
                  const startTime = new Date(period.startTime);
                  const endTime = new Date(period.endTime);
                  const now = new Date();
                  const isLive = now >= startTime && now <= endTime;
                  return (
                    <div key={period.id} className={cn(
                      "relative flex items-center gap-6 p-4 rounded-xl transition-all border",
                      isLive ? "bg-white border-brand-warning shadow-md scale-[1.01] z-10" : "bg-white border-transparent hover:border-brand-slate-100 hover:bg-brand-slate-50/50"
                    )}>
                      <div className={cn(
                        "relative z-10 h-10 w-10 shrink-0 rounded-full flex items-center justify-center border-2 border-white shadow-sm",
                        isLive ? "bg-brand-warning text-white" : "bg-brand-slate-100 text-brand-slate-400"
                      )}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="text-base font-heading font-bold text-brand-slate-900">{period.classSubject?.subject?.name}</h4>
                          <p className="text-[10px] font-bold text-brand-slate-400 uppercase tracking-widest">{period.classSection?.gradeLevel?.displayName} • Section {period.classSection?.section}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-brand-slate-900 tabular-nums">{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-[10px] font-black text-brand-slate-400 uppercase tracking-tighter">Start Time</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tall Card: Official Bulletin (Spans 2 columns, 2 rows) */}
        <div className="lg:col-span-2 lg:row-span-2 bg-white rounded-card shadow-grand border border-white overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-brand-slate-100 flex items-center justify-between bg-brand-slate-50/50">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-brand-indigo" />
              <h2 className="text-lg font-heading font-bold text-brand-slate-900">Official Bulletin</h2>
            </div>
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-indigo hover:text-brand-indigo-dark transition-colors">
              VIEW ARCHIVE
            </button>
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
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] font-bold text-brand-slate-400 uppercase tracking-widest">
                            {new Date(announcement.publishedAt).toLocaleDateString()}
                          </p>
                        </div>
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

        {/* Card: Faculty Absence (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-card shadow-grand border border-white overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-brand-slate-100 flex items-center justify-between bg-brand-slate-50/50">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-brand-indigo" />
              <h2 className="text-lg font-heading font-bold text-brand-slate-900">Faculty Absence</h2>
            </div>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-indigo hover:text-brand-indigo-dark transition-colors"
            >
              SUBMIT NEW REQUEST
            </button>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {statsData?.data?.teacherLeave ? (
              <div className="bg-brand-slate-50 rounded-2xl p-6 border border-brand-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[11px] font-black text-brand-slate-400 uppercase tracking-widest mb-1">Recent Request Status</p>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest",
                      statsData?.data?.teacherLeave?.status === "Approved" ? "bg-brand-success/10 text-brand-success" :
                        statsData?.data?.teacherLeave?.status === "Rejected" ? "bg-brand-danger/10 text-brand-danger" : "bg-brand-warning/10 text-brand-warning"
                    )}>
                      {statsData?.data?.teacherLeave?.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-heading font-bold text-brand-slate-900 leading-none">
                      {calculateDays(statsData?.data?.teacherLeave?.startDate, statsData?.data?.teacherLeave?.endDate)} Days
                    </p>
                    <p className="text-[10px] font-bold text-brand-slate-400 uppercase tracking-tighter">Total Duration</p>
                  </div>
                </div>
                <p className="text-sm text-brand-slate-600 italic border-l-2 border-brand-slate-300 pl-4 py-1 mb-4">
                  "{statsData?.data?.teacherLeave?.reason}"
                </p>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs font-bold text-brand-slate-500 uppercase">
                    From: {new Date(statsData?.data?.teacherLeave?.startDate).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => { setIsHistoryOpen(true); viewLeaves.refetch(); }}
                    className="text-[10px] font-black text-brand-indigo hover:underline"
                  >
                    VIEW HISTORY
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-brand-slate-400 italic font-heading">No attendance absence requests on record.</p>
              </div>
            )}
          </div>
        </div>

        {/* Card: Grading Tasks (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-card shadow-grand border border-white overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-brand-slate-100 flex items-center justify-between bg-brand-slate-50/50">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-5 w-5 text-brand-indigo" />
              <h2 className="text-lg font-heading font-bold text-brand-slate-900">Grading Tasks</h2>
            </div>
            <button
              onClick={() => navigate('/dashboard/exams/my-grading')}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-indigo hover:text-brand-indigo-dark transition-colors"
            >
              QUEUE
            </button>
          </div>
          <div className="p-6 flex-1">
            {activeExams.length === 0 ? (
              <div className="text-center py-10 opacity-40">
                <BookOpen className="h-10 w-10 mx-auto mb-2 text-brand-slate-300" />
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate-400">No active grading tasks</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeExams.map((exam: any) => (
                  <div key={exam.id} className="p-4 rounded-xl border border-brand-slate-100 bg-brand-slate-50/50 hover:bg-white hover:border-brand-indigo/20 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-heading font-bold text-brand-slate-900 leading-tight">{exam.title}</h4>
                      <span className="text-[9px] font-black text-white bg-brand-indigo px-2 py-0.5 rounded uppercase">
                        {exam.classSection?.gradeLevel?.displayName}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {exam.examSubjects.map((es: any) => (
                        <button
                          key={es.id}
                          onClick={() => navigate(`/dashboard/exams/${exam.id}/marks/${es.id}`)}
                          className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-brand-slate-100 hover:border-brand-indigo hover:shadow-sm transition-all text-left"
                        >
                          <span className="text-xs font-semibold text-brand-slate-600 group-hover:text-brand-indigo">{es.classSubject?.subject?.name}</span>
                          <ChevronRight className="h-3 w-3 text-brand-slate-300 group-hover:text-brand-indigo transition-transform group-hover:translate-x-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card: Quick Actions */}
        <div className="lg:col-span-2 bg-brand-slate-900 rounded-card p-6 shadow-grand text-white border border-white/5 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Settings className="w-32 h-32" />
          </div>
          <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-3 relative z-10 text-brand-indigo-light">
            <ClipboardCheck className="h-6 w-6 text-brand-indigo-light" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <button
              onClick={() => navigate('/dashboard/attendance')}
              className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-left group"
            >
              <div className="h-10 w-10 rounded-lg bg-brand-indigo/20 flex items-center justify-center text-brand-indigo-light group-hover:bg-brand-indigo group-hover:text-white transition-all">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Student Registry</h4>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-tighter mt-0.5">Mark Attendance</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/dashboard/timetable')}
              className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-left group"
            >
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white group-hover:bg-brand-indigo transition-all">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Academic Calendar</h4>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-tighter mt-0.5">Weekly Schedule</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-brand-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 bg-brand-indigo flex justify-between items-center text-white">
              <div>
                <h2 className="text-2xl font-heading font-bold">Leave Records</h2>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Institutional History</p>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {viewLeaves.isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-brand-indigo animate-spin mb-4" />
                  <p className="text-sm font-bold text-brand-slate-400 uppercase tracking-widest">Retrieving archives...</p>
                </div>
              ) : viewLeaves?.data?.data?.leaveRequests?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-brand-slate-400 font-heading italic text-sm">No historical leave records found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {viewLeaves?.data?.data?.leaveRequests?.map((leave: any) => (
                    <div key={leave.id} className="flex items-center justify-between p-5 rounded-2xl border border-brand-slate-100 hover:bg-brand-slate-50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center",
                          leave.status === "Approved" ? "bg-brand-success/10 text-brand-success" :
                            leave.status === "Rejected" ? "bg-brand-danger/10 text-brand-danger" :
                              "bg-brand-indigo/10 text-brand-indigo"
                        )}>
                          <ClipboardList className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-brand-slate-900 text-sm leading-tight">{leave.reason || "Formal Request"}</p>
                          <p className="text-xs text-brand-slate-400 font-medium tabular-nums mt-1">
                            {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                        leave.status === "Approved" ? "bg-brand-success/5 text-brand-success border-brand-success/20" :
                          leave.status === "Rejected" ? "bg-brand-danger/5 text-brand-danger border-brand-danger/20" :
                            "bg-brand-indigo/5 text-brand-indigo border-brand-indigo/20"
                      )}>
                        {leave.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-8 py-5 bg-brand-slate-50 flex justify-end">
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-brand-slate-500 hover:text-brand-slate-900 transition-colors"
              >
                CLOSE RECORDS
              </button>
            </div>
          </div>
        </div>
      )}

      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="px-10 pt-10 pb-6 text-center">
              <div className="h-16 w-16 bg-brand-warning/10 text-brand-warning rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-heading font-bold text-brand-slate-900 mb-2">Request Absence</h3>
              <p className="text-brand-slate-500 text-sm italic font-heading">Propose a leave of absence to the administration.</p>
            </div>

            <form onSubmit={handleLeaveSubmit} className="px-10 pb-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-slate-400 uppercase tracking-[0.2em] ml-1">Begin Date</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-brand-slate-50 border border-brand-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-brand-indigo outline-none transition-all tabular-nums"
                    onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-slate-400 uppercase tracking-[0.2em] ml-1">End Date</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-brand-slate-50 border border-brand-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-brand-indigo outline-none transition-all tabular-nums"
                    onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-slate-400 uppercase tracking-[0.2em] ml-1">Justification</label>
                <textarea
                  required
                  placeholder="Summarize the reason for your absence..."
                  className="w-full bg-brand-slate-50 border border-brand-slate-100 rounded-2xl px-4 py-3 text-sm font-medium focus:border-brand-indigo outline-none transition-all h-32 resize-none"
                  onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                />
              </div>

              <div className="bg-brand-indigo/5 rounded-2xl p-4 flex justify-between items-center border border-brand-indigo/10">
                <div>
                  <p className="text-[10px] font-black text-brand-indigo/50 uppercase tracking-widest">Calculated Duration</p>
                  <p className="text-xl font-heading font-bold text-brand-indigo">
                    {calculateDays(leaveForm.startDate, leaveForm.endDate)} <span className="text-sm font-normal">Working Days</span>
                  </p>
                </div>
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Clock className="h-5 w-5 text-brand-indigo" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-brand-slate-400 hover:text-brand-slate-900 transition-colors"
                >
                  WITHDRAW
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-brand-indigo text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-indigo-dark hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {leaveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "SUBMIT INQUIRY"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
