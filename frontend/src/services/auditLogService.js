import api from './api';

export const auditLogService = {
  /**
   * Lấy lịch sử hoạt động hệ thống (Phân trang & Lọc theo task_id)
   * @param {Object} params - { skip, limit, task_id }
   */
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/api/v1/audit-logs/', {
      params: {
        skip: params.skip ?? 0,
        limit: params.limit ?? 50,
        ...(params.task_id && { task_id: params.task_id }),
      },
    });
    return response.data;
  },
};