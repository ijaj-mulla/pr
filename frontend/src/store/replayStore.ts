import { create } from 'zustand';
import type { ReplayState } from '../types';

const MAX_TIME = 900;

export const useReplayStore = create<ReplayState>((set) => ({
  mode: 'replay',
  isPlaying: false,
  currentTime: 0,
  speed: 1,
  maxTime: MAX_TIME,
  selectedRobotId: null,
  searchQuery: '',
  filterAttention: false,

  setMode: (mode) => set({ mode, isPlaying: false }),
  setIsPlaying: (playing: boolean) => {
    set({ isPlaying: playing });
  },

  setCurrentTime: (time: number) => {
    set({ currentTime: Math.max(0, Math.min(time, MAX_TIME)) });
  },

  setSpeed: (speed: number) => {
    set({ speed });
  },

  setSelectedRobotId: (robotId: string | null) => {
    set({ selectedRobotId: robotId });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setFilterAttention: (filter: boolean) => {
    set({ filterAttention: filter });
  },

  resetReplay: () => {
    set({
      isPlaying: false,
      currentTime: 0,
      speed: 1,
      selectedRobotId: null,
      searchQuery: '',
      filterAttention: false,
    });
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },
}));
