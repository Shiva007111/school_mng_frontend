  import React from 'react';
  import { useQuery, useQueryClient } from '@tanstack/react-query';
  import { Calendar, BookOpen, ClipboardCheck, Loader2, Clock, MapPin, ChevronRight, Megaphone, Users} from 'lucide-react';
  import { dashboardService } from '@/services/dashboard.service';
  import { announcementService } from '@/services/announcement.service';
  import { useNavigate } from 'react-router-dom';
  import { attendanceService } from '@/services/attendance.service';
  import toast from 'react-hot-toast';

  export const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: statsData, isLoading: statsLoading } = useQuery({
      queryKey: ['teacher-stats'],
      queryFn: () => dashboardService.getTeacherStats(),
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
        queryClient.invalidateQueries({
          queryKey: ["teacher-attendance-today"],
        });
        // show markedat time near mark attendance button and disable it after marking attendance successfully.
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
      }catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to mark attendance");  
      };
    }

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
    //from stats.data get totalteacher periods keep in today's periods card.
    const totalPeriodsToday = statsData?.data?.totalPeriods || 0;

    const totalStudentsToday = statsData?.data?.attendanceStatus?.total || 0;

    const presentStudentsToday = statsData?.data?.attendanceStatus?.marked || 0;

    const attendanceStatus = statsData?.data?.attendanceStatus || { total: 0, marked: 0 };
// from stats.data get teacher Today schedule with class, section, subject and room details and show in today's schedule card. if no schedule show no classes today in teacher dashboard.
    // const todayClasses = statsData?.data?.todayShedule || [];
    // // const myClasses = statsData?.data?.myClasses || [];
    // // const activeExams = statsData?.data?.activeExams || [];
    // const gradelevels = statsData?.data?.todayShedule?.map((c: any) => c.classSection?.gradeLevel?.displayName).join(', ') || 'N/A';
    // const startTime = statsData?.data?.todayShedule?.[0]?.startTime ? new Date(statsData.data.todayShedule[0].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    // const endTime = statsData?.data?.todayShedule?.[0]?.endTime ? new Date(statsData.data.todayShedule[0].endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    // want gradeleves like Grade -1 .


    
    

    
    const { timetable = [], myClasses = [], activeExams = []  } = statsData?.data || {};

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
              <p className="text-2xl font-bold text-gray-900">{totalPeriodsToday}</p>
            </div>
          </div>

        {/* Teacher Attendance Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">

        <div className="flex items-center gap-4">
          
          <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              My Attendance
            </p>
            <p className="text-lg font-bold text-green-600">
              {markedTime ? `Marked at ${markedTime}` : "Not marked yet"}
            </p>
          </div>
        </div>

        <button
          onClick={handleMarkAttendance}
          disabled={!!markedTime}
          className={`px-4 py-2 text-lg font-medium rounded-lg transition-colors ${markedTime ? 'bg-gray-300 text-gray-500 cursor-not-allowed ' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:bg-gray-300'}`}
        >
          Mark Attendance
        </button>

      </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-500">Students Present</p>
            <p className="text-2xl font-bold text-gray-900">
              {attendanceStatus.marked ? `${presentStudentsToday} / ${totalStudentsToday}` : 'N/A'}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">My Classes</p>
            <p className="text-2xl font-bold text-gray-900 truncate max-w-[150px]">
              {myClasses.length > 0
                ? (
                  <span title={myClasses.map((c: any) => `${c.gradeLevel?.displayName} - ${c.section}`).join(', ')}>
                    {myClasses[0].gradeLevel?.displayName} - {myClasses[0].section}
                    {myClasses.length > 1 && <span className="text-sm text-gray-500 font-normal ml-1">+{myClasses.length - 1}</span>}
                  </span>
                )
                : '0'
              }
            </p>
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

          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Today's Schedule</h3>

            <button
              onClick={() => navigate('/dashboard/timetable')}
              className="text-sm text-indigo-600 font-medium hover:underline"
            >
              View Full
            </button>
          </div>

          {/* Schedule List */}
              {statsData?.data?.todayShedule?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg"
                >
                  <p className="text-sm font-semibold text-gray-800">
                    {item?.classSection?.gradeLevel?.displayName?.replace("Grade ", "Grade - ")} - {item?.classSection?.section} | {item?.classSubject?.subject?.name}
                  </p>

                  <span className="text-sm text-gray-600">
                    {item?.startTime
                      ? new Date(item.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}{" "}
                    -
                    {item?.endTime
                      ? new Date(item.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </span>
                </div>
              ))}

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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between ">
            <h3 className="text-lg font-bold text-gray-900">Active Grading</h3>
            <button onClick={() => navigate('/dashboard/exams/my-grading')} className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
          </div>
          <div className="p-6">

            {activeExams.length === 0 ? (
              <p className="text-center py-10 text-gray-400 italic"></p>
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
            <div className="p-6  border-t border-gray-100 margin-bottom-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mt-6 mb-4 px-2 py-3 embossed rounded-lg bg-gray-50  margin bottom-4">
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
      </div>
    </div>
  );
};
