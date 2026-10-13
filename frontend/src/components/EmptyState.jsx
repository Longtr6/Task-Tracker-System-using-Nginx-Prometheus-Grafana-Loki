import React from 'react';

export default function EmptyState({ message = 'Chưa có dữ liệu nào.', icon = '📁', action }) {
  return (
    <div className="empty-state">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm font-medium text-slate-600 mb-3">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}