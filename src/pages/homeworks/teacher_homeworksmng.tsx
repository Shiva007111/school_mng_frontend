import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { BookOpen, Loader2, Users } from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const TeacherHomeworkPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [activeStatus, setActiveStatus] = useState<'All' | 'Completed' | 'Pending'>('All');
    const [selectedClassId, setSelectedClassId] = useState<string>('all');
    const [selectedHw, setSelectedHw] = useState<any>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const [newHomework, setNewHomework] = useState({
        title: "",
        content: "",
        expiresAt: "",
        classSectionId: "",
        subjectId: "",
    });

    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['teacher-stats'],
        queryFn: () => dashboardService.getTeacherStats(),
    });

    const { data: homeworkData, isLoading: homeworkLoading } = useQuery({
        queryKey: ['homework', statsData?.data?.teacherId],
        queryFn: () => dashboardService.getTeacherHomeworks(statsData?.data?.teacherId || ""),
        enabled: !!statsData?.data?.teacherId,
        select: (data) => {
            const homeworkList = data?.data?.homework || [];
            const teacherClassesRaw = data?.data?.teacherClasses || [];

            // Flatten ClassSubjects to get a list of unique classSections
            const classSectionsMap = new Map();
            teacherClassesRaw.forEach((tc: any) => {
                tc.classSubjects?.forEach((cs: any) => {
                    if (cs.classSection) {
                        const existing = classSectionsMap.get(cs.classSection.id) || { ...cs.classSection, subjects: [] };
                        // Ensure unique subjects
                        if (!existing.subjects.some((s: any) => s.id === cs.subject?.id)) {
                            existing.subjects.push(cs.subject);
                        }
                        classSectionsMap.set(cs.classSection.id, existing);
                    }
                });
            });
            const teacherClasses = Array.from(classSectionsMap.values());

            return {
                ...data,
                homework: homeworkList,
                teacherClasses: teacherClasses,
                groupedByMonth: homeworkList.reduce((acc: any, hw: any) => {
                    const month = new Date(hw.expiryDate).toLocaleString('default', { month: 'long', year: 'numeric' });
                    if (!acc[month]) acc[month] = [];
                    acc[month].push(hw);
                    return acc;
                }, {})
            };
        }
    });

    const homeworkStatusQuery = useQuery({
        queryKey: ['homework-status', selectedHw?.id, activeStatus],
        queryFn: () => dashboardService.getTeacherHomeworksByClassSectionId(
            selectedHw?.classSectionId || "",
            selectedHw?.id || "",
            statsData?.data?.teacherId || "",
            activeStatus
        ),
        enabled: !!selectedHw && !!statsData?.data?.teacherId && isStatusModalOpen,
    });

    const createMutation = useMutation({
        mutationFn: (formData: any) => {
            const payload = {
                title: formData.title,
                content: formData.content,
                expireDate: formData.expiresAt,
                classSectionId: formData.classSectionId,
                subjectId: formData.subjectId,
                teacherId: statsData?.data?.teacherId,
            };
            return dashboardService.createHomework(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["homework", statsData?.data?.teacherId] });
            toast.success("Homework posted successfully");
            setIsAdding(false);
            setNewHomework({
                title: "",
                content: "",
                expiresAt: "",
                classSectionId: "",
                subjectId: "",
            });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to post homework");
        },
    });

    const handleSubmit = () => {
        if (!newHomework.title || !newHomework.content || !newHomework.classSectionId || !newHomework.expiresAt) {
            toast.error("Please fill all fields");
            return;
        }
        createMutation.mutate(newHomework);
    };

    const isLoading = statsLoading || homeworkLoading;

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-transparent flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Homework Management</h3>
                            <p className="text-sm text-gray-500 font-medium">Create and track student assignments</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <button
                            onClick={() => setIsAdding(true)}
                            className="group flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-indigo-200 active:scale-95"
                        >
                            <span className="text-lg">+</span>
                            New Assignment
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation - Classes */}
                    <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Your Classes</h4>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setSelectedClassId('all')}
                                    className={clsx(
                                        "w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm flex items-center justify-between group",
                                        selectedClassId === 'all' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                                    )}
                                >
                                    <span>All History</span>
                                    <span className={clsx(
                                        "text-[10px] px-2 py-0.5 rounded-full font-black",
                                        selectedClassId === 'all' ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                                    )}>
                                        {homeworkData?.homework?.length || 0}
                                    </span>
                                </button>

                                {homeworkData?.teacherClasses?.map((cls: any) => {
                                    const classHwCount = homeworkData?.homework?.filter((h: any) => h.classSectionId === cls.id).length || 0;
                                    return (
                                        <button
                                            key={cls.id}
                                            onClick={() => setSelectedClassId(cls.id)}
                                            className={clsx(
                                                "w-full text-left px-4 py-3 rounded-xl transition-all font-bold text-sm flex items-center justify-between group",
                                                selectedClassId === cls.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                                            )}
                                        >
                                            <span className="truncate">{cls.gradeLevel?.displayName} - {cls.section}</span>
                                            <span className={clsx(
                                                "text-[10px] px-2 py-0.5 rounded-full font-black",
                                                selectedClassId === cls.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                                            )}>
                                                {classHwCount}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 space-y-6">
                        {(!homeworkData?.homework || homeworkData.homework.length === 0) ? (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="h-8 w-8 text-gray-300" />
                                </div>
                                <h4 className="text-gray-900 font-bold mb-1">No homework posted yet</h4>
                                <p className="text-gray-500 text-sm max-w-[250px] mx-auto">
                                    Start by creating your first assignment for this class.
                                </p>
                            </div>
                        ) : (() => {
                            const filteredHw = homeworkData.homework.filter((hw: any) => selectedClassId === 'all' || hw.classSectionId === selectedClassId);

                            if (filteredHw.length === 0) {
                                return (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                                        <p className="text-gray-500 text-sm">No homework history found for this class.</p>
                                    </div>
                                );
                            }

                            // Group the filtered items by month
                            const monthGroups = filteredHw.reduce((acc: any, hw: any) => {
                                const month = new Date(hw.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
                                if (!acc[month]) acc[month] = [];
                                acc[month].push(hw);
                                return acc;
                            }, {});

                            return Object.entries(monthGroups).map(([month, hws]: [string, any]) => (
                                <div key={month} className="space-y-4">
                                    <div className="flex items-center gap-4 px-2">
                                        <h5 className="text-xs font-black text-indigo-400 uppercase tracking-widest">{month}</h5>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-indigo-100 to-transparent"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {hws.map((hw: any) => (
                                            <div key={hw.id} className="group relative bg-white border border-gray-100 rounded-3xl p-6 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700">
                                                            {hw.subject?.name}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400">
                                                            Posted: {new Date(hw.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <span className={clsx(
                                                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                                                            new Date(hw.expiryDate) < new Date() ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                                                        )}>
                                                            {new Date(hw.expiryDate) < new Date() ? "Expired" : "Active"}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-gray-300 mt-1">Due {new Date(hw.expiryDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>

                                                <h4 className="text-gray-900 font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                    {hw.title}
                                                </h4>
                                                <p className="text-gray-500 text-xs line-clamp-2 mb-6 min-h-[2rem]">
                                                    {hw.content}
                                                </p>

                                                <div className="flex items-center gap-3 pt-4 border-t border-gray-50 justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center text-xs font-bold text-indigo-600 border border-gray-100">
                                                            {hw.classSection?.gradeLevel?.displayName?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-900 leading-none">
                                                                {hw.classSection?.gradeLevel?.displayName}
                                                            </p>
                                                            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">Section {hw.classSection?.section}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedHw(hw);
                                                            setIsStatusModalOpen(true);
                                                        }}
                                                        className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-sm hover:shadow-indigo-200 transition-all active:scale-95"
                                                    >
                                                        View Status
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </div>

            {/* New Homework Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="px-8 py-6 bg-indigo-600 text-white relative">
                            <h3 className="text-2xl font-bold">New Assignment</h3>
                            <p className="text-indigo-100 text-sm opacity-90">Fill in the details to post a new homework</p>
                            <button onClick={() => setIsAdding(false)} className="absolute top-6 right-8 text-indigo-200 hover:text-white transition-colors p-2">
                                <span className="text-2xl font-light">✕</span>
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Target Class</label>
                                        <select
                                            value={newHomework.classSectionId}
                                            onChange={(e) => setNewHomework({ ...newHomework, classSectionId: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-700"
                                        >
                                            <option value="">Select Class</option>
                                            {homeworkData?.teacherClasses?.map((cls: any) => (
                                                <option key={cls.id} value={cls.id}>
                                                    {cls.gradeLevel?.displayName} - {cls.section}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Subject</label>
                                        <select
                                            value={newHomework.subjectId}
                                            onChange={(e) => setNewHomework({ ...newHomework, subjectId: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-700 disabled:opacity-50"
                                            disabled={!newHomework.classSectionId}
                                        >
                                            <option value="">Select Subject</option>
                                            {homeworkData?.teacherClasses
                                                ?.find((cls: any) => cls.id === newHomework.classSectionId)
                                                ?.subjects?.map((sub: any) => (
                                                    <option key={sub.id} value={sub.id}>
                                                        {sub.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Title</label>
                                    <input
                                        type="text"
                                        placeholder="E.g., Trigonometry Exercise 1.2"
                                        value={newHomework.title}
                                        onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Due Date</label>
                                    <input
                                        type="date"
                                        value={newHomework.expiresAt}
                                        onChange={(e) => setNewHomework({ ...newHomework, expiresAt: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Instructions</label>
                                    <textarea
                                        placeholder="What do students need to do?"
                                        value={newHomework.content}
                                        onChange={(e) => setNewHomework({ ...newHomework, content: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-700 h-32 resize-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setIsAdding(false)} className="flex-1 px-6 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95">
                                        Discard
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={createMutation.isPending}
                                        className="flex-[2] px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:shadow-none"
                                    >
                                        {createMutation.isPending ? "Posting..." : "Post Assignment"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Homework Status Modal */}
            {isStatusModalOpen && selectedHw && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold">{selectedHw.title}</h3>
                                    <p className="text-indigo-100 text-[10px] font-medium opacity-90 uppercase tracking-widest mt-1">
                                        {selectedHw.classSection?.gradeLevel?.displayName} - {selectedHw.classSection?.section} | {selectedHw.subject?.name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsStatusModalOpen(false);
                                        setSelectedHw(null);
                                    }}
                                    className="text-indigo-200 hover:text-white transition-colors p-2 bg-white/10 rounded-full"
                                >
                                    <span className="text-xl font-light">✕</span>
                                </button>
                            </div>

                            <div className="flex p-1 bg-white/10 backdrop-blur-md rounded-xl w-fit mt-6 border border-white/20">
                                {(['All', 'Completed', 'Pending'] as const).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setActiveStatus(s)}
                                        className={clsx(
                                            "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                            activeStatus === s ? "bg-white text-indigo-600 shadow-sm" : "text-indigo-100 hover:text-white"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto bg-gray-50/50">
                            {homeworkStatusQuery.isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="h-10 w-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fetching students...</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(() => {
                                        const list = homeworkStatusQuery.data?.data || [];
                                        if (list.length === 0) {
                                            return (
                                                <div className="text-center py-20">
                                                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                        <Users className="h-6 w-6 text-gray-300" />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-400">No students found for this status.</p>
                                                </div>
                                            );
                                        }
                                        return list.map((item: any, idx: number) => {
                                            const student = item.student || item;
                                            const user = student.user || {};
                                            const isCompleted = item.status === 'Completed';
                                            return (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm border border-indigo-200/50">
                                                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                                                                {user.firstName} {user.lastName}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">ID: {student.id?.slice(0, 8)}</span>
                                                                <span className="text-[10px] text-gray-300 font-bold">•</span>
                                                                <span className="text-[10px] text-gray-500 font-medium">Student</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <span className={clsx(
                                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                            isCompleted ? "bg-green-50 text-green-600 border-green-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                                        )}>
                                                            {isCompleted ? "Completed" : "Pending"}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherHomeworkPage;
