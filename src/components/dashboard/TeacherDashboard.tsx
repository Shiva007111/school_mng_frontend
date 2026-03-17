import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, BookOpen, ClipboardCheck, Loader2, Clock, MapPin, ChevronRight, Megaphone, User, GraduationCap, Settings, ClipboardList, X, ArrowRight, Users } from 'lucide-react';
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

  // Calculate days for the UI popup
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 0;
  };

  // Mutation for POSTing leave
  const leaveMutation = useMutation({
    mutationFn: (data: any) => dashboardService.postTeacherLeaveRequest(data), // Ensure this exists in your service
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
    // Helper to convert YYYY-MM-DD to ISO-8601
    const toISO = (dateStr: string) => new Date(dateStr).toISOString();

    leaveMutation.mutate({
      startDate: toISO(leaveForm.startDate), // Now it will be: 2026-03-18T00:00:00.000Z
      endDate: toISO(leaveForm.endDate),
      reason: leaveForm.reason,
      status: 'Requested',
      teacherId: statsData?.data?.teacherId,
      schoolId: statsData?.data?.schoolId,
    });
  };


  const [isHistoryOpen, setIsHistoryOpen] = useState(false);


  const viewLeaves = useQuery({
    queryKey: ["teacher-leaves", statsData?.data?.teacherId],
    queryFn: () =>
      dashboardService.getTeacherLeavesById(
        statsData?.data?.teacherId || "",

      ),
    enabled: false,
  });

  // response from backend will have marked as true/false and attendance record if marked is true, else null
  const markedAt = statsData?.data?.Tchrattendance?.markedAt || null;
  const markedTime = markedAt ? new Date(markedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }) : null;

  const markAttendance = async (latitude: number, longitude: number) => {
    try {
      const response = await attendanceService.markTeacherAttendance({
        latitude: latitude,
        longitude: longitude,
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
        toast.success("Attendance already  marked for today");
      } else {
        toast.success("Attendance marked successfully");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to mark attendance");
    };
  }
  console.log("markedTime", markedTime);

  const handleMarkAttendance = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // // accuracy check (very important)
          // if (accuracy > 100) {
          //   alert("Location accuracy is too low. Please move outside or enable GPS.");
          //   return;
          // }
          await markAttendance(latitude, longitude);

        } catch (error) {
          console.error(error);
          alert("Failed to mark attendance");
        }
      },

      (error) => {
        console.error(error);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("Please allow location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information unavailable.");
            break;
          case error.TIMEOUT:
            alert("Location request timed out.");
            break;
          default:
            alert("Unknown location error.");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
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
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const totalPeriodsToday = statsData?.data?.totalPeriods || 0;

  const attendanceStatus = statsData?.data?.attendanceStatus || { total: 0, marked: 0 };
  console.log(attendanceStatus);
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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-grand-navy rounded-3xl py-10 px-8 shadow-grand">
        {/* Subtle Watermark/Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-grand-gold/20 blur-3xl"></div>
          <div className="absolute right-0 bottom-0 opacity-20">
            <GraduationCap className="w-64 h-64 text-white rotate-12" />
          </div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-grand-gold/80 mb-2">
              <span>Dashboard</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/60">Overview</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
              {getGreeting()}, {user?.email.split('@')[0]}
            </h1>
            <p className="text-white/70 max-w-xl font-sans">
              Welcome back to your dashboard. Here's what's happening in your classes today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <p className="text-[10px] font-bold text-grand-gold uppercase tracking-tighter">Current Schema</p>
              <p className="text-sm font-semibold text-white">Academic Year 2025-26</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Periods */}
        <div className="group bg-white p-4 rounded-xl border-t-4 border-t-grand-blue border border-gray-100 shadow-grand hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg text-grand-blue group-hover:bg-grand-blue/5 transition-colors">
              <Calendar className="h-6 w-6 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">LIVE</span>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Today's Periods</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold text-gray-900 font-serif">{totalPeriodsToday}</p>
            <span className="text-xs text-gray-400 font-medium">Classes Scheduled</span>
          </div>
        </div>

        {/* Teacher Attendance Card */}
        <div className="group bg-white p-4 rounded-xl border-t-4 border-t-grand-green border border-gray-100 shadow-grand hover:shadow-lg transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg text-grand-green group-hover:bg-grand-green/5 transition-colors">
                <MapPin className="h-6 w-6 stroke-[1.5]" />
              </div>
              {markedTime && (
                <span className="text-[10px] font-bold text-grand-green bg-grand-green/10 px-2 py-0.5 rounded-full uppercase">VERIFIED</span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">My Attendance</p>
            <p className={cn(
              "text-lg font-bold mt-1 font-serif",
              markedTime ? "text-grand-green" : "text-amber-600"
            )}>
              {markedTime ? `Marked at ${markedTime}` : "Pending Check-in"}
            </p>
          </div>

          <button
            onClick={handleMarkAttendance}
            disabled={!!markedTime}
            className={cn(
              "mt-4 w-full py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all border",
              markedTime
                ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-grand-blue text-white border-grand-blue hover:bg-grand-navy hover:shadow-md'
            )}
          >
            {markedTime ? 'Attendance Recorded' : 'Mark Attendance Now'}
          </button>
        </div>

        {/* Student Attendance Summary */}
        <div className="group bg-white p-4 rounded-xl border-t-4 border-t-grand-gold border border-gray-100 shadow-grand hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg text-grand-gold group-hover:bg-grand-gold/5 transition-colors">
              <ClipboardCheck className="h-6 w-6 stroke-[1.5]" />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Rate</span>
              <span className="text-sm font-bold text-gray-700">
                {attendanceStatus.total > 0 ? Math.round((attendanceStatus.marked / attendanceStatus.total) * 100) : 0}%
              </span>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Attendance Marked</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold text-gray-900 font-serif">
              {attendanceStatus.marked} <span className="text-lg text-gray-400 font-normal italic">/ {attendanceStatus.total}</span>
            </p>
          </div>
          <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-grand-gold rounded-full transition-all duration-500"
              style={{ width: `${attendanceStatus.total > 0 ? (attendanceStatus.marked / attendanceStatus.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* My Classes Summary */}
        <div className="group bg-white p-6 rounded-xl border-t-4 border-t-indigo-400 border border-gray-100 shadow-grand hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg text-indigo-400 group-hover:bg-indigo-50 transition-colors">
              <BookOpen className="h-6 w-6 stroke-[1.5]" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">My Classes</p>
          <div className="mt-1">
            <p className="text-2xl font-bold text-gray-900 font-serif truncate">
              {myClasses.length > 0
                ? (
                  <span>
                    {myClasses[0].gradeLevel?.displayName} - {myClasses[0].section}
                    {myClasses.length > 1 && <span className="text-sm text-gray-400 font-normal ml-2">+{myClasses.length - 1} more</span>}
                  </span>
                )
                : 'No Classes Assigned'
              }
            </p>
          </div>
        </div>

        {/* Leave Requests Summary */}
        <div className="group bg-white p-6 rounded-xl border-t-4 border-t-amber-400 border border-gray-100 shadow-grand hover:shadow-lg transition-all lg:col-span-2">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  statsData?.data?.teacherLeave?.status === "Approved" ? "bg-green-50 text-green-600" :
                    statsData?.data?.teacherLeave?.status === "Requested" ? "bg-blue-50 text-blue-600" :
                      statsData?.data?.teacherLeave?.status === "Rejected" ? "bg-red-50 text-red-600" :
                        "bg-gray-50 text-gray-400"
                )}>
                  <Calendar className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 font-serif">Leave Management</p>
                  <p className="text-xs text-gray-500">Track and request your leave applications</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-2">
                {statsData?.data?.teacherLeave?.status && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Current Status</span>
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full uppercase",
                      statsData?.data?.teacherLeave?.status === "Approved" ? "bg-green-100 text-green-700" :
                        statsData?.data?.teacherLeave?.status === "Requested" ? "bg-blue-100 text-blue-700" :
                          "bg-red-100 text-red-700"
                    )}>
                      {statsData?.data?.teacherLeave?.status}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                disabled={statsData?.data?.teacherLeave?.status === "Requested"}
                className={cn(
                  "px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all",
                  statsData?.data?.teacherLeave?.status === "Requested"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-grand-gold text-white hover:bg-grand-gold/80 shadow-sm"
                )}
              >
                {statsData?.data?.teacherLeave?.status === "Requested" ? "Request Sent" : "Request Leave"}
              </button>
              <button
                onClick={() => { setIsHistoryOpen(true); viewLeaves.refetch(); }}
                className="text-[10px] font-bold uppercase tracking-tighter text-grand-blue hover:text-grand-navy flex items-center justify-center gap-1 transition-colors"
              >
                View History <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Section - Bulletin Style */}
      {announcementsData?.data && announcementsData.data.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-grand overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-grand-blue" />
              <h3 className="text-base font-serif font-bold text-gray-900">Official Bulletin</h3>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-widest text-grand-blue hover:text-grand-navy transition-colors">
              View All Postings
            </button>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto custom-scrollbar">
            {announcementsData.data.map((announcement: any) => (
              <div key={announcement.id} className="p-5 hover:bg-grand-paper/50 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-1 h-10 rounded-full",
                      announcement.priority === 'high' ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]' :
                        announcement.priority === 'medium' ? 'bg-amber-500' : 'bg-grand-blue'
                    )} />
                    <div>
                      <h4 className="text-lg font-serif font-bold text-gray-900 group-hover:text-grand-blue transition-colors">
                        {announcement.title}
                      </h4>
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tighter text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(announcement.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span>{announcement.author?.email.split('@')[0] || 'Academic Office'}</span>
                      </div>
                    </div>
                  </div>
                  <span className={cn(
                    "inline-flex items-center px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border",
                    announcement.priority === 'high' ? 'bg-red-50 text-red-700 border-red-100' :
                      announcement.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-grand-paper text-grand-blue border-gray-200'
                  )}>
                    {announcement.priority} Priority
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed font-sans pl-4 border-l border-gray-100 ml-0.5">
                  {announcement.content}
                </p>
                <div className="mt-4 pl-4">
                  <button className="text-sm font-bold text-grand-blue hover:text-grand-navy flex items-center gap-1 group/btn">
                    Read Full Document
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
        {/* Today's Schedule - Modern Grid View */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-grand overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-gray-900">Teaching Schedule</h3>
            <button onClick={() => navigate('/dashboard/timetable')} className="text-[10px] font-bold uppercase tracking-widest text-grand-blue hover:text-grand-navy">
              Detailed View
            </button>
          </div>

          <div className="p-5 max-h-[450px] overflow-y-auto custom-scrollbar">
            {todayShedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 bg-grand-paper/30 rounded-2xl border border-dashed border-gray-200">
                <Calendar className="h-10 w-10 text-gray-300 mb-4" />
                <p className="text-sm text-gray-500 font-serif italic text-center">No formal sessions scheduled for today.</p>
              </div>
            ) : (
              <div className="relative space-y-4">
                {/* Vertical Timeline Thread */}
                <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-gray-100" />

                {todayShedule.map((period: any) => {
                  const startTime = new Date(period.startTime);
                  const endTime = new Date(period.endTime);
                  const now = new Date();
                  const isLive = now >= startTime && now <= endTime;

                  return (
                    <div key={period.id} className={cn(
                      "relative flex items-center gap-6 p-5 rounded-2xl transition-all border",
                      isLive
                        ? "bg-white border-grand-gold shadow-lg shadow-grand-gold/10 scale-[1.02] z-10"
                        : "bg-white border-transparent hover:border-gray-100 hover:bg-gray-50/50"
                    )}>
                      {/* Time Marker */}
                      <div className={cn(
                        "relative z-10 h-[44px] w-[44px] shrink-0 rounded-full flex flex-col items-center justify-center border-4 border-white shadow-sm transition-colors",
                        isLive ? "bg-grand-gold text-white" : "bg-gray-100 text-gray-400"
                      )}>
                        <Clock className="h-5 w-5" />
                        {isLive && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                          </span>
                        )}
                      </div>

                      {/* Period Details */}
                      <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-serif font-bold text-gray-900">
                              {period.classSubject?.subject?.name}
                            </h4>
                            {isLive && (
                              <span className="text-[10px] font-black uppercase tracking-widest text-grand-gold bg-grand-gold/10 px-2 py-0.5 rounded">
                                Active Now
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-300" />
                            {period.classSection?.gradeLevel?.displayName} — Section {period.classSection?.section}
                          </p>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-black text-gray-900 tabular-nums">
                              {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                              Start Duration
                            </p>
                          </div>
                          <div className="h-8 w-px bg-gray-100" />
                          <div className="text-right">
                            <p className="text-sm text-gray-500 flex items-center justify-end gap-1 font-bold">
                              <MapPin className="h-3 w-3" />
                              {period.room?.name || 'Main Hall'}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                              Classroom
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Active Grading & Actions */}
        <div className="space-y-8">
          {/* Active Grading */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-grand overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-gray-900">Grading Tasks</h3>
              <button onClick={() => navigate('/dashboard/exams/my-grading')} className="text-xs font-bold uppercase tracking-widest text-grand-blue hover:text-grand-navy">Queue</button>
            </div>
            <div className="p-6">
              {activeExams.length === 0 ? (
                <div className="text-center py-10 grayscale opacity-40">
                  <BookOpen className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">No active grading</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeExams.map((exam: any) => (
                    <div key={exam.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-grand-blue/20 transition-all group">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-gray-900 font-serif leading-tight">{exam.title}</h4>
                        <span className="text-[9px] font-black text-white bg-grand-blue px-2 py-0.5 rounded">
                          {exam.classSection?.gradeLevel?.displayName}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {exam.examSubjects.map((es: any) => (
                          <button
                            key={es.id}
                            onClick={() => navigate(`/dashboard/exams/${exam.id}/marks/${es.id}`)}
                            className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 hover:border-grand-blue hover:shadow-sm transition-all text-left"
                          >
                            <span className="text-xs font-semibold text-gray-600 group-hover:text-grand-blue">{es.classSubject?.subject?.name}</span>
                            <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-grand-blue transition-transform group-hover:translate-x-1" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-grand-navy rounded-2xl p-6 shadow-grand text-white border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Settings className="w-20 h-20" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-grand-gold" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3 relative z-10">
              <button
                onClick={() => navigate('/dashboard/attendance')}
                className="flex items-center gap-4 p-4 bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 transition-all text-left group"
              >
                <div className="h-10 w-10 rounded-lg bg-grand-gold/20 flex items-center justify-center text-grand-gold group-hover:bg-grand-gold group-hover:text-grand-navy transition-all">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Student Registry</h4>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-tighter mt-0.5">Mark Attendance</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/dashboard/timetable')}
                className="flex items-center gap-4 p-4 bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 transition-all text-left group"
              >
                <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-grand-navy transition-all">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Academic Calendar</h4>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-tighter mt-0.5">Weekly Schedule</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= HISTORY MODAL - REDESIGNED ================= */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-grand-navy/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 bg-grand-navy flex justify-between items-center text-white">
              <div>
                <h2 className="text-2xl font-serif font-bold">Leave Records</h2>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Institutional History</p>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="h-10 w-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto">
              {viewLeaves.isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-grand-blue animate-spin mb-4" />
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Retrieving archives...</p>
                </div>
              ) : viewLeaves?.data?.data?.leaveRequests?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 font-serif italic">No historical leave records found in your folder.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {viewLeaves?.data?.data?.leaveRequests?.map((leave: any) => (
                    <div key={leave.id} className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 hover:bg-grand-paper/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center",
                          leave.status === "Approved" ? "bg-grand-green/10 text-grand-green" :
                            leave.status === "Rejected" ? "bg-red-50 text-red-600" :
                              "bg-grand-blue/10 text-grand-blue"
                        )}>
                          <ClipboardList className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm leading-tight">{leave.reason || "Formal Request"}</p>
                          <p className="text-xs text-gray-400 font-medium tabular-nums mt-1">
                            {new Date(leave.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                            {" — "}
                            {new Date(leave.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                        leave.status === "Approved" ? "bg-grand-green/5 text-grand-green border-grand-green/20" :
                          leave.status === "Rejected" ? "bg-red-50 text-red-700 border-red-100" :
                            "bg-grand-blue/5 text-grand-blue border-grand-blue/20"
                      )}>
                        {leave.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-8 py-5 bg-gray-50 flex justify-end">
              <button onClick={() => setIsHistoryOpen(false)} className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">
                Close Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REQUEST LEAVE MODAL - REDESIGNED ================= */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-grand-navy/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="px-10 pt-10 pb-6 text-center">
              <div className="h-16 w-16 bg-grand-gold/10 text-grand-gold rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mb-2">Request Absence</h3>
              <p className="text-gray-500 text-sm italic font-serif">Propose a leave of absence to the administration.</p>
            </div>

            <form onSubmit={handleLeaveSubmit} className="px-10 pb-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                    Begin Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full bg-grand-paper border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-grand-blue focus:ring-4 focus:ring-grand-blue/5 outline-none transition-all tabular-nums"
                    onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full bg-grand-paper border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-grand-blue focus:ring-4 focus:ring-grand-blue/5 outline-none transition-all tabular-nums"
                    onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                  Justification / Reason
                </label>
                <textarea
                  required
                  placeholder="Summarize the reason for your absence..."
                  className="w-full bg-grand-paper border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:border-grand-blue focus:ring-4 focus:ring-grand-blue/5 outline-none transition-all h-32 resize-none"
                  onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                />
              </div>

              <div className="bg-grand-blue/5 rounded-2xl p-4 flex justify-between items-center border border-grand-blue/10">
                <div>
                  <p className="text-[10px] font-black text-grand-blue/50 uppercase tracking-widest">Calculated Duration</p>
                  <p className="text-xl font-serif font-bold text-grand-blue">
                    {calculateDays(leaveForm.startDate, leaveForm.endDate)} <span className="text-sm font-normal">Working Days</span>
                  </p>
                </div>
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Clock className="h-5 w-5 text-grand-blue" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Withdraw
                </button>

                <button
                  type="submit"
                  className="flex-1 py-4 bg-grand-navy text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-grand-blue hover:shadow-xl hover:shadow-grand-blue/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {leaveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Submit Inquiry"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};






