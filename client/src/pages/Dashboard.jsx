import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, TrendingUp, DollarSign, BookOpen, Music, Target, Calendar } from 'lucide-react';
import taskService from '../services/taskService';
import budgetService from '../services/budgetService';
import projectService from '../services/projectService';
import focusService from '../services/focusService';
import MonthlyExpensesChart from '../components/MonthlyExpensesChart';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tasks: { total: 0, completed: 0, pending: 0, inProgress: 0 },
    budget: { totalIncome: 0, totalExpense: 0, balance: 0 },
    projects: { total: 0, active: 0 }
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const taskStats = await taskService.getTaskStats();
      const tasks = await taskService.getAllTasks();
      const budgetSummary = await budgetService.getFinancialSummary();
      const transactions = await budgetService.getAllTransactions();
      const projects = await projectService.getAllProjects();

      const activeProjects = projects.filter(p => p.status === 'active');

      setStats({
        tasks: taskStats,
        budget: budgetSummary,
        projects: { total: projects.length, active: activeProjects.length }
      });

      setRecentTasks(tasks.slice(0, 5));
      setRecentTransactions(transactions.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your overview</p>
      </div>

      {/* Monthly Expenses Chart - TOP */}
      {user && (
        <MonthlyExpensesChart userId={user.id} />
      )}

      {/* Smaller Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Tasks */}
        <SmallStatCard
          icon={<CheckCircle className="w-5 h-5" />}
          title="Tasks"
          value={stats.tasks.total}
          subtitle={`${stats.tasks.completed} done`}
          color="blue"
        />

        {/* Pending Tasks */}
        <SmallStatCard
          icon={<Clock className="w-5 h-5" />}
          title="Pending"
          value={stats.tasks.pending}
          subtitle={`${stats.tasks.inProgress} progress`}
          color="yellow"
        />

        {/* Budget Balance */}
        <SmallStatCard
          icon={<DollarSign className="w-5 h-5" />}
          title="Balance"
          value={`$${stats.budget.balance.toFixed(2)}`}
          subtitle={`Inc: $${stats.budget.totalIncome.toFixed(2)}`}
          color="green"
        />

        {/* Active Projects */}
        <SmallStatCard
          icon={<Target className="w-5 h-5" />}
          title="Projects"
          value={stats.projects.active}
          subtitle={`${stats.projects.total} total`}
          color="purple"
        />
      </div>

      {/* Recent Tasks & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Tasks</h2>
          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No tasks yet</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(transaction => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Small StatCard Component
const SmallStatCard = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-3`}>
        {icon}
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-xs font-medium">{title}</h3>
      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
};

// TaskItem Component
const TaskItem = ({ task }) => {
  const getStatusColor = () => {
    switch (task.status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'in-progress': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white truncate">{task.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{task.category || 'No category'}</p>
      </div>
      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor()}`}>
        {task.status}
      </span>
    </div>
  );
};

// TransactionItem Component
const TransactionItem = ({ transaction }) => {
  const isIncome = transaction.type === 'income';

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white truncate">{transaction.category}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{transaction.description || 'No description'}</p>
      </div>
      <span className={`font-bold whitespace-nowrap ml-2 ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isIncome ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
      </span>
    </div>
  );
};

export default Dashboard;