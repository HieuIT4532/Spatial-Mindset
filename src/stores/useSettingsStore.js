// =====================================================
// SpatialMind — Global Settings Store (Zustand)
// =====================================================
// Quản lý tập trung: Theme, Workspace 3D, Shortcuts, Profile
// Tất cả settings được persist vào localStorage
// =====================================================

import { create } from 'zustand';

// ── Default Shortcuts ──
const DEFAULT_SHORTCUTS = {
  draw_line:      { key: 'l', label: 'Vẽ đoạn thẳng',      category: 'draw' },
  draw_plane:     { key: 'p', label: 'Dựng mặt phẳng',     category: 'draw' },
  draw_point:     { key: 'o', label: 'Đặt điểm',           category: 'draw' },
  select_vertex:  { key: 'v', label: 'Chọn đỉnh',          category: 'select' },
  select_edge:    { key: 'e', label: 'Chọn cạnh',          category: 'select' },
  select_face:    { key: 'f', label: 'Chọn mặt',           category: 'select' },
  toggle_grid:    { key: 'g', label: 'Bật/tắt lưới',       category: 'view' },
  toggle_axes:    { key: 'a', label: 'Bật/tắt trục tọa độ', category: 'view' },
  reset_camera:   { key: 'r', label: 'Reset camera',       category: 'view' },
  undo:           { key: 'z', label: 'Hoàn tác (Undo)',    category: 'edit' },
  redo:           { key: 'y', label: 'Làm lại (Redo)',     category: 'edit' },
  delete_selected:{ key: 'Delete', label: 'Xóa đã chọn',  category: 'edit' },
  measure:        { key: 'm', label: 'Đo khoảng cách',     category: 'tools' },
  screenshot:     { key: 's', label: 'Chụp ảnh 3D',        category: 'tools' },
  open_search:    { key: 'k', label: 'Mở Command Palette', category: 'tools' },
};

// ── Load from localStorage ──
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('spatialmind_settings');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saved = loadSettings();

const useSettingsStore = create((set, get) => ({
  // ══════════════════════════════
  // Theme (dark | light | system)
  // ══════════════════════════════
  theme: saved.theme || 'dark',
  setTheme: (theme) => {
    set({ theme });
    // Apply to DOM
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    get()._persist();
  },
  getEffectiveTheme: () => {
    const { theme } = get();
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  },

  // ══════════════════════════════
  // Workspace / Canvas 3D
  // ══════════════════════════════
  workspace: {
    showGrid: saved.workspace?.showGrid ?? true,
    showAxes: saved.workspace?.showAxes ?? true,
    antiAliasing: saved.workspace?.antiAliasing ?? true,
    shadows: saved.workspace?.shadows ?? true,
    backgroundColor: saved.workspace?.backgroundColor ?? '#020617',
    ...saved.workspace,
  },
  updateWorkspace: (updates) => {
    set((state) => ({
      workspace: { ...state.workspace, ...updates },
    }));
    get()._persist();
  },

  // ══════════════════════════════
  // Shortcuts (Rebindable)
  // ══════════════════════════════
  shortcuts: saved.shortcuts || { ...DEFAULT_SHORTCUTS },
  
  updateShortcut: (actionId, newKey) => {
    const { shortcuts } = get();
    // Check conflict
    const conflict = Object.entries(shortcuts).find(
      ([id, sc]) => id !== actionId && sc.key.toLowerCase() === newKey.toLowerCase()
    );
    if (conflict) {
      return { success: false, conflictWith: conflict[1].label, conflictId: conflict[0] };
    }
    set((state) => ({
      shortcuts: {
        ...state.shortcuts,
        [actionId]: { ...state.shortcuts[actionId], key: newKey },
      },
    }));
    get()._persist();
    return { success: true };
  },

  resetShortcuts: () => {
    set({ shortcuts: { ...DEFAULT_SHORTCUTS } });
    get()._persist();
  },

  // ══════════════════════════════
  // Settings Panel UI State
  // ══════════════════════════════
  isSettingsOpen: false,
  settingsTab: 'profile', // profile | appearance | workspace | shortcuts
  openSettings: (tab = 'profile') => set({ isSettingsOpen: true, settingsTab: tab }),
  closeSettings: () => set({ isSettingsOpen: false }),
  setSettingsTab: (tab) => set({ settingsTab: tab }),

  // ══════════════════════════════
  // Persist to localStorage
  // ══════════════════════════════
  _persist: () => {
    const { theme, workspace, shortcuts } = get();
    localStorage.setItem('spatialmind_settings', JSON.stringify({
      theme,
      workspace,
      shortcuts,
    }));
  },
}));

// ── Initialize theme on load ──
const initTheme = () => {
  const store = useSettingsStore.getState();
  const theme = store.theme;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (useSettingsStore.getState().theme === 'system') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
};
initTheme();

export default useSettingsStore;
