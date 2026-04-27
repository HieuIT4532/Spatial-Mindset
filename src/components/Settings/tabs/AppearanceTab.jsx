// =====================================================
// SpatialMind — Appearance Tab (Settings)
// =====================================================
// Theme selection: Light, Dark, System
// Premium card-based selector with preview
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Check, Palette } from 'lucide-react';
import useSettingsStore from '../../../stores/useSettingsStore';

const THEMES = [
  {
    id: 'light',
    label: 'Sáng',
    description: 'Giao diện sáng, phù hợp ban ngày',
    icon: Sun,
    preview: {
      bg: '#f8fafc',
      sidebar: '#ffffff',
      header: '#e2e8f0',
      accent: '#22d3ee',
      text: '#0f172a',
      card: '#f1f5f9',
    },
  },
  {
    id: 'dark',
    label: 'Tối',
    description: 'Giao diện tối, bảo vệ mắt khi làm việc lâu',
    icon: Moon,
    preview: {
      bg: '#020617',
      sidebar: '#0f172a',
      header: '#1e293b',
      accent: '#22d3ee',
      text: '#f8fafc',
      card: '#1e293b',
    },
  },
  {
    id: 'system',
    label: 'Hệ thống',
    description: 'Tự động theo cài đặt hệ điều hành',
    icon: Monitor,
    preview: {
      bg: 'linear-gradient(135deg, #020617 50%, #f8fafc 50%)',
      sidebar: 'linear-gradient(135deg, #0f172a 50%, #ffffff 50%)',
      header: 'linear-gradient(135deg, #1e293b 50%, #e2e8f0 50%)',
      accent: '#22d3ee',
      text: '#94a3b8',
      card: 'linear-gradient(135deg, #1e293b 50%, #f1f5f9 50%)',
    },
  },
];

function ThemePreview({ theme, isSelected }) {
  const p = theme.preview;
  return (
    <div
      className="w-full aspect-[16/10] rounded-xl overflow-hidden relative"
      style={{ background: p.bg, border: '1px solid rgba(128,128,128,0.15)' }}
    >
      {/* Mini sidebar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[22%]"
        style={{ background: p.sidebar, borderRight: '1px solid rgba(128,128,128,0.1)' }}
      >
        <div className="p-1.5 space-y-1 mt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-1.5 rounded-full" style={{ background: p.accent, opacity: i === 1 ? 0.6 : 0.15, width: `${70 - i * 10}%` }} />
          ))}
        </div>
      </div>
      {/* Mini header */}
      <div
        className="absolute top-0 left-[22%] right-0 h-[12%]"
        style={{ background: p.header, borderBottom: '1px solid rgba(128,128,128,0.1)' }}
      />
      {/* Mini content */}
      <div className="absolute top-[12%] left-[22%] right-0 bottom-0 p-2">
        <div className="space-y-1.5 mt-1">
          <div className="h-2 w-[60%] rounded-full" style={{ background: p.card }} />
          <div className="h-2 w-[40%] rounded-full" style={{ background: p.card }} />
          <div className="grid grid-cols-2 gap-1 mt-2">
            <div className="h-6 rounded-md" style={{ background: p.card }} />
            <div className="h-6 rounded-md" style={{ background: p.card }} />
          </div>
        </div>
      </div>
      {/* Selected checkmark */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg"
        >
          <Check size={12} className="text-white" strokeWidth={3} />
        </motion.div>
      )}
    </div>
  );
}

export default function AppearanceTab() {
  const { theme, setTheme } = useSettingsStore();
  const isDark = useSettingsStore((s) => s.getEffectiveTheme()) === 'dark';

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Theme Selector */}
      <div>
        <h4 className={`text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <Palette size={14} className="text-cyan-400" />
          Chọn Theme
        </h4>
        <p className={`text-xs mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Chọn giao diện phù hợp với sở thích và môi trường làm việc của bạn.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {THEMES.map((t, i) => {
            const isSelected = theme === t.id;
            return (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setTheme(t.id)}
                className="flex flex-col rounded-2xl p-4 transition-all text-left group"
                style={{
                  background: isSelected
                    ? (isDark ? 'rgba(34,211,238,0.06)' : 'rgba(34,211,238,0.08)')
                    : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
                  border: isSelected
                    ? '2px solid rgba(34,211,238,0.4)'
                    : (isDark ? '2px solid rgba(255,255,255,0.06)' : '2px solid rgba(0,0,0,0.06)'),
                  boxShadow: isSelected ? '0 0 20px rgba(34,211,238,0.1)' : 'none',
                }}
              >
                {/* Preview */}
                <ThemePreview theme={t} isSelected={isSelected} />

                {/* Label */}
                <div className="mt-4 flex items-center gap-2">
                  <t.icon
                    size={16}
                    className={`transition-colors ${
                      isSelected ? 'text-cyan-400' : isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  />
                  <span className={`text-sm font-bold ${
                    isSelected
                      ? 'text-cyan-400'
                      : isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    {t.label}
                  </span>
                </div>
                <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {t.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Info box */}
      <div
        className="p-4 rounded-2xl flex items-start gap-3"
        style={{
          background: isDark ? 'rgba(34,211,238,0.04)' : 'rgba(34,211,238,0.06)',
          border: isDark ? '1px solid rgba(34,211,238,0.1)' : '1px solid rgba(34,211,238,0.15)',
        }}
      >
        <Monitor size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className={`text-xs font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
            Mẹo: Dùng chế độ "Hệ thống"
          </p>
          <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Giao diện sẽ tự động chuyển giữa sáng và tối theo cài đặt hệ điều hành của bạn. 
            Tiết kiệm mắt vào ban đêm, sáng sủa vào ban ngày!
          </p>
        </div>
      </div>
    </div>
  );
}
