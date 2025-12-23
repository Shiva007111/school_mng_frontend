import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { teacherService } from '@/services/teacher.service';
import { Button } from '@/components/Button';
import { 
  UserCheck, 
  Calendar, 
  Mail, 
  Phone, 
  ArrowLeft, 
  Edit, 
  BookOpen, 
  Briefcase,
  Clock,
  Award
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher', id],
    queryFn: () => teacherService.getTeacherById(id!),
    enabled: !!id,
  });

  const teacher = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading teacher details...</div>
      </div>
    );
  }

  if (error || !teacher) {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/teachers">
            <Button variant="outline" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Details</h1>
            <p className="text-sm text-gray-500">Viewing profile for {teacher.user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/dashboard/teachers/${teacher.id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column: Basic Info */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <UserCheck className="h-12 w-12 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{teacher.user.email}</h2>
              <p className="text-sm text-gray-500 mb-4">{teacher.employeeCode || 'No Employee Code'}</p>
              <span className={cn(
                "px-3 py-1 text-xs font-semibold rounded-full",
                teacher.user.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              )}>
                {teacher.user.status.toUpperCase()}
              </span>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                {teacher.user.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                {teacher.user.phone || 'No phone provided'}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                Hired on {teacher.hireDate ? new Date(teacher.hireDate).toLocaleDateString() : 'N/A'}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Award className="h-4 w-4 text-gray-400" />
                {teacher.qualification || 'No qualification listed'}
              </div>
            </div>
          </div>

          {/* Subjects Info */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Subjects
            </h3>
            {teacher.teacherSubjects && teacher.teacherSubjects.length > 0 ? (
              <div className="space-y-3">
                {teacher.teacherSubjects.map((ts: any) => (
                  <div key={ts.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                    <span className="text-sm font-medium text-gray-900">{ts.subject.name}</span>
                    {ts.isPrimary && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No subjects assigned yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Assignments & Activity */}
        <div className="xl:col-span-3 space-y-6">
          {/* Class Assignments */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              Class Assignments
            </h3>
            {teacher.classSections && teacher.classSections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teacher.classSections.map((cs: any) => (
                  <div key={cs.id} className="p-4 border border-gray-100 rounded-lg bg-indigo-50/30">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      {cs.academicYear.name}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {cs.gradeLevel.displayName} - {cs.section}
                    </p>
                    <p className="text-xs text-indigo-600 font-medium mt-1">Class Teacher</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-sm text-gray-500 mb-4">Teacher is not currently assigned as a class teacher.</p>
                <Button size="sm">Assign Class</Button>
              </div>
            )}
          </div>

          {/* Recent Activity Placeholder */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-500 italic">
                Teacher attendance, timetable, and performance metrics will be displayed here in future phases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
