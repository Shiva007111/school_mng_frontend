import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import type { ClassSection, GradeLevel } from '@/types/academic.types';
import type { Teacher } from '@/types/teacher.types';
import type { AcademicYear } from '@/services/academic.service';

const classSectionSchema = z.object({
  academicYearId: z.string().min(1, 'Academic Year is required'),
  gradeLevelId: z.string().min(1, 'Grade Level is required'),
  section: z.string().min(1, 'Section name is required'),
  classTeacherId: z.string().optional(),
  roomId: z.string().optional(),
});

type ClassSectionFormData = z.infer<typeof classSectionSchema>;

interface ClassSectionFormProps {
  initialData?: ClassSection;
  gradeLevels: GradeLevel[];
  academicYears: AcademicYear[];
  teachers: Teacher[];
  onSubmit: (data: ClassSectionFormData) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export default function ClassSectionForm({
  initialData,
  gradeLevels,
  academicYears,
  teachers,
  onSubmit,
  isLoading,
  onCancel
}: ClassSectionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassSectionFormData>({
    resolver: zodResolver(classSectionSchema),
    defaultValues: {
      academicYearId: initialData?.academicYearId || academicYears[0]?.id || '',
      gradeLevelId: initialData?.gradeLevelId || '',
      section: initialData?.section || '',
      classTeacherId: initialData?.classTeacherId || '',
      roomId: initialData?.roomId || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Academic Year</label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            {...register('academicYearId')}
          >
            <option value="">Select Academic Year</option>
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>{ay.name}</option>
            ))}
          </select>
          {errors.academicYearId && <p className="text-sm text-red-600">{errors.academicYearId.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Grade Level</label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            {...register('gradeLevelId')}
          >
            <option value="">Select Grade Level</option>
            {gradeLevels.map((gl) => (
              <option key={gl.id} value={gl.id}>{gl.displayName}</option>
            ))}
          </select>
          {errors.gradeLevelId && <p className="text-sm text-red-600">{errors.gradeLevelId.message}</p>}
        </div>

        <Input
          label="Section Name"
          placeholder="e.g. A, B, Blue, Red"
          {...register('section')}
          error={errors.section?.message}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Class Teacher (Optional)</label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            {...register('classTeacherId')}
          >
            <option value="">Select Class Teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.user ? (
                  t.user.firstName || t.user.lastName ?
                    `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() :
                    t.user.email
                ) : 'Unknown'} ({t.employeeCode})
              </option>
            ))}
          </select>
          {errors.classTeacherId && <p className="text-sm text-red-600">{errors.classTeacherId.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Section' : 'Create Section'}
        </Button>
      </div>
    </form>
  );
}
