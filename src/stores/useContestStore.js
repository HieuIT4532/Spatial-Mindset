import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =====================================================
// SpatialMind — Contest Store
// =====================================================
// Quản lý:
//  - Danh sách contest (có thể thêm / sửa)
//  - Đăng ký tham gia
//  - Elo Rating của người dùng
//  - Lịch sử thi đấu & kết quả
// Mọi thay đổi tự động lưu vào Chrome localStorage.
// =====================================================

const DEFAULT_CONTESTS = [
  {
    id: 1,
    title: 'Weekly Geometry Challenge #104',
    status: 'ongoing',
    startTime: 'Đang diễn ra',
    participants: 1245,
    duration: '90 phút',
    durationSeconds: 5400,
    prizes: ['Huy hiệu Weekly Winner', '500 XP'],
  },
  {
    id: 2,
    title: 'Monthly Spatial Cup - May 2026',
    status: 'upcoming',
    startTime: 'Bắt đầu sau 3 ngày',
    participants: 450,
    duration: '120 phút',
    durationSeconds: 7200,
    prizes: ['Premium 1 tháng', 'Khung Avatar Đặc biệt'],
  },
  {
    id: 3,
    title: 'Vector Masterclass Arena',
    status: 'past',
    startTime: 'Đã kết thúc',
    participants: 3200,
    duration: '60 phút',
    durationSeconds: 3600,
    prizes: [],
  },
];

export const useContestStore = create(
  persist(
    (set, get) => ({
      contests: DEFAULT_CONTESTS,

      // Elo rating
      elo: 1200,
      eloHistory: [],

      // Set of contest IDs the user has registered for
      registeredContests: [],

      // Map: contestId -> { answers: [...], submittedAt, score }
      contestResults: {},

      // ── Đăng ký contest ──
      registerContest: (contestId) => set((state) => {
        if (state.registeredContests.includes(contestId)) return state;
        // Tăng participant count
        const updatedContests = state.contests.map(c =>
          c.id === contestId ? { ...c, participants: c.participants + 1 } : c
        );
        return {
          registeredContests: [...state.registeredContests, contestId],
          contests: updatedContests,
        };
      }),

      // ── Hủy đăng ký ──
      unregisterContest: (contestId) => set((state) => ({
        registeredContests: state.registeredContests.filter(id => id !== contestId),
        contests: state.contests.map(c =>
          c.id === contestId ? { ...c, participants: Math.max(0, c.participants - 1) } : c
        ),
      })),

      // ── Submit kết quả contest ──
      submitContestResult: (contestId, answers, score) => set((state) => {
        // Tính Elo mới (simplified Elo: +30 nếu đạt >= 60%, -15 nếu không)
        const eloChange = score >= 60 ? 30 : -15;
        const newElo = Math.max(0, state.elo + eloChange);

        return {
          contestResults: {
            ...state.contestResults,
            [contestId]: {
              answers,
              score,
              submittedAt: new Date().toISOString(),
              eloChange,
            },
          },
          elo: newElo,
          eloHistory: [...state.eloHistory, { date: new Date().toISOString(), elo: newElo, contestId }],
        };
      }),

      // ── Thêm contest ──
      addContest: (contest) => set((state) => ({
        contests: [...state.contests, { ...contest, id: Date.now(), participants: 0 }],
      })),

      // ── Cập nhật status contest ──
      updateContestStatus: (contestId, status) => set((state) => ({
        contests: state.contests.map(c =>
          c.id === contestId ? { ...c, status } : c
        ),
      })),

      // ── Lấy rank từ Elo ──
      getRank: () => {
        const elo = get().elo;
        if (elo >= 2400) return { name: 'Thách Đấu', color: '#ff4444', emoji: '🏆' };
        if (elo >= 2000) return { name: 'Kim Cương', color: '#00bcd4', emoji: '💎' };
        if (elo >= 1600) return { name: 'Vàng', color: '#ffd700', emoji: '🥇' };
        if (elo >= 1200) return { name: 'Bạc', color: '#c0c0c0', emoji: '🥈' };
        return { name: 'Đồng', color: '#cd7f32', emoji: '🥉' };
      },

      // ── Kiểm tra đã đăng ký chưa ──
      isRegistered: (contestId) => {
        return get().registeredContests.includes(contestId);
      },

      // ── Reset ──
      resetContests: () => set({
        contests: DEFAULT_CONTESTS,
        elo: 1200,
        eloHistory: [],
        registeredContests: [],
        contestResults: {},
      }),
    }),
    { name: 'spatialmind_contests' }
  )
);
