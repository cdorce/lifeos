import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  BookOpen,
  Loader,
  Search,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    cover_url: '',
    status: 'Pending'
  });
  const [submitting, setSubmitting] = useState(false);

  const API_URL = 'http://localhost:5000/api/books';

  // Fetch books on mount
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No token found');
        toast.error('Not authenticated');
        return;
      }

      console.log('📖 Fetching books...');
      const res = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || 'Failed to fetch books');
      }

      const data = await res.json();
      console.log('✅ Books fetched:', data);
      setBooks(data.books || []);
    } catch (error) {
      console.error('❌ Fetch error:', error);
      toast.error(error.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    console.log('📝 Submitting book:', formData);

    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.author.trim()) {
      toast.error('Author is required');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      console.log('📤 Sending POST request to:', API_URL);
      console.log('📦 Payload:', {
        title: formData.title,
        author: formData.author,
        cover_url: formData.cover_url || null,
        status: formData.status
      });

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          author: formData.author.trim(),
          cover_url: formData.cover_url.trim() || null,
          status: formData.status
        })
      });

      console.log('✅ Response status:', res.status);
      const data = await res.json();
      console.log('📖 Response data:', data);

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add book');
      }

      toast.success('✅ Book added successfully!');
      setFormData({ title: '', author: '', cover_url: '', status: 'Pending' });
      setShowForm(false);
      
      // Refresh books list
      await fetchBooks();
    } catch (error) {
      console.error('❌ Add book error:', error);
      toast.error(error.message || 'Failed to add book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (bookId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      console.log(`🔄 Updating book ${bookId} status to ${newStatus}`);

      const res = await fetch(`${API_URL}/${bookId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      toast.success('✅ Status updated!');
      await fetchBooks();
    } catch (error) {
      console.error('❌ Update error:', error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      const token = localStorage.getItem('token');
      console.log(`🗑️ Deleting book ${bookId}`);

      const res = await fetch(`${API_URL}/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete book');
      }

      toast.success('✅ Book deleted!');
      await fetchBooks();
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast.error(error.message || 'Failed to delete book');
    }
  };

  // Filter and search books
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || book.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const stats = {
    total: books.length,
    pending: books.filter(b => b.status === 'Pending').length,
    reading: books.filter(b => b.status === 'Reading').length,
    completed: books.filter(b => b.status === 'Completed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <Loader className="animate-spin mr-2" size={24} />
        Loading books...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-40">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📚 Book Library</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your reading journey</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Add Book
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-300">Total Books</p>
          <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-sm text-yellow-300">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
          <p className="text-sm text-purple-300">Reading</p>
          <p className="text-2xl font-bold text-purple-400">{stats.reading}</p>
        </div>
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
          <p className="text-sm text-green-300">Completed</p>
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
        </div>
      </div>

      {/* Add Book Form */}
      {showForm && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Add New Book</h2>
            <button 
              onClick={() => setShowForm(false)} 
              className="text-gray-400 hover:text-white transition"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleAddBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Book title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Author *</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Author name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Cover Image URL</label>
              <input
                type="url"
                value={formData.cover_url}
                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="Reading">Reading</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader size={16} className="animate-spin" />
                  Adding Book...
                </div>
              ) : (
                'Add Book'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Reading">Reading</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>No books found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <div key={book.id} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition">
              {/* Cover Image */}
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-64 bg-gray-700 flex items-center justify-center">
                  <BookOpen size={48} className="text-gray-600" />
                </div>
              )}

              {/* Book Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-white truncate">{book.title}</h3>
                  <p className="text-sm text-gray-400">{book.author}</p>
                </div>

                {/* Status Badge */}
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    book.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                    book.status === 'Reading' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {book.status}
                  </span>
                </div>

                {/* Status Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(book.id, 'Pending')}
                    className={`flex-1 py-1 rounded text-xs font-medium transition ${
                      book.status === 'Pending'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(book.id, 'Reading')}
                    className={`flex-1 py-1 rounded text-xs font-medium transition ${
                      book.status === 'Reading'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Reading
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(book.id, 'Completed')}
                    className={`flex-1 py-1 rounded text-xs font-medium transition ${
                      book.status === 'Completed'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Done
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteBook(book.id)}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded transition"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Books;