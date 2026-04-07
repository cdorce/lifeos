import React, { useState } from 'react';
import { Upload, Loader } from 'lucide-react';

const MusicUpload = ({ userId, defaultAlbum, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState(defaultAlbum || '');
  const [genre, setGenre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (50MB max)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        setFile(null);
        return;
      }

      // Check file type
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/aac'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only audio files are supported (MP3, WAV, OGG, FLAC, M4A, AAC)');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError('');
      
      // Auto-fill title from filename
      const filename = selectedFile.name.split('.')[0];
      setTitle(filename);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !title || !artist) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);
      formData.append('title', title);
      formData.append('artist', artist);
      // Send ORIGINAL album name to database (with spaces)
      formData.append('album', album || 'Unknown');
      formData.append('genre', genre || 'Unknown');

      // Sanitize ONLY for the folder path (spaces -> underscores)
      const sanitizedAlbum = album.replace(/[^a-zA-Z0-9-_]/g, '_') || 'Unknown';
      const response = await fetch(`http://localhost:5000/api/music/upload?album=${encodeURIComponent(sanitizedAlbum)}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      setSuccess(`✅ Music "${title}" uploaded successfully!`);
      
      // Reset form
      setFile(null);
      setTitle('');
      setArtist('');
      setAlbum(defaultAlbum || '');
      setGenre('');

      // Call parent callback to refresh music list
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`❌ Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Upload Music
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Audio File *
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-900 dark:text-gray-100
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900 dark:file:text-blue-300"
            disabled={loading}
          />
          {file && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Selected: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Song Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter song title"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* Artist Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Artist *
          </label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Enter artist name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* Album & Genre Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Album
            </label>
            <input
              type="text"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="Album name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Genre
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Genre"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
            text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Music
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MusicUpload;