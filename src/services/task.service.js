import { Task } from '../models/index.js';
import { Op } from 'sequelize';

class TaskService {
 async getAllTasks(userId, filters = {}) {
  const where = { user_id: userId };

  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.category) where.category = filters.category;

  return await Task.findAll({
    where,
    order: [['created_at', 'DESC']]
  });
}

async getTaskById(id, userId) {
  return await Task.findOne({
    where: { id, user_id: userId }
  });
}

  async getTaskById(id, userId) {
    return await Task.findOne({
      where: { id, user_id: userId },
      attributes: ['id', 'title', 'description', 'type', 'priority', 'status', 'category', 'tags', 'links', 'due_date', 'completed_at', 'created_at', 'updated_at']
    });
  }

  async createTask(userId, taskData) {
    return await Task.create({
      ...taskData,
      user_id: userId
    });
  }

  async updateTask(id, userId, taskData) {
    const task = await this.getTaskById(id, userId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (taskData.status === 'completed' && task.status !== 'completed') {
      taskData.completed_at = new Date();
    }

    return await task.update(taskData);
  }

  async deleteTask(id, userId) {
    const task = await this.getTaskById(id, userId);
    if (!task) {
      throw new Error('Task not found');
    }
    await task.destroy();
    return task;
  }

  async getTaskStats(userId, type = null) {
    const where = { user_id: userId };
    if (type) where.type = type;

    const total = await Task.count({ where });
    const completed = await Task.count({ where: { ...where, status: 'completed' } });
    const inProgress = await Task.count({ where: { ...where, status: 'in-progress' } });
    const pending = await Task.count({ where: { ...where, status: 'pending' } });

    const overdue = await Task.count({
      where: {
        ...where,
        status: { [Op.ne]: 'completed' },
        due_date: { [Op.lt]: new Date() }
      }
    });

    return { total, completed, inProgress, pending, overdue };
  }
}

export default new TaskService();