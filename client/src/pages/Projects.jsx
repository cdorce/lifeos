import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, Clock, User, Tag, Calendar } from 'lucide-react';
import projectService from '../services/projectService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const allProjects = await projectService.getAllProjects();
      setProjects(allProjects);
      
      // Update selectedProject if it exists
      if (selectedProject) {
        const updatedSelectedProject = allProjects.find(p => p.id === selectedProject.id);
        if (updatedSelectedProject) {
          setSelectedProject(updatedSelectedProject);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (projectData) => {
    try {
      await projectService.createProject(projectData);
      toast.success('Project created successfully!');
      setShowAddProjectModal(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleUpdateProject = async (projectId, updates) => {
    try {
      await projectService.updateProject(projectId, updates);
      toast.success('Project updated successfully!');
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectService.deleteProject(projectId);
      toast.success('Project deleted successfully!');
      setSelectedProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      await projectService.createProjectTask(selectedProject.id, {
        ...taskData,
        status: selectedColumn
      });
      toast.success('Task created successfully!');
      setShowAddTaskModal(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleMoveTask = async (taskId, newStatus) => {
    try {
      await projectService.updateProjectTask(selectedProject.id, taskId, { status: newStatus });
      fetchProjects();
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Failed to move task');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await projectService.updateProjectTask(selectedProject.id, taskId, updates);
      toast.success('Task updated successfully!');
      fetchProjects();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await projectService.deleteProjectTask(selectedProject.id, taskId);
      toast.success('Task deleted successfully!');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: 'gray' },
    { id: 'in-progress', title: 'In Progress', color: 'blue' },
    { id: 'review', title: 'Review', color: 'yellow' },
    { id: 'completed', title: 'Completed', color: 'green' }
  ];

  const getTasksByStatus = (status) => {
    if (!selectedProject || !selectedProject.tasks) return [];
    return selectedProject.tasks.filter(task => task.status === status);
  };

  // Calculate project stats
  const totalTasks = selectedProject?.tasks?.length || 0;
  const completedTasks = selectedProject?.tasks?.filter(t => t.status === 'completed').length || 0;
  const inProgressTasks = selectedProject?.tasks?.filter(t => t.status === 'in-progress').length || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your projects with Kanban boards</p>
        </div>
        <button
          onClick={() => setShowAddProjectModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Project Selector */}
      {projects.length > 0 ? (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedProject?.id === project.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>

          {/* Project Stats */}
          {selectedProject && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full bg-${selectedProject.color}-500`}></div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedProject.name}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProject.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingProject(selectedProject)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(selectedProject.id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Progress</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTasks}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressTasks}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">In Progress</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Completed</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{getTasksByStatus('review').length}</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">In Review</p>
                </div>
              </div>
            </div>
          )}

          {/* Kanban Board */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={getTasksByStatus(column.id)}
                onMoveTask={handleMoveTask}
                onDeleteTask={handleDeleteTask}
                onUpdateTask={handleUpdateTask}
                onAddTask={() => {
                  setSelectedColumn(column.id);
                  setShowAddTaskModal(true);
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No projects yet</p>
          <button
            onClick={() => setShowAddProjectModal(true)}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Create your first project
          </button>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <ProjectModal
          onClose={() => setShowAddProjectModal(false)}
          onSave={handleAddProject}
        />
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <ProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={(data) => handleUpdateProject(editingProject.id, data)}
        />
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <TaskModal
          onClose={() => setShowAddTaskModal(false)}
          defaultStatus={selectedColumn}
          onAdd={handleAddTask}
        />
      )}
    </div>
  );
};

// Kanban Column Component
const KanbanColumn = ({ column, tasks, onMoveTask, onDeleteTask, onUpdateTask, onAddTask }) => {
  const [draggedOver, setDraggedOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = () => {
    setDraggedOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDraggedOver(false);
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    
    if (taskId) {
      onMoveTask(taskId, column.id);
    }
  };

  const getColumnColor = () => {
    switch (column.color) {
      case 'gray': return 'bg-gray-100 dark:bg-gray-700';
      case 'blue': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'yellow': return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'green': return 'bg-green-100 dark:bg-green-900/30';
      default: return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  const getColumnHeaderColor = () => {
    switch (column.color) {
      case 'gray': return 'text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600';
      case 'blue': return 'text-blue-700 dark:text-blue-300 bg-blue-200 dark:bg-blue-800';
      case 'yellow': return 'text-yellow-700 dark:text-yellow-300 bg-yellow-200 dark:bg-yellow-800';
      case 'green': return 'text-green-700 dark:text-green-300 bg-green-200 dark:bg-green-800';
      default: return 'text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600';
    }
  };

  return (
    <div
      className={`flex-shrink-0 w-80 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 transition-colors ${
        draggedOver ? getColumnColor() : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900 dark:text-white">{column.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColumnHeaderColor()}`}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks */}
      <div className="space-y-3 min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            No tasks yet
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
              onUpdate={onUpdateTask}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onDelete, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id.toString());
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  // Parse tags and links
  const tags = typeof task.tags === 'string' ? JSON.parse(task.tags) : (task.tags || []);
  const links = typeof task.links === 'string' ? JSON.parse(task.links) : (task.links || []);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-white dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-all cursor-move border border-gray-200 dark:border-gray-600"
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-white flex-1">{task.title}</h4>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setIsEditing(true);
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

      {/* Priority Badge */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor()}`}>
          {task.priority}
        </span>
        {tags.length > 0 && tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 rounded text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Task Meta */}
      <div className="space-y-2 mb-3">
        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4" />
            <span>{task.assignee}</span>
          </div>
        )}

        {/* Due Date */}
        {task.due_date && (
          <div className={`flex items-center gap-2 text-sm ${
            isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
            {isOverdue && <span className="text-xs">(Overdue)</span>}
          </div>
        )}
      </div>

      {/* Links */}
      {links.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Links:</div>
          <div className="space-y-1">
            {links.map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                🔗 {link.length > 40 ? link.substring(0, 40) + '...' : link}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <TaskEditModal
          task={task}
          onClose={() => setIsEditing(false)}
          onSave={(updates) => {
            onUpdate(task.id, updates);
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
};

// Project Modal Component
const ProjectModal = ({ project, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || 'blue',
    status: project?.status || 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

          {/* Color & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color
              </label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
                <option value="orange">Orange</option>
                <option value="red">Red</option>
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
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
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
              {project ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Task Modal Component
const TaskModal = ({ onClose, defaultStatus, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    status: defaultStatus || 'todo',
    priority: 'medium',
    assignee: '',
    due_date: '',
    tags: '',
    links: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      links: formData.links ? formData.links.split('\n').map(link => link.trim()).filter(link => link) : []
    };

    onAdd(taskData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
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

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority */}
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

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignee
            </label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="Who's working on this?"
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
              placeholder="design, urgent, frontend"
            />
          </div>

          {/* Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Links (one per line)
            </label>
            <textarea
              value={formData.links}
              onChange={(e) => setFormData({ ...formData, links: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="https://docs.google.com/document/d/1234
https://sheets.google.com/spreadsheets/d/5678"
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
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Task Edit Modal
const TaskEditModal = ({ task, onClose, onSave }) => {
  const tags = typeof task.tags === 'string' ? JSON.parse(task.tags) : (task.tags || []);
  const links = typeof task.links === 'string' ? JSON.parse(task.links) : (task.links || []);
  
  const [formData, setFormData] = useState({
    title: task.title,
    priority: task.priority,
    assignee: task.assignee || '',
    due_date: task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '',
    tags: tags.join(', '),
    links: links.join('\n')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updates = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      links: formData.links ? formData.links.split('\n').map(link => link.trim()).filter(link => link) : []
    };

    onSave(updates);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              Assignee
            </label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Links (one per line)
            </label>
            <textarea
              value={formData.links}
              onChange={(e) => setFormData({ ...formData, links: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

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
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Projects;