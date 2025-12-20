import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/services/student.service';
import StudentForm from './StudentForm';

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getStudentById(id!),
    enabled: !!id,
  });

  const student = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading student details...</div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-10 text-red-500">
        Error loading student details.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
        <p className="text-sm text-gray-500">Update student profile and account settings.</p>
      </div>
      <StudentForm initialData={student} isEdit />
    </div>
  );
}
