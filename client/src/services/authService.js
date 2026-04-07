import api from './api';

class AuthService {
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      console.log('Attempting login...', { email }); // Debug log
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data); // Debug log
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response || error);
      throw error;
    }
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  getCurrentUserFromStorage() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();