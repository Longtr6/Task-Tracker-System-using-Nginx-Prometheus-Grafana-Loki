import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [debugLink, setDebugLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setDebugLink('');

    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.message || 'Yêu cầu đã được gửi thành công.');
      if (res.debug_reset_link) {
        setDebugLink(res.debug_reset_link);
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-900 p-4">
      <img
        src="/quanlycongviec.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 z-0 bg-slate-950/50" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-white/30 bg-white/95 p-8 shadow-2xl backdrop-blur-sm sm:p-10"
      >
        <h4
          style={{ color: '#2563EB' }}
          className="text-2xl font-bold mb-3 text-center"
        >
          Quên mật khẩu
        </h4>
        <p className="mb-7 text-center text-sm text-slate-500">
          Nhập email đăng ký của bạn để nhận liên kết đặt lại mật khẩu.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* Khung hiển thị link debug để test trực tiếp trên môi trường dev */}
        {debugLink && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 break-all">
            <span className="font-semibold block mb-1">🔗 Link khôi phục (Môi trường Dev):</span>
            <a href={debugLink} className="underline text-blue-600 hover:text-blue-800">
              {debugLink}
            </a>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email đã đăng ký
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập địa chỉ email của bạn"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Đã nhớ lại mật khẩu?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </form>
    </div>
  );
}