import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useContestStore = create(
  persist(
    (set) => ({
      activeContestId: null,
      timeLeft: 90 * 60,
      isStarted: false,
      
      startContest: (contestId, duration = 90 * 60) => set({
        activeContestId: contestId,
        timeLeft: duration,
        isStarted: true
      }),
      
      decrementTime: () => set((state) => ({
        timeLeft: Math.max(0, state.timeLeft - 1)
      })),
      
      addPenalty: (seconds) => set((state) => ({
        timeLeft: Math.max(0, state.timeLeft - seconds)
      })),
      
      endContest: () => set({
        isStarted: false,
        timeLeft: 0
      })
    }),
    {
      name: 'spatialmind-contest-storage',
    }
  )
);

export default useContestStore;
