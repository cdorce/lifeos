import { useMusicStore } from './MusicEngine';
import { useRadioStore } from './RadioEngine';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Music, Radio, Square,
} from 'lucide-react';

export default function GlobalMusicPlayerBar() {
  // Music state
  const {
    currentPlaylistSongs, currentIndex, isPlaying: musicPlaying,
    togglePlay, next, prev, volume: musicVolume, setVolume: setMusicVolume,
    currentTime, duration,
  } = useMusicStore();

  // Radio state
  const {
    currentStation, isPlaying: radioPlaying,
    pause: radioPause, resume: radioResume, stop: radioStop,
    volume: radioVolume, isMuted, setVolume: setRadioVolume, toggleMute,
  } = useRadioStore();

  const currentSong = currentPlaylistSongs?.[currentIndex] ?? null;
  const hasMusic    = !!currentSong;
  const hasRadio    = !!currentStation;

  const formatTime = (t) => {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Nothing playing at all
  if (!hasMusic && !hasRadio) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 text-gray-400 py-3 px-6 flex items-center gap-3 z-50">
        <Music className="w-5 h-5" />
        <span className="text-sm">No song selected</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">

      {/* ── Radio row (shown when a station is loaded) ───────────────── */}
      {hasRadio && (
        <div className="flex items-center gap-4 px-6 py-2 border-b border-gray-800">
          {/* Label + station */}
          <Radio className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 leading-none">Radio</p>
            <p className="text-sm font-semibold text-white truncate">{currentStation.name}</p>
          </div>

          {/* Play / Pause */}
          <button
            onClick={radioPlaying ? radioPause : radioResume}
            className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-full transition flex-shrink-0"
            title={radioPlaying ? 'Pause radio' : 'Resume radio'}
          >
            {radioPlaying
              ? <Pause className="w-4 h-4 text-white" />
              : <Play  className="w-4 h-4 text-white" />
            }
          </button>

          {/* Stop */}
          <button
            onClick={radioStop}
            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-full transition flex-shrink-0"
            title="Stop radio"
          >
            <Square className="w-4 h-4 text-white" />
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={toggleMute} className="text-gray-400 hover:text-white transition">
              {isMuted || radioVolume === 0
                ? <VolumeX className="w-4 h-4" />
                : <Volume2 className="w-4 h-4" />
              }
            </button>
            <input
              type="range" min="0" max="1" step="0.02"
              value={isMuted ? 0 : radioVolume}
              onChange={(e) => setRadioVolume(parseFloat(e.target.value))}
              className="w-20 accent-blue-400 cursor-pointer"
            />
            <span className="text-xs text-gray-400 w-7 text-right">
              {Math.round((isMuted ? 0 : radioVolume) * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* ── Music row (shown when a song is loaded) ───────────────────── */}
      {hasMusic && (
        <>
          {/* Progress bar */}
          <div className="h-1 bg-gray-800">
            <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>

          <div className="py-3 px-6 flex items-center justify-between">
            {/* Song info */}
            <div className="flex items-center gap-3 w-1/3 min-w-0">
              <div className="bg-blue-700 text-white w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm flex-shrink-0">
                {currentSong.title.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-sm truncate">{currentSong.title}</p>
                <p className="text-gray-400 text-xs truncate">{currentSong.artist || 'Unknown Artist'}</p>
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Playback controls */}
            <div className="flex items-center gap-6 w-1/3 justify-center">
              <button onClick={prev} className="text-gray-300 hover:text-white transition" title="Previous">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={togglePlay}
                className="bg-white text-gray-800 rounded-full p-3 hover:scale-110 transition shadow-lg flex-shrink-0"
                title={musicPlaying ? 'Pause' : 'Play'}
              >
                {musicPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={next} className="text-gray-300 hover:text-white transition" title="Next">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Music volume */}
            <div className="flex items-center gap-3 w-1/3 justify-end">
              {musicVolume === 0
                ? <VolumeX className="w-5 h-5 text-gray-300 flex-shrink-0" />
                : <Volume2 className="w-5 h-5 text-gray-300 flex-shrink-0" />
              }
              <input
                type="range" min="0" max="1" step="0.01"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-24 accent-blue-600 flex-shrink-0"
              />
              <span className="text-xs text-gray-400 flex-shrink-0">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
