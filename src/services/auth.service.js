import User from '../models/User.model.js';

class AuthService {
  async createUser({ name, email, password }) {
    try {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        throw new Error('Email already registered');
      }

      const user = await User.create({
        name,
        email,
        password: password,
        theme: 'dark'
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async findUserByEmail(email) {
    try {
      // ✅ DO NOT use raw: true - we need Sequelize instance for comparePassword method
      const user = await User.findOne({ 
        where: { email }
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async findUserById(id) {
    try {
      return await User.findByPk(id);
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id, { name, email, theme, avatar }) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error('User not found');
      }

      if (name) user.name = name;
      if (email) user.email = email;
      if (theme) user.theme = theme;
      if (avatar) user.avatar = avatar;

      await user.save();
      return user;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();