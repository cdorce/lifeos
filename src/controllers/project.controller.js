import projectService from '../services/project.service.js';

class ProjectController {
  async getAllProjects(req, res, next) {
    try {
      const { status } = req.query;
      const projects = await projectService.getAllProjects(req.user.id, status);

      res.status(200).json({
        status: 'success',
        count: projects.length,
        projects
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectById(req, res, next) {
    try {
      const project = await projectService.getProjectById(
        req.params.id,
        req.user.id
      );

      if (!project) {
        return res.status(404).json({
          status: 'error',
          message: 'Project not found'
        });
      }

      res.status(200).json({
        status: 'success',
        project
      });
    } catch (error) {
      next(error);
    }
  }

  async createProject(req, res, next) {
    try {
      const project = await projectService.createProject(req.user.id, req.body);

      res.status(201).json({
        status: 'success',
        project
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req, res, next) {
    try {
      const project = await projectService.updateProject(
        req.params.id,
        req.user.id,
        req.body
      );

      res.status(200).json({
        status: 'success',
        project
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req, res, next) {
    try {
      await projectService.deleteProject(req.params.id, req.user.id);

      res.status(200).json({
        status: 'success',
        message: 'Project deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async createProjectTask(req, res, next) {
    try {
      const task = await projectService.createProjectTask(
        req.params.projectId,
        req.user.id,
        req.body
      );

      res.status(201).json({
        status: 'success',
        task
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProjectTask(req, res, next) {
    try {
      const task = await projectService.updateProjectTask(
        req.params.taskId,
        req.params.projectId,
        req.user.id,
        req.body
      );

      res.status(200).json({
        status: 'success',
        task
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProjectTask(req, res, next) {
    try {
      await projectService.deleteProjectTask(
        req.params.taskId,
        req.params.projectId,
        req.user.id
      );

      res.status(200).json({
        status: 'success',
        message: 'Task deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProjectController();