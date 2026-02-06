import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { GraduationCap, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans relative overflow-hidden">

      {/* Background Image Container */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          // Student with books and headphones - modern education theme
          backgroundImage: 'url("https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop")',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-indigo-900/30 to-purple-900/40" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[440px] px-4 flex flex-col items-center">

        {/* Header Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all">
            <div className="bg-indigo-600 p-1 rounded-full">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-indigo-900 tracking-tight">
              EduManage
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            School Management System
          </h1>
        </div>

        {/* Login Card with Enhanced Glassmorphism */}
        <div className="w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-8">

          <h2 className="text-lg font-semibold text-center text-slate-700 mb-6">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50/95 border border-red-100 flex items-center gap-2">
              <span className="text-red-500 text-sm">⚠️</span>
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/70 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 h-11 rounded-lg transition-all focus:bg-white"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/70 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 h-11 rounded-lg transition-all focus:bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/25 rounded-lg transition-all hover:scale-[1.01]"
            >
              Sign In
            </Button>

            <div className="text-center pt-2">
              <a href="#" className="text-sm text-slate-600 hover:text-indigo-700 font-medium transition-colors">
                Forgot Password?
              </a>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
