import { useAuth } from '@/context/AuthContext';
import { Menu, Bell, LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-grand-blue transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search Field */}
        <div className="hidden md:flex flex-1 max-w-md ml-4">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-grand-blue focus:bg-white focus:outline-none focus:ring-1 focus:ring-grand-blue transition-all"
              placeholder="Search records, students..."
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6 ml-auto">
          {/* Notifications */}
          <button className="relative group">
            <div className="p-2 rounded-full text-gray-500 hover:bg-gray-100 group-hover:text-grand-blue transition-all">
              <Bell className="h-5 w-5" />
            </div>
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-grand-gold ring-2 ring-white" />
          </button>

          {/* User menu */}
          <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900 leading-none">{user?.email}</p>
              <p className="text-[10px] font-bold text-grand-blue uppercase tracking-wider mt-1">
                {user?.roles?.[0]?.role?.name || 'User'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
