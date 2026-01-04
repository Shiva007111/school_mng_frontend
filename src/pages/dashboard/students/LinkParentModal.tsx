import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parentService } from '@/services/parent.service';
import { studentService } from '@/services/student.service';
import { Button } from '@/components/Button';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/Input';
import CreateParentModal from './CreateParentModal';
import { UserPlus, X, Loader2, Search } from 'lucide-react';

interface LinkParentModalProps {
    studentId: string;
    studentName: string;
    onClose: () => void;
}

export default function LinkParentModal({ studentId, studentName, onClose }: LinkParentModalProps) {
    const queryClient = useQueryClient();
    const [parentId, setParentId] = useState('');
    const [relationship, setRelationship] = useState('father');
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Fetch all parents
    const { data: parentsData, isLoading } = useQuery({
        queryKey: ['parents'],
        queryFn: () => parentService.getParents(),
    });

    const linkMutation = useMutation({
        mutationFn: ({ pId, rel }: { pId: string; rel: string }) =>
            studentService.linkParent(studentId, pId, rel),
        onSuccess: () => {
            toast.success('Parent linked successfully');
            queryClient.invalidateQueries({ queryKey: ['student', studentId] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to link parent');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!parentId) {
            toast.error('Please select a parent');
            return;
        }
        linkMutation.mutate({ pId: parentId, rel: relationship });
    };

    const filteredParents = parentsData?.data?.filter(p =>
        p.user.email.toLowerCase().includes(search.toLowerCase()) ||
        (p.user.phone && p.user.phone.includes(search))
    ) || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Link Parent</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-6 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed border-2 hover:border-indigo-500 hover:text-indigo-600 group"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        Create New Parent
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-4">
                            Linking parent for <span className="font-semibold text-gray-900">{studentName}</span>
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Input
                            label="Search Parent"
                            placeholder="Search by email or phone..."
                            leftIcon={<Search className="h-4 w-4" />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Select Parent</label>
                        <select
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-40"
                            value={parentId}
                            onChange={(e) => setParentId(e.target.value)}
                            required
                            size={5}
                        >
                            <option value="" disabled>-- Choose a parent --</option>
                            {isLoading ? (
                                <option disabled>Loading parents...</option>
                            ) : filteredParents.length === 0 ? (
                                <option disabled>No parents found</option>
                            ) : (
                                filteredParents.map((parent) => (
                                    <option key={parent.id} value={parent.id}>
                                        {parent.user.firstName} {parent.user.lastName} ({parent.user.email})
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Relationship</label>
                        <select
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={relationship}
                            onChange={(e) => setRelationship(e.target.value)}
                            required
                        >
                            <option value="father">Father</option>
                            <option value="mother">Mother</option>
                            <option value="guardian">Guardian</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={linkMutation.isPending}>
                            {linkMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Linking...
                                </>
                            ) : (
                                'Link Parent'
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {isCreateModalOpen && (
                <CreateParentModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={(newParentId) => {
                        setParentId(newParentId);
                        setSearch(''); // Clear search to show the new parent if needed
                    }}
                />
            )}
        </div>
    );
}
