import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
      <h1 className="text-6xl font-extrabold text-slate-800">404</h1>
      <p className="text-slate-600 my-4">Trang bạn đang tìm kiếm không tồn tại.</p>
      <Link
        to="/"
        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
      >
        Trở về Trang chủ
      </Link>
    </div>
  );
}