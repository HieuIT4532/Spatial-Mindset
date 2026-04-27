// =====================================================
// SpatialMind — Workspace Tab (Settings)
// =====================================================
// Canvas 3D settings: Grid, Axes, Anti-aliasing, Shadows
// Environment: Background color picker
// =====================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor, Grid3X3, Axis3D, Sparkles, Sun,
  Palette, Zap, Eye, Box, Info,
} from 'lucide-react';
import useSettingsStore from '../../../stores/useSettingsStore';

// ── Toggle Switch Component ──
function ToggleSwitch({ label, description, checked, onChange, icon: Icon, color = '#22d3ee', delay = 0 }) {
  const isDark = useSettingsStore((s) => s.getEffectiveTheme()) === 'dark';
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between p-4 rounded-2xl transition-all"
      style={{
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        <div>
          <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{label}</p>
          {description && (
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{description}</p>
          )}
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => onChange(!checked)}
        className="relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0"
        style={{
          background: checked
            ? `linear-gradient(90deg, ${color}aa, ${color})`
            : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
          boxShadow: checked ? `0 0 12px ${color}40` : 'none',
        }}
      >
        <motion.div
          className="absolute top-0.5 w-6 h-6 rounded-full shadow-lg"
          style={{
            background: checked ? '#fff' : (isDark ? '#64748b' : '#94a3b8'),
          }}
          animate={{ left: checked ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </motion.div>
  );
}

// ── Color Picker ──
const PRESET_COLORS = [
  { color: '#020617', label: 'Midnight' },
  { color: '#0f172a', label: 'Navy' },
  { color: '#1a1a2e', label: 'Deep Purple' },
  { color: '#0d1b2a', label: 'Ocean' },
  { color: '#1b263b', label: 'Steel' },
  { color: '#2d3436', label: 'Graphite' },
  { color: '#0a192f', label: 'Abyss' },
  { color: '#1a1a1a', label: 'Carbon' },
  { color: '#e0f2fe', label: 'Sky (Light)' },
  { color: '#f0fdf4', label: 'Mint (Light)' },
  { color: '#fdf4ff', label: 'Lavender (Light)' },
  { color: '#fffbeb', label: 'Warm (Light)' },
];

export default function WorkspaceTab() {
  const { workspace, updateWorkspace } = useSettingsStore();
  const isDark = useSettingsStore((s) => s.getEffectiveTheme()) === 'dark';
  const [customColor, setCustomColor] = useState(workspace.backgroundColor);

  return (
    <div className="space-y-8 max-w-3xl">
      {/* ── Display Settings ── */}
      <div>
        <h4 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <Eye size={14} className="text-cyan-400" />
          Hiển thị (Display)
        </h4>
        <div className="space-y-3">
          <ToggleSwitch
            label="Lưới tọa độ (Grid)"
            description="Hiển thị lưới Oxyz trên không gian 3D"
            checked={workspace.showGrid}
            onChange={(v) => updateWorkspace({ showGrid: v })}
            icon={Grid3X3}
            color="#22d3ee"
            delay={0.05}
          />
          <ToggleSwitch
            label="Trục tọa độ X-Y-Z (Axes)"
            description="Hiển thị các trục tọa độ với màu sắc"
            checked={workspace.showAxes}
            onChange={(v) => updateWorkspace({ showAxes: v })}
            icon={Axis3D}
            color="#a78bfa"
            delay={0.1}
          />
        </div>
      </div>

      {/* ── Performance Settings ── */}
      <div>
        <h4 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <Zap size={14} className="text-yellow-400" />
          Hiệu năng (Performance)
        </h4>
        <div className="space-y-3">
          <ToggleSwitch
            label="Khử răng cưa (Anti-aliasing)"
            description="Cạnh mượt hơn nhưng tốn nhiều GPU hơn"
            checked={workspace.antiAliasing}
            onChange={(v) => updateWorkspace({ antiAliasing: v })}
            icon={Sparkles}
            color="#34d399"
            delay={0.05}
          />
          <ToggleSwitch
            label="Đổ bóng (Shadows)"
            description="Bóng đổ thực tế, tắt để tăng FPS trên máy yếu"
            checked={workspace.shadows}
            onChange={(v) => updateWorkspace({ shadows: v })}
            icon={Sun}
            color="#fbbf24"
            delay={0.1}
          />
        </div>

        {/* Performance tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 p-3 rounded-xl flex items-start gap-2"
          style={{
            background: isDark ? 'rgba(251,191,36,0.05)' : 'rgba(251,191,36,0.08)',
            border: isDark ? '1px solid rgba(251,191,36,0.1)' : '1px solid rgba(251,191,36,0.15)',
          }}
        >
          <Info size={13} className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className={`text-[11px] ${isDark ? 'text-yellow-200/60' : 'text-yellow-700/60'}`}>
            Tắt Anti-aliasing và Shadows sẽ giúp tăng FPS đáng kể trên máy cấu hình thấp.
          </p>
        </motion.div>
      </div>

      {/* ── Environment Settings ── */}
      <div>
        <h4 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <Palette size={14} className="text-pink-400" />
          Môi trường (Environment)
        </h4>

        <div
          className="p-5 rounded-2xl space-y-4"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Màu nền không gian 3D
          </p>

          {/* Preset colors */}
          <div className="grid grid-cols-6 gap-2">
            {PRESET_COLORS.map((preset) => {
              const isSelected = workspace.backgroundColor === preset.color;
              return (
                <button
                  key={preset.color}
                  onClick={() => {
                    updateWorkspace({ backgroundColor: preset.color });
                    setCustomColor(preset.color);
                  }}
                  className="group flex flex-col items-center gap-1.5"
                  title={preset.label}
                >
                  <div
                    className="w-10 h-10 rounded-xl transition-all"
                    style={{
                      backgroundColor: preset.color,
                      border: isSelected
                        ? '2px solid #22d3ee'
                        : `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      boxShadow: isSelected ? '0 0 12px rgba(34,211,238,0.3)' : 'none',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                  <span className={`text-[8px] font-bold ${isDark ? 'text-slate-600' : 'text-slate-400'} group-hover:text-cyan-400 transition-colors`}>
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom color input */}
          <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            <label className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tùy chỉnh:</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  updateWorkspace({ backgroundColor: e.target.value });
                }}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                    updateWorkspace({ backgroundColor: e.target.value });
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono w-24 ${
                  isDark
                    ? 'bg-white/5 border border-white/10 text-slate-300'
                    : 'bg-black/5 border border-black/10 text-slate-600'
                } focus:outline-none focus:ring-1 focus:ring-cyan-400`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
