import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  BarChart3, 
  Settings,
  X,
  IndianRupee,
  ArrowRight,
  Megaphone
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'teacher', 'student', 'parent'] },
  { name: 'Students', href: '/dashboard/students', icon: Users, roles: ['admin'] },
  { name: 'Promotion', href: '/dashboard/students/promotion', icon: ArrowRight, roles: ['admin'] },
  { name: 'Announcements', href: '/dashboard/announcements', icon: Megaphone, roles: ['admin'] },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, roles: ['admin', 'teacher'] },
  { name: 'Teachers', href: '/dashboard/teachers', icon: GraduationCap, roles: ['admin'] },
  { name: 'Classes', href: '/dashboard/academic/sections', icon: BookOpen, roles: ['admin'] },
  { name: 'Subjects', href: '/dashboard/academic/subjects', icon: BookOpen, roles: ['admin'] },
  { name: 'Timetable', href: '/dashboard/timetable', icon: Calendar, roles: ['admin', 'teacher', 'student', 'parent'] },
  { 
    name: 'Attendance', 
    href: '/dashboard/attendance', 
    icon: ClipboardList, 
    roles: ['admin', 'teacher', 'parent'],
    getHref: (role: string) => {
      if (role === 'admin') return '/dashboard/attendance/report';
      if (role === 'parent') return '/dashboard/attendance/my-children';
      return '/dashboard/attendance'; // Teacher
    }
  },
  { name: 'Grades', href: '/dashboard/exams', icon: BarChart3, roles: ['admin', 'teacher', 'parent'], getHref: (role: string) => role === 'teacher' ? '/dashboard/exams/my-grading' : role === 'parent' ? '/dashboard/exams/my-children' : '/dashboard/exams' },
  { name: 'Fee Structures', href: '/dashboard/fees/structures', icon: IndianRupee, roles: ['admin'] },
  { name: 'Student Fees', href: '/dashboard/fees/students', icon: IndianRupee, roles: ['admin'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['admin'] },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  // Get user's primary role (first role in array)
  const userRole = user?.roles?.[0]?.role?.name?.toLowerCase();

  const filteredNavigation = navigation.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EduManage</span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const href = item.getHref ? item.getHref(userRole!) : item.href;
              const isActive = location.pathname === href;
              return (
                <Link
                  key={item.name}
                  to={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => onClose()}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          {user && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.roles?.[0]?.role?.name || 'User'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
