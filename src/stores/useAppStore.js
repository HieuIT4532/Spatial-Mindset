import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // 1. Gamification (Streak)
  currentStreak: 0,
  incrementStreak: () => set((state) => ({ currentStreak: state.currentStreak + 1 })),

  // 2. Contest Mode (Lock AI)
  isContestMode: false,
  setContestMode: (status) => set({ isContestMode: status }),
}));
