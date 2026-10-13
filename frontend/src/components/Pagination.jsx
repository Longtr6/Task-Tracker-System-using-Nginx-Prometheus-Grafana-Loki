import React from 'react';

export default function Pagination({ skip, limit, hasNext, onPageChange }) {
  const currentPage = Math.floor(skip / limit) + 1;

  return (
    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
      <button
        disabled={skip === 0}
        onClick={() => onPageChange(Math.max(0, skip - limit))}
        className="btn btn-outline btn-sm disabled:opacity-50"
      >
        Trang Trước
      </button>
      <span className="text-xs font-semibold text-slate-600">Trang {currentPage}</span>
      <button
        disabled={!hasNext}
        onClick={() => onPageChange(skip + limit)}
        className="btn btn-outline btn-sm disabled:opacity-50"
      >
        Trang Sau
      </button>
    </div>
  );
}