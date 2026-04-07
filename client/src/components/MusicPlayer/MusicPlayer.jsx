import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Music, Plus, Trash2, X } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import CreatePlaylistModal from "./CreatePlaylistModal";
import playlistAPI from "../../services/playlistAPI.service.js";
import MusicUploadModal from './MusicUploadModal';
import { useMusicStore } from "../../global/MusicEngine";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const MusicPlayer = () => {
  const { user } = useAuth();
  const userId = user?.id;
  
  const [playlists, setPlaylists] = useState([]);
  const [customPlaylists, setCustomPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [expandedPlaylists, setExpandedPlaylists] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [allSongs, setAllSongs] = useState([]);
  
  const { songs, playlists: storePlaylists, setSongs, setPlaylists: setStorePlaylists, selectedPlaylistName, setSelectedPlaylistName } = useMusicStore();

  // 🔄 Load music ONCE
  useEffect(() => {
    if (!userId) {
      console.log("⚠️ [MusicPlayer] No userId available yet");
      return;
    }
    // If playlists already in store, use them
    if (storePlaylists.length > 0) {
      console.log("📁 [MusicPlayer] Restoring playlists from store:", storePlaylists.length);
      setPlaylists(storePlaylists);
      
      // Restore selected playlist
      if (selectedPlaylistName) {
        console.log("📁 [MusicPlayer] Restoring selected playlist:", selectedPlaylistName);
        const playlist = storePlaylists.find(p => p.name === selectedPlaylistName);
        if (playlist) {
          setSelectedPlaylist(selectedPlaylistName);
          setPlaylistSongs(playlist.songs);
          setExpandedPlaylists({ [selectedPlaylistName]: true });
        }
      } else if (storePlaylists.length > 0) {
        const first = storePlaylists[0];
        setSelectedPlaylist(first.name);
        setPlaylistSongs(first.songs);
      }
      setLoading(false);
      return;
    }

    // Fetch music from server
    console.log("🎵 [MusicPlayer] Fetching music from server");
    
    fetch(`http://localhost:5000/api/music/get?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        const fetchedSongs = data.data || [];
        setAllSongs(fetchedSongs);
        console.log("📚 [MusicPlayer] Fetched", fetchedSongs.length, "songs");
        
        setSongs(fetchedSongs);

        // Build album-based playlists from songs
        const map = {};
        fetchedSongs.forEach(song => {
          const key = song.album || "Uncategorized";
          if (!map[key]) map[key] = [];
          map[key].push(song);
        });

        const playlistArray = Object.entries(map)
          .map(([name, songs]) => ({
            name,
            songs,
            songCount: songs.length,
            type: 'album'
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        console.log("📁 [MusicPlayer] Built", playlistArray.length, "album playlists");

        setPlaylists(playlistArray);
        setStorePlaylists(playlistArray);

        // Auto-select first playlist
        if (playlistArray.length > 0) {
          const first = playlistArray[0];
          setSelectedPlaylist(first.name);
          setPlaylistSongs(first.songs);
          setSelectedPlaylistName(first.name);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Error fetching music:", err);
        setLoading(false);
      });
  }, []);

  // Load custom playlists
  useEffect(() => {
    if (!userId) return;
    
    console.log("📁 [MusicPlayer] Loading custom playlists");
    loadCustomPlaylists();
  }, [userId]);

  const loadCustomPlaylists = async () => {
  // Custom playlists feature not implemented in this version
  console.log("ℹ️ Custom playlists feature disabled");
  return;
}

  const handlePlaylistSelect = (name, id = null, type = 'album') => {
    console.log("📁 [MusicPlayer] Clicked playlist:", name, "type:", type);
    
    if (type === 'custom') {
      const playlist = customPlaylists.find(p => p.id === id);
      if (!playlist) {
        console.error("❌ Custom playlist not found:", name);
        return;
      }
      
      setSelectedPlaylist(name);
      setSelectedPlaylistId(id);
      setPlaylistSongs(playlist.songs || []);
      setSelectedPlaylistName(name);
      setExpandedPlaylists(prev => ({
        ...prev,
        [name]: !prev[name]
      }));
    } else {
      const playlist = playlists.find(p => p.name === name);
      if (!playlist) {
        console.error("❌ Playlist not found:", name);
        return;
      }

      console.log("🎵 [MusicPlayer] Loading", playlist.songs.length, "songs from", name);
      
      setSelectedPlaylist(name);
      setSelectedPlaylistId(null);
      setPlaylistSongs(playlist.songs);
      setSelectedPlaylistName(name);
      useMusicStore.getState().setCurrentPlaylistSongs(playlist.songs, name, true);
      setShowAddSongs(false);
    }
  };

  const handlePlaylistCreated = async () => {
    console.log("🎵 [MusicPlayer] Playlist created, reloading custom playlists");
    await loadCustomPlaylists();
  };

  const handleDeletePlaylist = async (playlistId, playlistName) => {
    if (!window.confirm(`Are you sure you want to delete "${playlistName}"?`)) return;

    try {
      await playlistAPI.delete(playlistId);
      toast.success(`Playlist "${playlistName}" deleted!`);
      await loadCustomPlaylists();
      
      if (selectedPlaylistId === playlistId) {
        setSelectedPlaylist(null);
        setSelectedPlaylistId(null);
        setPlaylistSongs([]);
      }
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast.error("Failed to delete playlist");
    }
  };

  const handleAddSongToPlaylist = (song) => {
    if (!selectedPlaylist) {
      toast.error("Please select a playlist");
      return;
    }

    // Check if song already in playlist
    if (playlistSongs.find(s => s.id === song.id)) {
      toast.error("Song already in playlist");
      return;
    }

    // Add song to playlist
    const updatedSongs = [...playlistSongs, song];
    setPlaylistSongs(updatedSongs);
    
    // Update store
    const updatedPlaylists = playlists.map(p => 
      p.name === selectedPlaylist 
        ? { ...p, songs: updatedSongs, songCount: updatedSongs.length }
        : p
    );
    setPlaylists(updatedPlaylists);
    setStorePlaylists(updatedPlaylists);

    toast.success(`Added "${song.title}" to ${selectedPlaylist}`);
  };

  const handleRemoveSongFromPlaylist = async (musicId) => {
    if (!selectedPlaylistId) return;

    try {
      await playlistAPI.removeSong(selectedPlaylistId, musicId);
      toast.success("Song removed!");
      
      // Reload playlist
      const playlist = await playlistAPI.getById(selectedPlaylistId);
      if (playlist.data.success) {
        setPlaylistSongs(playlist.data.data.songs);
      }
    } catch (error) {
      console.error("Error removing song:", error);
      toast.error("Failed to remove song");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
        <div className="text-gray-400">
          <Music className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p>Loading music library...</p>
        </div>
      </div>
    );
  }

  const allPlaylists = playlists.length + customPlaylists.length;
  const totalSongs = playlists.reduce((sum, p) => sum + p.songCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Music className="w-6 h-6" />
          Music Library
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            {totalSongs} songs • {allPlaylists} playlists
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3 bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h3 className="text-white font-semibold text-sm mb-4">📁 Playlists</h3>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {/* Album-based playlists */}
            {playlists.map(p => (
              <div key={p.name}>
                <button
                  onClick={() => handlePlaylistSelect(p.name, null, 'album')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded transition text-left text-sm ${
                    selectedPlaylist === p.name
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-800 text-gray-300"
                  }`}
                >
                  {expandedPlaylists[p.name] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                    {p.songCount}
                  </span>
                </button>

                {expandedPlaylists[p.name] && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-gray-800 pl-2 max-h-48 overflow-y-auto">
                    {p.songs.map(song => (
                      <div
                        key={song.id}
                        className="text-xs text-gray-400 hover:text-white truncate"
                        title={`${song.title} - ${song.artist}`}
                      >
                        {song.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Custom playlists */}
            {customPlaylists.length > 0 && (
              <>
                <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-800">Custom Playlists</div>
                {customPlaylists.map(p => (
                  <div key={`custom-${p.id}`}>
                    <div className="flex items-center justify-between group">
                      <button
                        onClick={() => handlePlaylistSelect(p.name, p.id, 'custom')}
                        className={`flex-1 flex items-center gap-2 px-3 py-2 rounded transition text-left text-sm ${
                          selectedPlaylist === p.name
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-800 text-gray-300"
                        }`}
                      >
                        {expandedPlaylists[p.name] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <span className="flex-1 truncate">{p.name}</span>
                        <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                          {p.song_count || 0}
                        </span>
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeletePlaylist(p.id, p.name)}
                        className="p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                        title="Delete playlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {expandedPlaylists[p.name] && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-gray-800 pl-2 max-h-48 overflow-y-auto">
                        {p.songs && p.songs.length > 0 ? (
                          p.songs.map(song => (
                            <div
                              key={song.id}
                              className="flex items-center justify-between group text-xs text-gray-400 hover:text-white"
                            >
                              <span className="truncate flex-1" title={`${song.title} - ${song.artist}`}>
                                {song.title}
                              </span>
                              <button
                                onClick={() => handleRemoveSongFromPlaylist(song.id)}
                                className="p-0.5 opacity-0 group-hover:opacity-100 transition hover:text-red-400"
                                title="Remove from playlist"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-500 italic">Empty playlist</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Player */}
        <div className="col-span-9 space-y-6">
          {selectedPlaylist && (
            <>
              <div className="items-center justify-between">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 transition"
                  title="Upload new song"
                >
                  <Plus className="w-4 h-4" />
                  Add Songs
                </button>
              </div>

              {/* Add songs section */}
              {showAddSongs && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">Add Songs to {selectedPlaylist}</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {allSongs
                      .filter(song => !playlistSongs.find(ps => ps.id === song.id))
                      .map(song => (
                        <div
                          key={song.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-700 transition"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-white truncate">{song.title}</p>
                            <p className="text-xs text-gray-400">{song.artist}</p>
                          </div>
                          <button
                            onClick={() => handleAddSongToPlaylist(song)}
                            className="ml-4 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {playlistSongs.length > 0 ? (
                <AudioPlayer 
                  songs={playlistSongs} 
                  playlistName={selectedPlaylist} 
                  userId={userId}
                  isCustomPlaylist={!!selectedPlaylistId}
                  onSongDeleted={() => {
                    if (selectedPlaylistId) {
                      loadCustomPlaylists();
                    }
                  }}
                  key={selectedPlaylist} 
                />
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-900 rounded-lg border border-gray-800">
                  <div className="text-gray-400 text-center">
                    <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No songs in this playlist</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPlaylistCreated={handlePlaylistCreated}
        userId={userId}
      />

      {/* Upload Music Modal */}
      <MusicUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        userId={userId}
        defaultAlbum={selectedPlaylist}
        onUploadSuccess={() => {
          // Refresh music library
          fetch(`http://localhost:5000/api/music/get?user_id=${userId}`)
            .then(res => res.json())
            .then(data => {
              const fetchedSongs = data.data || [];
              setAllSongs(fetchedSongs);
              setSongs(fetchedSongs);
              
              // Rebuild playlists with new songs
              const map = {};
              fetchedSongs.forEach(song => {
                const key = song.album || "Uncategorized";
                if (!map[key]) map[key] = [];
                map[key].push(song);
              });

              const playlistArray = Object.entries(map)
                .map(([name, songs]) => ({
                  name,
                  songs,
                  songCount: songs.length,
                  type: 'album'
                }))
                .sort((a, b) => a.name.localeCompare(b.name));

              setPlaylists(playlistArray);
              setStorePlaylists(playlistArray);
              toast.success('Music uploaded and added to library!');
            });
        }}
      />
    </div>
  );
};

export default MusicPlayer;