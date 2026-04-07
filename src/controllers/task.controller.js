import taskService from '../services/task.service.js';

class TaskController {
  async getAllTasks(req, res, next) {
    try {
      const { type, status, priority, category } = req.query;
      const tasks = await taskService.getAllTasks(req.user.id, {
        type,
        status,
        priority,
        category
      });

      res.status(200).json({
        status: 'success',
        count: tasks.length,
        tasks
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.params.id, req.user.id);

      if (!task) {
        return res.status(404).json({
          status: 'error',
          message: 'Task not found'
        });
      }

      res.status(200).json({
        status: 'success',
        task
      });
    } catch (error) {
      next(error);
    }
  }

  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.user.id, req.body);

      res.status(201).json({
        status: 'success',
        task
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(
        req.params.id,
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

  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id, req.user.id);

      res.status(200).json({
        status: 'success',
        message: 'Task deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskStats(req, res, next) {
    try {
      const { type } = req.query;
      const stats = await taskService.getTaskStats(req.user.id, type);

      res.status(200).json({
        status: 'success',
        stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();