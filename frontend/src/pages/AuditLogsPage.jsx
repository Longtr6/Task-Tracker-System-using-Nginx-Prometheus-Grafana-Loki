import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { auditLogService } from '../services/auditLogService';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 20;

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await auditLogService.getAuditLogs({ skip, limit });
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [skip]);

  return (
    <MainLayout>
      <h1 style={{ color: 'black' }} className="text-2xl font-bold mb-6">Lịch Sử Hoạt Động (Audit Logs)</h1>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải dữ liệu nhật ký...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Chưa có dữ liệu nhật ký.</div>
        ) : (
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">User ID</th>
                <th className="p-4">Task ID</th>
                <th className="p-4">Hành Động</th>
                <th className="p-4">Giá Trị Cũ</th>
                <th className="p-4">Giá Trị Mới</th>
                <th className="p-4">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">#{log.id}</td>
                  <td className="p-4">User #{log.user_id}</td>
                  <td className="p-4">{log.task_id ? `#${log.task_id}` : '-'}</td>
                  <td className="p-4 font-semibold text-blue-600">{log.action}</td>
                  <td className="p-4 text-slate-400">{log.old_value || '-'}</td>
                  <td className="p-4 text-slate-800">{log.new_value || '-'}</td>
                  <td className="p-4 text-slate-400">
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
          <button
            disabled={skip === 0}
            onClick={() => setSkip((prev) => Math.max(0, prev - limit))}
            className="px-3 py-1.5 border rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            Trang Trước
          </button>
          <span className="text-xs text-slate-500">Trang {skip / limit + 1}</span>
          <button
            disabled={logs.length < limit}
            onClick={() => setSkip((prev) => prev + limit)}
            className="px-3 py-1.5 border rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            Trang Sau
          </button>
        </div>
      </div>
    </MainLayout>
  );
}