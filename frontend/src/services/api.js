
import axios from 'axios';

// Gọi API thông qua HTTPS và Nginx reverse proxy.
// Không gọi trực tiếp cổng Backend từ trình duyệt.
const BASE_URL = '';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Chuẩn hóa lỗi từ Backend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    const normalizedError = {
      status: status || 500,
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.',
      details: null,
    };

    if (error.response) {
      const data = error.response.data;

      if (typeof data?.detail === 'string') {
        normalizedError.message = data.detail;
      } else if (Array.isArray(data?.detail)) {
        normalizedError.message = 'Dữ liệu gửi lên không hợp lệ.';
        normalizedError.details = data.detail;
      } else if (data?.message) {
        normalizedError.message = data.message;
      } else {
        normalizedError.message = `Lỗi hệ thống (${status})`;
      }
    }

    return Promise.reject(normalizedError);
  }
);

export default api;
