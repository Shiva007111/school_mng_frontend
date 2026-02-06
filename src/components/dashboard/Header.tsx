import { useAuth } from '@/context/AuthContext';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';

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
    <header className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB] shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-[#4F46E5] transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Right side */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <button className="relative text-gray-400 hover:text-[#4F46E5] transition-colors">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#4F46E5] ring-2 ring-white" />
          </button>

          {/* Vertical Separator */}
          <div className="h-8 w-[1px] bg-[#E5E7EB] mx-2 hidden sm:block"></div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900 leading-tight mb-0.5">{user?.email.split('@')[0]}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black leading-tight">
                {user?.roles?.[0]?.role?.name || 'User'}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 border-[#E5E7EB] text-gray-700 hover:text-[#4F46E5] hover:border-[#4F46E5] transition-all h-9 px-4 text-xs font-bold uppercase tracking-wider"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
