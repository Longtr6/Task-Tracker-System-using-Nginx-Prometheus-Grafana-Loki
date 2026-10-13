import React from 'react';

const STATUS_CONFIG = {
  TODO: { label: 'Cần Làm', className: 'badge-neutral' },
  IN_PROGRESS: { label: 'Đang Làm', className: 'badge-info' },
  REVIEW: { label: 'Review', className: 'badge-warning' },
  DONE: { label: 'Hoàn Thành', className: 'badge-success' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'badge-neutral' };

  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
}