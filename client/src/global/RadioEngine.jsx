import { create } from 'zustand';
import { useEffect, useRef } from 'react';

// Single global audio element — never destroyed, same as MusicEngine pattern
let globalRadioAudio = null;
let radioInitialized = false;

export const useRadioStore = create((set, get) => ({
  currentStation: null,
  isPlaying: false,
  volume: 0.8,
  isMuted: false,

  // Only sets state — the RadioEngine component's useEffects handle the actual audio
  playStation: (station) => {
    const state = get();
    // Clicking the active playing station toggles it off
    if (state.currentStation?.stationuuid === station.stationuuid && state.isPlaying) {
      set({ isPlaying: false });
      return;
    }
    set({ currentStation: station, isPlaying: true });
  },

  pause:  () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  stop: () => {
    if (globalRadioAudio) {
      globalRadioAudio.pause();
      globalRadioAudio.src = '';
    }
    set({ isPlaying: false, currentStation: null });
  },

  setVolume: (vol) => {
    set({ volume: vol, isMuted: vol === 0 });
    if (globalRadioAudio) globalRadioAudio.volume = vol;
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    const next = !isMuted;
    set({ isMuted: next });
    if (globalRadioAudio) globalRadioAudio.volume = next ? 0 : volume;
  },
}));

// Mounts ONCE in App.jsx (outside <Routes>) — never unmounts
// Mirrors MusicEngine: useEffects here are the bridge between store state and the audio API
export default function RadioEngine() {
  const { currentStation, isPlaying, volume, isMuted } = useRadioStore();
  const initRef = useRef(false);

  // Create the single audio element once
  useEffect(() => {
    if (initRef.current || radioInitialized) return;
    initRef.current = true;
    radioInitialized = true;

    globalRadioAudio = new Audio();
    globalRadioAudio.preload = 'none';
  }, []);

  // React to station changes — load new stream, play if needed
  useEffect(() => {
    if (!globalRadioAudio) return;

    if (!currentStation) {
      globalRadioAudio.pause();
      globalRadioAudio.src = '';
      return;
    }

    globalRadioAudio.pause();
    globalRadioAudio.src = currentStation.url;
    globalRadioAudio.load();

    if (isPlaying) {
      globalRadioAudio.play().catch(err => console.error('Radio play error:', err));
    }
  }, [currentStation]);

  // React to play/pause toggle
  useEffect(() => {
    if (!globalRadioAudio) return;
    if (isPlaying) {
      globalRadioAudio.play().catch(err => console.error('Radio play error:', err));
    } else {
      globalRadioAudio.pause();
    }
  }, [isPlaying]);

  // React to volume / mute
  useEffect(() => {
    if (globalRadioAudio) {
      globalRadioAudio.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume));
    }
  }, [volume, isMuted]);

  return null;
}
