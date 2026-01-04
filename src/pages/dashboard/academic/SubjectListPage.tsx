import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicService } from '@/services/academic.service';
import { Button } from '@/components/Button';
import { Search, Plus, BookOpen, Edit2, Trash2, X } from 'lucide-react';
import { Input } from '@/components/Input';
import SubjectForm from './SubjectForm';
import type { Subject } from '@/types/academic.types';

export default function SubjectListPage() {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>(undefined);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => academicService.getSubjects(),
  });

  const subjects = data?.data || [];
  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: academicService.createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => academicService.updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsFormOpen(false);
      setEditingSubject(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: academicService.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (formData: any) => {
    if (editingSubject) {
      updateMutation.mutate({ id: editingSubject.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-sm text-gray-500">Manage academic subjects and their details.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => {
          setEditingSubject(undefined);
          setIsFormOpen(true);
        }}>
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="max-w-md">
          <Input
            placeholder="Search by name or code..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-10 text-gray-500">Loading subjects...</div>
        ) : error ? (
          <div className="col-span-full text-center py-10 text-red-500">Error loading subjects.</div>
        ) : filteredSubjects.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">No subjects found.</div>
        ) : (
          filteredSubjects.map((subject) => (
            <div key={subject.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(subject)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">{subject.name}</h3>
                  {subject.isElective && (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800 rounded-full uppercase">
                      Elective
                    </span>
                  )}
                </div>
                <p className="text-sm font-mono text-indigo-600">{subject.code}</p>
                {subject.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mt-2">{subject.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <SubjectForm
                initialData={editingSubject}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
