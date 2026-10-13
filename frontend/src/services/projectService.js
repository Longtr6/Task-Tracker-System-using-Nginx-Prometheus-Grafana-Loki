import api from './api';

export const projectService = {
  /**
   * Tạo dự án mới
   * @param {Object} projectData - { name, description, start_date, end_date }
   */
  createProject: async (projectData) => {
    const response = await api.post('/api/v1/projects/', projectData);
    return response.data;
  },

  /**
   * Lấy danh sách dự án người dùng tham gia (hoặc tất cả nếu là ADMIN)
   */
  getProjects: async () => {
    const response = await api.get('/api/v1/projects/');
    return response.data;
  },

  /**
   * Lấy chi tiết dự án kèm danh sách thành viên
   * @param {number} projectId
   */
  getProjectDetail: async (projectId) => {
    const response = await api.get(`/api/v1/projects/${projectId}`);
    return response.data;
  },

  /**
   * Thêm thành viên vào dự án
   * @param {number} projectId
   * @param {Object} memberData - { user_id, role_in_project }
   */
  addProjectMember: async (projectId, memberData) => {
    const response = await api.post(
      `/api/v1/projects/${projectId}/members`,
      memberData
    );
    return response.data;
  },
};