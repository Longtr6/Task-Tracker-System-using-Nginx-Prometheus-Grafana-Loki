import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { authService } from '../services/authService';

export default function MainLayout({ children }) {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    authService
      .getMe()
      .then((data) => {
        console.log('[MainLayout] Thông tin tài khoản:', data);

        // API /auth/me trả về user trực tiếp,
        // role nằm ở data.role.
        const currentUser =
          data?.user ??
          data?.data?.user ??
          data?.data ??
          data;

        if (isMounted) {
          setUser(currentUser);
        }
      })
      .catch((err) => {
        console.error(
          '[MainLayout] Lỗi lấy thông tin người dùng:',
          err
        );

        if (isMounted && err?.status === 401) {
          authService.logout();
          navigate('/login', { replace: true });
        }
      })
      .finally(() => {
        if (isMounted) {
          setUserLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased w-full">
      <Navbar
        user={user}
        onToggleSidebar={() =>
          setIsSidebarOpen((open) => !open)
        }
      />

      <div className="flex flex-1 relative overflow-hidden w-full">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          user={user}
          userLoaded={userLoaded}
        />

        <main className="flex-1 p-4 md:p-6 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}