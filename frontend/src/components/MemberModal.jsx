import React, { useState } from 'react';

export default function MemberModal({ isOpen, onClose, onSubmit }) {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('MEMBER');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      user_id: Number(userId),
      role_in_project: role,
    });
    setUserId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Thêm Thành Viên Dự Án</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">User ID *</label>
            <input
              type="number"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập User ID"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Vai trò trong dự án</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MEMBER">MEMBER</option>
              <option value="MANAGER">MANAGER</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
              Thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}