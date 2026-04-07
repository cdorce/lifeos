import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const FocusSession = sequelize.define('FocusSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  type: {
    type: DataTypes.ENUM('pomodoro', 'short-break', 'long-break', 'custom'),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: false
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  task: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'focus_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default FocusSession;