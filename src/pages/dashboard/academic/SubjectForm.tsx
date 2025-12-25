import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import type { Subject } from '@/types/academic.types';

const subjectSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  isElective: z.boolean().optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  initialData?: Subject;
  onSubmit: (data: SubjectFormData) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export default function SubjectForm({ initialData, onSubmit, isLoading, onCancel }: SubjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      isElective: initialData?.isElective || false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Subject Code"
          placeholder="e.g. MATH101"
          {...register('code')}
          error={errors.code?.message}
        />
        <Input
          label="Subject Name"
          placeholder="e.g. Mathematics"
          {...register('name')}
          error={errors.name?.message}
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            rows={3}
            {...register('description')}
          />
          {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isElective"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            {...register('isElective')}
          />
          <label htmlFor="isElective" className="text-sm text-gray-700">
            Is Elective Subject?
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Subject' : 'Create Subject'}
        </Button>
      </div>
    </form>
  );
}
