// services/libraryService.js
// Configure this with your actual backend URL
const API_BASE_URL = 'http://localhost:5000/api';

const libraryService = {
  // Get all books for current user
  getAllBooks: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/library/books`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  // Get single book
  getBook: async (bookId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/library/books/${bookId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  },

  // Create new book
  createBook: async (bookData) => {
    try {
      const formData = new FormData();
      formData.append('title', bookData.title);
      formData.append('author', bookData.author);
      formData.append('status', bookData.status);
      formData.append('pages', bookData.pages);
      formData.append('current_page', bookData.current_page || 0);
      formData.append('rating', bookData.rating || 0);
      formData.append('format', bookData.format);
      
      if (bookData.file) {
        formData.append('file', bookData.file);
      }

      const response = await fetch(`${API_BASE_URL}/library/books`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  // Update book (title, author, status, current_page, rating, etc.)
  updateBook: async (bookId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/library/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  },

  // Delete book
  deleteBook: async (bookId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/library/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  },

  // Get books by status
  getBooksByStatus: async (status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/library/books?status=${status}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching books by status:', error);
      throw error;
    }
  },

  // Search books
  searchBooks: async (query) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/library/books/search?q=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  },

  // Get reading statistics
  getReadingStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/library/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching reading stats:', error);
      throw error;
    }
  },

  // Update reading progress (current_page)
  updateReadingProgress: async (bookId, currentPage) => {
    try {
      const response = await fetch(`${API_BASE_URL}/library/books/${bookId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ current_page: currentPage })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating reading progress:', error);
      throw error;
    }
  },

  // Rate book
  rateBook: async (bookId, rating) => {
    try {
      const response = await fetch(`${API_BASE_URL}/library/books/${bookId}/rate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ rating })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error rating book:', error);
      throw error;
    }
  },

  // Download book
  downloadBook: async (bookId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/library/books/${bookId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.blob();
    } catch (error) {
      console.error('Error downloading book:', error);
      throw error;
    }
  }
};

export default libraryService;