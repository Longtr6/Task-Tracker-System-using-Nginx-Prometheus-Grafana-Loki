import api from './api';

export const commentService = {
  /**
   * Thêm bình luận vào Task
   * @param {number} taskId
   * @param {Object} commentData - { content }
   */
  createComment: async (taskId, commentData) => {
    const response = await api.post(
      `/api/v1/comments/${taskId}/comments`,
      commentData
    );
    return response.data;
  },
};