import api from './api';

export const taskService = {
  /**
   * Tạo Task mới
   * @param {Object} taskData - { project_id, title, description, status, priority, deadline, assignee_ids }
   */
  createTask: async (taskData) => {
    const response = await api.post('/api/v1/tasks/', taskData);
    return response.data;
  },

  /**
   * Lấy danh sách Task (Phân trang & Lọc)
   * @param {Object} params - { skip, limit, project_id, task_status, priority }
   */
  getTasks: async (params = {}) => {
    const response = await api.get('/api/v1/tasks/', {
      params: {
        skip: params.skip ?? 0,
        limit: params.limit ?? 20,
        ...(params.project_id && { project_id: params.project_id }),
        ...(params.task_status && { task_status: params.task_status }),
        ...(params.priority && { priority: params.priority }),
      },
    });
    return response.data;
  },

  /**
   * Cập nhật trạng thái Task (Lưu ý: Backend nhận new_status qua Query Param)
   * @param {number} taskId
   * @param {string} newStatus
   */
  updateTaskStatus: async (taskId, newStatus) => {
    const response = await api.patch(`/api/v1/tasks/${taskId}/status`, null, {
      params: {
        new_status: newStatus,
      },
    });
    return response.data;
  },

  /**
   * Xóa Task khỏi hệ thống
   * @param {number} taskId
   */
  deleteTask: async (taskId) => {
    const response = await api.delete(`/api/v1/tasks/${taskId}`);
    return response.data; // Trả về HTTP 204 (không có content)
  },
};