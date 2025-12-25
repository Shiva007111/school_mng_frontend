import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/auth/LoginPage';
import LandingPage from '@/pages/LandingPage';
import DashboardHomePage from '@/pages/dashboard/DashboardHomePage';
import StudentListPage from '@/pages/dashboard/students/StudentListPage';
import StudentDetailPage from '@/pages/dashboard/students/StudentDetailPage';
import AddStudentPage from '@/pages/dashboard/students/AddStudentPage';
import EditStudentPage from '@/pages/dashboard/students/EditStudentPage';
import TeacherListPage from '@/pages/dashboard/teachers/TeacherListPage';
import TeacherDetailPage from '@/pages/dashboard/teachers/TeacherDetailPage';
import AddTeacherPage from '@/pages/dashboard/teachers/AddTeacherPage';
import EditTeacherPage from '@/pages/dashboard/teachers/EditTeacherPage';
import SubjectListPage from '@/pages/dashboard/academic/SubjectListPage';
import ClassSectionListPage from '@/pages/dashboard/academic/ClassSectionListPage';
import ClassSectionDetailPage from '@/pages/dashboard/academic/ClassSectionDetailPage';

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
            element: <StudentListPage />,
          },
          {
            path: 'students/new',
            element: <AddStudentPage />,
          },
          {
            path: 'students/:id',
            element: <StudentDetailPage />,
          },
          {
            path: 'students/:id/edit',
            element: <EditStudentPage />,
          },
          {
            path: 'teachers',
            element: <TeacherListPage />,
          },
          {
            path: 'teachers/new',
            element: <AddTeacherPage />,
          },
          {
            path: 'teachers/:id',
            element: <TeacherDetailPage />,
          },
          {
            path: 'teachers/:id/edit',
            element: <EditTeacherPage />,
          },
          {
            path: 'academic/subjects',
            element: <SubjectListPage />,
          },
          {
            path: 'academic/sections',
            element: <ClassSectionListPage />,
          },
          {
            path: 'academic/sections/:id',
            element: <ClassSectionDetailPage />,
          },
          {
            path: 'classes',
            element: <Navigate to="/dashboard/academic/sections" replace />,
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
