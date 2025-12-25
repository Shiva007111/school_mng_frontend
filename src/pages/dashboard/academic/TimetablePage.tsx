import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Filter, Loader2 } from 'lucide-react';
import { academicService } from '@/services/academic.service';
import { TimetableGrid } from '@/components/academic/TimetableGrid';
import { TimetablePeriodForm } from './TimetablePeriodForm';
import type { TimetablePeriod } from '@/types/academic.types';
import { toast } from 'react-hot-toast';

export const TimetablePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSectionId, setSelectedSectionId] = useState<string>(searchParams.get('sectionId') || '');
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<TimetablePeriod | null>(null);
  const [clickedSlot, setClickedSlot] = useState<{ weekday: number, time: string } | null>(null);

  // Sync selectedSectionId with URL
  useEffect(() => {
    const sectionId = searchParams.get('sectionId');
    if (sectionId && sectionId !== selectedSectionId) {
      setSelectedSectionId(sectionId);
    }
  }, [searchParams]);

  const handleSectionChange = (id: string) => {
    setSelectedSectionId(id);
    if (id) {
      setSearchParams({ sectionId: id });
    } else {
      setSearchParams({});
    }
  };

  // Fetch Class Sections
  const { data: sectionsData } = useQuery({
    queryKey: ['class-sections'],
    queryFn: () => academicService.getClassSections(),
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
  const periods = periodsData?.data || [];
  const classSubjects = classSubjectsData?.data || [];
  const rooms = roomsData?.data || [];
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
          <p className="text-gray-500">Create and manage weekly schedules for class sections.</p>
        </div>
      </div>

      {/* Filters & Selection */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Select Class:</span>
        </div>
        <select
          value={selectedSectionId}
          onChange={(e) => handleSectionChange(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
        >
          <option value="">Choose a section...</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.gradeLevel?.displayName} - {section.section}
            </option>
          ))}
        </select>

        {selectedSection && (
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-sm">
              <span className="text-gray-500">Class Teacher: </span>
              <span className="font-semibold text-gray-900">
                {selectedSection.classTeacher?.user?.email || 'Not Assigned'}
              </span>
            </div>
          </div>
        )}
      </div>

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
          onPeriodClick={handlePeriodClick}
          onSlotClick={handleSlotClick}
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
