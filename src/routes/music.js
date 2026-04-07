// src/routes/music.js - Music Library Routes (FIXED - Middleware for Album Capture)

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sequelize } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ============================================
// MULTER SETUP FOR FILE UPLOADS
// ============================================

const uploadDir = path.join(__dirname, '../../public/uploads/music');

// Create upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created upload directory:', uploadDir);
}

// ============================================
// CUSTOM MIDDLEWARE TO CAPTURE ALBUM
// ============================================

router.use((req, res, next) => {
  // Capture album from query params BEFORE multer sees the request
  if (req.path === '/upload' || req.path === '/test-upload') {
    req.uploadAlbum = req.query.album || 'Uncategorized';
    console.log('🔍 [MIDDLEWARE] Captured album from query:', req.uploadAlbum);
  }
  next();
});

// ============================================
// MULTER STORAGE CONFIG
// ============================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use the album captured by middleware from query params
    const album = req.uploadAlbum || 'Uncategorized';
    console.log('📁 [MULTER] Using album from middleware:', album);
    
    const albumDir = path.join(uploadDir, album);
    
    if (!fs.existsSync(albumDir)) {
      fs.mkdirSync(albumDir, { recursive: true });
      console.log('✅ [MULTER] Created directory:', albumDir);
    }
    
    console.log('📁 [MULTER] Saving file to:', albumDir);
    cb(null, albumDir);
  },
  filename: (req, file, cb) => {
    console.log('📄 [MULTER] Original filename:', file.originalname);
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/flac',
    'audio/mp4',
    'audio/aac',
    'audio/webm'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed (mp3, wav, ogg, flac, m4a, aac)'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

// ============================================
// SPECIFIC ROUTES (MUST BE BEFORE /:id)
// ============================================

// TEST: Simple file upload test
router.post('/test-upload', upload.single('file'), (req, res) => {
  console.log('\n====== 🧪 TEST UPLOAD ======');
  console.log('File received:', req.file ? 'YES' : 'NO');
  console.log('File details:', {
    fieldname: req.file?.fieldname,
    filename: req.file?.originalname,
    path: req.file?.path,
    destination: req.file?.destination,
    size: req.file?.size
  });
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('Album used:', req.uploadAlbum);
  
  if (!req.file) {
    console.log('❌ No file received');
    return res.status(400).json({ error: 'No file received' });
  }
  
  console.log('✅ Test upload successful!');
  res.json({
    received: true,
    filename: req.file.filename,
    path: req.file.path,
    destination: req.file.destination,
    size: req.file.size,
    album: req.uploadAlbum,
    message: 'File received successfully!'
  });
});

// UPLOAD SONG ENDPOINT
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('\n====== 📀 MUSIC UPLOAD START ======');
    console.log('Query params:', req.query);
    console.log('Body:', req.body);
    console.log('Album from middleware:', req.uploadAlbum);
    console.log('File:', {
      filename: req.file?.filename,
      destination: req.file?.destination,
      size: req.file?.size
    });

    if (!req.file) {
      console.error('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const user_id = req.query.user_id || req.body.user_id;
    const album = req.uploadAlbum; // Use from middleware
    const { title, artist, genre } = req.body;

    console.log('📊 Parsed values:');
    console.log('  user_id:', user_id);
    console.log('  album:', album);
    console.log('  title:', title);
    console.log('  artist:', artist);

    if (!user_id || !title || !artist) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_id, title, artist'
      });
    }

    const filePath = `/uploads/music/${album}/${req.file.filename}`;

    console.log('📁 File paths:');
    console.log('  Database path:', filePath);
    console.log('  Actual path:', req.file.path);

    // Verify paths match
    const actualPath = req.file.path.replace(/\\/g, '/');
    const expectedPath = path.join(uploadDir, album, req.file.filename).replace(/\\/g, '/');
    
    if (actualPath !== expectedPath) {
      console.warn('⚠️  PATH MISMATCH!');
      console.warn('  Expected:', expectedPath);
      console.warn('  Actual:', actualPath);
    } else {
      console.log('✅ Paths match!');
    }

    // Insert into database
    const result = await sequelize.query(
      `INSERT INTO music_library 
       (user_id, title, artist, album, file_path, duration_seconds, file_format, file_size, genre)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          user_id,
          title.trim(),
          artist.trim(),
          album,
          filePath,
          null,
          req.file.mimetype,
          req.file.size,
          genre || album
        ],
        type: sequelize.QueryTypes.INSERT
      }
    );

    console.log('✅ Song inserted with ID:', result[0]);
    console.log('====== 📀 MUSIC UPLOAD SUCCESS ======\n');

    res.json({
      success: true,
      message: 'Song uploaded successfully',
      data: {
        id: result[0],
        title: title.trim(),
        artist: artist.trim(),
        album: album,
        filePath: filePath
      }
    });

  } catch (error) {
    console.error('❌ [UPLOAD] Error:', error.message);
    console.log('====== 📀 MUSIC UPLOAD FAILED ======\n');
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload song'
    });
  }
});

// DIAGNOSTIC: Check what files actually exist
router.get('/diagnose/files', async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../../public/uploads/music');
    
    const walkDir = (dir) => {
      let results = [];
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          results = results.concat(walkDir(filePath));
        } else {
          results.push({
            file: file,
            path: filePath,
            urlPath: filePath.replace(/\\/g, '/').split('public')[1],
            size: stat.size
          });
        }
      }
      return results;
    };
    
    const files = walkDir(uploadDir);
    
    res.json({
      uploadDir: uploadDir,
      filesFound: files.length,
      files: files
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all playlists for user
router.get('/playlists/list', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    const playlists = await sequelize.query(
      `
      SELECT 
        mp.*,
        COUNT(ps.id) as song_count
      FROM music_playlists mp
      LEFT JOIN playlist_songs ps ON mp.id = ps.playlist_id
      WHERE mp.user_id = ?
      GROUP BY mp.id
      ORDER BY mp.created_at DESC
      `,
      {
        replacements: [user_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: playlists,
      count: playlists.length
    });

  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GENERIC ROUTES (AFTER SPECIFIC ROUTES)
// ============================================

// Get all music for user
router.get('/get', async (req, res) => {
  try {
    const { user_id, genre, playlist_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    let query, replacements = [];

    if (playlist_id) {
      query = `
        SELECT m.* FROM music_library m
        JOIN playlist_songs ps ON m.id = ps.music_id
        WHERE ps.playlist_id = ? AND m.user_id = ?
        ORDER BY ps.order_index ASC
      `;
      replacements = [playlist_id, user_id];
    } else {
      query = 'SELECT * FROM music_library WHERE user_id = ?';
      replacements = [user_id];

      if (genre) {
        query += ' AND genre = ?';
        replacements.push(genre);
      }

      query += ' ORDER BY created_at DESC';
    }

    const songs = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: songs,
      count: songs.length
    });

  } catch (error) {
    console.error('Error fetching music:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single music
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    const music = await sequelize.query(
      'SELECT * FROM music_library WHERE id = ? AND user_id = ?',
      {
        replacements: [id, user_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!music || music.length === 0) {
      return res.status(404).json({ error: 'Music not found' });
    }

    res.json({
      success: true,
      data: music[0]
    });

  } catch (error) {
    console.error('Error fetching music:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create playlist
router.post('/playlists/create', async (req, res) => {
  try {
    const { user_id, name, description } = req.body;

    if (!user_id || !name) {
      return res.status(400).json({ error: 'user_id and name required' });
    }

    const result = await sequelize.query(
      `INSERT INTO music_playlists 
       (user_id, name, description)
       VALUES (?, ?, ?)`,
      {
        replacements: [user_id, name, description || null],
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.status(201).json({
      success: true,
      message: 'Playlist created',
      id: result[0]
    });

  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add song to playlist
router.post('/playlists/:id/add-song', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, music_id } = req.body;

    if (!user_id || !music_id) {
      return res.status(400).json({ error: 'user_id and music_id required' });
    }

    const playlist = await sequelize.query(
      'SELECT id FROM music_playlists WHERE id = ? AND user_id = ?',
      {
        replacements: [id, user_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!playlist || playlist.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const maxOrder = await sequelize.query(
      'SELECT MAX(order_index) as max_index FROM playlist_songs WHERE playlist_id = ?',
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    const nextIndex = (maxOrder[0]?.max_index || 0) + 1;

    await sequelize.query(
      `INSERT INTO playlist_songs (playlist_id, music_id, order_index)
       VALUES (?, ?, ?)`,
      {
        replacements: [id, music_id, nextIndex],
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.status(201).json({
      success: true,
      message: 'Song added to playlist'
    });

  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// Track listening session
router.post('/track-listen', async (req, res) => {
  try {
    const {
      music_id,
      user_id,
      playlist_id,
      duration_listened_seconds,
      completed
    } = req.body;

    if (!music_id || !user_id) {
      return res.status(400).json({ error: 'music_id and user_id required' });
    }

    const music = await sequelize.query(
      'SELECT id FROM music_library WHERE id = ? AND user_id = ?',
      {
        replacements: [music_id, user_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!music || music.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await sequelize.query(
      `INSERT INTO music_listening_sessions 
       (music_id, user_id, playlist_id, duration_listened_seconds, completed, session_date)
       VALUES (?, ?, ?, ?, ?, CURDATE())`,
      {
        replacements: [music_id, user_id, playlist_id || null, duration_listened_seconds || null, completed ? 1 : 0],
        type: sequelize.QueryTypes.INSERT
      }
    );

    await sequelize.query(
      `UPDATE music_library 
       SET play_count = play_count + 1, last_played = NOW()
       WHERE id = ?`,
      {
        replacements: [music_id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.json({
      success: true,
      message: 'Listening session tracked',
      music_id,
      session_date: new Date().toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('Error tracking listen:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create music entry
router.post('/create', async (req, res) => {
  try {
    const {
      user_id,
      title,
      artist,
      album,
      file_path,
      duration_seconds,
      file_format,
      file_size,
      genre
    } = req.body;

    if (!user_id || !title || !file_path) {
      return res.status(400).json({ error: 'user_id, title, and file_path required' });
    }

    const result = await sequelize.query(
      `INSERT INTO music_library 
       (user_id, title, artist, album, file_path, duration_seconds, file_format, file_size, genre)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [user_id, title, artist || null, album || null, file_path, duration_seconds || null, 
         file_format || 'mp3', file_size || null, genre || null],
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.status(201).json({
      success: true,
      message: 'Music created',
      id: result[0]
    });

  } catch (error) {
    console.error('Error creating music:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete music
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    console.log('\n====== 🗑️ DELETE MUSIC START ======');
    console.log('ID:', id, 'User:', user_id);

    // Get the file path before deleting from database
    const music = await sequelize.query(
      'SELECT file_path FROM music_library WHERE id = ? AND user_id = ?',
      {
        replacements: [id, user_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!music || music.length === 0) {
      console.log('❌ Music not found');
      return res.status(404).json({ error: 'Music not found' });
    }

    const filePath = music[0].file_path;
    console.log('📁 File path from DB:', filePath);

    // Step 1: Delete from playlist_songs FIRST (child table)
    console.log('🗑️  Deleting from playlist_songs...');
    await sequelize.query(
      'DELETE FROM playlist_songs WHERE music_id = ?',
      {
        replacements: [id],
        type: sequelize.QueryTypes.DELETE
      }
    );
    console.log('✅ Deleted from playlist_songs');

    // Step 2: Delete from music_library (parent table)
    console.log('🗑️  Deleting from music_library...');
    const result = await sequelize.query(
      'DELETE FROM music_library WHERE id = ? AND user_id = ?',
      {
        replacements: [id, user_id],
        type: sequelize.QueryTypes.DELETE
      }
    );
    console.log('✅ Deleted from music_library');

    // Step 3: Delete the actual file
    if (filePath) {
      // Convert database path to actual file path
      const actualFilePath = path.join(__dirname, '../../public', filePath);
      console.log('🗑️ Attempting to delete file:', actualFilePath);

      if (fs.existsSync(actualFilePath)) {
        fs.unlinkSync(actualFilePath);
        console.log('✅ File deleted successfully');
      } else {
        console.warn('⚠️ File not found at path:', actualFilePath);
      }
    }

    console.log('====== 🗑️ DELETE MUSIC SUCCESS ======\n');

    res.json({
      success: true,
      message: 'Music deleted successfully',
      deleted: {
        id: id,
        filePath: filePath
      }
    });

  } catch (error) {
    console.error('❌ Error deleting music:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;