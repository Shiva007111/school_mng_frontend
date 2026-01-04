import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicService } from '@/services/academic.service';
import { Button } from '@/components/Button';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AssignClassModalProps {
    teacherId: string;
    teacherName: string;
    onClose: () => void;
}

export default function AssignClassModal({ teacherId, teacherName, onClose }: AssignClassModalProps) {
    const queryClient = useQueryClient();
    const [academicYearId, setAcademicYearId] = useState('');
    const [gradeLevelId, setGradeLevelId] = useState('');
    const [classSectionId, setClassSectionId] = useState('');

    // Fetch Academic Years
    const { data: yearsData } = useQuery({
        queryKey: ['academic-years'],
        queryFn: () => academicService.getAcademicYears(),
    });

    // Fetch Grade Levels
    const { data: gradesData } = useQuery({
        queryKey: ['grade-levels'],
        queryFn: () => academicService.getGradeLevels(),
    });

    // Fetch Class Sections based on Year and Grade
    const { data: sectionsData } = useQuery({
        queryKey: ['class-sections', { academicYearId, gradeLevelId }],
        queryFn: () => academicService.getClassSections({ academicYearId, gradeLevelId }),
        enabled: !!academicYearId && !!gradeLevelId,
    });

    const assignMutation = useMutation({
        mutationFn: (csId: string) => academicService.updateClassSection(csId, { classTeacherId: teacherId }),
        onSuccess: () => {
            toast.success('Teacher assigned successfully');
            queryClient.invalidateQueries({ queryKey: ['teacher', teacherId] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to assign teacher');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!classSectionId) {
            toast.error('Please select a class section');
            return;
        }
        assignMutation.mutate(classSectionId);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Assign Class Teacher</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-4">
                            Assigning <span className="font-semibold text-gray-900">{teacherName}</span> as class teacher.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Academic Year</label>
                        <select
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={academicYearId}
                            onChange={(e) => {
                                setAcademicYearId(e.target.value);
                                setClassSectionId('');
                            }}
                            required
                        >
                            <option value="">Select Year</option>
                            {yearsData?.data?.map((year) => (
                                <option key={year.id} value={year.id}>{year.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Grade Level</label>
                        <select
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={gradeLevelId}
                            onChange={(e) => {
                                setGradeLevelId(e.target.value);
                                setClassSectionId('');
                            }}
                            required
                        >
                            <option value="">Select Grade</option>
                            {gradesData?.data?.map((grade) => (
                                <option key={grade.id} value={grade.id}>{grade.displayName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Class Section</label>
                        <select
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
                            value={classSectionId}
                            onChange={(e) => setClassSectionId(e.target.value)}
                            disabled={!academicYearId || !gradeLevelId}
                            required
                        >
                            <option value="">Select Section</option>
                            {sectionsData?.data?.map((section) => (
                                <option key={section.id} value={section.id}>
                                    Section {section.section} {section.classTeacherId ? '(Already has teacher)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={assignMutation.isPending}>
                            {assignMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                'Confirm Assignment'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
