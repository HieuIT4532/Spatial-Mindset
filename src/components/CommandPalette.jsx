// =====================================================
// SpatialMind — Command Palette (Ctrl+K)
// =====================================================
// Giao diện AI giống Spotlight/VS Code Command Palette
// - Fuzzy search commands
// - AI suggestions với clickable actions
// - Keyboard-first navigation
// =====================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Command, Zap, Triangle, Compass,
  Lightbulb, Target, ArrowRight, ChevronRight,
  BarChart3, Award, BookOpen, Share2, Sparkles,
  Calculator, Move3D, Ruler, Eye, PenTool,
  X, CornerDownLeft
} from 'lucide-react';

// Command categories
const COMMAND_CATEGORIES = {
  ai: { label: 'AI Gợi ý', icon: Sparkles, color: '#22d3ee' },
  geometry: { label: 'Hình học', icon: Triangle, color: '#a78bfa' },
  navigate: { label: 'Điều hướng', icon: Compass, color: '#34d399' },
  tools: { label: 'Công cụ', icon: PenTool, color: '#fbbf24' },
};

export default function CommandPalette({
  isOpen,
  onClose,
  onAction,
  geometryData = null,
  currentMode = 'geometry',
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // ── Base commands ──
  const baseCommands = [
    // AI commands
    {
      id: 'ai-hint',
      category: 'ai',
      label: 'Gợi ý bước tiếp theo',
      description: 'AI phân tích hình và đưa ra gợi ý Socratic',
      shortcut: 'H',
      action: () => onAction?.({ type: 'ai-hint' }),
    },
    {
      id: 'ai-draw-height',
      category: 'ai',
      label: 'Kẻ đường cao từ đỉnh xuống đáy',
      description: 'AI tự xác định đỉnh cao nhất và vẽ đường cao',
      action: () => onAction?.({ type: 'ai-draw', element: 'height' }),
    },
    {
      id: 'ai-angle',
      category: 'ai',
      label: 'Tính góc giữa hai mặt phẳng',
      description: 'Chọn 2 mặt phẳng → AI tính góc nhị diện',
      action: () => onAction?.({ type: 'ai-calculate', calc: 'dihedral-angle' }),
    },
    {
      id: 'ai-distance',
      category: 'ai',
      label: 'Tính khoảng cách điểm đến mặt phẳng',
      description: 'Chọn 1 điểm và 1 mặt phẳng → AI tính khoảng cách',
      action: () => onAction?.({ type: 'ai-calculate', calc: 'point-plane-distance' }),
    },
    {
      id: 'ai-cross-section',
      category: 'ai',
      label: 'Vẽ thiết diện qua 3 điểm',
      description: 'Chọn 3 điểm → Vẽ mặt cắt và tính diện tích',
      action: () => onAction?.({ type: 'ai-draw', element: 'cross-section' }),
    },
    {
      id: 'ai-explain',
      category: 'ai',
      label: 'Giải thích bước giải hiện tại',
      description: 'AI giải thích chi tiết bước giải đang hiển thị',
      action: () => onAction?.({ type: 'ai-explain' }),
    },

    // Geometry tools
    {
      id: 'geo-midpoint',
      category: 'geometry',
      label: 'Tìm trung điểm',
      description: 'Chọn 2 điểm → Đánh dấu trung điểm',
      action: () => onAction?.({ type: 'tool', tool: 'midpoint' }),
    },
    {
      id: 'geo-project',
      category: 'geometry',
      label: 'Chiếu điểm lên mặt phẳng',
      description: 'Hình chiếu vuông góc của điểm lên mặt phẳng',
      action: () => onAction?.({ type: 'tool', tool: 'projection' }),
    },
    {
      id: 'geo-perpendicular',
      category: 'geometry',
      label: 'Kẻ đường vuông góc',
      description: 'Từ 1 điểm kẻ đường vuông góc với 1 đường thẳng',
      action: () => onAction?.({ type: 'tool', tool: 'perpendicular' }),
    },
    {
      id: 'geo-measure',
      category: 'geometry',
      label: 'Đo khoảng cách giữa 2 điểm',
      description: 'Chọn 2 điểm → Hiển thị khoảng cách',
      shortcut: 'M',
      action: () => onAction?.({ type: 'tool', tool: 'measure' }),
    },

    // Navigation
    {
      id: 'nav-challenge',
      category: 'navigate',
      label: 'Mở Daily Challenge',
      description: 'Thử thách hình học hàng ngày',
      shortcut: 'D',
      action: () => onAction?.({ type: 'navigate', target: 'daily-challenge' }),
    },
    {
      id: 'nav-gallery',
      category: 'navigate',
      label: 'Thư viện Cộng đồng',
      description: 'Xem mô hình 3D từ cộng đồng',
      shortcut: 'G',
      action: () => onAction?.({ type: 'navigate', target: 'gallery' }),
    },
    {
      id: 'nav-share',
      category: 'navigate',
      label: 'Chia sẻ mô hình',
      description: 'Tạo link chia sẻ mô hình 3D hiện tại',
      action: () => onAction?.({ type: 'navigate', target: 'share' }),
    },
    {
      id: 'nav-theory',
      category: 'navigate',
      label: 'Mở kho học liệu',
      description: 'Lý thuyết và bài tập',
      action: () => onAction?.({ type: 'navigate', target: 'exercise-bank' }),
    },
    {
      id: 'nav-profile',
      category: 'navigate',
      label: 'Hồ sơ cá nhân',
      description: 'XP, Rank, và thống kê',
      action: () => onAction?.({ type: 'navigate', target: 'profile' }),
    },

    // Tools
    {
      id: 'tool-reset-camera',
      category: 'tools',
      label: 'Reset camera',
      description: 'Đặt lại góc nhìn mặc định',
      shortcut: 'R',
      action: () => onAction?.({ type: 'camera', action: 'reset' }),
    },
    {
      id: 'tool-toggle-grid',
      category: 'tools',
      label: 'Bật/tắt lưới tọa độ',
      description: 'Hiển thị hoặc ẩn lưới Oxyz',
      action: () => onAction?.({ type: 'toggle', target: 'grid' }),
    },
    {
      id: 'tool-toggle-labels',
      category: 'tools',
      label: 'Bật/tắt nhãn đỉnh',
      description: 'Hiển thị tên các đỉnh trên hình 3D',
      action: () => onAction?.({ type: 'toggle', target: 'labels' }),
    },
    {
      id: 'tool-screenshot',
      category: 'tools',
      label: 'Chụp ảnh hình 3D',
      description: 'Lưu ảnh PNG mô hình hiện tại',
      action: () => onAction?.({ type: 'screenshot' }),
    },
  ];

  // ── Fuzzy search ──
  const filteredCommands = query.trim()
    ? baseCommands.filter(cmd => {
        const q = query.toLowerCase();
        const label = cmd.label.toLowerCase();
        const desc = (cmd.description || '').toLowerCase();
        
        // Fuzzy match: mỗi ký tự query phải xuất hiện theo thứ tự
        let qi = 0;
        for (let i = 0; i < label.length && qi < q.length; i++) {
          if (label[i] === q[qi]) qi++;
        }
        if (qi === q.length) return true;
        
        // Fallback: includes check
        return label.includes(q) || desc.includes(q);
      })
    : baseCommands;

  // Kết hợp AI suggestions
  const allCommands = [...aiSuggestions, ...filteredCommands];

  // ── Keyboard navigation ──
  useEffect(() => {
    if (!isOpen) return;
    
    setQuery('');
    setSelectedIndex(0);
    setAiSuggestions([]);
    
    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, allCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (allCommands[selectedIndex]) {
          allCommands[selectedIndex].action?.();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [isOpen, selectedIndex, allCommands, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('[data-cmd-item]');
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Reset index khi query thay đổi
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = (cmd) => {
    cmd.action?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 500 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[601] w-full max-w-2xl"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(2,6,23,0.98), rgba(15,23,42,0.98))',
                border: '1px solid rgba(34,211,238,0.15)',
                boxShadow: '0 0 80px rgba(34,211,238,0.06), 0 25px 80px rgba(0,0,0,0.6)',
              }}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                  <Command size={12} className="text-cyan-400" />
                  <span className="text-[10px] font-bold text-cyan-400">K</span>
                </div>
                <Search size={18} className="text-slate-500" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Gõ lệnh hoặc tìm kiếm... (ví dụ: 'kẻ đường cao', 'tính góc')"
                  className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-slate-500 hover:text-white">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Commands list */}
              <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2 custom-scrollbar">
                {allCommands.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <Search size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-bold">Không tìm thấy lệnh phù hợp</p>
                  </div>
                ) : (
                  allCommands.map((cmd, idx) => {
                    const cat = COMMAND_CATEGORIES[cmd.category] || COMMAND_CATEGORIES.tools;
                    const Icon = cat.icon;
                    const isSelected = idx === selectedIndex;

                    return (
                      <button
                        key={cmd.id}
                        data-cmd-item
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className="w-full flex items-center gap-3 px-5 py-3 text-left transition-all"
                        style={{
                          background: isSelected ? 'rgba(34,211,238,0.06)' : 'transparent',
                          borderLeft: isSelected ? `2px solid ${cat.color}` : '2px solid transparent',
                        }}
                      >
                        {/* Icon */}
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background: `${cat.color}15`,
                            border: `1px solid ${cat.color}25`,
                          }}
                        >
                          <Icon size={14} style={{ color: cat.color }} />
                        </div>

                        {/* Label + Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                              {cmd.label}
                            </span>
                            {cmd.isAiSuggestion && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                                AI
                              </span>
                            )}
                          </div>
                          {cmd.description && (
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{cmd.description}</p>
                          )}
                        </div>

                        {/* Shortcut or arrow */}
                        {cmd.shortcut ? (
                          <kbd className="flex-shrink-0 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-500">
                            {cmd.shortcut}
                          </kbd>
                        ) : (
                          isSelected && <ArrowRight size={14} className="text-slate-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer hints */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-[10px] text-slate-600 font-bold">
                    <CornerDownLeft size={10} /> Thực hiện
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-600 font-bold">
                    ↑↓ Di chuyển
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-600 font-bold">
                    Esc Đóng
                  </span>
                </div>
                <span className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">
                  SpatialMind Command
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
