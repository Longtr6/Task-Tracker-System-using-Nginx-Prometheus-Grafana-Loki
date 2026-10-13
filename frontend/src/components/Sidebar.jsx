import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    { path: '/', label: 'Tổng Quan', icon: '📊' },
    { path: '/projects', label: 'Dự Án', icon: '📁' },
    { path: '/audit-logs', label: 'Lịch Sử Hoạt Động', icon: '📜' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col gap-2 shrink-0 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-3 mb-2 md:hidden">
          <span className="text-xs font-bold text-slate-400 uppercase">Menu Điều Hướng</span>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="hidden md:block text-xs font-bold text-slate-400 uppercase px-3 mb-2">
          Menu Điều Hướng
        </div>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={() => {
              if (window.innerWidth < 768 && onClose) onClose();
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
        ))}
      </aside>
    </>
  );
}