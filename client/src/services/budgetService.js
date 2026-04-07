import api from './api';

class BudgetService {
  async getAllTransactions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/budget?${params.toString()}`);
    return response.data.transactions;
  }

  async getTransactionById(id) {
    const response = await api.get(`/budget/${id}`);
    return response.data.transaction;
  }

  async createTransaction(transactionData) {
    const response = await api.post('/budget', transactionData);
    return response.data.transaction;
  }

  async updateTransaction(id, transactionData) {
    const response = await api.put(`/budget/${id}`, transactionData);
    return response.data.transaction;
  }

  async deleteTransaction(id) {
    await api.delete(`/budget/${id}`);
  }

  async getFinancialSummary(startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/budget/summary?${params.toString()}`);
    return response.data.summary;
  }
}

export default new BudgetService();