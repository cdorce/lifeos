import { create } from "zustand";
import { useEffect, useRef } from "react";

// Global audio element that NEVER gets destroyed
let globalAudioElement = null;
let audioInitialized = false;

// ✅ Export function to get the audio element
export const getGlobalAudioElement = () => {
  return globalAudioElement;
};

export const useMusicStore = create((set, get) => ({
  songs: [],
  playlists: [],
  
  currentPlaylistSongs: [],
  selectedPlaylistName: null,

  currentIndex: 0,
  isPlaying: false,
  volume: 1,
  currentTime: 0,
  duration: 0,

  setSongs: (newSongs) => {
    const state = get();
    if (state.songs.length > 0 && newSongs.length < state.songs.length) {
      console.warn("⚠️ Ignoring partial song list overwrite");
      return;
    }
    set({
      songs: newSongs,
      currentIndex: 0,
      isPlaying: false
    });
  },

  setPlaylists: (playlists) => {
    set({ playlists });
  },

  setSelectedPlaylistName: (name) => {
    console.log("📁 [STORE] Setting selectedPlaylistName:", name);
    set({ selectedPlaylistName: name });
  },

  setCurrentPlaylistSongs: (playlistSongs, playlistName, force = false) => {
    const state = get();
    
    console.log("🎵 [STORE] setCurrentPlaylistSongs called");
    console.log("   playlistName:", playlistName);
    console.log("   force:", force);
    
    if (!force && state.selectedPlaylistName === playlistName) {
      console.log("   ✅ SAME PLAYLIST NAME - PRESERVING playback");
      return;
    }
    
    console.log("   🔄 NEW PLAYLIST - Resetting to index 0");
    set({
      currentPlaylistSongs: playlistSongs,
      selectedPlaylistName: playlistName,
      currentIndex: 0,
      isPlaying: false
    });
  },

  playIndex: (index) => {
    const state = get();
    if (!state.currentPlaylistSongs[index]) {
      console.warn("⚠️ Invalid index:", index);
      return;
    }
    console.log("▶️ [STORE] Playing index:", index);
    set({ currentIndex: index, isPlaying: true });
  },

  togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),
  
  next: () =>
    set(state => ({
      currentIndex: (state.currentIndex + 1) % state.currentPlaylistSongs.length,
      isPlaying: true
    })),
    
  prev: () =>
    set(state => ({
      currentIndex:
        state.currentIndex === 0
          ? state.currentPlaylistSongs.length - 1
          : state.currentIndex - 1,
      isPlaying: true
    })),

  setVolume: (volume) => {
    set({ volume });
    if (globalAudioElement) globalAudioElement.volume = volume;
  },

  setCurrentTime: (time) => {
    set({ currentTime: time });
    // ✅ Also update the audio element directly
    if (globalAudioElement) {
      globalAudioElement.currentTime = time;
      console.log("⏩ [STORE] Set audio currentTime to:", time);
    }
  },
  
  setDuration: (dur) => set({ duration: dur })
}));

export default function MusicEngine() {
  const { currentPlaylistSongs, currentIndex, isPlaying, volume, next } = useMusicStore();
  const initRef = useRef(false);

  // 🎧 Init audio ONCE
  useEffect(() => {
    if (initRef.current || audioInitialized) {
      console.log("✅ [AUDIO] Audio already initialized");
      return;
    }
    
    initRef.current = true;
    audioInitialized = true;

    console.log("🎧 [AUDIO] Creating global audio element");

    globalAudioElement = new Audio();
    globalAudioElement.preload = "auto";
    globalAudioElement.crossOrigin = "anonymous";

    globalAudioElement.addEventListener("ended", next);
    globalAudioElement.addEventListener("timeupdate", () => {
      useMusicStore.setState({
        currentTime: globalAudioElement.currentTime,
        duration: globalAudioElement.duration
      });
    });

    return () => {};
  }, []);

  // 🎵 Load song from CURRENT PLAYLIST
  useEffect(() => {
    if (!currentPlaylistSongs[currentIndex] || !globalAudioElement) {
      console.log("⚠️ [SONG] No song available");
      return;
    }

    const song = currentPlaylistSongs[currentIndex];
    console.log("📀 [SONG] Loading:", song.title);

    globalAudioElement.src = `http://localhost:5000${song.file_path}`;
    globalAudioElement.load();
    globalAudioElement.currentTime = 0;

    if (isPlaying) {
      setTimeout(() => {
        globalAudioElement.play().catch((e) => {
          console.error("❌ Play error:", e);
          useMusicStore.getState().next();
        });
      }, 100);
    }
  }, [currentIndex, currentPlaylistSongs.length]);

  // ▶️ Play / Pause
  useEffect(() => {
    if (!globalAudioElement) return;

    console.log("🎙️ [STATE] isPlaying:", isPlaying);

    if (isPlaying) {
      globalAudioElement.play().catch(e => console.error("Play error:", e));
    } else {
      globalAudioElement.pause();
    }
  }, [isPlaying]);

  // 🔊 Volume
  useEffect(() => {
    if (globalAudioElement) {
      globalAudioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  return null;
}