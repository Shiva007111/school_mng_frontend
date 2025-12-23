import TeacherForm from './TeacherForm';

export default function AddTeacherPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Teacher</h1>
        <p className="text-sm text-gray-500">Create a new teacher profile and user account.</p>
      </div>
      <TeacherForm />
    </div>
  );
}
