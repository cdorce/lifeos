import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  Music as MusicIcon,
  List,
  Search,
  Clock,
  Trash2,
  Folder,
  Loader,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

// ✅ NO musicService import needed - we fetch directly!

const Music = () => {
  // State
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showPlaylistPanel, setShowPlaylistPanel] = useState(true);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [loadingPlaylistSongs, setLoadingPlaylistSongs] = useState(false);

  // Refs
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  // Fetch on mount
  useEffect(() => {
    fetchData();
  }, []);

  // ✅ DIRECT API FETCH - No service layer
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🎵 Fetching music from API...');

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch songs
      console.log('📥 GET /api/music/songs');
      const songsRes = await fetch('http://localhost:5000/api/music/songs', { headers });
      console.log('Response:', songsRes.status);

      if (!songsRes.ok) {
        throw new Error(`API error: ${songsRes.status}`);
      }

      const songsData = await songsRes.json();
      console.log('✅ Songs loaded:', songsData.songs?.length);

      if (songsData.songs) {
        setSongs(songsData.songs);
      }

      // Fetch playlists
      console.log('📥 GET /api/music/playlists');
      const playlistsRes = await fetch('http://localhost:5000/api/music/playlists', { headers });
      console.log('Response:', playlistsRes.status);

      if (!playlistsRes.ok) {
        throw new Error(`API error: ${playlistsRes.status}`);
      }

      const playlistsData = await playlistsRes.json();
      console.log('✅ Playlists loaded:', playlistsData.playlists?.length);

      if (playlistsData.playlists) {
        setPlaylists(playlistsData.playlists);

        if (playlistsData.playlists.length > 0) {
          setSelectedPlaylist(playlistsData.playlists[0]);
          loadPlaylistSongsDirectly(playlistsData.playlists[0].id, headers);
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to load music: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Direct API fetch for playlist songs
  const loadPlaylistSongsDirectly = async (playlistId, headers = null) => {
    try {
      setLoadingPlaylistSongs(true);

      if (!headers) {
        const token = localStorage.getItem('token');
        headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
      }

      console.log(`📥 GET /api/music/playlists/${playlistId}/songs`);
      const res = await fetch(`http://localhost:5000/api/music/playlists/${playlistId}/songs`, {
        headers
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      console.log('✅ Playlist songs loaded:', data.songs?.length);

      if (data.songs) {
        setPlaylistSongs(data.songs);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to load playlist');
    } finally {
      setLoadingPlaylistSongs(false);
    }
  };

  // Audio setup
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    const handleEnded = () => {
      if (isRepeat === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat, playlistSongs, currentSong]);

  // Play/pause
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.play().catch(err => console.error('Play error:', err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  // Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Display songs
  const displaySongs = selectedPlaylist
    ? playlistSongs.filter(
        song =>
          song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : songs.filter(
        song =>
          song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Playback controls
  const playSong = song => {
    console.log('▶️ Playing:', song.title);
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const togglePlayPause = () => setIsPlaying(!isPlaying);

  const playNext = () => {
    if (displaySongs.length === 0) return;
    let nextIndex = 0;
    if (currentSong) {
      const currentIndex = displaySongs.findIndex(s => s.id === currentSong.id);
      nextIndex = isShuffle
        ? Math.floor(Math.random() * displaySongs.length)
        : (currentIndex + 1) % displaySongs.length;
    }
    playSong(displaySongs[nextIndex]);
  };

  const playPrevious = () => {
    if (displaySongs.length === 0) return;
    const currentIndex = displaySongs.findIndex(s => s.id === currentSong?.id);
    const prevIndex = currentIndex <= 0 ? displaySongs.length - 1 : currentIndex - 1;
    playSong(displaySongs[prevIndex]);
  };

  const handleProgressClick = e => {
    if (!audioRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const formatTime = seconds => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFavorite = async song => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/music/songs/${song.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_favorite: !song.is_favorite })
      });

      if (!res.ok) throw new Error('Failed to update');

      const updateList = list =>
        list.map(s =>
          s.id === song.id ? { ...s, is_favorite: !s.is_favorite } : s
        );
      setSongs(updateList);
      setPlaylistSongs(updateList);
      toast.success(song.is_favorite ? '💔 Removed' : '❤️ Added');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update');
    }
  };

  const deleteSong = async song => {
    if (!window.confirm(`Delete "${song.title}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/music/songs/${song.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete');

      setSongs(prev => prev.filter(s => s.id !== song.id));
      setPlaylistSongs(prev => prev.filter(s => s.id !== song.id));
      if (currentSong?.id === song.id) {
        setCurrentSong(null);
        setIsPlaying(false);
      }
      toast.success('Deleted');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete');
    }
  };

  const stats = {
    totalSongs: songs.length,
    totalPlaylists: playlists.length,
    favorites: songs.filter(s => s.is_favorite).length,
    currentPlaylistSongs: selectedPlaylist ? playlistSongs.length : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <Loader className="animate-spin mr-2" size={24} />
        Loading music library...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-40">
      <audio ref={audioRef} src={currentSong?.file_url} crossOrigin="anonymous" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🎵 Music Player</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {selectedPlaylist ? `📁 ${selectedPlaylist.name}` : 'Your personal music library'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
          <MusicIcon className="w-6 h-6 text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-blue-400">{stats.totalSongs}</p>
          <p className="text-sm text-blue-300">Total Songs</p>
        </div>
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
          <List className="w-6 h-6 text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-purple-400">{stats.totalPlaylists}</p>
          <p className="text-sm text-purple-300">Playlists</p>
        </div>
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <Heart className="w-6 h-6 text-red-400 mb-2" />
          <p className="text-2xl font-bold text-red-400">{stats.favorites}</p>
          <p className="text-sm text-red-300">Favorites</p>
        </div>
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
          <Clock className="w-6 h-6 text-green-400 mb-2" />
          <p className="text-2xl font-bold text-green-400">{stats.currentPlaylistSongs}</p>
          <p className="text-sm text-green-300">In Playlist</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Folder size={18} /> Playlists
              </h2>
              <button
                onClick={() => setShowPlaylistPanel(!showPlaylistPanel)}
                className="text-gray-400 hover:text-white"
              >
                {showPlaylistPanel ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {showPlaylistPanel && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {playlists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={() => {
                      setSelectedPlaylist(playlist);
                      loadPlaylistSongsDirectly(playlist.id);
                      setCurrentSong(null);
                      setIsPlaying(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded transition ${
                      selectedPlaylist?.id === playlist.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <div className="font-medium truncate">{playlist.name}</div>
                    <div className="text-xs text-gray-400">{playlist.song_count} songs</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {currentSong && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
              <p className="text-sm opacity-80 mb-2">Now Playing</p>
              <h2 className="text-2xl font-bold mb-1">{currentSong.title}</h2>
              <p className="text-blue-100 mb-4">{currentSong.artist}</p>

              <div className="mb-4">
                <div
                  ref={progressBarRef}
                  onClick={handleProgressClick}
                  className="w-full h-1 bg-white/30 rounded-full cursor-pointer hover:h-2 transition"
                >
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm mt-2 opacity-80">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() =>
                    setIsRepeat(
                      isRepeat === 'off' ? 'all' : isRepeat === 'all' ? 'one' : 'off'
                    )
                  }
                  className={`p-2 rounded-full transition ${
                    isRepeat !== 'off' ? 'bg-white/30' : 'hover:bg-white/20'
                  }`}
                >
                  <Repeat size={20} />
                </button>
                <button onClick={playPrevious} className="p-2 rounded-full hover:bg-white/20">
                  <SkipBack size={24} />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="p-3 rounded-full bg-white text-blue-600 hover:scale-110 transition transform"
                >
                  {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                </button>
                <button onClick={playNext} className="p-2 rounded-full hover:bg-white/20">
                  <SkipForward size={24} />
                </button>
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-2 rounded-full transition ${
                    isShuffle ? 'bg-white/30' : 'hover:bg-white/20'
                  }`}
                >
                  <Shuffle size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={e => {
                    setVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  className="flex-1 accent-white"
                />
                <span className="text-sm w-8 text-right">{isMuted ? 0 : volume}%</span>
              </div>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search songs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white mb-3">
              {selectedPlaylist ? 'Playlist Songs' : 'All Songs'} ({displaySongs.length})
            </h3>

            {loadingPlaylistSongs ? (
              <div className="text-center py-8 text-gray-400">
                <Loader className="animate-spin mx-auto mb-2" size={24} />
                Loading...
              </div>
            ) : displaySongs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MusicIcon size={40} className="mx-auto mb-2 opacity-50" />
                <p>No songs found</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {displaySongs.map(song => (
                  <div
                    key={song.id}
                    onClick={() => playSong(song)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition group ${
                      currentSong?.id === song.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700 text-gray-200'
                    }`}
                  >
                    {currentSong?.id === song.id && isPlaying ? (
                      <Pause size={18} />
                    ) : (
                      <Play size={18} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{song.title}</p>
                      <p className="text-sm opacity-80 truncate">{song.artist}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      <span className="text-xs">{formatTime(song.duration)}</span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleFavorite(song);
                        }}
                        className={`p-1 transition ${
                          song.is_favorite
                            ? 'text-red-400'
                            : 'text-gray-400 hover:text-red-400'
                        }`}
                      >
                        <Heart size={16} fill={song.is_favorite ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteSong(song);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Music;