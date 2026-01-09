import { useAuth } from '@/context/AuthContext';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { ParentDashboard } from '@/components/dashboard/ParentDashboard';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';

export default function DashboardHomePage() {
  const { user } = useAuth();
  // Prioritize roles: Admin > Teacher > Parent > Student
  const roles = user?.roles.map(r => r.role.name) || [];
  const userRole = roles.includes('Admin') ? 'Admin' :
    roles.includes('Teacher') ? 'Teacher' :
      roles.includes('Parent') ? 'Parent' :
        roles.includes('Student') ? 'Student' : undefined;

  const renderDashboard = () => {
    switch (userRole) {
      case 'Admin':
        return <AdminDashboard />;
      case 'Teacher':
        return <TeacherDashboard />;
      case 'Parent':
        return <ParentDashboard />;
      case 'Student':
        return <StudentDashboard />;
      default:
        return (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900">Dashboard Coming Soon</h3>
            <p className="mt-2 text-sm text-gray-500">
              We're setting up your personalized dashboard. Check back soon!
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.email?.split('@')[0]}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your {userRole?.toLowerCase()} account today.
        </p>
      </div>

      {renderDashboard()}
    </div>
  );
}
