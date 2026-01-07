import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Filter, Loader2, User as UserIcon } from 'lucide-react';
import { academicService } from '@/services/academic.service';
import { parentService } from '@/services/parent.service';
import { useAuth } from '@/context/AuthContext';
import { TimetableGrid } from '@/components/academic/TimetableGrid';
import { TimetablePeriodForm } from './TimetablePeriodForm';
import type { TimetablePeriod } from '@/types/academic.types';
import { toast } from 'react-hot-toast';

export const TimetablePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSectionId, setSelectedSectionId] = useState<string>(searchParams.get('sectionId') || '');
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<TimetablePeriod | null>(null);
  const [clickedSlot, setClickedSlot] = useState<{ weekday: number, time: string } | null>(null);

  const isStudent = user?.roles?.some(r => r.role.name === 'Student');
  const isParent = user?.roles?.some(r => r.role.name === 'Parent');
  const isAdmin = user?.roles?.some(r => ['Admin', 'Super Admin'].includes(r.role.name));
  const isTeacher = user?.roles?.some(r => r.role.name === 'Teacher');
  const canManage = isAdmin; // Only Admins can manage timetable

  // Sync selectedSectionId with URL
  useEffect(() => {
    const sectionId = searchParams.get('sectionId');
    if (sectionId && sectionId !== selectedSectionId) {
      setSelectedSectionId(sectionId);
    }
  }, [searchParams]);

  // For Student: Automatically set a dummy section ID to trigger the query (backend handles the actual filtering)
  useEffect(() => {
    if (isStudent && !selectedSectionId) {
      setSelectedSectionId('my-section');
    }
  }, [isStudent, selectedSectionId]);

  const handleSectionChange = (id: string) => {
    setSelectedSectionId(id);
    if (id && !isStudent) {
      setSearchParams({ sectionId: id });
    } else {
      setSearchParams({});
    }
  };

  // Fetch Class Sections (Only for Admin/Teacher)
  const { data: sectionsData } = useQuery({
    queryKey: ['class-sections'],
    queryFn: () => academicService.getClassSections(),
    enabled: !!(isAdmin || isTeacher),
  });

  // Fetch Children (Only for Parent)
  const { data: childrenData } = useQuery({
    queryKey: ['my-children'],
    queryFn: () => parentService.getMyChildren(),
    enabled: !!isParent,
  });

  // Fetch Timetable Periods for selected section
  const { data: periodsData, isLoading: isLoadingPeriods } = useQuery({
    queryKey: ['timetable-periods', selectedSectionId],
    queryFn: () => academicService.getTimetablePeriods({ classSectionId: selectedSectionId }),
    enabled: !!selectedSectionId,
  });

  // Fetch Class Subjects for the selected section
  const { data: classSubjectsData } = useQuery({
    queryKey: ['class-subjects', selectedSectionId],
    queryFn: () => academicService.getClassSubjects(selectedSectionId),
    enabled: !!selectedSectionId,
  });

  // Fetch Rooms
  const { data: roomsData } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => academicService.getRooms(),
  });

  const sections = sectionsData?.data || [];
  const children = childrenData?.data || [];
  const periods = periodsData?.data || [];
  const classSubjects = classSubjectsData?.data || [];
  const rooms = roomsData?.data || [];

  // Helper to get display name for selected section
  const getSelectedSectionName = () => {
    if (isAdmin || isTeacher) {
      const section = sections.find(s => s.id === selectedSectionId);
      return section ? `${section.gradeLevel?.displayName} - ${section.section}` : '';
    }
    if (isParent) {
      const child = children.find(c => c.enrollments?.some(e => e.classSectionId === selectedSectionId));
      return child ? `${child.user?.firstName}'s Class` : '';
    }
    return 'My Timetable';
  };

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => academicService.createTimetablePeriod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-periods', selectedSectionId] });
      toast.success('Period added successfully');
      setIsPeriodModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add period');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) =>
      academicService.updateTimetablePeriod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-periods', selectedSectionId] });
      toast.success('Period updated successfully');
      setIsPeriodModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update period');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => academicService.deleteTimetablePeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-periods', selectedSectionId] });
      toast.success('Period deleted successfully');
      setIsPeriodModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete period');
    },
  });

  const handleSlotClick = (weekday: number, time: string) => {
    if (!selectedSectionId) {
      toast.error('Please select a class section first');
      return;
    }
    setClickedSlot({ weekday, time });
    setEditingPeriod(null);
    setIsPeriodModalOpen(true);
  };

  const handlePeriodClick = (period: TimetablePeriod) => {
    setEditingPeriod(period);
    setClickedSlot(null);
    setIsPeriodModalOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    // Convert HH:mm to ISO Date for the backend
    const today = new Date();
    const [startH, startM] = data.startTime.split(':');
    const [endH, endM] = data.endTime.split(':');

    const startTime = new Date(today);
    startTime.setHours(parseInt(startH, 10), parseInt(startM, 10), 0, 0);

    const endTime = new Date(today);
    endTime.setHours(parseInt(endH, 10), parseInt(endM, 10), 0, 0);

    const payload = {
      ...data,
      classSectionId: selectedSectionId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };

    if (editingPeriod) {
      updateMutation.mutate({ id: editingPeriod.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-500">
            {isStudent ? 'View your weekly class schedule.' : 'Create and manage weekly schedules for class sections.'}
          </p>
        </div>
        {selectedSectionId && (
          <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium text-sm border border-indigo-100">
            {getSelectedSectionName()}
          </div>
        )}
      </div>

      {/* Filters & Selection */}
      {!isStudent && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            {isParent ? <UserIcon className="h-4 w-4 text-gray-400" /> : <Filter className="h-4 w-4 text-gray-400" />}
            <span className="text-sm font-medium text-gray-700">
              {isParent ? 'Select Child:' : 'Select Class:'}
            </span>
          </div>

          <select
            value={selectedSectionId}
            onChange={(e) => handleSectionChange(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
          >
            <option value="">{isParent ? 'Choose a child...' : 'Choose a section...'}</option>

            {(isAdmin || isTeacher) && sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.gradeLevel?.displayName} - {section.section}
              </option>
            ))}

            {isParent && children.map((child) => {
              // Find active enrollment to get classSectionId
              const enrollment = child.enrollments?.find(e => e.status === 'active' || !e.status);
              if (!enrollment) return null;

              return (
                <option key={child.id} value={enrollment.classSectionId}>
                  {child.user?.firstName} {child.user?.lastName} ({enrollment.classSection?.gradeLevel?.displayName})
                </option>
              );
            })}
          </select>

          {selectedSection && (isAdmin || isTeacher) && (
            <div className="flex items-center gap-4 ml-auto">
              <div className="text-sm">
                <span className="text-gray-500">Class Teacher: </span>
                <span className="font-semibold text-gray-900">
                  {selectedSection.classTeacher?.user ? (
                    `${selectedSection.classTeacher.user.firstName} ${selectedSection.classTeacher.user.lastName}`
                  ) : (
                    selectedSection.classTeacher?.user?.email || 'Not Assigned'
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timetable Grid */}
      {!selectedSectionId ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-20 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Section Selected</h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">
            Please select a class section from the dropdown above to view or manage its timetable.
          </p>
        </div>
      ) : isLoadingPeriods ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-500">Loading timetable...</p>
        </div>
      ) : (
        <TimetableGrid
          periods={periods}
          onPeriodClick={canManage ? handlePeriodClick : undefined}
          onSlotClick={canManage ? handleSlotClick : undefined}
        />
      )}

      <TimetablePeriodForm
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        onSubmit={handleFormSubmit}
        onDelete={(id) => deleteMutation.mutate(id)}
        isLoading={createMutation.isPending || updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
        classSubjects={classSubjects}
        rooms={rooms}
        initialData={editingPeriod}
        defaultWeekday={clickedSlot?.weekday}
        defaultTime={clickedSlot?.time}
      />
    </div>
  );
};
