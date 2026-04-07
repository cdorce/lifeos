// src/services/pdfService.js
// FIXED - Matches the actual book routes in backend

const API_URL = 'http://localhost:5000/api/books';

const pdfService = {
  // Get all books for user
  getAllPDFs: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/get?user_id=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  // Update progress
  updateProgress: async (data) => {
    try {
      const response = await fetch(`${API_URL}/update-progress/${data.pdf_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: data.user_id,
          current_page: data.current_page || 0,
          total_pages: data.total_pages || 0
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  // Get single book
  getBook: async (bookId, userId) => {
    try {
      const response = await fetch(`${API_URL}/${bookId}?user_id=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  },

  // Get bookmarks
  getBookmarks: async (bookId, userId) => {
    try {
      const response = await fetch(`${API_URL}/bookmarks/${bookId}?user_id=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      throw error;
    }
  },

  // Add bookmark
  addBookmark: async (bookId, userId, pageNumber, note) => {
    try {
      const response = await fetch(`${API_URL}/bookmarks/add/${bookId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          page_number: pageNumber,
          note: note || null
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  },

  // Log reading session
  logSession: async (bookId, userId, pagesRead, readingTime) => {
    try {
      const response = await fetch(`${API_URL}/log-session/${bookId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          pages_read: pagesRead || 0,
          reading_time_minutes: readingTime || 0
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error logging session:', error);
      throw error;
    }
  }
};

export default pdfService;