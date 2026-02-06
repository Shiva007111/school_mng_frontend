import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { useState } from 'react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 py-8">
          <div className="px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
