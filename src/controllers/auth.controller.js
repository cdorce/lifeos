import authService from '../services/auth.service.js';
import User from '../models/User.model.js';
import { sendTokenResponse } from '../utils/jwt.js';

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide name, email, and password'
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Passwords do not match'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 6 characters'
        });
      }

      const user = await authService.createUser({ name, email, password });
      console.log('✅ User registered:', user.email);
      
      sendTokenResponse(user, 201, res);
    } catch (error) {
      console.error('❌ Register error:', error.message);
      if (error.message.includes('Email already registered')) {
        return res.status(409).json({
          status: 'error',
          message: 'Email already registered'
        });
      }
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      console.log('\n🔐 [LOGIN] Attempting login for:', email);

      // Validation
      if (!email || !password) {
        console.log('❌ Missing email or password');
        return res.status(400).json({
          status: 'error',
          message: 'Please provide email and password'
        });
      }

      // Find user
      const user = await authService.findUserByEmail(email);
      console.log('   User found:', user ? 'YES' : 'NO');

      if (!user) {
        console.log('❌ User not found');
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      // Compare passwords using bcrypt
      console.log('   Comparing passwords with bcrypt...');
      const isMatch = await User.comparePassword(password, user.password);

      if (!isMatch) {
        console.log('❌ Password mismatch');
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      console.log('✅ Login successful\n');
      sendTokenResponse(user, 200, res);
    } catch (error) {
      console.error('❌ Login error:', error.message);
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.findUserById(req.user.id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      res.status(200).json({
        status: 'success',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          theme: user.theme
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
      });

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { name, email, theme, avatar } = req.body;
      
      const user = await authService.updateUser(req.user.id, {
        name,
        email,
        theme,
        avatar
      });

      res.status(200).json({
        status: 'success',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          theme: user.theme
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();