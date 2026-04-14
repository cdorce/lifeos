import { create } from 'zustand';
import { useEffect, useRef } from 'react';

// Global audio element — never destroyed
let globalRadioAudio = null;
let radioInitialized = false;

export const useRadioStore = create((set, get) => ({
  currentStation: null,
  isPlaying: false,
  volume: 0.8,
  isMuted: false,

  playStation: (station) => {
    const state = get();

    // Stop existing audio
    if (globalRadioAudio) {
      globalRadioAudio.pause();
      globalRadioAudio.src = '';
    }

    // Clicking the active station while playing → stop it
    if (state.currentStation?.stationuuid === station.stationuuid && state.isPlaying) {
      set({ isPlaying: false, currentStation: null });
      return;
    }

    globalRadioAudio = new Audio(station.url);
    globalRadioAudio.volume = state.isMuted ? 0 : state.volume;
    globalRadioAudio.play().catch(err => console.error('Radio playback error:', err));
    set({ currentStation: station, isPlaying: true });
  },

  pause: () => {
    if (globalRadioAudio) globalRadioAudio.pause();
    set({ isPlaying: false });
  },

  resume: () => {
    if (globalRadioAudio) {
      globalRadioAudio.play().catch(err => console.error('Radio resume error:', err));
      set({ isPlaying: true });
    }
  },

  stop: () => {
    if (globalRadioAudio) {
      globalRadioAudio.pause();
      globalRadioAudio.src = '';
      globalRadioAudio = null;
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

// Mounts once in App.jsx — keeps audio alive across route changes
export default function RadioEngine() {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current || radioInitialized) return;
    initRef.current = true;
    radioInitialized = true;
  }, []);

  return null;
}
