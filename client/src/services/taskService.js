import api from './api';

class TaskService {
  // Helper to parse task data
  parseTask(task) {
    return {
      ...task,
      tags: typeof task.tags === 'string' ? JSON.parse(task.tags) : (task.tags || [])
    };
  }

  async getAllTasks(filters = {}) {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    
    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data.tasks.map(task => this.parseTask(task));
  }

  async getTaskById(id) {
    const response = await api.get(`/tasks/${id}`);
    return this.parseTask(response.data.task);
  }

  async createTask(taskData) {
    const response = await api.post('/tasks', taskData);
    return this.parseTask(response.data.task);
  }

  async updateTask(id, taskData) {
    const response = await api.put(`/tasks/${id}`, taskData);
    return this.parseTask(response.data.task);
  }

  async deleteTask(id) {
    await api.delete(`/tasks/${id}`);
  }

  async getTaskStats(type = null) {
    const params = type ? `?type=${type}` : '';
    const response = await api.get(`/tasks/stats${params}`);
    return response.data.stats;
  }
}

export default new TaskService();