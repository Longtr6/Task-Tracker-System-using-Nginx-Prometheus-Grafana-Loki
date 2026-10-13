import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/api/v1/auth/register', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      full_name: userData.full_name || null,
    });
    return response.data;
  },

  login: async ({ username, password }) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data?.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
  },

  forgotPassword: async (email) => {
    const response = await api.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async ({ token, new_password }) => {
    const response = await api.post('/api/v1/auth/reset-password', {
      token,
      new_password,
    });
    return response.data;
  },
};