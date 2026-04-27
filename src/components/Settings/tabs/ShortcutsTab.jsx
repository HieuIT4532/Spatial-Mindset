// =====================================================
// SpatialMind — Shortcuts Tab (Settings)
// =====================================================
// Rebindable keyboard shortcuts table
// Conflict detection with red error flash
// Category grouping (draw, select, view, edit, tools)
// =====================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard, RotateCcw, AlertTriangle, Check,
  Pencil, MousePointer, Eye, Edit, Wrench,
} from 'lucide-react';
import useSettingsStore from '../../../stores/useSettingsStore';

const CATEGORY_INFO = {
  draw:   { label: 'Vẽ hình',     icon: Pencil,       color: '#22d3ee' },
  select: { label: 'Chọn',        icon: MousePointer,  color: '#a78bfa' },
  view:   { label: 'Xem',         icon: Eye,           color: '#34d399' },
  edit:   { label: 'Chỉnh sửa',   icon: Edit,          color: '#fbbf24' },
  tools:  { label: 'Công cụ',     icon: Wrench,        color: '#f472b6' },
};

// ── Key Display Helper ──
function formatKey(key) {
  const map = {
    'Delete': 'Del',
    'Escape': 'Esc',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    ' ': 'Space',
  };
  return map[key] || key.toUpperCase();
}

// ── Single Shortcut Row ──
function ShortcutRow({ actionId, shortcut, onRebind, delay = 0 }) {
  const isDark = useSettingsStore((s) => s.getEffectiveTheme()) === 'dark';
  const [isListening, setIsListening] = useState(false);
  const [conflict, setConflict] = useState(null);
  const [justBound, setJustBound] = useState(false);
  const rowRef = useRef(null);

  const handleStartListening = () => {
    setIsListening(true);
    setConflict(null);
    setJustBound(false);
  };

  const handleKeyCapture = useCallback((e) => {
    if (!isListening) return;
    e.preventDefault();
    e.stopPropagation();

    // Ignore modifier-only keys
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

    // Escape → cancel
    if (e.key === 'Escape') {
      setIsListening(false);
      return;
    }

    const newKey = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const result = onRebind(actionId, newKey);

    if (result.success) {
      setIsListening(false);
      setConflict(null);
      setJustBound(true);
      setTimeout(() => setJustBound(false), 1500);
    } else {
      setConflict(result.conflictWith);
      // Auto-clear conflict after 2s
      setTimeout(() => setConflict(null), 2500);
    }
  }, [isListening, actionId, onRebind]);

  useEffect(() => {
    if (isListening) {
      window.addEventListener('keydown', handleKeyCapture, true);
      return () => window.removeEventListener('keydown', handleKeyCapture, true);
    }
  }, [isListening, handleKeyCapture]);

  // Click outside → cancel
  useEffect(() => {
    if (!isListening) return;
    const handleClick = (e) => {
      if (rowRef.current && !rowRef.current.contains(e.target)) {
        setIsListening(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isListening]);

  return (
    <motion.div
      ref={rowRef}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between py-3 px-4 rounded-xl transition-all"
      style={{
        background: isListening
          ? (isDark ? 'rgba(34,211,238,0.06)' : 'rgba(34,211,238,0.08)')
          : conflict
            ? (isDark ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.08)')
            : 'transparent',
        border: isListening
          ? '1px solid rgba(34,211,238,0.2)'
          : conflict
            ? '1px solid rgba(239,68,68,0.2)'
            : '1px solid transparent',
      }}
    >
      {/* Action label */}
      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        {shortcut.label}
      </span>

      {/* Key binding */}
      <div className="flex items-center gap-2">
        {/* Conflict error */}
        <AnimatePresence>
          {conflict && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="text-[10px] text-red-400 font-bold flex items-center gap-1"
            >
              <AlertTriangle size={11} />
              Trùng với "{conflict}"
            </motion.span>
          )}
        </AnimatePresence>

        {/* Success indicator */}
        <AnimatePresence>
          {justBound && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="text-emerald-400"
            >
              <Check size={14} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Key button */}
        <button
          onClick={handleStartListening}
          className="min-w-[60px] text-center transition-all"
        >
          {isListening ? (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-400"
              style={{
                background: isDark ? 'rgba(34,211,238,0.1)' : 'rgba(34,211,238,0.15)',
                border: '1px solid rgba(34,211,238,0.3)',
              }}
            >
              Bấm phím...
            </motion.span>
          ) : (
            <kbd
              className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-cyan-500/30 hover:text-cyan-400'
                  : 'bg-black/5 border border-black/10 text-slate-500 hover:bg-black/10 hover:border-cyan-500/30 hover:text-cyan-600'
              }`}
            >
              {formatKey(shortcut.key)}
            </kbd>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default function ShortcutsTab() {
  const { shortcuts, updateShortcut, resetShortcuts } = useSettingsStore();
  const isDark = useSettingsStore((s) => s.getEffectiveTheme()) === 'dark';

  // Group shortcuts by category
  const grouped = Object.entries(shortcuts).reduce((acc, [id, sc]) => {
    const cat = sc.category || 'tools';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ id, ...sc });
    return acc;
  }, {});

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header with reset */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Keyboard size={14} className="text-cyan-400" />
            Tùy chỉnh phím tắt
          </h4>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Click vào phím tắt để gán lại. Bấm <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isDark ? 'bg-white/10 text-slate-400' : 'bg-black/5 text-slate-500'}`}>Esc</kbd> để hủy.
          </p>
        </div>
        <button
          onClick={resetShortcuts}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            isDark
              ? 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
              : 'bg-black/5 text-slate-500 hover:bg-black/10 hover:text-slate-800 border border-black/5'
          }`}
        >
          <RotateCcw size={13} />
          Đặt lại mặc định
        </button>
      </div>

      {/* Shortcuts by category */}
      {Object.entries(CATEGORY_INFO).map(([catId, catInfo]) => {
        const items = grouped[catId];
        if (!items || items.length === 0) return null;

        return (
          <div key={catId}>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: `${catInfo.color}18`, border: `1px solid ${catInfo.color}30` }}
              >
                <catInfo.icon size={12} style={{ color: catInfo.color }} />
              </div>
              <span
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: catInfo.color }}
              >
                {catInfo.label}
              </span>
            </div>
            <div
              className="rounded-2xl overflow-hidden divide-y"
              style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                divideColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              }}
            >
              {items.map((item, i) => (
                <ShortcutRow
                  key={item.id}
                  actionId={item.id}
                  shortcut={item}
                  onRebind={updateShortcut}
                  delay={i * 0.03}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Info note */}
      <div
        className="p-4 rounded-2xl flex items-start gap-3"
        style={{
          background: isDark ? 'rgba(251,146,60,0.04)' : 'rgba(251,146,60,0.06)',
          border: isDark ? '1px solid rgba(251,146,60,0.1)' : '1px solid rgba(251,146,60,0.15)',
        }}
      >
        <AlertTriangle size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className={`text-xs font-bold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
            Phát hiện xung đột tự động
          </p>
          <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Hệ thống sẽ tự động báo lỗi nếu bạn gán cùng một phím cho 2 hành động khác nhau.
            Thay đổi sẽ có hiệu lực ngay lập tức trên Canvas 3D.
          </p>
        </div>
      </div>
    </div>
  );
}
