import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  User, 
  Loader2,
  Save,
  Clock
} from 'lucide-react';
import { announcementService } from '@/services/announcement.service';
import { academicService } from '@/services/academic.service';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';

export const AnnouncementManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'medium' as const,
    targetRole: '',
    targetGradeLevelId: '',
    expiresAt: ''
  });

  // Fetch Grade Levels
  const { data: gradesData } = useQuery({
    queryKey: ['grade-levels'],
    queryFn: () => academicService.getGradeLevels(),
  });

  // Fetch Announcements
  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementService.getAnnouncements(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => announcementService.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement posted successfully');
      setIsAdding(false);
      setNewAnnouncement({
        title: '',
        content: '',
        priority: 'medium',
        targetRole: '',
        targetGradeLevelId: '',
        expiresAt: ''
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to post announcement');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementService.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted');
    }
  });

  const handleSave = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error('Title and content are required');
      return;
    }
    createMutation.mutate(newAnnouncement);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500">Manage school-wide notices and targeted announcements.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Post New Notice
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input 
                  placeholder="e.g. School Reopening Date"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Content</label>
                <textarea 
                  className="w-full min-h-[120px] p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Enter the announcement details..."
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as any })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Expires At</label>
                  <Input 
                    type="date"
                    value={newAnnouncement.expiresAt}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expiresAt: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Target Role</label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newAnnouncement.targetRole}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetRole: e.target.value })}
                  >
                    <option value="">All Roles</option>
                    <option value="Student">Students</option>
                    <option value="Teacher">Teachers</option>
                    <option value="Parent">Parents</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Target Grade</label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newAnnouncement.targetGradeLevelId}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetGradeLevelId: e.target.value })}
                  >
                    <option value="">All Grades</option>
                    {gradesData?.data?.map(g => (
                      <option key={g.id} value={g.id}>{g.displayName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button 
              onClick={handleSave}
              isLoading={createMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Post Announcement
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {announcementsData?.data?.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group">
              <div className="p-6 flex items-start gap-6">
                <div className={clsx(
                  "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0",
                  announcement.priority === 'high' ? "bg-red-50 text-red-600" :
                  announcement.priority === 'medium' ? "bg-amber-50 text-amber-600" :
                  "bg-blue-50 text-blue-600"
                )}>
                  <Megaphone className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(announcement.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          <span>{announcement.author?.email.split('@')[0]}</span>
                        </div>
                        {announcement.targetRole && (
                          <div className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">
                            {announcement.targetRole}
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteMutation.mutate(announcement.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {announcement.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {announcementsData?.data?.length === 0 && !isAdding && (
            <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                <Megaphone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No announcements yet</h3>
              <p className="text-gray-500 max-w-xs mx-auto mt-1">
                Post your first announcement to keep everyone informed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
