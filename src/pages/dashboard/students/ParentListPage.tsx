import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parentService } from '@/services/parent.service';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Search, Plus, MoreVertical, User, Mail, Phone, Briefcase } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { cn } from '@/utils/cn';
import { Dropdown } from '@/components/Dropdown';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CreateParentModal from './CreateParentModal';
import EditParentModal from './EditParentModal';
import apiClient from '@/services/api';

export default function ParentListPage() {
  // const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<any>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['parents'],
    queryFn: () => parentService.getParents(),
  });

  const deleteMutation = useMutation({
    // Note: Backend delete is soft delete
    mutationFn: (id: string) => apiClient.delete(`/parents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      toast.success('Parent deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete parent');
    },
  });

  const parents = data?.data || [];

  const filteredParents = parents.filter(parent =>
    parent.user.email.toLowerCase().includes(search.toLowerCase()) ||
    (parent.user.phone && parent.user.phone.includes(search)) ||
    (parent.occupation && parent.occupation.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parents</h1>
          <p className="text-sm text-gray-500">Manage and view all parent records in the system.</p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Parent
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="max-w-md">
          <Input
            placeholder="Search by email, phone or occupation..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Parent Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Occupation</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Children</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Loading parents...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-red-500">
                    Error loading parents. Please try again.
                  </td>
                </tr>
              ) : filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No parents found.
                  </td>
                </tr>
              ) : (
                filteredParents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {parent.user?.firstName} {parent.user?.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parent.user?.email || 'No Email'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        {parent.occupation || 'Not specified'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">{parent.user.email}</span>
                        </div>
                        {parent.user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span className="text-xs">{parent.user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {(parent as any).studentParents?.length || 0} Students
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Dropdown
                          trigger={
                            <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          }
                          items={[
                            {
                              label: 'Edit Profile',
                              icon: <Edit className="h-4 w-4" />,
                              onClick: () => setEditingParent(parent)
                            },
                            {
                              label: 'Delete Parent',
                              icon: <Trash2 className="h-4 w-4" />,
                              variant: 'danger',
                              onClick: () => {
                                if (window.confirm('Are you sure you want to delete this parent?')) {
                                  deleteMutation.mutate(parent.id);
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
      </div>

      {isCreateModalOpen && (
        <CreateParentModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['parents'] });
          }}
        />
      )}

      {editingParent && (
        <EditParentModal
          parent={editingParent}
          onClose={() => setEditingParent(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['parents'] });
          }}
        />
      )}
    </div>
  );
}
