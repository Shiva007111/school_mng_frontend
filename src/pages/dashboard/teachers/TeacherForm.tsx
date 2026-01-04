import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '@/services/teacher.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Teacher, CreateTeacherRequest, UpdateTeacherRequest } from '@/types/teacher.types';

const teacherSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  employeeCode: z.string().min(3, 'Employee code is required'),
  hireDate: z.string().min(1, 'Hire date is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  status: z.enum(['active', 'inactive', 'suspended']),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  initialData?: Teacher;
  isEdit?: boolean;
}

export default function TeacherForm({ initialData, isEdit }: TeacherFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: initialData ? {
      email: initialData.user.email,
      phone: initialData.user.phone || '',
      firstName: initialData.user.firstName || '',
      lastName: initialData.user.lastName || '',
      employeeCode: initialData.employeeCode || '',
      hireDate: initialData.hireDate ? initialData.hireDate.split('T')[0] : '',
      qualification: initialData.qualification || '',
      status: initialData.user.status as any,
    } : {
      status: 'active',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: TeacherFormData) => {
      if (isEdit && initialData) {
        return teacherService.updateTeacher(initialData.id, data as UpdateTeacherRequest);
      }
      return teacherService.createTeacher(data as CreateTeacherRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['teacher', initialData?.id] });
      }
      navigate('/dashboard/teachers');
    },
  });

  const onSubmit = (data: TeacherFormData) => {
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
              placeholder="teacher@school.com"
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

        {/* Section 2: Professional Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
            <span className="h-2 w-2 bg-indigo-600 rounded-full"></span>
            Professional Information
          </h3>
          <div className="space-y-4">
            <Input
              label="Employee Code"
              {...register('employeeCode')}
              error={errors.employeeCode?.message}
              placeholder="EMP2024001"
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
              </select>
              {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Personal & Background */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
            <span className="h-2 w-2 bg-indigo-600 rounded-full"></span>
            Personal & Background
          </h3>
          <div className="space-y-4">
            <Input
              label="Hire Date"
              type="date"
              {...register('hireDate')}
              error={errors.hireDate?.message}
            />
            <Input
              label="Qualification"
              {...register('qualification')}
              error={errors.qualification?.message}
              placeholder="e.g. M.Sc. Mathematics, B.Ed."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/dashboard/teachers')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={mutation.isPending}
        >
          {isEdit ? 'Update Teacher' : 'Create Teacher'}
        </Button>
      </div>
    </form>
  );
}
