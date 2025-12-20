import { useAuth } from '@/context/AuthContext';
import { Users, GraduationCap, BookOpen, TrendingUp } from 'lucide-react';

export default function DashboardHomePage() {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Students', value: '2,345', icon: Users, change: '+12%', changeType: 'positive' },
    { name: 'Total Teachers', value: '156', icon: GraduationCap, change: '+3%', changeType: 'positive' },
    { name: 'Active Classes', value: '48', icon: BookOpen, change: '+5%', changeType: 'positive' },
    { name: 'Attendance Rate', value: '94.2%', icon: TrendingUp, change: '+2.1%', changeType: 'positive' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.email}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your school today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-indigo-100 rounded-md p-3">
                    <stat.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Recent Activity
          </h3>
          <div className="mt-5">
            <p className="text-sm text-gray-500">
              Activity feed will be implemented in upcoming phases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
