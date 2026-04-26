import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =====================================================
// SpatialMind — Problems Store
// =====================================================
// Quản lý toàn bộ dữ liệu bài tập:
//  - Danh sách bài (có thể thêm bài mới)
//  - Trạng thái giải: solved / unsolved / attempted
//  - Lịch sử nộp bài của người dùng
// Mọi thay đổi tự động lưu vào Chrome localStorage.
// =====================================================

const DEFAULT_PROBLEMS = [
  { id: 1, title: 'Tính thể tích khối chóp S.ABCD', acceptance: 68.5, difficulty: 'Easy', topic: 'Hình chóp', expectedAnswer: '\\frac{\\sqrt{2}}{3}' },
  { id: 2, title: 'Góc giữa hai mặt phẳng (SAB) và (SCD)', acceptance: 45.2, difficulty: 'Medium', topic: 'Góc', expectedAnswer: '45' },
  { id: 3, title: 'Khoảng cách chéo nhau giữa hai đường thẳng', acceptance: 22.8, difficulty: 'Hard', topic: 'Khoảng cách', expectedAnswer: 'a\\sqrt{2}' },
  { id: 4, title: 'Thể tích khối lăng trụ tam giác đều', acceptance: 75.1, difficulty: 'Easy', topic: 'Lăng trụ', expectedAnswer: '\\frac{3a^3\\sqrt{3}}{4}' },
  { id: 5, title: 'Mặt cầu ngoại tiếp hình chóp', acceptance: 35.4, difficulty: 'Medium', topic: 'Mặt cầu', expectedAnswer: '\\frac{a\\sqrt{6}}{2}' },
  { id: 6, title: 'Thiết diện cắt bởi mặt phẳng (P)', acceptance: 18.9, difficulty: 'Hard', topic: 'Thiết diện', expectedAnswer: '3a^2' },
];

export const useProblemsStore = create(
  persist(
    (set, get) => ({
      problems: DEFAULT_PROBLEMS,

      // Map: problemId -> 'solved' | 'attempted' | 'unsolved'
      solvedStatus: {},

      // Map: problemId -> [{ answer, result, timestamp }]
      submissions: {},

      // ── Lấy trạng thái 1 bài ──
      getStatus: (problemId) => {
        return get().solvedStatus[problemId] || 'unsolved';
      },

      // ── Submit đáp án ──
      submitAnswer: (problemId, answer) => set((state) => {
        const problem = state.problems.find(p => p.id === problemId);
        const isCorrect = problem && answer.replace(/\s/g, '') === problem.expectedAnswer.replace(/\s/g, '');
        const newSubmission = {
          answer,
          result: isCorrect ? 'accepted' : 'wrong',
          timestamp: new Date().toISOString(),
        };

        const prevSubs = state.submissions[problemId] || [];
        return {
          submissions: {
            ...state.submissions,
            [problemId]: [...prevSubs, newSubmission],
          },
          solvedStatus: {
            ...state.solvedStatus,
            [problemId]: isCorrect ? 'solved' : (state.solvedStatus[problemId] === 'solved' ? 'solved' : 'attempted'),
          },
        };
      }),

      // ── Thêm bài tập mới ──
      addProblem: (problem) => set((state) => ({
        problems: [...state.problems, { ...problem, id: Date.now() }],
      })),

      // ── Xóa bài tập ──
      removeProblem: (problemId) => set((state) => ({
        problems: state.problems.filter(p => p.id !== problemId),
      })),

      // ── Thống kê ──
      getStats: () => {
        const state = get();
        const solved = Object.values(state.solvedStatus).filter(s => s === 'solved').length;
        const attempted = Object.values(state.solvedStatus).filter(s => s === 'attempted').length;
        const total = state.problems.length;
        const acceptRate = total > 0 ? ((solved / total) * 100).toFixed(1) : '0.0';
        return { solved, attempted, total, acceptRate };
      },

      // ── Reset ──
      resetProblems: () => set({
        problems: DEFAULT_PROBLEMS,
        solvedStatus: {},
        submissions: {},
      }),
    }),
    { name: 'spatialmind_problems' }
  )
);
