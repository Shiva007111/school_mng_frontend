import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Calendar,
  Edit2,
  Trash2,
  Search,
  Loader2,
  CheckCircle2,
  ChevronRight,
  FileText
} from 'lucide-react';
import { academicService } from '@/services/academic.service';
import { examService } from '@/services/exam.service';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils/cn';

export const ExamSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const roles = user?.roles.map(r => r.role.name) || [];
  const isAdmin = roles.includes('Admin');
  const isTeacher = roles.includes('Teacher');
  const canViewSessions = isAdmin || isTeacher;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    academicYearId: '',
    startDate: '',
    endDate: '',
    publishAt: '',
  });

  // Fetch Academic Years
  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicService.getAcademicYears(),
  });

  // Fetch Exam Sessions
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['exam-sessions'],
    queryFn: () => examService.getExamSessions(),
  });

  const sessions = sessionsData?.data || [];
  const academicYears = yearsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => examService.createExamSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-sessions'] });
      toast.success('Exam session created successfully');
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create session');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) =>
      examService.updateExamSession(id, data), // Note: Need to add update to service
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-sessions'] });
      toast.success('Exam session updated successfully');
      handleCloseModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => examService.deleteExamSession(id), // Note: Need to add delete to service
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-sessions'] });
      toast.success('Exam session deleted successfully');
    },
  });

  const handleOpenModal = (session?: any) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        name: session.name,
        academicYearId: session.academicYearId,
        startDate: session.startDate.split('T')[0],
        endDate: session.endDate.split('T')[0],
        publishAt: session.publishAt ? session.publishAt.split('T')[0] : '',
      });
    } else {
      setEditingSession(null);
      setFormData({
        name: '',
        academicYearId: academicYears[0]?.id || '',
        startDate: '',
        endDate: '',
        publishAt: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSession(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSession) {
      updateMutation.mutate({ id: editingSession.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredSessions = sessions.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Sessions</h1>
          <p className="text-gray-500">Manage terms and examination periods.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px]">
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-500">Loading exam sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-20 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Sessions Found</h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">
            Get started by creating your first exam session (e.g., "First Term 2024").
          </p>
          {isAdmin && (
            <Button onClick={() => handleOpenModal()} variant="outline" className="mt-6">
              <Plus className="h-4 w-4 mr-2" />
              Create Session
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex gap-1">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenModal(session)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure? This will delete all exams in this session.')) {
                              deleteMutation.mutate(session.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">{session.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{session.academicYear?.name}</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{session._count?.exams || 0} Exams Scheduled</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border",
                  session.publishAt ? "bg-green-50 text-green-700 border-green-100" : "bg-amber-50 text-amber-700 border-amber-100"
                )}>
                  {session.publishAt ? 'Published' : 'Draft'}
                </span>
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate(`/dashboard/exams/${session.id}/reports`)}
                    className="text-gray-600 text-sm font-semibold flex items-center hover:text-indigo-600 transition-all"
                  >
                    Report Cards
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/exams/${session.id}`)}
                    className="text-indigo-600 text-sm font-semibold flex items-center hover:gap-1 transition-all"
                  >
                    Manage Exams
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingSession ? 'Edit Session' : 'Create New Session'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Name</label>
                <Input
                  required
                  placeholder="e.g. First Term 2024"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <select
                  required
                  value={formData.academicYearId}
                  onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                >
                  <option value="">Select Year</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>{year.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Result Publish Date (Optional)</label>
                <input
                  type="date"
                  value={formData.publishAt}
                  onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {editingSession ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
