import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login({ username, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-900 p-4">

      {/* Ảnh nền */}
      <img
        src="/quanlycongviec.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />

      {/* Lớp phủ tối giúp form nổi bật */}
      <div className="absolute inset-0 z-0 bg-slate-950/50" />

      {/* Form đăng nhập */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-white/30 bg-white/95 p-8 shadow-2xl backdrop-blur-sm sm:p-10"
      >
        <h4
          style={{ color: '#2563EB' }}
          className="text-2xl font-bold mb-6 text-center"
        >
          Đăng nhập Task Tracker
        </h4>

        <p className="mb-7 text-center text-sm text-slate-500">
          Chào mừng bạn quay trở lại!
        </p>

        {/* Thông báo lỗi */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Tên đăng nhập */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Tên đăng nhập
            </label>

            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Mật khẩu */}
          <div>
            {/* ============================================================ */}
            {/* <--- ĐOẠN MỚI THÊM: Flex layout chứa nhãn và Link Quên mật khẩu */}
            {/* ============================================================ */}
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Mật khẩu
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </div>

        {/* Liên kết đăng ký */}
        <p className="mt-6 text-center text-sm text-slate-600">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </div>
  );
}