// src/routes/books.js - Simple Book Library Routes

import express from 'express';
import { sequelize } from '../config/database.js';

const router = express.Router();

// Get all books for user
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    const books = await sequelize.query(
      `SELECT id, user_id, title, author, status, cover_url, created_at 
       FROM books 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      {
        replacements: [user_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    const book = await sequelize.query(
      `SELECT * FROM books WHERE id = ? AND user_id = ?`,
      {
        replacements: [id, user_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!book || book.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({
      success: true,
      data: book[0]
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add book
router.post('/', async (req, res) => {
  try {
    const { user_id, title, author, status, cover_url } = req.body;

    if (!user_id || !title || !author) {
      return res.status(400).json({ error: 'user_id, title, and author required' });
    }

    const result = await sequelize.query(
      `INSERT INTO books (user_id, title, author, status, cover_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      {
        replacements: [user_id, title, author, status || 'Pending', cover_url || null],
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.status(201).json({
      success: true,
      message: 'Book added',
      id: result[0]
    });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update book status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, status, title, author, cover_url } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    // Verify ownership
    const book = await sequelize.query(
      `SELECT id FROM books WHERE id = ? AND user_id = ?`,
      {
        replacements: [id, user_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!book || book.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    if (title) {
      updates.push('title = ?');
      values.push(title);
    }
    if (author) {
      updates.push('author = ?');
      values.push(author);
    }
    if (cover_url) {
      updates.push('cover_url = ?');
      values.push(cover_url);
    }

    updates.push('updated_at = NOW()');
    values.push(id);
    values.push(user_id);

    if (updates.length > 1) {
      await sequelize.query(
        `UPDATE books SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        {
          replacements: values,
          type: sequelize.QueryTypes.UPDATE
        }
      );
    }

    res.json({
      success: true,
      message: 'Book updated'
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete book
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    // Verify ownership
    const book = await sequelize.query(
      `SELECT id FROM books WHERE id = ? AND user_id = ?`,
      {
        replacements: [id, user_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!book || book.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await sequelize.query(
      `DELETE FROM books WHERE id = ? AND user_id = ?`,
      {
        replacements: [id, user_id],
        type: sequelize.QueryTypes.DELETE
      }
    );

    res.json({
      success: true,
      message: 'Book deleted'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;