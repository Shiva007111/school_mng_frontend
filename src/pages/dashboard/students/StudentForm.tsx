import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useNavigate } from 'react-router-dom';
import { studentService } from '@/services/student.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Student, CreateStudentRequest } from '@/types/student.types';
import { toast } from 'react-hot-toast';

const studentSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  admissionNo: z.string().min(3, 'Admission number is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  bloodGroup: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'graduated', 'transferred']),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  initialData?: Student;
  isEdit?: boolean;
}

export default function StudentForm({ initialData, isEdit }: StudentFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData ? {
      email: initialData.user.email,
      phone: initialData.user.phone,
      firstName: initialData.user.firstName || '',
      lastName: initialData.user.lastName || '',
      admissionNo: initialData.admissionNo,
      dob: initialData.dob.split('T')[0],
      gender: initialData.gender,
      bloodGroup: initialData.bloodGroup,
      status: initialData.status,
    } : {
      status: 'active',
      gender: 'Male',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: StudentFormData) => {
      if (isEdit && initialData) {
        return studentService.updateStudent(initialData.id, data as any);
      }
      return studentService.createStudent(data as CreateStudentRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['student', initialData?.id] });
      }
      toast.success(isEdit ? 'Student updated successfully' : 'Student created successfully');
      navigate('/dashboard/students');
    },
    onError: (error: any) => {
      console.error('Student mutation error:', error);
      toast.error(error.response?.data?.message || 'Failed to save student details');
    },
  });

  const onSubmit = (data: StudentFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section 1: Account Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
            <span className="h-2 w-2 bg-indigo-600 rounded-full"></span>
            Account Information
          </h3>
          <div className="space-y-4">
            <Input
              label="Email Address"
              {...register('email')}
              error={errors.email?.message}
              placeholder="student@school.com"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                {...register('firstName')}
                error={errors.firstName?.message}
                placeholder="John"
              />
              <Input
                label="Last Name"
                {...register('lastName')}
                error={errors.lastName?.message}
                placeholder="Doe"
              />
            </div>
            {!isEdit && (
              <Input
                label="Password"
                type="password"
                {...register('password')}
                error={errors.password?.message}
                placeholder="Minimum 6 characters"
              />
            )}
            <Input
              label="Phone Number (Optional)"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="+1 234 567 890"
            />
          </div>
        </div>

        {/* Section 2: Academic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
            <span className="h-2 w-2 bg-indigo-600 rounded-full"></span>
            Academic Information
          </h3>
          <div className="space-y-4">
            <Input
              label="Admission Number"
              {...register('admissionNo')}
              error={errors.admissionNo?.message}
              placeholder="ADM2024001"
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                {...register('status')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border h-[38px]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="graduated">Graduated</option>
                <option value="transferred">Transferred</option>
              </select>
              {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Personal Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
            <span className="h-2 w-2 bg-indigo-600 rounded-full"></span>
            Personal Information
          </h3>
          <div className="space-y-4">
            <Input
              label="Date of Birth"
              type="date"
              {...register('dob')}
              error={errors.dob?.message}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  {...register('gender')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border h-[38px]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
              </div>
              <Input
                label="Blood Group"
                {...register('bloodGroup')}
                error={errors.bloodGroup?.message}
                placeholder="O+"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/dashboard/students')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={mutation.isPending}
        >
          {isEdit ? 'Update Student' : 'Create Student'}
        </Button>
      </div>
    </form>
  );
}
