import React from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { BookOpen, Loader2, CheckCircle2 } from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import toast from 'react-hot-toast';

export const StudentHomeworkPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['student-stats'],
        queryFn: () => dashboardService.getStudentStats(),
    });

    const completeMutation = useMutation({
        mutationFn: ({ id, classSectionId }: { id: string, classSectionId: string }) =>
            dashboardService.homeworkStatus(id, "Completed", classSectionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["student-stats"] });
            toast.success("Homework completed successfully");
        },
        onError: () => {
            toast.error("Failed to complete homework");
        },
    });

    const handleComplete = (id: string, classSectionId: string) => {
        if (completeMutation.isPending) return;
        completeMutation.mutate({ id, classSectionId });
    };

    if (statsLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    const { homeworks = [], homeworksSubmissions = [] } = statsData?.data || {};
    const submissionMap = new Map(homeworksSubmissions.map((s: any) => [s.homeworkId, s]));

    return (
        <div className="space-y-8 p-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">My Homeworks</h3>
                            <p className="text-sm text-gray-500 font-medium">Keep track of your assignments and deadlines</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {homeworks.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <BookOpen className="h-8 w-8 text-gray-300" />
                            </div>
                            <h4 className="text-gray-900 font-bold mb-1">No homework assigned yet</h4>
                            <p className="text-gray-500 text-sm max-w-[250px]">
                                Your teachers will post assignments here when they are ready.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {homeworks.map((hw: any) => {
                                const submission = submissionMap.get(hw.id);
                                const isCompleted = (submission as any)?.status?.toLowerCase() === "completed";
                                const isUpdating = completeMutation.isPending && completeMutation.variables?.id === hw.id;

                                return (
                                    <div key={hw.id} className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                                                {hw.subject?.name || 'Subject'}
                                            </span>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    Due: {new Date(hw.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                        </div>

                                        <h4 className="text-gray-900 font-bold text-base mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                            {hw.title}
                                        </h4>
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10 italic">
                                            {hw.description}
                                        </p>

                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-50 mt-auto">
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-gray-900">
                                                    {hw.classSection?.gradeLevel?.displayName} - {hw.classSection?.section}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleComplete(hw.id, hw.classSection?.id)}
                                                disabled={isCompleted || completeMutation.isPending}
                                                className="text-sm font-bold text-green-600 cursor-default disabled:cursor-not-allowed disabled:text-gray-400 bg-green-50 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                            >
                                                {isUpdating ? (
                                                    <>
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        <span>Updating...</span>
                                                    </>
                                                ) : (
                                                    isCompleted ? (
                                                        <>
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            <span>Done</span>
                                                        </>
                                                    ) : "Mark Completed"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentHomeworkPage;
