import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicService } from '@/services/academic.service';
import { teacherService } from '@/services/teacher.service';
import { Button } from '@/components/Button';
import { Search, Plus, Users, Edit2, Trash2, X, ChevronRight } from 'lucide-react';
import { Input } from '@/components/Input';
import { Link } from 'react-router-dom';
import ClassSectionForm from './ClassSectionForm';
import type { ClassSection } from '@/types/academic.types';

export default function ClassSectionListPage() {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ClassSection | undefined>(undefined);

  const queryClient = useQueryClient();

  // Queries
  const { data: sectionsData, isLoading: isLoadingSections } = useQuery({
    queryKey: ['class-sections'],
    queryFn: () => academicService.getClassSections(),
  });

  const { data: gradeLevelsData } = useQuery({
    queryKey: ['grade-levels'],
    queryFn: () => academicService.getGradeLevels(),
  });

  const { data: academicYearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicService.getAcademicYears(),
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teacherService.getTeachers(),
  });

  const sections = sectionsData?.data || [];
  const gradeLevels = gradeLevelsData?.data || [];
  const academicYears = academicYearsData?.data || [];
  const teachers = teachersData?.data || [];

  const filteredSections = sections.filter(s =>
    s.gradeLevel?.displayName.toLowerCase().includes(search.toLowerCase()) ||
    s.section.toLowerCase().includes(search.toLowerCase())
  );

  // Mutations
  const createMutation = useMutation({
    mutationFn: academicService.createClassSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-sections'] });
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => academicService.updateClassSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-sections'] });
      setIsFormOpen(false);
      setEditingSection(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: academicService.deleteClassSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-sections'] });
    },
  });

  const handleEdit = (e: React.MouseEvent, section: ClassSection) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSection(section);
    setIsFormOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this class section?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (formData: any) => {
    if (editingSection) {
      updateMutation.mutate({ id: editingSection.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Sections</h1>
          <p className="text-sm text-gray-500">Manage grades, sections, and class teachers.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => {
          setEditingSection(undefined);
          setIsFormOpen(true);
        }}>
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="max-w-md">
          <Input
            placeholder="Search by grade or section..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Section Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingSections ? (
          <div className="col-span-full text-center py-10 text-gray-500">Loading sections...</div>
        ) : filteredSections.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">No class sections found.</div>
        ) : (
          filteredSections.map((section) => (
            <Link
              key={section.id}
              to={`/dashboard/academic/sections/${section.id}`}
              className="group bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleEdit(e, section)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, section.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {section.gradeLevel?.displayName} - {section.section}
                  </h3>
                  <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">
                    {academicYears.find(ay => ay.id === section.academicYearId)?.name || 'Current Year'}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Class Teacher</p>
                  <p className="text-sm text-gray-700 font-medium truncate">
                    {section.classTeacher?.user ? (
                      section.classTeacher.user.firstName || section.classTeacher.user.lastName ?
                        `${section.classTeacher.user.firstName || ''} ${section.classTeacher.user.lastName || ''}`.trim() :
                        section.classTeacher.user.email
                    ) : 'Not Assigned'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 text-indigo-600 text-sm font-medium">
                  <span>View Details</span>
                  <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">
                {editingSection ? 'Edit Class Section' : 'Add New Class Section'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <ClassSectionForm
                initialData={editingSection}
                gradeLevels={gradeLevels}
                academicYears={academicYears}
                teachers={teachers}
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
