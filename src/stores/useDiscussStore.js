import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =====================================================
// SpatialMind — Discuss Store
// =====================================================
// Quản lý:
//  - Danh sách bài viết (tạo mới, xóa)
//  - Likes, views
//  - Bình luận
//  - Dữ liệu Spatial 3D nhúng trong bài viết
// Mọi thay đổi tự động lưu vào Chrome localStorage.
// =====================================================

const DEFAULT_POSTS = [
  {
    id: 1,
    title: '[Hướng dẫn] Mẹo xác định nhanh góc giữa hai mặt phẳng',
    author: 'MathWiz99',
    avatar: 'M',
    content: `Xin chào mọi người, hôm nay mình xin chia sẻ một meta cực nhanh để xác định góc giữa hai mặt phẳng trong không gian.

Giả sử chúng ta có hình chóp $S.ABCD$ với đáy là hình vuông. Đề bài yêu cầu tìm góc giữa mặt phẳng $(SCD)$ và mặt đáy $(ABCD)$.

Cách làm chuẩn SGK:
1. Tìm giao tuyến của 2 mặt phẳng: $CD$
2. Từ $S$ kẻ $SH \\\\perp (ABCD)$
3. Từ $H$ kẻ $HK \\\\perp CD$
4. Suy ra góc cần tìm là $\\\\widehat{SKH}$

Các bạn có thể tương tác trực tiếp với mô hình 3D mình đã dựng bên dưới để dễ hình dung!`,
    views: 1250,
    likes: 342,
    likedBy: [],
    tags: ['Góc', 'Mẹo', 'Lý thuyết'],
    createdAt: '2026-04-27T03:00:00Z',
    comments: [
      { id: 1, author: 'SpatialFan', content: 'Quá hay! Cảm ơn bạn.', createdAt: '2026-04-27T04:00:00Z' },
    ],
    spatialData: {
      type: '3D',
      vertices: {
        A: [-1, 0, 1], B: [1, 0, 1], C: [1, 0, -1], D: [-1, 0, -1],
        S: [-1, 2, 1],
      },
      edges: [
        ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
        ['S', 'A'], ['S', 'B'], ['S', 'C'], ['S', 'D'],
      ],
    },
  },
  {
    id: 2,
    title: 'Hỏi bài: Thiết diện cắt bởi mặt phẳng (MNP) đi qua trọng tâm',
    author: 'geometry_noob',
    avatar: 'G',
    content: 'Cho hình hộp chữ nhật $ABCDA\'B\'C\'D\'$. Mình không biết cách xác định thiết diện khi mặt phẳng đi qua trọng tâm tam giác $ABC$. Ai giúp mình với!',
    views: 89,
    likes: 5,
    likedBy: [],
    tags: ['Thiết diện', 'Hỏi đáp'],
    createdAt: '2026-04-27T00:00:00Z',
    comments: [],
    spatialData: null,
  },
  {
    id: 3,
    title: 'Showcase: Dựng mô hình khối chóp tứ giác đều SIÊU ĐẸP bằng SpatialMind',
    author: 'Architect2026',
    avatar: 'A',
    content: 'Mình vừa hoàn thành mô hình 3D của khối chóp tứ giác đều, xoay góc nào cũng đẹp! Anh em thử xem.',
    views: 5400,
    likes: 1205,
    likedBy: [],
    tags: ['3D Showcase', 'Mô hình'],
    createdAt: '2026-04-26T12:00:00Z',
    comments: [
      { id: 1, author: 'MathWiz99', content: 'Ảo thật! Render mượt quá.', createdAt: '2026-04-26T13:00:00Z' },
      { id: 2, author: 'geometry_noob', content: 'Làm sao bạn dựng nhanh vậy?', createdAt: '2026-04-26T14:00:00Z' },
    ],
    spatialData: {
      type: '3D',
      vertices: {
        A: [-1, 0, 1], B: [1, 0, 1], C: [1, 0, -1], D: [-1, 0, -1],
        S: [0, 2, 0],
      },
      edges: [
        ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
        ['S', 'A'], ['S', 'B'], ['S', 'C'], ['S', 'D'],
      ],
    },
  },
];

export const useDiscussStore = create(
  persist(
    (set, get) => ({
      posts: DEFAULT_POSTS,

      // ── Tạo bài viết mới ──
      createPost: ({ title, content, tags = [], spatialData = null }) => set((state) => {
        const profileData = JSON.parse(localStorage.getItem('spatialmind_profile_storage') || '{}');
        const authorName = profileData?.state?.displayName || 'Người dùng';
        
        const newPost = {
          id: Date.now(),
          title,
          author: authorName,
          avatar: authorName.charAt(0).toUpperCase(),
          content,
          views: 0,
          likes: 0,
          likedBy: [],
          tags,
          createdAt: new Date().toISOString(),
          comments: [],
          spatialData,
        };
        return { posts: [newPost, ...state.posts] };
      }),

      // ── Xóa bài viết ──
      deletePost: (postId) => set((state) => ({
        posts: state.posts.filter(p => p.id !== postId),
      })),

      // ── Like / Unlike ──
      toggleLike: (postId) => set((state) => {
        const userId = 'local_user'; // ID cố định cho local user
        return {
          posts: state.posts.map(p => {
            if (p.id !== postId) return p;
            const alreadyLiked = p.likedBy.includes(userId);
            return {
              ...p,
              likes: alreadyLiked ? p.likes - 1 : p.likes + 1,
              likedBy: alreadyLiked
                ? p.likedBy.filter(id => id !== userId)
                : [...p.likedBy, userId],
            };
          }),
        };
      }),

      // ── Tăng view ──
      incrementView: (postId) => set((state) => ({
        posts: state.posts.map(p =>
          p.id === postId ? { ...p, views: p.views + 1 } : p
        ),
      })),

      // ── Thêm bình luận ──
      addComment: (postId, content) => set((state) => {
        const profileData = JSON.parse(localStorage.getItem('spatialmind_profile_storage') || '{}');
        const authorName = profileData?.state?.displayName || 'Người dùng';
        
        const newComment = {
          id: Date.now(),
          author: authorName,
          content,
          createdAt: new Date().toISOString(),
        };
        return {
          posts: state.posts.map(p =>
            p.id === postId
              ? { ...p, comments: [...p.comments, newComment] }
              : p
          ),
        };
      }),

      // ── Xóa bình luận ──
      deleteComment: (postId, commentId) => set((state) => ({
        posts: state.posts.map(p =>
          p.id === postId
            ? { ...p, comments: p.comments.filter(c => c.id !== commentId) }
            : p
        ),
      })),

      // ── Lấy 1 bài viết theo ID ──
      getPost: (postId) => {
        return get().posts.find(p => p.id === postId) || null;
      },

      // ── Reset ──
      resetDiscuss: () => set({ posts: DEFAULT_POSTS }),
    }),
    { name: 'spatialmind_discuss' }
  )
);
