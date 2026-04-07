import { Project, ProjectTask } from '../models/index.js';

class ProjectService {
  async getAllProjects(userId, status = null) {
    const where = { user_id: userId };
    if (status) where.status = status;

    return await Project.findAll({
      where,
      include: [{
        model: ProjectTask,
        as: 'tasks'
      }],
      order: [['created_at', 'DESC']]
    });
  }

  async getProjectById(id, userId) {
    return await Project.findOne({
      where: { id, user_id: userId },
      include: [{
        model: ProjectTask,
        as: 'tasks'
      }]
    });
  }

  async createProject(userId, projectData) {
    return await Project.create({
      ...projectData,
      user_id: userId
    });
  }

  async updateProject(id, userId, projectData) {
    const project = await this.getProjectById(id, userId);
    if (!project) {
      throw new Error('Project not found');
    }
    return await project.update(projectData);
  }

  async deleteProject(id, userId) {
    const project = await this.getProjectById(id, userId);
    if (!project) {
      throw new Error('Project not found');
    }
    await project.destroy();
    return project;
  }

  async createProjectTask(projectId, userId, taskData) {
    const project = await this.getProjectById(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }
    return await ProjectTask.create({
      ...taskData,
      project_id: projectId
    });
  }

  async updateProjectTask(taskId, projectId, userId, taskData) {
    const project = await this.getProjectById(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }

    const task = await ProjectTask.findOne({
      where: { id: taskId, project_id: projectId }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return await task.update(taskData);
  }

  async deleteProjectTask(taskId, projectId, userId) {
    const project = await this.getProjectById(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }

    const task = await ProjectTask.findOne({
      where: { id: taskId, project_id: projectId }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    await task.destroy();
    return task;
  }
}

export default new ProjectService();