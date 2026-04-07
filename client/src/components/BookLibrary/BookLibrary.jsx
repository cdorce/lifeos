import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmationModal from '../common/ConfirmationModal';

const BookLibrary = () => {
  const { user } = useAuth();
  const userId = user?.id;
  
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    bookId: null,
    bookTitle: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    status: 'Pending',
    cover_url: ''
  });

  // Fetch books
  useEffect(() => {
    if (!userId) return;
    fetchBooks();
  }, [userId]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/books?user_id=${userId}`);
      const data = await response.json();
      setBooks(data.data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      // Compress image
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 400;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with lower quality
        const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
        setFormData({ ...formData, cover_url: compressedImage });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.author) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ...formData
        })
      });

      if (!response.ok) throw new Error('Failed to add book');

      toast.success('Book added successfully!');
      setFormData({ title: '', author: '', status: 'Pending', cover_url: '' });
      setShowForm(false);
      fetchBooks();
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error('Failed to add book');
    }
  };

  const handleDeleteClick = (id, title) => {
    setDeleteModal({
      isOpen: true,
      bookId: id,
      bookTitle: title
    });
  };

  const handleConfirmDelete = async () => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:5000/api/books/${deleteModal.bookId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Book deleted');
      setDeleteModal({ isOpen: false, bookId: null, bookTitle: '' });
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, bookId: null, bookTitle: '' });
  };

  const handleDelete = async (id, title) => {
    handleDeleteClick(id, title);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update');

      toast.success('Status updated');
      fetchBooks();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const statusColors = {
    Pending: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
    Reading: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
    Completed: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
    Wishlist: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700'
  };

  const statusOptions = ['Pending', 'Reading', 'Completed', 'Wishlist'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Book Library</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Book
          </button>
        </div>

        {/* Add Book Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Book</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter book title"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Enter author name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cover Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-sm text-gray-900 dark:text-gray-100
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      dark:file:bg-blue-900 dark:file:text-blue-300"
                  />
                </div>
              </div>

              {formData.cover_url && (
                <div className="flex justify-center">
                  <img src={formData.cover_url} alt="Preview" className="h-40 rounded-lg" />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Add Book
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Books Grid */}
        {loading ? (
          <div className="text-center text-gray-500">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No books yet. Add your first book!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map(book => (
              <div
                key={book.id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition"
              >
                {/* Book Cover */}
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Book Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{book.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{book.author}</p>

                  {/* Status Badge */}
                  <div className="mt-3 mb-3">
                    <select
                      value={book.status}
                      onChange={(e) => handleStatusChange(book.id, e.target.value)}
                      className={`w-full px-2 py-1 rounded text-xs font-semibold cursor-pointer border focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusColors[book.status]}`}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(book.id, book.title)}
                    className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium py-2 flex items-center justify-center gap-2 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        type="delete"
        title="Delete Book?"
        message={`Are you sure you want to delete "${deleteModal.bookTitle}" from your library? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={isDeleting}
      />
    </div>
  );
};

export default BookLibrary;