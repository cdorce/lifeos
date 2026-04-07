import api from './api';

class ProjectService {
  async getAllProjects(status = null) {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/projects${params}`);
    return response.data.projects;
  }

  async getProjectById(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data.project;
  }

  async createProject(projectData) {
    const response = await api.post('/projects', projectData);
    return response.data.project;
  }

  async updateProject(id, projectData) {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data.project;
  }

  async deleteProject(id) {
    await api.delete(`/projects/${id}`);
  }

  // Project Tasks
  async createProjectTask(projectId, taskData) {
    const response = await api.post(`/projects/${projectId}/tasks`, taskData);
    return response.data.task;
  }

  async updateProjectTask(projectId, taskId, taskData) {
    const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, taskData);
    return response.data.task;
  }

  async deleteProjectTask(projectId, taskId) {
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
  }
}

export default new ProjectService();