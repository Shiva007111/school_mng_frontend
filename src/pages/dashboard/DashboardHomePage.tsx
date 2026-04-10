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
  //can u drag username.

  return (
    // <div className="space-y-6">
    //   {/* Welcome message */}
    //   <div>
    //     <h1 className="text-2xl font-bold text-gray-900">
    //       {/* Welcome {userRole}, {user?.email?.split('@')[0]}! */}
    //       Welcome {userRole} {user?.firstName} {user?.lastName}
    //     </h1>
    //     <p className="mt-1 text-sm text-gray-500">
    //       Here's what's happening with your {userRole?.toLowerCase()} account today.
    //     </p>
    //   </div>

    <div className="space-y-6">
      {/* Welcome message */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 shadow-lg">

        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white">
            Welcome {userRole}, {user?.firstName} {user?.lastName}
          </h1>
          <p className="mt-2 text-sm text-indigo-100">
            Here's what's happening with your {userRole?.toLowerCase()} account today.
          </p>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
      </div>
      {renderDashboard()}
    </div>
  );
}

// In this implementation, we check the user's roles in a prioritized order (Admin > Teacher > Parent > Student) and render the appropriate dashboard component based on their highest role. If the user has no recognized roles, we display a placeholder message indicating that their dashboard is coming soon.
