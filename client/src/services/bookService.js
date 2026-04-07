import api from './api';

class BookService {
  async getAllBooks() {
    const response = await api.get('/books/books');
    return response.data.books || [];
  }

  async getBookById(id) {
    const response = await api.get(`/books/books/${id}`);
    return response.data.book;
  }

    async createBook(bookData, pdfFile) {
    const formData = new FormData();
    
    console.log('=== CREATING BOOK ===');
    console.log('Book Data:', bookData);
    console.log('PDF File:', pdfFile);
    
    // Add book metadata
    Object.keys(bookData).forEach(key => {
      if (bookData[key] !== null && bookData[key] !== undefined && bookData[key] !== '') {
        formData.append(key, bookData[key]);
        console.log(`Added field: ${key} = ${bookData[key]}`);
      }
    });

    // Add PDF file if provided
    if (pdfFile) {
      formData.append('pdf', pdfFile);
      console.log('✅ Added PDF file:', pdfFile.name, pdfFile.size, 'bytes');
    } else {
      console.log('⚠️ No PDF file to upload');
    }

    console.log('===================');

    const response = await api.post('/books/books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    return response.data.book;
  }
  async updateBook(id, bookData) {
    const response = await api.put(`/books/books/${id}`, bookData);
    return response.data.book;
  }

  async updateProgress(id, progressData) {
    const response = await api.put(`/books/books/${id}/progress`, progressData);
    return response.data.book;
  }

  async deleteBook(id) {
    await api.delete(`/books/books/${id}`);
  }

  async getReadingStats() {
    const response = await api.get('/books/books/stats');
    return response.data.stats;
  }

  getPdfUrl(book) {
    if (!book || !book.pdf_url) return null;
    return `http://localhost:5000${book.pdf_url}`;
  }
}

export default new BookService();