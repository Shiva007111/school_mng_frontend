import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { parentService } from '@/services/parent.service';
import { attendanceService } from '@/services/attendance.service';
import { cn } from '@/utils/cn';

export const ParentAttendancePage: React.FC = () => {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Fetch Parent's Children
  const { data: childrenData, isLoading: isLoadingChildren } = useQuery({
    queryKey: ['my-children'],
    queryFn: () => parentService.getMyChildren(),
  });

  const children = childrenData?.data || [];

  // Set first child as selected by default
  React.useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  // Fetch Attendance History for selected child
  const { data: attendanceData, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['student-attendance', selectedChildId],
    queryFn: () => attendanceService.getStudentHistory(selectedChildId!),
    enabled: !!selectedChildId,
  });

  const attendanceEvents = attendanceData?.data || [];

  // Calculate stats
  const stats = {
    present: attendanceEvents.filter(e => e.status === 'present').length,
    absent: attendanceEvents.filter(e => e.status === 'absent').length,
    late: attendanceEvents.filter(e => e.status === 'late').length,
    total: attendanceEvents.length,
  };

  const attendancePercentage = stats.total > 0
    ? Math.round(((stats.present + stats.late) / stats.total) * 100)
    : 0;

  if (isLoadingChildren) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">No Students Linked</h2>
        <p className="text-gray-500 mt-2">No student profiles are currently linked to your account.</p>
      </div>
    );
  }

  const selectedChild = children.find(c => c.id === selectedChildId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
        <p className="text-gray-500">Track daily attendance for your children.</p>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all min-w-[200px]",
                selectedChildId === child.id
                  ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200"
                  : "bg-white border-gray-200 hover:border-indigo-200"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center",
                selectedChildId === child.id ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"
              )}>
                <User className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className={cn(
                  "text-sm font-semibold",
                  selectedChildId === child.id ? "text-indigo-900" : "text-gray-900"
                )}>
                  {child.user?.firstName || child.user?.lastName ?
                    `${child.user.firstName || ''} ${child.user.lastName || ''}`.trim() :
                    child.user?.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">{child.admissionNo}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{attendancePercentage}%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-gray-500">Present</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm font-medium text-gray-500">Absent</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <p className="text-sm font-medium text-gray-500">Late</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Attendance History for {selectedChild?.user?.firstName || selectedChild?.user?.lastName ?
              `${selectedChild.user.firstName || ''} ${selectedChild.user.lastName || ''}`.trim() :
              selectedChild?.user?.email.split('@')[0]}
          </h2>
        </div>

        {isLoadingAttendance ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 text-indigo-600 animate-spin mx-auto" />
          </div>
        ) : attendanceEvents.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {attendanceEvents.map((event) => (
              <div key={event.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    event.status === 'present' && "bg-green-100 text-green-600",
                    event.status === 'absent' && "bg-red-100 text-red-600",
                    event.status === 'late' && "bg-orange-100 text-orange-600",
                    event.status === 'excused' && "bg-blue-100 text-blue-600",
                  )}>
                    {event.status === 'present' && <CheckCircle2 className="h-5 w-5" />}
                    {event.status === 'absent' && <XCircle className="h-5 w-5" />}
                    {event.status === 'late' && <Clock className="h-5 w-5" />}
                    {event.status === 'excused' && <Calendar className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {event.markedAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Marked at {new Date(event.markedAt).toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    )}
                    {event.remarks && (
                      <p className="text-sm text-gray-500">{event.remarks}</p>
                    )}
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold",
                  event.status === 'present' && "bg-green-50 text-green-700",
                  event.status === 'absent' && "bg-red-50 text-red-700",
                  event.status === 'late' && "bg-orange-50 text-orange-700",
                  event.status === 'excused' && "bg-blue-50 text-blue-700",
                )}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500">No attendance records found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
