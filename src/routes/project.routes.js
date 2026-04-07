import express from 'express';
import projectController from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(projectController.getAllProjects)
  .post(projectController.createProject);

router.route('/:id')
  .get(projectController.getProjectById)
  .put(projectController.updateProject)
  .delete(projectController.deleteProject);

// Project tasks
router.post('/:projectId/tasks', projectController.createProjectTask);
router.put('/:projectId/tasks/:taskId', projectController.updateProjectTask);
router.delete('/:projectId/tasks/:taskId', projectController.deleteProjectTask);

export default router;