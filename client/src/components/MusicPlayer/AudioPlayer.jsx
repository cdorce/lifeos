import React, { useState, useEffect } from 'react';
import { useMusicStore } from '../../global/MusicEngine';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Trash2,
  Search,
  X,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmationModal from "../common/ConfirmationModal";

const AudioPlayer = ({ songs = [], playlistName = null, userId = null, onSongDeleted = null }) => {
  const [localShuffle, setLocalShuffle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    songId: null,
    songTitle: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    currentIndex,
    isPlaying,
    togglePlay,
    playIndex,
    next,
    prev,
    volume,
    setVolume,
    currentTime,
    duration,
    setCurrentPlaylistSongs,
    setCurrentTime,
  } = useMusicStore();

  // ✅ When playlist songs change, update store
  useEffect(() => {
    if (!songs || songs.length === 0) return;

    console.log("🎵 [AudioPlayer] Updating current playlist:", songs.length, "songs, playlistName:", playlistName);
    setCurrentPlaylistSongs(songs, playlistName, false);
  }, [songs, playlistName, setCurrentPlaylistSongs]);

  const displaySongs = songs && songs.length > 0 ? songs : [];
  
  // Sort songs alphabetically by title
  const sortedSongs = [...displaySongs].sort((a, b) => {
    const aTitle = (a.title || '').toLowerCase();
    const bTitle = (b.title || '').toLowerCase();
    return aTitle.localeCompare(bTitle);
  });

  // Filter based on search query
  const filteredSongs = searchQuery.trim() === '' 
    ? sortedSongs 
    : sortedSongs.filter(song => {
        const query = searchQuery.toLowerCase();
        return (
          song.title?.toLowerCase().includes(query) ||
          song.artist?.toLowerCase().includes(query) ||
          song.album?.toLowerCase().includes(query)
        );
      });

  const currentTrack = displaySongs[currentIndex];

  const handlePlayNextTrack = () => {
    if (localShuffle && displaySongs.length > 0) {
      const randomIndex = Math.floor(Math.random() * displaySongs.length);
      playIndex(randomIndex);
    } else {
      next();
    }
  };

  const handlePlayPrevTrack = () => {
    if (currentTime > 3) {
      setCurrentTime(0);
    } else {
      prev();
    }
  };

  const handleProgressChange = (e) => {
    const percent = parseFloat(e.target.value);
    const newTime = (percent / 100) * duration;
    setCurrentTime(newTime);
  };

  const handleDeleteClick = (songId, songTitle) => {
    setDeleteModal({
      isOpen: true,
      songId: songId,
      songTitle: songTitle
    });
  };

  const handleConfirmDelete = async () => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setIsDeleting(true);
      console.log('🗑️ [AudioPlayer] Deleting song:', deleteModal.songId);
      
      await api.delete(`/music/${deleteModal.songId}`, {
        data: { user_id: userId }
      });

      toast.success('Song deleted successfully');
      console.log('✅ [AudioPlayer] Song deleted');
      
      // Close modal
      setDeleteModal({ isOpen: false, songId: null, songTitle: '' });
      
      // Refresh the playlist
      if (onSongDeleted) {
        onSongDeleted();
      }
    } catch (error) {
      console.error('❌ [AudioPlayer] Delete error:', error);
      toast.error('Failed to delete song');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, songId: null, songTitle: '' });
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!displaySongs || displaySongs.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-900 rounded-lg border border-gray-800">
        <div className="text-gray-400 text-center">
          <p className="text-sm">No songs available</p>
          <p className="text-xs text-gray-500 mt-1">Select a playlist to get started</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
        {/* Track Info */}
        <div className="mb-4">
          <h3 className="text-white font-semibold truncate text-sm">
            {currentTrack?.title || 'No track'}
          </h3>
          <p className="text-gray-400 text-xs truncate">
            {currentTrack?.artist || 'Unknown artist'}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Track {currentIndex + 1} of {displaySongs.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercent}
            onChange={handleProgressChange}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-3">
          {/* Main playback controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={handlePlayPrevTrack}
              className="text-gray-300 hover:text-white transition"
              title="Previous or restart"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="bg-white text-gray-800 rounded-full p-3 hover:scale-110 transition shadow-lg flex-shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={handlePlayNextTrack}
              className="text-gray-300 hover:text-white transition"
              title="Next track"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-3">
            {volume === 0 ? (
              <VolumeX className="w-5 h-5 text-gray-300 flex-shrink-0" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-300 flex-shrink-0" />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 accent-blue-600 flex-shrink-0"
              title="Volume"
            />
            <span className="text-xs text-gray-400 flex-shrink-0">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Shuffle toggle */}
          <button
            onClick={() => setLocalShuffle(!localShuffle)}
            className={`transition ${
              localShuffle
                ? 'text-blue-400'
                : 'text-gray-300 opacity-60 hover:opacity-100'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-t border-gray-800 pt-3 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-gray-800 text-white text-xs rounded border border-gray-700 focus:border-blue-600 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Playlist - compact with sorting and search */}
        <div className="max-h-40 overflow-y-auto border-t border-gray-800 pt-3">
          <div className="text-xs text-gray-500 mb-2">Queue ({filteredSongs.length} of {displaySongs.length} songs)</div>
          {filteredSongs.length === 0 ? (
            <div className="text-xs text-gray-500 p-2 text-center">
              No songs match your search
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSongs.map((song) => {
                const originalIndex = displaySongs.findIndex(s => s.id === song.id);
                return (
                  <div
                    key={`${song.id}`}
                    className={`flex items-center justify-between p-2 rounded text-xs transition group ${
                      originalIndex === currentIndex
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                    title={`${song.title} - ${song.artist}`}
                  >
                    <button
                      onClick={() => {
                        console.log("[AudioPlayer] Clicked song at index:", originalIndex, song.title);
                        playIndex(originalIndex);
                      }}
                      className="flex-1 text-left truncate"
                    >
                      {song.title}
                    </button>
                    
                    {/* Delete button - appears on hover */}
                    <button
                      onClick={() => handleDeleteClick(song.id, song.title)}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-600 flex-shrink-0"
                      title="Delete song"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        type="delete"
        title="Delete Song?"
        message={`Are you sure you want to delete "${deleteModal.songTitle}" from your library? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={isDeleting}
      />
    </>
  );
};

export default AudioPlayer;