import api from './api';

class FocusService {
  async getAllSessions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.type) params.append('type', filters.type);
    
    const response = await api.get(`/focus?${params.toString()}`);
    return response.data.sessions || [];
  }

  async getSessionById(id) {
    const response = await api.get(`/focus/${id}`);
    return response.data.session;
  }

  async createSession(sessionData) {
    const response = await api.post('/focus', sessionData);
    return response.data.session;
  }

  async updateSession(id, sessionData) {
    const response = await api.put(`/focus/${id}`, sessionData);
    return response.data.session;
  }

  async deleteSession(id) {
    await api.delete(`/focus/${id}`);
  }

  async getTodaySessions() {
    const response = await api.get('/focus/today');
    return response.data.sessions || [];
  }

  async getSessionStats() {
    const response = await api.get('/focus/stats');
    return response.data.stats;
  }
}

export default new FocusService();