import React from 'react';
import { Clock, BookOpen, User as UserIcon, MapPin } from 'lucide-react';
import type { TimetablePeriod } from '@/types/academic.types';
import { cn } from '@/utils/cn';

interface TimetableGridProps {
  periods: TimetablePeriod[];
  onPeriodClick?: (period: TimetablePeriod) => void;
  onSlotClick?: (weekday: number, time: string) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
];

export const TimetableGrid: React.FC<TimetableGridProps> = ({ 
  periods, 
  onPeriodClick,
  onSlotClick 
}) => {
  // Helper to find period for a day and time
  const getPeriod = (dayIndex: number, time: string) => {
    // Convert "08:00 AM" to minutes since midnight
    const parseTimeSlot = (t: string) => {
      const [timePart, ampm] = t.split(' ');
      if (!timePart || !ampm) return -1;
      let [h, m] = timePart.split(':').map(Number);
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return h * 60 + (m || 0);
    };

    const slotMinutes = parseTimeSlot(time);

    return periods.find(p => {
      const date = new Date(p.startTime);
      
      // Try local minutes
      const localMinutes = date.getHours() * 60 + date.getMinutes();
      // Try UTC minutes
      const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
      
      const isMatch = p.weekday === dayIndex + 1 && (localMinutes === slotMinutes || utcMinutes === slotMinutes);
      return isMatch;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 border-r border-gray-200">
                Time
              </th>
              {DAYS.map((day) => (
                <th key={day} className="p-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[150px]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {TIME_SLOTS.map((time) => (
              <tr key={time} className="group">
                <td className="p-4 text-xs font-medium text-gray-500 border-r border-gray-200 bg-gray-50/50">
                  {time}
                </td>
                {DAYS.map((_, dayIndex) => {
                  const period = getPeriod(dayIndex, time);
                  return (
                    <td 
                      key={`${dayIndex}-${time}`} 
                      className={cn(
                        "p-2 h-24 transition-colors relative",
                        period ? "bg-indigo-50/30" : "hover:bg-gray-50 cursor-pointer"
                      )}
                      onClick={() => period ? onPeriodClick?.(period) : onSlotClick?.(dayIndex + 1, time)}
                    >
                      {period ? (
                        <div className="h-full w-full p-2 rounded-lg bg-white border border-indigo-100 shadow-sm flex flex-col justify-between group/period hover:border-indigo-300 hover:shadow-md transition-all">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <BookOpen className="h-3 w-3 text-indigo-600" />
                              <span className="text-xs font-bold text-gray-900 truncate">
                                {period.classSubject?.subject?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                              <UserIcon className="h-2.5 w-2.5" />
                              <span className="truncate">
                                {period.classSubject?.teacherSubject?.teacher?.user?.email || 'No Teacher'}
                              </span>
                            </div>
                          </div>
                          {period.room && (
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-auto">
                              <MapPin className="h-2.5 w-2.5" />
                              <span>{period.room.name}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="p-1.5 rounded-full bg-gray-100 text-gray-400">
                            <Clock className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
