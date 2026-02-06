import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/Button';
import { GraduationCap, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "sticky top-0 z-50 transition-all duration-300 border-b",
      isScrolled
        ? "bg-white/90 backdrop-blur-md border-gray-100 shadow-lg py-2"
        : "bg-[#0b1b35] border-white/10 py-4"
    )}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                isScrolled ? "bg-[#10b981]" : "bg-[#10b981]"
              )}>
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className={cn(
                  "text-2xl font-bold tracking-tight transition-colors",
                  isScrolled ? "text-[#0b1b35]" : "text-white"
                )}>EduManage</span>
                <span className={cn(
                  "text-[8px] uppercase tracking-widest font-light transition-colors",
                  isScrolled ? "text-gray-500" : "text-gray-400"
                )}>Accelerating School's Growth</span>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            <a href="/" className={cn(
              "font-medium transition-colors hover:text-[#10b981]",
              isScrolled ? "text-gray-700" : "text-gray-300"
            )}>Home</a>
            <a href="#" className={cn(
              "flex items-center gap-1 font-medium transition-colors hover:text-[#10b981] group",
              isScrolled ? "text-gray-700" : "text-gray-300"
            )}>
              Services & Solutions <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a href="#" className={cn(
              "flex items-center gap-1 font-medium transition-colors hover:text-[#10b981] group",
              isScrolled ? "text-gray-700" : "text-gray-300"
            )}>
              Community Connect <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a href="#" className={cn(
              "flex items-center gap-1 font-medium transition-colors hover:text-[#10b981] group",
              isScrolled ? "text-gray-700" : "text-gray-300"
            )}>
              About EduManage <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a href="#" className={cn(
              "flex items-center gap-1 font-medium transition-colors hover:text-[#10b981] group",
              isScrolled ? "text-gray-700" : "text-gray-300"
            )}>
              Contact Us <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a href="#" className={cn(
              "font-medium transition-colors hover:text-[#10b981]",
              isScrolled ? "text-gray-700" : "text-gray-300"
            )}>Blogs</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button className={cn(
                "px-7 text-sm h-10 transition-all font-bold rounded-xl border-none text-white",
                "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600",
                "shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(16,185,129,0.5)]",
                "active:scale-95 flex items-center justify-center"
              )}>Login</Button>
            </Link>
            <Link to="/login">
              <Button className="bg-[#f59e0b] hover:bg-[#ffb330] text-white px-6 text-sm h-10 font-bold rounded-xl shadow-lg shadow-orange-500/30 active:scale-95 transition-all border-none">
                Book Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
