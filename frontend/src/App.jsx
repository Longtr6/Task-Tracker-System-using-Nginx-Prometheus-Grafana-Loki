import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AuditLogsPage from './pages/AuditLogsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

import { authService } from './services/authService';

// Kiểm tra người dùng đã đăng nhập chưa
function PrivateRoute({ children }) {
  const token = localStorage.getItem('access_token');

  return token
    ? children
    : <Navigate to="/login" replace />;
}

// Kiểm tra quyền Admin từ API /auth/me
function AdminRoute({ children }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    authService
      .getMe()
      .then((data) => {
        const currentUser =
          data?.user ??
          data?.data?.user ??
          data?.data ??
          data;

        if (isMounted) {
          const currentRole = String(
            currentUser?.role ?? ''
          ).toLowerCase();

          setRole(currentRole);
          setUnauthorized(currentRole !== 'admin');
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (err?.status === 401) {
            authService.logout();
            setUnauthorized(true);
          } else {
            setUnauthorized(true);
          }
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-6">Đang kiểm tra quyền truy cập...</div>;
  }

  if (unauthorized || role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Các trang công khai */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* Quản lý dự án */}
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <ProjectsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects/:projectId"
          element={
            <PrivateRoute>
              <ProjectDetailPage />
            </PrivateRoute>
          }
        />

        {/* Quản lý người dùng - chỉ Admin */}
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            </PrivateRoute>
          }
        />

        {/* Lịch sử hoạt động - chỉ Admin */}
        <Route
          path="/audit-logs"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AuditLogsPage />
              </AdminRoute>
            </PrivateRoute>
          }
        />

        {/* Trang không tồn tại */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}