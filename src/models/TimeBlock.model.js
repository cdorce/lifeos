import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const TimeBlock = sequelize.define('TimeBlock', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: false
  },
  color: {
    type: DataTypes.STRING(50),
    defaultValue: 'blue'
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'time_blocks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default TimeBlock;