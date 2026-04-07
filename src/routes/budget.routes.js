import express from 'express';
import budgetController from '../controllers/budget.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(budgetController.getAllTransactions)
  .post(budgetController.createTransaction);

router.get('/summary', budgetController.getFinancialSummary);

// ✅ ADD THIS BEFORE /:id route
router.get('/monthly-summary', budgetController.getMonthlySummary);

router.route('/:id')
  .get(budgetController.getTransactionById)
  .put(budgetController.updateTransaction)
  .delete(budgetController.deleteTransaction);

export default router;