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

const navigationGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'School Health', href: '/dashboard', icon: Home, roles: ['admin', 'teacher', 'student', 'parent'] },
      { name: 'Announcements', href: '/dashboard/announcements', icon: Megaphone, roles: ['admin'] },
    ]
  },
  {
    title: 'Academic',
    items: [
      { name: 'Students', href: '/dashboard/students', icon: Users, roles: ['admin'] },
      { name: 'Teachers', href: '/dashboard/teachers', icon: GraduationCap, roles: ['admin'] },
      { name: 'Classes', href: '/dashboard/academic/sections', icon: BookOpen, roles: ['admin'] },
      { name: 'Timetable', href: '/dashboard/timetable', icon: Calendar, roles: ['admin', 'teacher', 'student', 'parent'] },
      {
        name: 'Attendance',
        href: '/dashboard/attendance',
        icon: ClipboardList,
        roles: ['admin', 'teacher', 'parent', 'student'],
        getHref: (role: string) => {
          if (role === 'admin') return '/dashboard/attendance/report';
          if (role === 'parent') return '/dashboard/attendance/my-children';
          if (role === 'student') return '/dashboard/attendance/my-attendance';
          return '/dashboard/attendance';
        }
      },
      {
        name: 'Evaluation', href: '/dashboard/exams', icon: BarChart3, roles: ['admin', 'teacher', 'parent', 'student'], getHref: (role: string) => {
          if (role === 'parent') return '/dashboard/exams/my-children';
          if (role === 'student') return '/dashboard/exams/my-grades';
          return '/dashboard/exams';
        }
      },
    ]
  },
  {
    title: 'Admin & Finance',
    items: [
      { name: 'Promotion', href: '/dashboard/students/promotion', icon: ArrowRight, roles: ['admin'] },
      { name: 'Fee Structures', href: '/dashboard/fees/structures', icon: IndianRupee, roles: ['admin'] },
      { name: 'Student Fees', href: '/dashboard/fees/students', icon: IndianRupee, roles: ['admin'] },
      { name: 'Administration', href: '/dashboard/settings', icon: Settings, roles: ['admin'] },
    ]
  },
  {
    title: 'Communication',
    items: [
      { name: 'Insights', href: '/dashboard/reports', icon: BarChart3, roles: ['admin', 'teacher'] },
      { name: 'Directory', href: '/dashboard/parents', icon: Users, roles: ['admin'] },
    ]
  }
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const roles = user?.roles.map(r => r.role.name.toLowerCase()) || [];
  const userRole = roles.includes('admin') ? 'admin' :
    roles.includes('teacher') ? 'teacher' :
      roles.includes('parent') ? 'parent' :
        roles.includes('student') ? 'student' : undefined;

  const filteredGroups = navigationGroups.map(group => ({
    ...group,
    items: group.items.filter(item => userRole && item.roles.includes(userRole))
  })).filter(group => group.items.length > 0);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-75 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#0F172A] to-[#1E293B] border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl shadow-indigo-500/10",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="bg-[#4F46E5] p-2 rounded-xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight uppercase">EduManage</span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 space-y-8 px-3 py-6 overflow-y-auto custom-scrollbar">
            {filteredGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const href = item.getHref ? item.getHref(userRole!) : item.href;
                    const isActive = location.pathname === href;
                    return (
                      <Link
                        key={item.name}
                        to={href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 group relative overflow-hidden",
                          isActive
                            ? "bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white shadow-lg shadow-indigo-500/30 scale-[1.02] ring-1 ring-white/20"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        )}
                        onClick={() => onClose()}
                      >
                        {/* Subtle active glow */}
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                        )}
                        <item.icon className={cn(
                          "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                          isActive ? "text-white animate-pulse" : "text-slate-500 group-hover:text-white"
                        )} />
                        <span className="relative z-10 tracking-tight">{item.name}</span>
                        {isActive && (
                          <div className="absolute right-3 w-1.5 h-6 rounded-full bg-white shadow-sm shadow-white" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User info Section */}
          {user && (
            <div className="border-t border-white/5 p-5 bg-[#0F172A]/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#818CF8] p-0.5 shadow-md">
                  <div className="w-full h-full rounded-[10px] bg-[#0F172A] flex items-center justify-center">
                    <span className="text-[#4F46E5] font-black text-sm">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate leading-none">{user.email.split('@')[0]}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mt-1.5">
                    {userRole || 'User'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
