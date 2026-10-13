import React from 'react';

const STATUS_LABELS = {
  TODO: 'Cần Làm',
  IN_PROGRESS: 'Đang Làm',
  REVIEW: 'Review',
  DONE: 'Hoàn Thành',
};

export default function TaskCard({ task, onStatusChange, onDelete, onSelect }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h4
          onClick={() => onSelect && onSelect(task)}
          className="font-semibold text-slate-800 text-sm hover:text-blue-600 cursor-pointer line-clamp-2"
        >
          {task.title}
        </h4>
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="text-slate-400 hover:text-red-500 text-xs p-1"
            title="Xóa công việc"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-3 line-clamp-2">
        {task.description || 'Chưa có mô tả'}
      </p>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
        <span
          className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
            task.priority === 'HIGH' || task.priority === 'URGENT'
              ? 'bg-red-100 text-red-700'
              : task.priority === 'MEDIUM'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {task.priority}
        </span>

        {onStatusChange && (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs text-slate-700 focus:outline-none"
          >
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}