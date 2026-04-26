import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =====================================================
// SpatialMind — Gamification Store (XP, Streak, Rank)
// =====================================================
// Thay thế hoàn toàn các lệnh localStorage.getItem/setItem
// rải rác trong App.jsx, ProfileTab, GameHUD, v.v.
// Mọi thay đổi tự động lưu vào Chrome localStorage.
// =====================================================

export const useGamificationStore = create(
  persist(
    (set, get) => ({
      xp: 0,
      streak: 0,
      maxStreak: 0,
      level: 1,
      totalSolved: 0,
      totalStars: 0,
      achievements: [],
      // Tracking ngày cuối cùng hoạt động để tính streak
      lastActiveDate: null,

      // ── XP ──
      addXP: (amount) => set((state) => {
        const newXP = state.xp + amount;
        const newLevel = Math.floor(newXP / 500) + 1;
        return { xp: newXP, level: newLevel };
      }),

      // ── Streak ──
      checkInToday: () => set((state) => {
        const today = new Date().toISOString().slice(0, 10);
        if (state.lastActiveDate === today) return state; // Đã check-in rồi

        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const isConsecutive = state.lastActiveDate === yesterday;
        const newStreak = isConsecutive ? state.streak + 1 : 1;
        const newMax = Math.max(newStreak, state.maxStreak);

        return {
          streak: newStreak,
          maxStreak: newMax,
          lastActiveDate: today,
        };
      }),

      // ── Problem solved ──
      incrementSolved: () => set((state) => ({
        totalSolved: state.totalSolved + 1,
      })),

      // ── Achievements ──
      unlockAchievement: (achievementId) => set((state) => {
        if (state.achievements.includes(achievementId)) return state;
        return { achievements: [...state.achievements, achievementId] };
      }),

      // ── Stars ──
      addStars: (count) => set((state) => ({
        totalStars: state.totalStars + count,
      })),

      // ── Reset (for testing) ──
      resetGamification: () => set({
        xp: 0, streak: 0, maxStreak: 0, level: 1,
        totalSolved: 0, totalStars: 0, achievements: [],
        lastActiveDate: null,
      }),
    }),
    { name: 'spatialmind_gamification' }
  )
);
