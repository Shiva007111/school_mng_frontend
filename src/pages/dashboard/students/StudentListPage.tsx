import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services/student.service';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Search, Plus, Filter, MoreVertical, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import type { StudentStatus } from '@/types/student.types';
import { Dropdown } from '@/components/Dropdown';
import { Eye, Edit, Trash2 } from 'lucide-react';

import { academicService } from '@/services/academic.service';
import { toast } from 'react-hot-toast';

export default function StudentListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StudentStatus | undefined>(undefined);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [gradeLevelId, setGradeLevelId] = useState('');
  const [classSectionId, setClassSectionId] = useState('');
  const [gender, setGender] = useState('');

  // Fetch Grade Levels for filter
  const { data: gradesData } = useQuery({
    queryKey: ['grade-levels'],
    queryFn: () => academicService.getGradeLevels(),
  });

  // Fetch Class Sections for filter
  const { data: sectionsData } = useQuery({
    queryKey: ['class-sections', { gradeLevelId }],
    queryFn: () => academicService.getClassSections({ gradeLevelId }),
    enabled: !!gradeLevelId,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['students', { search, status, gradeLevelId, classSectionId, gender }],
    queryFn: () => studentService.getStudents({
      search,
      status: status || undefined,
      gradeLevelId: gradeLevelId || undefined,
      classSectionId: classSectionId || undefined,
      gender: gender || undefined
    }),
  });

  console.log('Student list data:', data);
  console.log('Student list error:', error);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentService.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    },
  });

  const students = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500">Manage and view all students in the system.</p>
        </div>
        <Link to="/dashboard/students/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email or admission no..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={status || ''}
            onChange={(e) => setStatus((e.target.value as StudentStatus) || undefined)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <Button
            variant={isFiltersOpen ? "secondary" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter className="h-4 w-4" />
            {isFiltersOpen ? "Hide Filters" : "More Filters"}
          </Button>
        </div>
      </div>

      {/* More Filters Panel */}
      {isFiltersOpen && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase">Grade Level</label>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              value={gradeLevelId}
              onChange={(e) => {
                setGradeLevelId(e.target.value);
                setClassSectionId('');
              }}
            >
              <option value="">All Grades</option>
              {gradesData?.data?.map((grade) => (
                <option key={grade.id} value={grade.id}>{grade.displayName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase">Class Section</label>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border disabled:bg-gray-50"
              value={classSectionId}
              onChange={(e) => setClassSectionId(e.target.value)}
              disabled={!gradeLevelId}
            >
              <option value="">All Sections</option>
              {sectionsData?.data?.map((section) => (
                <option key={section.id} value={section.id}>Section {section.section}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase">Gender</label>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              className="text-xs text-indigo-600 font-medium hover:text-indigo-800"
              onClick={() => {
                setGradeLevelId('');
                setClassSectionId('');
                setGender('');
                setStatus(undefined);
                setSearch('');
              }}
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Student Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Loading students...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-red-500">
                    Error loading students. Please try again.
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.user?.firstName} {student.user?.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.user?.email || 'No Email'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.admissionNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.enrollments?.[0]?.classSection?.gradeLevel?.displayName || 'Not Enrolled'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        student.status === 'active' ? "bg-green-100 text-green-800" :
                          student.status === 'inactive' ? "bg-gray-100 text-gray-800" :
                            "bg-red-100 text-red-800"
                      )}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link to={`/dashboard/students/${student.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        <Dropdown
                          trigger={
                            <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          }
                          items={[
                            {
                              label: 'View Details',
                              icon: <Eye className="h-4 w-4" />,
                              onClick: () => navigate(`/dashboard/students/${student.id}`)
                            },
                            {
                              label: 'Edit Student',
                              icon: <Edit className="h-4 w-4" />,
                              onClick: () => navigate(`/dashboard/students/${student.id}/edit`)
                            },
                            {
                              label: 'Delete Student',
                              icon: <Trash2 className="h-4 w-4" />,
                              variant: 'danger',
                              onClick: () => {
                                if (window.confirm('Are you sure you want to delete this student?')) {
                                  deleteMutation.mutate(student.id);
                                }
                              }
                            }
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{students.length}</span> of <span className="font-medium">{students.length}</span> results
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
