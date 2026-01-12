import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { parentService } from '@/services/parent.service';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { X, Loader2, User, Mail, Phone, Briefcase, PhoneCall } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EditParentModalProps {
    parent: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditParentModal({ parent, onClose, onSuccess }: EditParentModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        firstName: '',
        lastName: '',
        occupation: '',
        preferredContact: 'email',
    });

    useEffect(() => {
        if (parent) {
            setFormData({
                email: parent.user?.email || '',
                phone: parent.user?.phone || '',
                firstName: parent.user?.firstName || '',
                lastName: parent.user?.lastName || '',
                occupation: parent.occupation || '',
                preferredContact: parent.preferredContact || 'email',
            });
        }
    }, [parent]);

    const updateMutation = useMutation({
        mutationFn: (data: typeof formData) => parentService.updateParent(parent.id, data),
        onSuccess: () => {
            toast.success('Parent updated successfully');
            queryClient.invalidateQueries({ queryKey: ['parents'] });
            onSuccess();
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update parent');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email && !formData.phone) {
            toast.error('Either email or phone is required');
            return;
        }
        updateMutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <User className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Edit Parent</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                        />
                        <Input
                            label="Last Name"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="parent@example.com"
                            leftIcon={<Mail className="h-4 w-4" />}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />

                        <Input
                            label="Phone Number"
                            placeholder="+1234567890"
                            leftIcon={<Phone className="h-4 w-4" />}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />

                        <Input
                            label="Occupation"
                            placeholder="e.g. Engineer, Doctor"
                            leftIcon={<Briefcase className="h-4 w-4" />}
                            value={formData.occupation}
                            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        />

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <PhoneCall className="h-4 w-4 text-gray-400" />
                                Preferred Contact Method
                            </label>
                            <select
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.preferredContact}
                                onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                                required
                            >
                                <option value="email">Email</option>
                                <option value="phone">Phone</option>
                                <option value="sms">SMS</option>
                                <option value="whatsapp">WhatsApp</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
