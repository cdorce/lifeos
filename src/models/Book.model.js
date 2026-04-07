import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Book = sequelize.define('Book', {
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
  author: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cover_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Reading', 'Completed'),
    allowNull: false,
    defaultValue: 'Pending'
  }
}, {
  tableName: 'books',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Book;