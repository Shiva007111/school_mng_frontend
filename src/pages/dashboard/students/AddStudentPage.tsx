import StudentForm from './StudentForm';

export default function AddStudentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
        <p className="text-sm text-gray-500">Create a new student profile and user account.</p>
      </div>
      <StudentForm />
    </div>
  );
}
