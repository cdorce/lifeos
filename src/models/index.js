import User from './User.model.js';
import Task from './Task.model.js';
import Transaction from './Transaction.model.js';
import Project from './Project.model.js';
import ProjectTask from './ProjectTask.model.js';
import FocusSession from './FocusSession.model.js';
import TimeBlock from './TimeBlock.model.js';

// User associations
User.hasMany(Task, { foreignKey: 'user_id', as: 'tasks' });
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
User.hasMany(Project, { foreignKey: 'user_id', as: 'projects' });
User.hasMany(FocusSession, { foreignKey: 'user_id', as: 'focusSessions' });
User.hasMany(TimeBlock, { foreignKey: 'user_id', as: 'timeBlocks' });

// Task associations
Task.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Transaction associations
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Project associations
Project.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Project.hasMany(ProjectTask, { foreignKey: 'project_id', as: 'tasks' });

// ProjectTask associations
ProjectTask.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// FocusSession associations
FocusSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// TimeBlock associations
TimeBlock.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  User,
  Task,
  Transaction,
  Project,
  ProjectTask,
  FocusSession,
  TimeBlock
};