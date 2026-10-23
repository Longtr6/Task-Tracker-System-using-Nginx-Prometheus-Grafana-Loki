
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({
  isOpen,
  onClose,
  user,
  userLoaded = true,
}) {
  // API /auth/me trả về role trực tiếp.
  const role = String(
    user?.role ??
    user?.user_role ??
    user?.account?.role ??
    user?.user?.role ??
    user?.data?.role ??
    ''
  )
    .trim()
    .toUpperCase();

  const isAdmin = [
    'ADMIN',
    'SUPERADMIN',
    'SUPER_ADMIN',
  ].includes(role);

  console.log('[Sidebar] user:', user);
  console.log('[Sidebar] role:', role);
  console.log('[Sidebar] isAdmin:', isAdmin);

  const menuItems = [
    { path: '/', label: 'Tổng Quan', icon: '📊' },
    { path: '/projects', label: 'Dự Án', icon: '📁' },
  ];

  // Chỉ thêm Lịch Sử Hoạt Động khi tài khoản là Admin.
  if (isAdmin) {
    menuItems.push({
      path: '/audit-logs',
      label: 'Lịch Sử Hoạt Động',
      icon: '📜',
    });
  }

  // Giữ nguyên menu Quản Lý Người Dùng dành cho Admin.
  if (isAdmin) {
    menuItems.push({
      path: '/admin/users',
      label: 'Quản Lý Người Dùng',
      icon: '👥',
    });
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col gap-2 shrink-0 transform transition-transform duration-200 ease-in-out ${
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-3 mb-2 md:hidden">
          <span className="text-xs font-bold text-slate-400 uppercase">
            Menu Điều Hướng
          </span>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="hidden md:block text-xs font-bold text-slate-400 uppercase px-3 mb-2">
          Menu Điều Hướng
        </div>

        {!userLoaded ? (
          <div className="px-3 py-2 text-sm text-slate-400">
            Đang tải thông tin tài khoản...
          </div>
        ) : (
          menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => {
                if (window.innerWidth < 768) {
                  onClose?.();
                }
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'hover:bg-slate-800 text-slate-300'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))
        )}
      </aside>
    </>
  );
}
