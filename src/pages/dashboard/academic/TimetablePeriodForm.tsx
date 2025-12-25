import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/Button';
import type { 
  ClassSubject, 
  ClassRoom, 
  TimetablePeriod 
} from '@/types/academic.types';

const periodSchema = z.object({
  classSubjectId: z.string().min(1, 'Subject is required'),
  roomId: z.string().optional(),
  weekday: z.number().min(1).max(7),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

type PeriodFormValues = z.infer<typeof periodSchema>;

interface TimetablePeriodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PeriodFormValues) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  isDeleting?: boolean;
  classSubjects: ClassSubject[];
  rooms: ClassRoom[];
  initialData?: TimetablePeriod | null;
  defaultWeekday?: number;
  defaultTime?: string;
}

export const TimetablePeriodForm: React.FC<TimetablePeriodFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  isLoading,
  isDeleting,
  classSubjects,
  rooms,
  initialData,
  defaultWeekday,
  defaultTime,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PeriodFormValues>({
    resolver: zodResolver(periodSchema),
    defaultValues: {
      weekday: defaultWeekday || 1,
      startTime: defaultTime || '08:00',
      endTime: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      // Convert ISO string to HH:mm for input[type="time"]
      const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toTimeString().slice(0, 5);
      };

      reset({
        classSubjectId: initialData.classSubjectId,
        roomId: initialData.roomId || '',
        weekday: initialData.weekday,
        startTime: formatTime(initialData.startTime),
        endTime: formatTime(initialData.endTime),
      });
    } else {
      reset({
        weekday: defaultWeekday || 1,
        startTime: defaultTime ? convertTo24Hour(defaultTime) : '08:00',
        endTime: '',
      });
    }
  }, [initialData, reset, defaultWeekday, defaultTime]);

  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">
            {initialData ? 'Edit Period' : 'Add Timetable Period'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject & Teacher</label>
            <select
              {...register('classSubjectId')}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
            >
              <option value="">Select Subject</option>
              {classSubjects.map((cs) => (
                <option key={cs.id} value={cs.id}>
                  {cs.subject?.name} ({cs.teacherSubject?.teacher?.user?.email || 'No Teacher'})
                </option>
              ))}
            </select>
            {errors.classSubjectId && (
              <p className="mt-1 text-xs text-red-600">{errors.classSubjectId.message}</p>
            )}
          </div>

          {/* Room Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Room (Optional)</label>
            <select
              {...register('roomId')}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
            >
              <option value="">Select Room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} (Cap: {room.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Weekday */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Weekday</label>
              <select
                {...register('weekday', { valueAsNumber: true })}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
              >
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
                <option value={7}>Sunday</option>
              </select>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                {...register('startTime')}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
              />
              {errors.startTime && (
                <p className="mt-1 text-xs text-red-600">{errors.startTime.message}</p>
              )}
            </div>
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              {...register('endTime')}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
            />
            {errors.endTime && (
              <p className="mt-1 text-xs text-red-600">{errors.endTime.message}</p>
            )}
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading || isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isLoading || isDeleting}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : initialData ? (
                  'Update Period'
                ) : (
                  'Add Period'
                )}
              </Button>
            </div>
            
            {initialData && onDelete && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onDelete(initialData.id)}
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                disabled={isLoading || isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Delete Period'
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
