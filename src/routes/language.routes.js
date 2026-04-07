import express from 'express';
import languageController from '../controllers/language.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Language routes
router.route('/languages')
  .get(languageController.getAllLanguages)
  .post(languageController.createLanguage);

router.route('/languages/:id')
  .get(languageController.getLanguageById)
  .put(languageController.updateLanguage)
  .delete(languageController.deleteLanguage);

// Progress routes
router.get('/languages/:id/progress', languageController.getLanguageProgress);
router.put('/languages/:id/progress', languageController.updateProgress);

// Curriculum routes
router.get('/languages/:id/curriculum', languageController.getCurriculum);
router.post('/curriculum', languageController.createCurriculumItem);
router.put('/curriculum/:id', languageController.updateCurriculumItem);

// Lesson completion
router.post('/lessons/:id/complete', languageController.completeLesson);

export default router;