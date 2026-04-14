import React, { useState, useEffect } from 'react';
import { Volume2, Search, Play, Pause } from 'lucide-react';

export default function Radio() {
  const [stations, setStations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [audio, setAudio] = useState(null);

  // Fetch stations from Radio Browser API
  const searchStations = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://de1.api.radio-browser.info/json/stations/search?limit=20&name=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
    setLoading(false);
  };

  // Play station
  const playStation = (station) => {
    if (audio) {
      audio.pause();
    }

    if (currentStation?.stationuuid === station.stationuuid) {
      setCurrentStation(null);
      return;
    }

    const newAudio = new Audio(station.url);
    newAudio.play().catch(err => console.error('Playback error:', err));
    setAudio(newAudio);
    setCurrentStation(station);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  const handleSearch = (e) => {
    e.preventDefault();
    searchStations(searchQuery);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg">
      <div className="flex items-center gap-3 mb-6">
        <Volume2 className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Radio</h2>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search stations... (jazz, pop, news, etc.)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && <p className="text-slate-300">Searching stations...</p>}

      {/* Stations List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {stations.length === 0 && !loading && (
          <p className="text-slate-400">Search for a station to start listening</p>
        )}
        {stations.map((station) => (
          <div
            key={station.stationuuid}
            className={`p-3 rounded-lg cursor-pointer transition ${
              currentStation?.stationuuid === station.stationuuid
                ? 'bg-blue-500'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
            onClick={() => playStation(station)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{station.name}</p>
                <p className="text-sm text-slate-300">{station.country || 'Unknown'}</p>
              </div>
              {currentStation?.stationuuid === station.stationuuid ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Now Playing */}
      {currentStation && (
        <div className="mt-6 p-4 bg-blue-500 rounded-lg">
          <p className="text-sm text-blue-100">Now Playing</p>
          <p className="text-lg font-bold text-white">{currentStation.name}</p>
          <p className="text-sm text-blue-100">{currentStation.country}</p>
        </div>
      )}
    </div>
  );
}
