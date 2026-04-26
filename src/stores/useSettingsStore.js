import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      // Theme settings
      theme: 'system', // 'light', 'dark', 'system'
      setTheme: (theme) => set({ theme }),

      // Workspace/Canvas settings
      showGrid: true,
      setShowGrid: (showGrid) => set({ showGrid }),
      showAxes: true,
      setShowAxes: (showAxes) => set({ showAxes }),
      antiAliasing: true,
      setAntiAliasing: (antiAliasing) => set({ antiAliasing }),
      shadows: true,
      setShadows: (shadows) => set({ shadows }),
      canvasBackgroundColor: '#020617',
      setCanvasBackgroundColor: (canvasBackgroundColor) => set({ canvasBackgroundColor }),

      // Shortcuts mapping
      shortcuts: {
        draw_line: 'l',
        draw_plane: 'p',
        select_vertex: 'v',
        toggle_grid: 'g',
        toggle_axes: 'a',
        search: 'k' // For Ctrl+K
      },
      updateShortcut: (action, key) => 
        set((state) => ({
          shortcuts: {
            ...state.shortcuts,
            [action]: key.toLowerCase()
          }
        }))
    }),
    {
      name: 'spatialmind-settings',
    }
  )
);
