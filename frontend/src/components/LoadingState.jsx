import React from 'react';

export default function LoadingState({ message = 'Đang tải dữ liệu...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="loading-spinner"></div>
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
}