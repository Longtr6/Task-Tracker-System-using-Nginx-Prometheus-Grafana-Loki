
import React, { useCallback, useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { adminService } from '../services/adminService';

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Lấy thêm một bản ghi để xác định còn trang tiếp theo hay không.
      const data = await adminService.getUsers({
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE + 1,
        search,
      });

      // Backend hiện tại trả về một mảng người dùng.
      const list = Array.isArray(data)
        ? data
        : data?.items ?? data?.users ?? [];

      setHasNextPage(list.length > PAGE_SIZE);
      setUsers(list.slice(0, PAGE_SIZE));
    } catch (err) {
      setUsers([]);
      setHasNextPage(false);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'Không thể tải danh sách người dùng. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleSearch(event) {
    event.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  }

  function handleClearSearch() {
    setSearchInput('');
    setSearch('');
    setPage(0);
  }

  function getFullName(user) {
    return (
      user.profile?.full_name ||
      user.full_name ||
      user.username ||
      '—'
    );
  }

  function getRoleLabel(role) {
    return String(role || 'USER').toUpperCase();
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Tiêu đề */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Quản lý người dùng
          </h1>
          <p className="mt-2 text-slate-500">
            Theo dõi các tài khoản đã đăng ký trong hệ thống Task Tracker.
          </p>
        </div>

        {/* Thẻ thống kê */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Người dùng ở trang hiện tại
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {loading ? '—' : users.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Trang hiện tại</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">
              {page + 1}
            </p>
          </div>
        </div>

        {/* Danh sách người dùng */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {/* Tìm kiếm */}
          <form
            onSubmit={handleSearch}
            className="mb-5 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm theo tên đăng nhập hoặc email..."
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tìm kiếm
            </button>

            <button
              type="button"
              onClick={handleClearSearch}
              disabled={loading && !search && !searchInput}
              className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Xóa lọc
            </button>
          </form>

          {/* Thông báo lỗi */}
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <p>{error}</p>
              <button
                type="button"
                onClick={loadUsers}
                disabled={loading}
                className="mt-2 font-semibold underline disabled:opacity-50"
              >
                Thử tải lại
              </button>
            </div>
          )}

          {/* Nội dung */}
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              Đang tải danh sách người dùng...
            </div>
          ) : error ? (
            <div className="py-6 text-center text-slate-500">
              Không thể hiển thị dữ liệu.
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-3 text-4xl">👥</div>
              <p className="font-medium text-slate-700">
                Không tìm thấy người dùng
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Hãy thử từ khóa khác hoặc xóa bộ lọc.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="px-4 py-3 font-semibold">STT</th>
                    <th className="px-4 py-3 font-semibold">Người dùng</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Vai trò</th>
                    <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user, index) => {
                    const role = getRoleLabel(user.role);
                    const isAdmin = role === 'ADMIN';

                    return (
                      <tr
                        key={user.id ?? user.user_id ?? user.username ?? index}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-4 text-slate-500">
                          {page * PAGE_SIZE + index + 1}
                        </td>

                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-800">
                            {getFullName(user)}
                          </div>

                          {(user.profile?.full_name || user.full_name) &&
                            user.username && (
                              <div className="mt-1 text-xs text-slate-400">
                                @{user.username}
                              </div>
                            )}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {user.email || '—'}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isAdmin
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {role}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-500">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString(
                                'vi-VN'
                              )
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Phân trang */}
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm text-slate-500">
              Trang {page + 1}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0 || loading}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>

              <button
                type="button"
                disabled={!hasNextPage || loading}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Tiếp
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
