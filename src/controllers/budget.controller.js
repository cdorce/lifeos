import budgetService from '../services/budget.service.js';

class BudgetController {
  async getAllTransactions(req, res, next) {
    try {
      const { type, category, startDate, endDate } = req.query;
      const transactions = await budgetService.getAllTransactions(req.user.id, {
        type,
        category,
        startDate,
        endDate
      });

      res.status(200).json({
        status: 'success',
        count: transactions.length,
        transactions
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionById(req, res, next) {
    try {
      const transaction = await budgetService.getTransactionById(
        req.params.id,
        req.user.id
      );

      if (!transaction) {
        return res.status(404).json({
          status: 'error',
          message: 'Transaction not found'
        });
      }

      res.status(200).json({
        status: 'success',
        transaction
      });
    } catch (error) {
      next(error);
    }
  }

  async createTransaction(req, res, next) {
    try {
      const transaction = await budgetService.createTransaction(
        req.user.id,
        req.body
      );

      res.status(201).json({
        status: 'success',
        transaction
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTransaction(req, res, next) {
    try {
      const transaction = await budgetService.updateTransaction(
        req.params.id,
        req.user.id,
        req.body
      );

      res.status(200).json({
        status: 'success',
        transaction
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTransaction(req, res, next) {
    try {
      await budgetService.deleteTransaction(req.params.id, req.user.id);

      res.status(200).json({
        status: 'success',
        message: 'Transaction deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getFinancialSummary(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const summary = await budgetService.getFinancialSummary(
        req.user.id,
        startDate,
        endDate
      );

      res.status(200).json({
        status: 'success',
        summary
      });
    } catch (error) {
      next(error);
    }
  }

  // ✅ NEW: Get monthly summary for chart
  async getMonthlySummary(req, res, next) {
    try {
      const monthlySummary = await budgetService.getMonthlySummary(req.user.id);

      res.status(200).json({
        status: 'success',
        data: monthlySummary
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BudgetController();