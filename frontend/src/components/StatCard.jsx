import React from 'react';

export default function StatCard({ title, value, icon, valueColor = 'text-blue-600' }) {
  return (
    <div className="card-stat">
      <div className="flex items-center justify-between">
        <span className="card-stat-label">{title}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className={`card-stat-value ${valueColor}`}>{value}</p>
    </div>
  );
}