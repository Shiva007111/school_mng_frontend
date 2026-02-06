import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Loader2,
  Megaphone,
  ChevronRight
} from 'lucide-react';
import { dashboardService } from '@/services/dashboard.service';
import { announcementService } from '@/services/announcement.service';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

import { Odometer } from '@/components/Odometer';

export const AdminDashboard: React.FC = () => {
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => dashboardService.getAdminStats(),
  });

  const { data: announcementsData, isLoading: isLoadingAnnouncements } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementService.getAnnouncements(),
  });

  if (isLoadingStats || isLoadingAnnouncements) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 text-[#4F46E5] animate-spin" />
      </div>
    );
  }

  const stats = statsData?.data || {};

  const statCards = [
    {
      name: 'Student Community',
      value: parseInt(stats.studentCount) || 0,
      icon: Users,
      color: '#3B82F6',
      trend: '+12%',
      meaning: '+4 enrolled this month',
      trendUp: true
    },
    {
      name: 'Expert Teachers',
      value: parseInt(stats.teacherCount) || 0,
      icon: GraduationCap,
      color: '#8B5CF6',
      trend: 'Synced',
      meaning: 'Fully staffed for semester',
      trendUp: null
    },
    {
      name: 'Active Classes',
      value: parseInt(stats.classCount) || 0,
      icon: BookOpen,
      color: '#22C55E',
      trend: '↑ 2',
      meaning: 'Running smoothly',
      trendUp: true
    },
    {
      name: 'Attendance Rate',
      value: parseFloat(stats.attendanceRate?.replace('%', '')) || 0,
      icon: TrendingUp,
      color: '#F97316',
      trend: '↑ 3.2%',
      meaning: 'Above last month\'s average',
      suffix: '%',
      trendUp: true
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow-sm rounded-2xl border border-[#E5E7EB] hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div
                  className="flex-shrink-0 rounded-xl p-3 text-white shadow-lg"
                  style={{ backgroundColor: stat.color }}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                {stat.trend && (
                  <div className={clsx(
                    "flex items-center text-xs font-bold px-2 py-1 rounded-full",
                    stat.trendUp === true ? "bg-green-50 text-green-600" :
                      stat.trendUp === false ? "bg-red-50 text-red-600" :
                        "bg-gray-50 text-gray-600"
                  )}>
                    {stat.trend}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="text-2xl font-bold text-gray-900 mt-1">
                    <Odometer value={stat.value} suffix={stat.suffix} />
                  </dd>
                </dl>
                {stat.meaning && (
                  <p className="mt-2 text-xs text-indigo-600 font-bold flex items-center gap-1">
                    <span className="w-1 h-1 bg-indigo-600 rounded-full" />
                    {stat.meaning}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Visual Hero Insight: Academic Snapshot & School Health */}
        <div className="lg:col-span-4 bg-white shadow-sm rounded-2xl border border-[#E5E7EB] overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">School Health Indicator</h3>
              <p className="text-sm text-gray-500 font-medium">Real-time academic & operational pulse</p>
            </div>
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                  {i}
                </div>
              ))}
              <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">
                +
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
            <div className="space-y-8">
              <div className="relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">Academic Progress</span>
                  <span className="text-2xl font-black text-indigo-600">84%</span>
                </div>
                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg transition-all duration-1000 ease-out"
                    style={{ width: '84%' }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-gray-400 font-medium uppercase tracking-widest">
                  Target: 95% by end of term
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 group hover:bg-indigo-50 transition-colors">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Student Mood</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-indigo-900">High</span>
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 group hover:bg-emerald-50 transition-colors">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Fee Collection</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-emerald-900">92%</span>
                    <span className="text-xs font-bold text-emerald-600">+4%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-full flex flex-col pt-4">
              <div className="flex-1 bg-[#F9FAFB] rounded-2xl border border-gray-100 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">Performance Overview</p>
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-xl font-bold text-gray-900 tracking-tight">Academic Pulse</h4>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">+2.4% vs last week</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
                    ))}
                  </div>
                </div>

                <div className="relative flex-1 flex items-end gap-4 min-h-[140px]">
                  {/* Y-axis Labels */}
                  <div className="h-full flex flex-col justify-between text-[10px] font-bold text-gray-300 pb-6 py-2">
                    <span>100%</span>
                    <span>50%</span>
                    <span>0%</span>
                  </div>

                  <div className="flex-1 h-full relative group">
                    <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="clean-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Reference Grid */}
                      <line x1="0" y1="0" x2="400" y2="0" stroke="#F3F4F6" strokeWidth="1" />
                      <line x1="0" y1="60" x2="400" y2="60" stroke="#F3F4F6" strokeWidth="1" />
                      <line x1="0" y1="120" x2="400" y2="120" stroke="#F3F4F6" strokeWidth="1" />

                      {/* Area Fill */}
                      <path
                        d="M 0,100 C 40,95 80,40 120,50 C 160,65 200,30 240,40 C 280,55 320,20 400,10 L 400,120 L 0,120 Z"
                        fill="url(#clean-gradient)"
                      />

                      {/* Main Data Line */}
                      <path
                        d="M 0,100 C 40,95 80,40 120,50 C 160,65 200,30 240,40 C 280,55 320,20 400,10"
                        fill="none"
                        stroke="#4F46E5"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Minimalist Data Points (Visible on Hover Area) */}
                      {[
                        { x: 0, y: 100 }, { x: 120, y: 50 }, { x: 240, y: 40 }, { x: 400, y: 10 }
                      ].map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke="#4F46E5" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      ))}
                    </svg>

                    {/* X-axis Labels */}
                    <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-1">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-gray-400">{day}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Split/Visual Card: Recent Announcements & Actions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white shadow-sm rounded-2xl border border-[#E5E7EB] overflow-hidden flex-1 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-60" />
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-[#4F46E5]" />
                Recent Pulse
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {announcementsData?.data?.slice(0, 2).map((announcement) => (
                <div key={announcement.id} className="p-4 rounded-xl border border-gray-50 hover:border-indigo-100 transition-colors bg-gray-50/30 group">
                  <div className="flex items-start gap-3">
                    <div className={clsx(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                      announcement.priority === 'high' ? "bg-red-50 text-red-600" :
                        announcement.priority === 'medium' ? "bg-amber-50 text-amber-600" :
                          "bg-blue-50 text-blue-600"
                    )}>
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-gray-900 truncate uppercase mt-1">{announcement.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 font-medium leading-relaxed">
                        {announcement.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Link
                  to="/dashboard/announcements"
                  className="w-full inline-flex items-center justify-center py-3 px-4 rounded-xl bg-gray-50 text-gray-600 text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                >
                  View All News
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-2xl border border-[#E5E7EB] p-6 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-60" />
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Recommended Next Steps</h4>
            <div className="space-y-3">
              {[
                { label: 'Review Term 2 Grades', color: 'bg-amber-50 text-amber-600' },
                { label: 'Verify Staff Attendance', color: 'bg-indigo-50 text-indigo-600' },
                { label: 'Send Monthly Newsletter', color: 'bg-emerald-50 text-emerald-600' }
              ].map((action, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 group hover:border-indigo-100 transition-colors cursor-pointer">
                  <span className="text-xs font-bold text-gray-700">{action.label}</span>
                  <div className={clsx("h-6 w-6 rounded-lg flex items-center justify-center translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all", action.color)}>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group">
            <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">Premium Feature</p>
              <h4 className="text-lg font-bold mt-1">Smart Reporting</h4>
              <p className="text-xs text-indigo-100 mt-2 font-medium leading-relaxed">
                Generate term-end insights with AI automation in one click.
              </p>
              <button className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-xs font-black uppercase tracking-widest transition-colors">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
