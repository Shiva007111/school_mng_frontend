import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/auth/LoginPage';
import LandingPage from '@/pages/LandingPage';
import DashboardHomePage from '@/pages/dashboard/DashboardHomePage';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        path: '',
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '',
            element: <DashboardHomePage />,
          },
          // Placeholder routes for future pages
          {
            path: 'students',
            element: <div className="p-8"><h1>Students (Coming Soon)</h1></div>,
          },
          {
            path: 'teachers',
            element: <div className="p-8"><h1>Teachers (Coming Soon)</h1></div>,
          },
          {
            path: 'classes',
            element: <div className="p-8"><h1>Classes (Coming Soon)</h1></div>,
          },
          {
            path: 'timetable',
            element: <div className="p-8"><h1>Timetable (Coming Soon)</h1></div>,
          },
          {
            path: 'attendance',
            element: <div className="p-8"><h1>Attendance (Coming Soon)</h1></div>,
          },
          {
            path: 'grades',
            element: <div className="p-8"><h1>Grades (Coming Soon)</h1></div>,
          },
          {
            path: 'settings',
            element: <div className="p-8"><h1>Settings (Coming Soon)</h1></div>,
          },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
