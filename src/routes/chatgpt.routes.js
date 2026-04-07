import express from 'express';
import chatGptController from '../controllers/chatgpt.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Chat endpoints
router.post('/chat', chatGptController.sendMessage);
router.get('/conversations', chatGptController.getConversations);
router.get('/conversation/:id', chatGptController.getConversationMessages);
router.delete('/conversation/:id', chatGptController.deleteConversation);

export default router;