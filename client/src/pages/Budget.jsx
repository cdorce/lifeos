import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Search, Filter, Edit2, Trash2, MoreVertical } from 'lucide-react';
import budgetService from '../services/budgetService';
import MonthlyExpensesChart from '../components/MonthlyExpensesChart';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import ConfirmationModal from '../components/common/ConfirmationModal';

const Budget = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    byCategory: {}
  });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    transactionId: null,
    transactionName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all transactions
      const allTransactions = await budgetService.getAllTransactions();
      setTransactions(allTransactions);

      // Get current month start and end dates
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch summary for current month
      const financialSummary = await budgetService.getFinancialSummary(startDateStr, endDateStr);
      setSummary(financialSummary);

    } catch (error) {
      console.error('Error fetching budget data:', error);
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      await budgetService.createTransaction(transactionData);
      toast.success('Transaction added successfully!');
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Failed to add transaction');
    }
  };

  const handleUpdateTransaction = async (transactionId, updates) => {
    try {
      await budgetService.updateTransaction(transactionId, updates);
      toast.success('Transaction updated successfully!');
      setEditingTransaction(null);
      fetchData();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId);
    setDeleteModal({
      isOpen: true,
      transactionId: transactionId,
      transactionName: transaction?.description || 'Transaction'
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await budgetService.deleteTransaction(deleteModal.transactionId);
      toast.success('Transaction deleted successfully!');
      setDeleteModal({ isOpen: false, transactionId: null, transactionName: '' });
      fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, transactionId: null, transactionName: '' });
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesSearch = 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesMonth = true;
    if (selectedMonth !== 'all') {
      const transactionMonth = format(new Date(transaction.date), 'yyyy-MM');
      matchesMonth = transactionMonth === selectedMonth;
    }
    
    return matchesType && matchesSearch && matchesMonth;
  });

  // Get unique months from transactions
  const getAvailableMonths = () => {
    const months = new Set();
    transactions.forEach(t => {
      const month = format(new Date(t.date), 'yyyy-MM');
      months.add(month);
    });
    return Array.from(months).sort().reverse();
  };

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = format(new Date(transaction.date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTransactions).sort().reverse();

  // Get top categories
  const topCategories = Object.entries(summary.byCategory || {})
    .map(([category, data]) => ({
      category,
      amount: data.expense,
      income: data.income
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budget Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Current Month Overview</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards - Match Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Total Income */}
        <SmallStatCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Income"
          value={`$${summary.totalIncome.toFixed(2)}`}
          subtitle={`${transactions.filter(t => t.type === 'income').length} transactions`}
          color="green"
        />

        {/* Total Expenses */}
        <SmallStatCard
          icon={<TrendingDown className="w-5 h-5" />}
          title="Expenses"
          value={`$${summary.totalExpense.toFixed(2)}`}
          subtitle={`${transactions.filter(t => t.type === 'expense').length} transactions`}
          color="red"
        />

        {/* Balance */}
        <SmallStatCard
          icon={<DollarSign className="w-5 h-5" />}
          title="Balance"
          value={`$${summary.balance.toFixed(2)}`}
          subtitle={summary.balance >= 0 ? 'Surplus' : 'Deficit'}
          color="blue"
        />
      </div>

      {/* Monthly Expenses Chart */}
      {user && (
        <MonthlyExpensesChart userId={user.id} />
      )}

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Spending Categories</h2>
          <div className="space-y-3">
            {topCategories.map((cat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.category}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">${cat.amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(cat.amount / summary.totalExpense) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="all">All Months</option>
            {getAvailableMonths().map(month => (
              <option key={month} value={month}>
                {format(new Date(month + '-01'), 'MMMM yyyy')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {sortedDates.length > 0 ? (
          sortedDates.map(date => (
            <div key={date} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
              </h3>
              <div className="space-y-3">
                {groupedTransactions[date].map(transaction => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={setEditingTransaction}
                    onDelete={handleDeleteTransaction}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No transactions found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Add your first transaction
            </button>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <TransactionModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTransaction}
        />
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={(data) => handleUpdateTransaction(editingTransaction.id, data)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        type="delete"
        title="Delete Transaction?"
        message={`Are you sure you want to delete "${deleteModal.transactionName}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={isDeleting}
      />
    </div>
  );
};

// Small StatCard Component - Match Dashboard
const SmallStatCard = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        {icon}
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
};

// Transaction Card Component
const TransactionCard = ({ transaction, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const isIncome = transaction.type === 'income';

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
      isIncome 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
        : 'bg-red-50 dark:bg-red-900/20 border-red-500'
    }`}>
      <div className="flex items-center gap-4 flex-1">
        {/* Icon */}
        <div className={`p-3 rounded-lg ${
          isIncome 
            ? 'bg-green-100 dark:bg-green-900/30' 
            : 'bg-red-100 dark:bg-red-900/30'
        }`}>
          {isIncome ? (
            <TrendingUp className={`w-6 h-6 ${
              isIncome 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`} />
          ) : (
            <TrendingDown className={`w-6 h-6 ${
              isIncome 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`} />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">{transaction.category}</h4>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              isIncome 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {transaction.type}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{transaction.description}</p>
        </div>

        {/* Amount */}
        <div className="text-right">
          <p className={`text-xl font-bold ${
            isIncome 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {isIncome ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {format(new Date(transaction.date), 'h:mm a')}
          </p>
        </div>
      </div>

      {/* Actions Menu */}
      <div className="relative ml-4" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                onEdit(transaction);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => {
                onDelete(transaction.id);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Transaction Modal Component
const TransactionModal = ({ transaction, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense',
    amount: transaction?.amount || '',
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: transaction?.date ? format(new Date(transaction.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  });

  const expenseCategories = ['Food', 'Business', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Rent', 'Other'];
  const incomeCategories = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  formData.type === 'income'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  formData.type === 'expense'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select category</option>
              {(formData.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="Add a note..."
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {transaction ? 'Update' : 'Add'} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Budget;