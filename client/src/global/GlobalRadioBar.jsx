import { Volume2, VolumeX, Play, Pause, Square } from 'lucide-react';
import { useRadioStore } from './RadioEngine';

export default function GlobalRadioBar() {
  const { currentStation, isPlaying, volume, isMuted, pause, resume, stop, setVolume, toggleMute } = useRadioStore();

  if (!currentStation) return null;

  return (
    <div className="fixed bottom-[72px] left-0 right-0 bg-slate-900 border-t border-slate-700 z-40 px-6 py-2 flex items-center gap-4">
      {/* Station info */}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400 leading-none mb-0.5">Radio</p>
        <p className="text-sm font-semibold text-white truncate">{currentStation.name}</p>
      </div>

      {/* Play / Pause */}
      <button
        onClick={isPlaying ? pause : resume}
        className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-full transition flex-shrink-0"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying
          ? <Pause className="w-4 h-4 text-white" />
          : <Play  className="w-4 h-4 text-white" />
        }
      </button>

      {/* Stop */}
      <button
        onClick={stop}
        className="p-1.5 bg-slate-600 hover:bg-slate-500 rounded-full transition flex-shrink-0"
        title="Stop"
      >
        <Square className="w-4 h-4 text-white" />
      </button>

      {/* Volume */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={toggleMute} className="text-slate-400 hover:text-white transition">
          {isMuted || volume === 0
            ? <VolumeX className="w-4 h-4" />
            : <Volume2 className="w-4 h-4" />
          }
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-20 accent-blue-400 cursor-pointer"
        />
        <span className="text-xs text-slate-400 w-7 text-right">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>
    </div>
  );
}
