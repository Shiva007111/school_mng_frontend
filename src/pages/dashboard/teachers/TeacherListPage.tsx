import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherService } from '@/services/teacher.service';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Search, Plus, Filter, MoreVertical, UserCheck, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Dropdown } from '@/components/Dropdown';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TeacherListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = useQuery({
    queryKey: ['teachers', { search, status }],
    queryFn: () => teacherService.getTeachers({ search, status: status || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teacherService.deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete teacher');
    },
  });

  const teachers = data?.data || [];

  const handleExportCSV = () => {
    if (teachers.length === 0) return;

    const headers = ['Name', 'Email', 'Employee Code', 'Qualification', 'Status'];
    const csvContent = [
      headers.join(','),
      ...teachers.map((teacher: any) => {
        const name = `${teacher.user.firstName} ${teacher.user.lastName}`;

        return [
          `"${name}"`,
          `"${teacher.user.email}"`,
          `"${teacher.employeeCode || ''}"`,
          `"${teacher.qualification || ''}"`,
          teacher.user.status
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `teachers_list_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    if (teachers.length === 0) return;

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Teacher List', 14, 22);

    // Add metadata
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);

    // Add table
    const tableColumn = ["Name", "Email", "Employee Code", "Qualification", "Status"];
    const tableRows = teachers.map((teacher: any) => {
      const name = `${teacher.user.firstName} ${teacher.user.lastName}`;

      return [
        name,
        teacher.user.email,
        teacher.employeeCode || '-',
        teacher.qualification || '-',
        teacher.user.status
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [79, 70, 229] } // Indigo-600
    });

    doc.save(`teachers_list_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-sm text-gray-500">Manage and view all teacher profiles and assignments.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExportCSV}
            disabled={teachers.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handlePrintPDF}
            disabled={teachers.length === 0}
          >
            <FileText className="h-4 w-4" />
            Print PDF
          </Button>
          <Link to="/dashboard/teachers/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Teacher
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email or employee code..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            value={status || ''}
            onChange={(e) => setStatus(e.target.value || undefined)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Teacher Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Code</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Loading teachers...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-red-500">
                    Error loading teachers. Please try again.
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No teachers found.
                  </td>
                </tr>
              ) : (
                teachers.map((teacher: any) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserCheck className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {teacher.user.firstName} {teacher.user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.employeeCode || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.qualification || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        teacher.user.status === 'active' ? "bg-green-100 text-green-800" :
                          teacher.user.status === 'inactive' ? "bg-gray-100 text-gray-800" :
                            "bg-red-100 text-red-800"
                      )}>
                        {teacher.user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link to={`/dashboard/teachers/${teacher.id}`}>
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
                              onClick: () => navigate(`/dashboard/teachers/${teacher.id}`)
                            },
                            {
                              label: 'Edit Teacher',
                              icon: <Edit className="h-4 w-4" />,
                              onClick: () => navigate(`/dashboard/teachers/${teacher.id}/edit`)
                            },
                            {
                              label: 'Delete Teacher',
                              icon: <Trash2 className="h-4 w-4" />,
                              variant: 'danger',
                              onClick: () => {
                                if (window.confirm('Are you sure you want to delete this teacher?')) {
                                  deleteMutation.mutate(teacher.id);
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
              Showing <span className="font-medium">1</span> to <span className="font-medium">{teachers.length}</span> of <span className="font-medium">{teachers.length}</span> results
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
