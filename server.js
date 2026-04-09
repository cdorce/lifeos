import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './src/routes/auth.routes.js';
import taskRoutes from './src/routes/tasks.routes.js';
import budgetRoutes from './src/routes/budget.routes.js';
import projectRoutes from './src/routes/project.routes.js';
import bookRoutes from './src/routes/books.routes.js';
import focusRoutes from './src/routes/focus.routes.js';
import aiRoutes from './src/routes/ai.routes.js';
import languageRoutes from './src/routes/language.routes.js';
import { sequelize, connectDB } from './src/config/database.js';
import musicRoutes from './src/routes/music.js';
import { User } from './src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public', 'dist')));

// ✅ API ROUTES FIRST
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/language', languageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/uploaded', express.static(path.join(__dirname, 'public/uploads'))); 
app.use('/api/music', musicRoutes);
app.use('/api/books', bookRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'LifeOS API is running!',
    timestamp: new Date().toISOString()
  });
});

// TEST LOGIN
app.post('/api/auth/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const user = await User.findOne({ 
      where: { email },
      attributes: { include: ['password'] },
      raw: true
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test path
app.get('/api/test-path', (req, res) => {
  res.json({
    __dirname: __dirname,
    uploadPath: path.join(__dirname, 'public/uploads'),
    filesExist: fs.existsSync(path.join(__dirname, 'public/uploads'))
  });
});

// ✅ CATCH-ALL REACT ROUTE - MUST BE LAST
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dist', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

startServer();