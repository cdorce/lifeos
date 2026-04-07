import express from 'express';
import focusController from '../controllers/focus.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(focusController.getAllSessions)
  .post(focusController.createSession);

router.get('/stats', focusController.getSessionStats);
router.get('/today', focusController.getTodaySessions);

router.route('/:id')
  .get(focusController.getSessionById)
  .put(focusController.updateSession)
  .delete(focusController.deleteSession);

export default router;