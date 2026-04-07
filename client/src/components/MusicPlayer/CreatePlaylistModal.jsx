import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreatePlaylistModal = ({ isOpen, onClose, onPlaylistCreated, userId }) => {
  const [playlistName, setPlaylistName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();

    if (!playlistName.trim()) {
      toast.error('Playlist name is required');
      return;
    }

    try {
      setLoading(true);
      console.log('🎵 [CreatePlaylist] Creating playlist:', playlistName);

      const response = await api.post('/music/playlists/create', {
        user_id: userId,
        name: playlistName.trim(),
        description: description.trim() || null
      });

      if (response.data.success) {
        console.log('✅ [CreatePlaylist] Playlist created with ID:', response.data.id);
        toast.success(`Playlist "${playlistName}" created!`);
        
        // Reset form
        setPlaylistName('');
        setDescription('');
        
        // Call callback to refresh playlists
        onPlaylistCreated();
        
        // Close modal
        onClose();
      }
    } catch (error) {
      console.error('❌ [CreatePlaylist] Error:', error);
      toast.error(error.response?.data?.error || 'Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Playlist</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreatePlaylist} className="space-y-4">
          {/* Playlist Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Playlist Name *
            </label>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="My Awesome Playlist"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows="3"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Playlist
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;