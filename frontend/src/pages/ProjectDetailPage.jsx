
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import MemberModal from '../components/MemberModal';

import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { commentService } from '../services/commentService';
import { authService } from '../services/authService';

const KANBAN_COLUMNS = [
  { key: 'TODO', title: 'Cần Làm', bg: 'bg-slate-200' },
  { key: 'IN_PROGRESS', title: 'Đang Thực Hiện', bg: 'bg-blue-100' },
  { key: 'REVIEW', title: 'Đang Review', bg: 'bg-amber-100' },
  { key: 'DONE', title: 'Hoàn Thành', bg: 'bg-emerald-100' },
];

export default function ProjectDetailPage() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // Task được chọn để bình luận
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentContent, setCommentContent] = useState('');

  // Tải thông tin dự án, công việc và tài khoản hiện tại
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [projData, taskData, userData] = await Promise.all([
        projectService.getProjectDetail(projectId),
        taskService.getTasks({ project_id: Number(projectId) }),
        authService.getMe(),
      ]);

      setProject(projData);
      setTasks(taskData);
      setCurrentUser(userData);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu dự án');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Kiểm tra quyền thêm thành viên
  const isAdmin = currentUser?.role === 'ADMIN';

  const isProjectManager = project?.members?.some(
    (member) =>
      Number(member.user_id) === Number(currentUser?.id) &&
      member.role_in_project === 'MANAGER'
  );

  const canAddMember = isAdmin || isProjectManager;

  // Tạo công việc
  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks((prev) => [...prev, newTask]);
      setIsTaskModalOpen(false);
    } catch (err) {
      alert(err.message || 'Lỗi khi tạo task');
    }
  };

  // Thay đổi trạng thái công việc
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updated = await taskService.updateTaskStatus(
        taskId,
        newStatus
      );

      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updated : task))
      );
    } catch (err) {
      alert(err.message || 'Lỗi chuyển trạng thái');
    }
  };

  // Xóa công việc
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Bạn có chắc muốn xóa công việc này?')) {
      return;
    }

    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      alert(err.message || 'Lỗi xóa công việc');
    }
  };

  // Thêm thành viên vào dự án
  const handleAddMember = async (memberData) => {
    try {
      await projectService.addProjectMember(projectId, memberData);

      alert('Đã thêm thành viên!');
      setIsMemberModalOpen(false);

      await fetchData();
    } catch (err) {
      alert(err.message || 'Lỗi thêm thành viên');
    }
  };

  // Gửi bình luận
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!selectedTask || !commentContent.trim()) {
      return;
    }

    try {
      await commentService.createComment(selectedTask.id, {
        content: commentContent,
      });

      alert('Đã gửi bình luận!');
      setCommentContent('');
    } catch (err) {
      alert(err.message || 'Lỗi gửi bình luận');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-12 text-center text-slate-500">
          Đang tải...
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="py-12 text-center text-red-500">
          {error}
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="py-12 text-center text-slate-500">
          Không tìm thấy dự án.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Thông tin dự án */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {project.name}
            </h1>

            <p className="text-xs text-slate-500 mt-1">
              {project.description}
            </p>
          </div>

          <div className="flex gap-2">
            {/* Chỉ Admin hoặc Manager của dự án mới thấy nút này */}
            {canAddMember && (
              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-700 transition"
              >
                + Thêm Thành Viên
              </button>
            )}

            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Tạo Task
            </button>
          </div>
        </div>

        {/* Danh sách thành viên */}
        <div className="text-xs text-slate-500 border-t pt-3 flex flex-wrap gap-4">
          <span>
            Thành viên ({project.members?.length || 0}):
          </span>

          {project.members?.map((member) => (
            <span
              key={member.id}
              className="font-semibold text-slate-700"
            >
              User #{member.user_id} ({member.role_in_project})
            </span>
          ))}
        </div>
      </div>

      {/* Bảng Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = tasks.filter(
            (task) => task.status === col.key
          );

          return (
            <div
              key={col.key}
              className={`p-4 rounded-2xl ${col.bg} min-h-[500px]`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 text-sm">
                  {col.title}
                </h3>

                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTask}
                    onSelect={setSelectedTask}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal bình luận */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {selectedTask.title}
              </h3>

              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              {selectedTask.description}
            </p>

            <form
              onSubmit={handleAddComment}
              className="space-y-3 border-t pt-4"
            >
              <label className="block text-xs font-semibold text-slate-600">
                Thêm Bình Luận
              </label>

              <textarea
                rows="2"
                required
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="w-full border rounded-lg p-2 text-xs outline-none"
                placeholder="Nhập nội dung bình luận..."
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                >
                  Đóng
                </button>

                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                >
                  Gửi Bình Luận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal tạo task */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        projectId={projectId}
      />

      {/* Modal thêm thành viên */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSubmit={handleAddMember}
      />
    </MainLayout>
  );
}
