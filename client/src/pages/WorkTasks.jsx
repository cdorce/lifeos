import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Tag, MoreVertical, Edit2, Trash2, Check, TrendingUp, Clock } from 'lucide-react';
import taskService from '../services/taskService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import ConfirmationModal from '../components/common/ConfirmationModal';

const WorkTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    taskId: null,
    taskTitle: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    overdue: 0
  });

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const allTasks = await taskService.getAllTasks({ type: 'work' });
      setTasks(allTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const taskStats = await taskService.getTaskStats('work');
      
      // Calculate overdue tasks
      const now = new Date();
      const overdueTasks = tasks.filter(task => 
        task.status !== 'completed' && 
        task.due_date && 
        new Date(task.due_date) < now
      ).length;

      setStats({
        total: taskStats.total,
        active: taskStats.pending + taskStats.inProgress,
        completed: taskStats.completed,
        overdue: taskStats.overdue || overdueTasks
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      await taskService.createTask({ ...taskData, type: 'work' });
      toast.success('Task created successfully!');
      setShowAddModal(false);
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await taskService.updateTask(taskId, updates);
      toast.success('Task updated successfully!');
      setEditingTask(null);
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setDeleteModal({
      isOpen: true,
      taskId: taskId,
      taskTitle: task?.title || 'Task'
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await taskService.deleteTask(deleteModal.taskId);
      toast.success('Task deleted successfully!');
      setDeleteModal({ isOpen: false, taskId: null, taskTitle: '' });
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, taskId: null, taskTitle: '' });
  };

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await handleUpdateTask(task.id, { status: newStatus });
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Group tasks by status
  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Work Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your professional tasks and projects</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Active</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 bg-green-50 dark:bg-green-900/20">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-300">{stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400 mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-900 dark:text-red-300">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search work tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-6">
        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <TaskSection
            title="Pending"
            icon={<Clock className="w-5 h-5" />}
            color="yellow"
            tasks={pendingTasks}
            onToggleComplete={handleToggleComplete}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
          />
        )}

        {/* In Progress Tasks */}
        {inProgressTasks.length > 0 && (
          <TaskSection
            title="In Progress"
            icon={<TrendingUp className="w-5 h-5" />}
            color="blue"
            tasks={inProgressTasks}
            onToggleComplete={handleToggleComplete}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
          />
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <TaskSection
            title="Completed"
            icon={<Check className="w-5 h-5" />}
            color="green"
            tasks={completedTasks}
            onToggleComplete={handleToggleComplete}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
          />
        )}

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No work tasks found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Create your first work task
            </button>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <TaskModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTask}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(data) => handleUpdateTask(editingTask.id, data)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        type="delete"
        title="Delete Task?"
        message={`Are you sure you want to delete "${deleteModal.taskTitle}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={isDeleting}
      />
    </div>
  );
};

// TaskSection Component
const TaskSection = ({ title, icon, color, tasks, onToggleComplete, onEdit, onDelete }) => {
  const colorClasses = {
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
  };

  const headerColorClasses = {
    yellow: 'text-yellow-700 dark:text-yellow-300',
    blue: 'text-blue-700 dark:text-blue-300',
    green: 'text-green-700 dark:text-green-300'
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className={headerColorClasses[color]}>{icon}</span>
        <h2 className={`text-xl font-bold ${headerColorClasses[color]}`}>{title}</h2>
        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${headerColorClasses[color]} bg-white dark:bg-gray-800`}>
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

// TaskCard Component
const TaskCard = ({ task, onToggleComplete, onEdit, onDelete }) => {
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

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-600">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task)}
          className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.status === 'completed'
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
          }`}
        >
          {task.status === 'completed' && <Check className="w-3 h-3 text-white" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 dark:text-white ${task.status === 'completed' ? 'line-through opacity-50' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Priority */}
            <span className={`px-2 py-1 rounded border text-xs font-medium ${getPriorityColor()}`}>
              {task.priority}
            </span>

            {/* Category */}
            {task.category && (
              <span className="px-2 py-1 rounded border text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                {task.category}
              </span>
            )}

            {/* Due Date */}
            {task.due_date && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                <Calendar className="w-3 h-3" />
                {format(new Date(task.due_date), 'MMM dd, yyyy')}
                {isOverdue && ' (Overdue)'}
              </span>
            )}

            {/* Tags */}
            {task.tags && Array.isArray(task.tags) && task.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <Tag className="w-3 h-3 text-gray-400" />
                {task.tags.map((tag, index) => (
                  <span key={index} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative" ref={menuRef}>
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
                  onEdit(task);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(task.id);
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
    </div>
  );
};

// TaskModal Component (same as PersonalTasks)
const TaskModal = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    category: task?.category || '',
    due_date: task?.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '',
    tags: task?.tags?.join(', ') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };

    onSave(taskData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              required
            />
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
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="e.g. Projects, Meetings"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="development, urgent"
            />
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
              {task ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkTasks;