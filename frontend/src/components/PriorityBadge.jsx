import React from 'react';

const PRIORITY_CONFIG = {
  LOW: { label: 'Thấp', className: 'badge-neutral' },
  MEDIUM: { label: 'Trung Bình', className: 'badge-info' },
  HIGH: { label: 'Cao', className: 'badge-warning' },
  URGENT: { label: 'Khẩn Cấp', className: 'badge-danger' },
};

export default function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority] || { label: priority, className: 'badge-neutral' };

  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
}