import { sequelize } from '../config/database.js';

class BookController {
  // Get all books for user
  async getAllBooks(req, res) {
    try {
      const [books] = await sequelize.query(
        `SELECT * FROM books WHERE user_id = ? ORDER BY created_at DESC`,
        {
          replacements: [req.user.id]
        }
      );

      res.json({
        status: 'success',
        count: books.length,
        books: books
      });
    } catch (error) {
      console.error('Get books error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch books'
      });
    }
  }

  async getBookById(req, res) {
    try {
      const [books] = await sequelize.query(
        'SELECT * FROM books WHERE id = ? AND user_id = ?',
        {
          replacements: [req.params.id, req.user.id]
        }
      );

      if (books.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Book not found'
        });
      }

      res.json({
        status: 'success',
        book: books[0]
      });
    } catch (error) {
      console.error('Get book error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch book'
      });
    }
  }

  // Create book
  async createBook(req, res) {
    try {
      const { title, author, cover_url, status } = req.body;

      if (!title || !author) {
        return res.status(400).json({
          status: 'error',
          message: 'Title and author are required'
        });
      }

      await sequelize.query(
        `INSERT INTO books (user_id, title, author, cover_url, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            req.user.id,
            title,
            author,
            cover_url || null,
            status || 'Pending'
          ]
        }
      );

      const [[{ id: insertedId }]] = await sequelize.query(
        'SELECT LAST_INSERT_ID() as id'
      );

      const [newBook] = await sequelize.query(
        'SELECT * FROM books WHERE id = ?',
        {
          replacements: [insertedId]
        }
      );

      res.status(201).json({
        status: 'success',
        book: newBook[0]
      });
    } catch (error) {
      console.error('Create book error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create book'
      });
    }
  }

  async updateBook(req, res) {
    try {
      const { title, author, cover_url, status } = req.body;
      const bookId = req.params.id;
      const userId = req.user.id;
      const [books] = await sequelize.query(
        'SELECT * FROM books WHERE id = ? AND user_id = ?',
        {
          replacements: [bookId, userId]
        }
      );

      if (books.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Book not found'
        });
      }

      const currentBook = books[0];

      const updateData = {
        title: title !== undefined ? title : currentBook.title,
        author: author !== undefined ? author : currentBook.author,
        cover_url: cover_url !== undefined ? cover_url : currentBook.cover_url,
        status: status !== undefined ? status : currentBook.status
      };

      await sequelize.query(
        `UPDATE books 
         SET title = ?, author = ?, cover_url = ?, status = ?, updated_at = NOW()
         WHERE id = ? AND user_id = ?`,
        {
          replacements: [
            updateData.title,
            updateData.author,
            updateData.cover_url,
            updateData.status,
            bookId,
            userId
          ]
        }
      );

      const [updatedBook] = await sequelize.query(
        'SELECT * FROM books WHERE id = ?',
        {
          replacements: [bookId]
        }
      );

      res.json({
        status: 'success',
        book: updatedBook[0]
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to update book',
        error: error.message
      });
    }
  }

  async deleteBook(req, res) {
    try {
      const [books] = await sequelize.query(
        'SELECT * FROM books WHERE id = ? AND user_id = ?',
        {
          replacements: [req.params.id, req.user.id]
        }
      );

      if (books.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Book not found'
        });
      }

      await sequelize.query(
        'DELETE FROM books WHERE id = ? AND user_id = ?',
        {
          replacements: [req.params.id, req.user.id]
        }
      );

      res.json({
        status: 'success',
        message: 'Book deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete book'
      });
    }
  }

  async getBooksByStatus(req, res) {
    try {
      const { status } = req.params;

      const validStatuses = ['Pending', 'Reading', 'Completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid status. Must be: Pending, Reading, or Completed'
        });
      }

      const [books] = await sequelize.query(
        `SELECT * FROM books WHERE user_id = ? AND status = ? ORDER BY created_at DESC`,
        {
          replacements: [req.user.id, status]
        }
      );

      res.json({
        status: 'success',
        count: books.length,
        books: books
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch books'
      });
    }
  }
}

export default new BookController();