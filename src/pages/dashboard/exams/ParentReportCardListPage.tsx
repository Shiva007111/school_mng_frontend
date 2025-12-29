import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  FileText, 
  ChevronRight, 
  Loader2,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { parentService } from '@/services/parent.service';
import { examService } from '@/services/exam.service';
import { Button } from '@/components/Button';

export const ParentReportCardListPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Fetch Parent's Children
  const { data: childrenData, isLoading: isLoadingChildren } = useQuery({
    queryKey: ['my-children'],
    queryFn: () => parentService.getMyChildren(),
  });

  const children = childrenData?.data || [];

  // Set first child as selected by default when data loads
  React.useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  // Fetch Exam Sessions (we'll filter for published ones)
  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['exam-sessions'],
    queryFn: () => examService.getExamSessions(),
  });

  const sessions = sessionsData?.data?.filter(s => s.publishAt) || [];

  if (isLoadingChildren) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">No Students Linked</h2>
        <p className="text-gray-500 mt-2">No student profiles are currently linked to your account.</p>
      </div>
    );
  }

  const selectedChild = children.find(c => c.id === selectedChildId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Reports</h1>
        <p className="text-gray-500">View and download report cards for your children.</p>
      </div>

      {/* Child Selector (if multiple) */}
      {children.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all min-w-[200px] ${
                selectedChildId === child.id
                  ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                  : 'bg-white border-gray-200 hover:border-indigo-200'
              }`}
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                selectedChildId === child.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
              }`}>
                <User className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className={`text-sm font-semibold ${
                  selectedChildId === child.id ? 'text-indigo-900' : 'text-gray-900'
                }`}>
                  {child.user?.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">{child.admissionNo}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Report Cards for {selectedChild?.user?.email.split('@')[0]}
          </h2>
        </div>

        {isLoadingSessions ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 text-indigo-600 animate-spin mx-auto" />
          </div>
        ) : sessions.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {sessions.map((session) => (
              <div key={session.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{session.name}</h3>
                    <p className="text-sm text-gray-500">
                      Published on {new Date(session.publishAt!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/dashboard/exams/report-card/${selectedChildId}/${session.id}`)}
                >
                  View Report
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500">No report cards have been published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
