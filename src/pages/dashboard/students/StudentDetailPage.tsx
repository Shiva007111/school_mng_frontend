import { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/services/student.service';
import { Button } from '@/components/Button';
import EnrollmentModal from './EnrollmentModal';
import LinkParentModal from './LinkParentModal';
import {
  User,
  Calendar,
  Mail,
  Phone,
  ArrowLeft,
  Edit,
  GraduationCap,
  Users,
  Clock
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isLinkParentModalOpen, setIsLinkParentModalOpen] = useState(false);
  const location = useLocation();
  const from = location.state?.from;

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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-500 font-medium">Error loading student details.</div>
        <Link to="/dashboard/students">
          <Button variant="outline">Back to Students</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/students">
            <Button variant="outline" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
            <p className="text-sm text-gray-500">Viewing profile for {student.user?.firstName} {student.user?.lastName}</p>
          </div>
        </div>
        {from !== 'parent' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate(`/dashboard/students/${id}/edit`)}
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column: Basic Info */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{student.user?.firstName} {student.user?.lastName}</h2>
              <p className="text-sm text-gray-500 mb-4">{student.admissionNo}</p>
              <span className={cn(
                "px-3 py-1 text-xs font-semibold rounded-full",
                student.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              )}>
                {student.status.toUpperCase()}
              </span>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                {student.user?.email || 'No Email'}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                {student.user?.phone || 'No phone provided'}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                Born on {new Date(student.dob).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Users className="h-4 w-4 text-gray-400" />
                {student.gender}
              </div>
            </div>
          </div>

          {/* Parents Info */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Parents / Guardians</h3>
            {student.studentParents && student.studentParents.length > 0 ? (
              <div className="space-y-4">
                {student.studentParents.map((sp) => (
                  <div key={sp.parentId} className="flex items-start gap-3 p-3 rounded-md bg-gray-50">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {sp.parent.user.firstName} {sp.parent.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{sp.relationship}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No parent information linked.</p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              disabled
            >
              Link Parent
            </Button>
          </div>
        </div>

        {/* Right Column: Academic Info */}
        <div className="xl:col-span-3 space-y-6">
          {/* Current Enrollment */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              Academic Enrollment
            </h3>
            {student.enrollments && student.enrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-100 rounded-lg bg-indigo-50/30">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Grade Level</p>
                  <p className="text-lg font-bold text-gray-900">
                    {student.enrollments[0].classSection?.gradeLevel?.displayName || 'N/A'}
                  </p>
                </div>
                <div className="p-4 border border-gray-100 rounded-lg bg-indigo-50/30">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Section</p>
                  <p className="text-lg font-bold text-gray-900">
                    {student.enrollments[0].classSection?.section || 'N/A'}
                  </p>
                </div>
                <div className="p-4 border border-gray-100 rounded-lg bg-indigo-50/30">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Roll Number</p>
                  <p className="text-lg font-bold text-gray-900">
                    #{student.enrollments[0].rollNumber}
                  </p>
                </div>
                <div className="p-4 border border-gray-100 rounded-lg bg-indigo-50/30">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Joined On</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(student.enrollments[0].joinedOn).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-sm text-gray-500 mb-4">Student is not currently enrolled in any class.</p>
                <Button size="sm" onClick={() => setIsEnrollModalOpen(true)}>Enroll Now</Button>
              </div>
            )}
          </div>

          {/* Recent Activity / Performance Placeholder */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-500 italic">
                Attendance and grade history will be displayed here in future phases.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isEnrollModalOpen && (
        <EnrollmentModal
          studentId={student.id}
          studentName={student.user?.email || student.admissionNo}
          onClose={() => setIsEnrollModalOpen(false)}
        />
      )}
      {isLinkParentModalOpen && (
        <LinkParentModal
          studentId={student.id}
          studentName={student.user?.email || student.admissionNo}
          onClose={() => setIsLinkParentModalOpen(false)}
        />
      )}
    </div>
  );
}
