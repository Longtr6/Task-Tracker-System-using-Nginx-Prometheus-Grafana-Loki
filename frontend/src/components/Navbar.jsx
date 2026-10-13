import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Navbar({ user, onToggleSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Toggle for Mobile */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
            T
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">Task Tracker</span>
        </div>
      </div>

      {user ? (
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {user.profile?.full_name || user.username}
            </p>
            <p className="text-xs text-slate-500">
              {user.email} <span className="font-medium text-blue-600">({user.role})</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-danger btn-sm text-xs font-semibold cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      ) : (
        <div className="text-xs text-slate-400 animate-pulse">Đang tải thông tin...</div>
      )}
    </header>
  );
}