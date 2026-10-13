import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/StatCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { auditLogService } from '../services/auditLogService';

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [projData, taskData, logData] = await Promise.all([
          projectService.getProjects(),
          taskService.getTasks({ limit: 10 }),
          auditLogService.getAuditLogs({ limit: 5 }),
        ]);
        setProjects(projData);
        setTasks(taskData);
        setLogs(logData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <LoadingState message="Đang tải bảng tổng quan..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 style={{ color: 'black' }} className="text-2xl font-bold mb-6">Tổng quan hệ thống </h1>
        <p className="text-secondary">Chào mừng bạn trở lại với hệ thống quản lý công việc Task-Tracker.</p>
      </div>

      {/* Thẻ thống kê tổng quan sử dụng StatCard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Dự Án Tham Gia"
          value={projects.length}
          icon="📁"
          valueColor="text-blue-600"
        />
        <StatCard
          title="Tổng Số Công Việc"
          value={tasks.length}
          icon="📋"
          valueColor="text-emerald-600"
        />
        <StatCard
          title="Hoạt Động Gần Đây"
          value={logs.length}
          icon="📜"
          valueColor="text-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Khu vực công việc gần đây */}
        <div className="card">
          <h2 className="text-h3 mb-4">Công Việc Gần Đây</h2>
          {tasks.length === 0 ? (
            <EmptyState message="Chưa có công việc nào." icon="📋" />
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{task.title}</p>
                    <p className="text-xs text-slate-400">Độ ưu tiên: {task.priority}</p>
                  </div>
                  <span className="badge badge-neutral">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Khu vực nhật ký mới nhất */}
        <div className="card">
          <h2 className="text-h3 mb-4">Nhật Ký Mới Nhất</h2>
          {logs.length === 0 ? (
            <EmptyState message="Chưa có nhật ký nào." icon="📜" />
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="text-xs text-slate-600 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <span className="font-semibold text-slate-800">{log.action}</span> - Task ID #{log.task_id || 'N/A'}
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}