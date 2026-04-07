import api from './api';

const playlistAPI = {
  // Create a new playlist
  create: (name, description = '') => {
    return api.post('/playlists', { name, description });
  },

  // Get all playlists
  getAll: () => {
    return api.get('/playlists');
  },

  // Get single playlist
  getById: (id) => {
    return api.get(`/playlists/${id}`);
  },

  // Update playlist
  update: (id, name, description) => {
    return api.put(`/playlists/${id}`, { name, description });
  },

  // Delete playlist
  delete: (id) => {
    return api.delete(`/playlists/${id}`);
  },

  // Add song to playlist
  addSong: (playlistId, songId) => {
    return api.post(`/playlists/${playlistId}/songs`, { song_id: songId });
  },

  // Remove song from playlist
  removeSong: (playlistId, songId) => {
    return api.delete(`/playlists/${playlistId}/songs/${songId}`);
  },

  // Reorder songs
  reorder: (playlistId, songOrder) => {
    return api.patch(`/playlists/${playlistId}/reorder`, { songOrder });
  },

  // Clear playlist
  clear: (playlistId) => {
    return api.delete(`/playlists/${playlistId}/clear`);
  }
};

export default playlistAPI;