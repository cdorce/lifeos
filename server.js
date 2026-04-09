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

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://lifeos.clefftonwidmaer.com'
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from public folder (React build)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
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

// TEST LOGIN ENDPOINT - for debugging
app.post('/api/auth/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('\n🧪 ========== TEST LOGIN DEBUG ==========');
    console.log('📧 Email:', email);
    console.log('🔑 Password sent:', password, '(length:', password.length, ')');
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // Query database directly
    console.log('🔍 Querying database...');
    const user = await User.findOne({ 
      where: { email },
      attributes: { include: ['password'] },
      raw: true  // Get raw data, not Sequelize instance
    });
    
    console.log('✅ Query result:', user ? 'USER FOUND' : 'NO USER');
    
    if (!user) {
      console.log('❌ User not found in database');
      console.log('🧪 ========== END TEST ==========\n');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('📝 User details:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Password in DB:', JSON.stringify(user.password));
    console.log('   DB password length:', user.password ? user.password.length : 'NULL');
    console.log('   DB password type:', typeof user.password);
    console.log('   Sent password:', JSON.stringify(password));
    console.log('   Sent password type:', typeof password);
    
    // Byte-by-byte comparison
    console.log('   Byte comparison:');
    if (user.password) {
      for (let i = 0; i < Math.max(user.password.length, password.length); i++) {
        const dbChar = user.password[i] || 'MISSING';
        const sentChar = password[i] || 'MISSING';
        const match = dbChar === sentChar ? '✅' : '❌';
        console.log(`     [${i}] DB: '${dbChar}' (${user.password.charCodeAt(i)}) vs Sent: '${sentChar}' (${password.charCodeAt(i)}) ${match}`);
      }
    }
    
    console.log('   Exact match (===):', user.password === password);
    console.log('   Loose match (==):', user.password == password);
    console.log('   Trim match:', (user.password || '').trim() === (password || '').trim());

    if (user.password !== password) {
      console.log('❌ Password mismatch!');
      console.log('🧪 ========== END TEST ==========\n');
      return res.status(401).json({ error: 'Invalid password' });
    }

    console.log('✅ Password verified!');
    console.log('🧪 ========== END TEST ==========\n');
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('❌ Test error:', err.message);
    console.log('🧪 ========== END TEST (ERROR) ==========\n');
    res.status(500).json({ error: err.message });
  }
});

// Test path info
app.get('/api/test-path', (req, res) => {
  res.json({
    __dirname: __dirname,
    uploadPath: path.join(__dirname, 'public/uploads'),
    filesExist: fs.existsSync(path.join(__dirname, 'public/uploads'))
  });
});

// Serve React app for all non-API routes (MUST BE BEFORE error handler)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler (MUST BE LAST)
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
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📚 Books API: http://localhost:${PORT}/api/books`);
      console.log(`🌍 Language API: http://localhost:${PORT}/api/language`);
      console.log(`🧪 Test Login: POST http://localhost:${PORT}/api/auth/test-login`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

startServer();