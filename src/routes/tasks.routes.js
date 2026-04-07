import express from 'express';
import taskController from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

router.get('/stats', taskController.getTaskStats);

router.route('/:id')
  .get(taskController.getTaskById)
  .put(taskController.updateTask)
  .delete(taskController.deleteTask);

export default router;