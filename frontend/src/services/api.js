import axios from 'axios';

// Cố định thẳng trực tiếp vào cổng 8001 của backend
const BASE_URL = '';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm JWT Bearer Token nếu có
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

// Response Interceptor: Chuẩn hóa dữ liệu lỗi từ Backend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let normalizedError = {
      status: error.response?.status || 500,
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
        normalizedError.message = `Lỗi hệ thống (${error.response.status})`;
      }

      if (error.response.status === 401) {
        localStorage.removeItem('access_token');
      }
    }

    return Promise.reject(normalizedError);
  }
);

export default api;