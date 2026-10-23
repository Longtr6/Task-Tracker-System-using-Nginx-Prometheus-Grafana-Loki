
import api from './api';

export const adminService = {
  // Lấy danh sách người dùng, hỗ trợ tìm kiếm và phân trang
  getUsers: async (params = {}) => {
    const response = await api.get('/api/v1/admin/users', {
      params: {
        skip: params.skip ?? 0,
        limit: params.limit ?? 10,
        search: params.search || undefined,
      },
    });

    return response.data;
  },

  // Lấy thống kê tổng quan dành cho Admin
  getDashboard: async () => {
    const response = await api.get('/api/v1/admin/dashboard');

    return response.data;
  },
};
