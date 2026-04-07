import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  theme: {
    type: DataTypes.ENUM('light', 'dark'),
    defaultValue: 'dark'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        console.log("🔐 [USER] Hashing password on create");
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        console.log("✅ [USER] Password hashed");
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        console.log("🔐 [USER] Hashing password on update");
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        console.log("✅ [USER] Password hashed");
      }
    }
  }
});

// ✅ Add instance method properly
User.prototype.comparePassword = async function(enteredPassword) {
  console.log('🔐 [AUTH] Comparing passwords...');
  
  if (!this.password) {
    console.error('❌ [AUTH] No password hash stored');
    return false;
  }

  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('🔐 [AUTH] Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('❌ [AUTH] Password comparison error:', error.message);
    return false;
  }
};

// ✅ Also add static method as backup
User.comparePassword = async function(enteredPassword, hashedPassword) {
  console.log('🔐 [AUTH] Comparing passwords (static)...');
  
  if (!hashedPassword) {
    console.error('❌ [AUTH] No password hash provided');
    return false;
  }

  try {
    const isMatch = await bcrypt.compare(enteredPassword, hashedPassword);
    console.log('🔐 [AUTH] Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('❌ [AUTH] Password comparison error:', error.message);
    return false;
  }
};

export default User;