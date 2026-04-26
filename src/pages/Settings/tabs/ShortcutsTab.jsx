import React, { useState, useEffect } from 'react';
import { Keyboard, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '../../../stores/useSettingsStore';

const SHORTCUT_ACTIONS = [
  { id: 'search', label: 'Mở thanh tìm kiếm (Command Palette)' },
  { id: 'draw_line', label: 'Vẽ đoạn thẳng' },
  { id: 'draw_plane', label: 'Dựng mặt phẳng' },
  { id: 'select_vertex', label: 'Chọn đỉnh' },
  { id: 'toggle_grid', label: 'Bật/Tắt Lưới' },
  { id: 'toggle_axes', label: 'Bật/Tắt Trục' },
];

export default function ShortcutsTab() {
  const { shortcuts, updateShortcut } = useSettingsStore();
  const [listeningFor, setListeningFor] = useState(null); // id of action being rebound
  const [error, setError] = useState('');

  useEffect(() => {
    if (!listeningFor) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      
      const newKey = e.key.toLowerCase();
      
      // Ignore modifier keys alone
      if (['control', 'shift', 'alt', 'meta', 'escape', 'enter'].includes(newKey)) {
        if (newKey === 'escape') setListeningFor(null);
        return;
      }

      // Check conflict
      const conflictAction = Object.entries(shortcuts).find(
        ([action, key]) => key === newKey && action !== listeningFor
      );

      if (conflictAction) {
        const conflictLabel = SHORTCUT_ACTIONS.find(a => a.id === conflictAction[0])?.label || conflictAction[0];
        setError(`Phím "${newKey.toUpperCase()}" đã được gán cho "${conflictLabel}". Vui lòng chọn phím khác.`);
        return;
      }

      updateShortcut(listeningFor, newKey);
      setListeningFor(null);
      setError('');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listeningFor, shortcuts, updateShortcut]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-xl font-bold mb-1">Cấu hình Phím tắt</h3>
        <p className="text-sm text-slate-500">Thao tác nhanh hơn mà không cần dùng chuột.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 animate-in fade-in zoom-in-95">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Hành động</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Phím tắt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5 bg-white dark:bg-transparent">
            {SHORTCUT_ACTIONS.map((action) => {
              const currentKey = shortcuts[action.id];
              const isListening = listeningFor === action.id;

              return (
                <tr key={action.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">{action.label}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setListeningFor(action.id);
                        setError('');
                      }}
                      className={`
                        inline-flex items-center justify-center min-w-[2rem] px-3 py-1.5 rounded-lg text-sm font-bold font-mono tracking-widest transition-all
                        ${isListening 
                          ? 'bg-cyan-500 text-white animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.5)]' 
                          : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 group-hover:border-cyan-500/50 border border-transparent'}
                      `}
                    >
                      {isListening ? '...' : currentKey.toUpperCase()}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <p className="text-xs text-slate-500 flex items-center gap-2">
        <Keyboard size={14} /> Nhấn vào một phím tắt để thay đổi. Bấm ESC để hủy.
      </p>
    </div>
  );
}
