import { Transaction } from '../models/index.js';
import { Op } from 'sequelize';

class BudgetService {
  async getAllTransactions(userId, filters = {}) {
    const where = { user_id: userId };

    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.startDate && filters.endDate) {
      where.date = {
        [Op.between]: [filters.startDate, filters.endDate]
      };
    }

    return await Transaction.findAll({
      where,
      order: [['date', 'DESC']]
    });
  }

  async getTransactionById(id, userId) {
    return await Transaction.findOne({
      where: { id, user_id: userId }
    });
  }

  async createTransaction(userId, transactionData) {
    return await Transaction.create({
      ...transactionData,
      user_id: userId
    });
  }

  async updateTransaction(id, userId, transactionData) {
    const transaction = await this.getTransactionById(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return await transaction.update(transactionData);
  }

  async deleteTransaction(id, userId) {
    const transaction = await this.getTransactionById(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    await transaction.destroy();
    return transaction;
  }

  async getFinancialSummary(userId, startDate, endDate) {
    const where = { user_id: userId };
    
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }

    const transactions = await Transaction.findAll({ where });

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const balance = totalIncome - totalExpense;

    const byCategory = {};
    transactions.forEach(t => {
      if (!byCategory[t.category]) {
        byCategory[t.category] = { income: 0, expense: 0 };
      }
      byCategory[t.category][t.type] += parseFloat(t.amount);
    });

    return {
      totalIncome,
      totalExpense,
      balance,
      byCategory,
      transactionCount: transactions.length
    };
  }

  // ✅ NEW: Get monthly summary for chart
  async getMonthlySummary(userId) {
    const transactions = await Transaction.findAll({
      where: { user_id: userId }
    });

    // Group by month
    const monthlyData = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          income: 0,
          expense: 0,
          balance: 0
        };
      }

      const amount = parseFloat(t.amount);
      if (t.type === 'income') {
        monthlyData[monthKey].income += amount;
      } else {
        monthlyData[monthKey].expense += amount;
      }
      monthlyData[monthKey].balance = monthlyData[monthKey].income - monthlyData[monthKey].expense;
    });

    // Convert to array and sort by month
    const chartData = Object.values(monthlyData)
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .slice(-12); // Last 12 months

    return chartData;
  }
}

export default new BudgetService();