import React from "react";
import { useMusicStore } from "./MusicEngine";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
} from "lucide-react";

export default function GlobalMusicPlayerBar() {
  const {
    currentPlaylistSongs,
    currentIndex,
    isPlaying,
    togglePlay,
    next,
    prev,
    volume,
    setVolume,
    currentTime,
    duration,
  } = useMusicStore();

  // ✅ Get current song from CURRENT PLAYLIST, not global songs
  const current = currentPlaylistSongs && currentPlaylistSongs.length > 0 && currentIndex < currentPlaylistSongs.length
    ? currentPlaylistSongs[currentIndex]
    : null;

  console.log("🎵 [PlayerBar] Playlist songs:", currentPlaylistSongs.length, "Index:", currentIndex, "Current:", current?.title);

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!current || !currentPlaylistSongs || currentPlaylistSongs.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 text-gray-400 py-3 px-6 flex items-center gap-3 z-50">
        <Music className="w-5 h-5" />
        <span className="text-sm">No song selected</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      {/* Progress Bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-blue-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Player Controls */}
      <div className="py-3 px-6 flex items-center justify-between">
        {/* Song Info */}
        <div className="flex items-center gap-3 w-1/3 min-w-0">
          <div className="bg-blue-700 text-white w-12 h-12 flex items-center justify-center rounded-lg font-bold text-lg flex-shrink-0">
            {current.title.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-sm truncate">
              {current.title}
            </p>
            <p className="text-gray-400 text-xs truncate">
              {current.artist || "Unknown Artist"}
            </p>
          </div>

          {/* Time Display */}
          <div className="text-xs text-gray-400 flex-shrink-0">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-6 w-1/3 justify-center">
          <button
            onClick={prev}
            className="text-gray-300 hover:text-white transition"
            title="Previous track"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="bg-white text-gray-800 rounded-full p-3 hover:scale-110 transition shadow-lg flex-shrink-0"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={next}
            className="text-gray-300 hover:text-white transition"
            title="Next track"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 w-1/3 justify-end">
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
      </div>
    </div>
  );
}