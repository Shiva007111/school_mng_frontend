import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { teacherService } from '@/services/teacher.service';
import TeacherForm from './TeacherForm';
import { Button } from '@/components/Button';
import { ArrowLeft } from 'lucide-react';

export default function EditTeacherPage() {
  const { id } = useParams<{ id: string }>();

  const { data: teacher, isLoading, error } = useQuery({
    queryKey: ['teacher', id],
    queryFn: () => teacherService.getTeacherById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading teacher details...</div>
      </div>
    );
  }

  if (error || !teacher?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-500 font-medium">Error loading teacher details.</div>
        <Link to="/dashboard/teachers">
          <Button variant="outline">Back to Teachers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/dashboard/teachers/${id}`}>
          <Button variant="outline" size="sm" className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Teacher</h1>
          <p className="text-sm text-gray-500">Update profile for {teacher.data.user.email}</p>
        </div>
      </div>
      <TeacherForm initialData={teacher.data} isEdit />
    </div>
  );
}
