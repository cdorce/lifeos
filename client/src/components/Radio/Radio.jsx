import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Search, Play, Pause, Square } from 'lucide-react';

const CATEGORIES = [
  { label: 'Pop',     tag: 'pop' },
  { label: 'R&B',     tag: 'rnb' },
  { label: 'Rap',     tag: 'rap' },
  { label: 'French',  tag: 'french' },
  { label: 'English', tag: 'english' },
  { label: 'Spanish', tag: 'spanish' },
  { label: 'News',    tag: 'news' },
  { label: 'Music',   tag: 'music' },
  { label: 'Podcast', tag: 'podcast' },
];

export default function Radio() {
  const [stations, setStations]           = useState([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [loading, setLoading]             = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying]         = useState(false);
  const [volume, setVolume]               = useState(0.8);
  const [isMuted, setIsMuted]             = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const audioRef = useRef(null);

  // Keep audio volume in sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const fetchStations = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://de1.api.radio-browser.info/json/stations/search?limit=20&name=${encodeURIComponent(query)}&hidebroken=true&order=votes&reverse=true`
      );
      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
    setLoading(false);
  };

  const fetchByTag = async (tag) => {
    setLoading(true);
    setActiveCategory(tag);
    setSearchQuery('');
    try {
      const response = await fetch(
        `https://de1.api.radio-browser.info/json/stations/bytag/${encodeURIComponent(tag)}?limit=20&hidebroken=true&order=votes&reverse=true`
      );
      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error('Error fetching stations by tag:', error);
    }
    setLoading(false);
  };

  const playStation = (station) => {
    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // If clicking the same station, stop it
    if (currentStation?.stationuuid === station.stationuuid && isPlaying) {
      setIsPlaying(false);
      setCurrentStation(null);
      return;
    }

    const newAudio = new Audio(station.url);
    newAudio.volume = isMuted ? 0 : volume;
    newAudio.play().catch(err => console.error('Playback error:', err));
    newAudio.onended = () => setIsPlaying(false);
    audioRef.current = newAudio;
    setCurrentStation(station);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error('Playback error:', err));
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentStation(null);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveCategory(null);
    fetchStations(searchQuery);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg min-h-screen">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Volume2 className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Radio</h2>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search stations..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory(null); }}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.tag}
            onClick={() => fetchByTag(cat.tag)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeCategory === cat.tag
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <p className="text-slate-300 mb-4">Loading stations...</p>}

      {/* Station List */}
      <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
        {stations.length === 0 && !loading && (
          <p className="text-slate-400">Pick a category or search to start listening</p>
        )}
        {stations.map((station) => {
          const active = currentStation?.stationuuid === station.stationuuid;
          return (
            <div
              key={station.stationuuid}
              onClick={() => playStation(station)}
              className={`p-3 rounded-lg cursor-pointer transition ${
                active ? 'bg-blue-500' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 pr-3">
                  <p className="font-semibold text-white truncate">{station.name}</p>
                  <p className="text-sm text-slate-300 truncate">
                    {station.country || 'Unknown'}{station.tags ? ` · ${station.tags.split(',')[0]}` : ''}
                  </p>
                </div>
                {active && isPlaying ? (
                  <Pause className="w-5 h-5 text-white flex-shrink-0" />
                ) : (
                  <Play className="w-5 h-5 text-white flex-shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Player Bar */}
      {currentStation && (
        <div className="sticky bottom-0 mt-4 p-4 bg-slate-800 border border-slate-700 rounded-xl">
          {/* Station info */}
          <div className="mb-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Now Playing</p>
            <p className="text-base font-bold text-white truncate">{currentStation.name}</p>
            <p className="text-sm text-slate-400">{currentStation.country}</p>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-4">
            {/* Play / Pause */}
            <button
              onClick={handlePlayPause}
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying
                ? <Pause className="w-5 h-5 text-white" />
                : <Play className="w-5 h-5 text-white" />
              }
            </button>

            {/* Stop */}
            <button
              onClick={handleStop}
              className="p-2 bg-slate-600 hover:bg-slate-500 rounded-full transition"
              title="Stop"
            >
              <Square className="w-5 h-5 text-white" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 flex-1">
              <button onClick={toggleMute} className="text-slate-300 hover:text-white transition">
                {isMuted || volume === 0
                  ? <VolumeX className="w-5 h-5" />
                  : <Volume2 className="w-5 h-5" />
                }
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="flex-1 accent-blue-400 cursor-pointer"
              />
              <span className="text-xs text-slate-400 w-8 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
