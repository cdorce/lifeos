import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ProjectTask = sequelize.define('ProjectTask', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('todo', 'in-progress', 'review', 'completed'),
    defaultValue: 'todo'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  assignee: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'project_tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default ProjectTask;