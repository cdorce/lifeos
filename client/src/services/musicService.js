// services/musicService.js

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const musicService = {
  // Get all music for user
  getAllMusic: async (userId, genre = null, playlistId = null) => {
    try {
      let url = `${API_BASE}/music/get?user_id=${userId}`;
      if (genre) url += `&genre=${genre}`;
      if (playlistId) url += `&playlist_id=${playlistId}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch music');

      return await response.json();
    } catch (error) {
      console.error('Error fetching music:', error);
      throw error;
    }
  },

  // Get single music
  getMusic: async (musicId, userId) => {
    try {
      const response = await fetch(`${API_BASE}/music/${musicId}?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch music');

      return await response.json();
    } catch (error) {
      console.error('Error fetching music:', error);
      throw error;
    }
  },

  // Get all playlists
  getPlaylists: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/music/playlists/list?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch playlists');

      return await response.json();
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  },

  // Create new music entry
  createMusic: async (musicData) => {
    try {
      const response = await fetch(`${API_BASE}/music/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(musicData)
      });

      if (!response.ok) throw new Error('Failed to create music');

      return await response.json();
    } catch (error) {
      console.error('Error creating music:', error);
      throw error;
    }
  },

  // Create playlist
  createPlaylist: async (playlistData) => {
    try {
      const response = await fetch(`${API_BASE}/music/playlists/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playlistData)
      });

      if (!response.ok) throw new Error('Failed to create playlist');

      return await response.json();
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  },

  // Add song to playlist
  addSongToPlaylist: async (playlistId, musicId, userId) => {
    try {
      const response = await fetch(
        `${API_BASE}/music/playlists/${playlistId}/add-song`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, music_id: musicId })
        }
      );

      if (!response.ok) throw new Error('Failed to add song to playlist');

      return await response.json();
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      throw error;
    }
  },

  // Track listening session
  trackListening: async (listeningData) => {
    try {
      const response = await fetch(`${API_BASE}/music/track-listen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listeningData)
      });

      if (!response.ok) throw new Error('Failed to track listening');

      return await response.json();
    } catch (error) {
      console.error('Error tracking listening:', error);
      throw error;
    }
  },

  // Delete music
  deleteMusic: async (musicId, userId) => {
    try {
      const response = await fetch(`${API_BASE}/music/${musicId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      if (!response.ok) throw new Error('Failed to delete music');

      return await response.json();
    } catch (error) {
      console.error('Error deleting music:', error);
      throw error;
    }
  }
};

export default musicService;