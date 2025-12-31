import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { useNavigate } from 'react-router-dom';

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: childrenData, isLoading } = useQuery({
    queryKey: ['parent-stats'],
    queryFn: () => dashboardService.getParentStats(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const children = childrenData?.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Children Summary</h2>
        <p className="text-sm text-gray-500">Quick overview of your children's performance and attendance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {children.map((child: any) => (
          <div key={child.studentId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-indigo-600 shadow-sm">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{child.name}</h3>
                  <p className="text-xs text-gray-500">{child.class}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500">Attendance</p>
                <p className={`text-lg font-bold ${parseFloat(child.attendanceRate) > 90 ? 'text-green-600' : 'text-amber-600'}`}>
                  {child.attendanceRate}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Recent Marks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Marks</h4>
                  <button onClick={() => navigate('/dashboard/exams/my-children')} className="text-[10px] text-indigo-600 font-bold hover:underline">View All</button>
                </div>
                {child.recentMarks.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No marks recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {child.recentMarks.map((mark: any) => (
                      <div key={mark.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-xs">
                        <span className="font-medium text-gray-700">{mark.examSubject?.classSubject?.subject?.name}</span>
                        <span className="font-bold text-gray-900">{mark.score} / {mark.examSubject?.maxScore}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Attendance */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Attendance</h4>
                  <button onClick={() => navigate('/dashboard/attendance/my-children')} className="text-[10px] text-indigo-600 font-bold hover:underline">View All</button>
                </div>
                <div className="flex gap-2">
                  {child.recentAttendance.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No attendance records yet.</p>
                  ) : (
                    child.recentAttendance.map((event: any) => (
                      <div 
                        key={event.id} 
                        className={`h-8 w-8 rounded-lg flex items-center justify-center border ${
                          event.status === 'present' ? 'bg-green-50 border-green-100 text-green-600' : 
                          event.status === 'absent' ? 'bg-red-50 border-red-100 text-red-600' : 
                          'bg-amber-50 border-amber-100 text-amber-600'
                        }`}
                        title={`${new Date(event.date).toLocaleDateString()}: ${event.status}`}
                      >
                        {event.status === 'present' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={() => navigate(`/dashboard/students/${child.studentId}`)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-indigo-600 hover:bg-white rounded-xl transition-all"
              >
                View Full Profile
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
