import express from 'express';
import aiController from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Chat endpoints
router.post('/chat', aiController.sendMessage);
router.get('/conversations', aiController.getConversations);
router.get('/conversation/:id', aiController.getConversationMessages);
router.delete('/conversation/:id', aiController.deleteConversation);

export default router;