import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useSettingsStore } from '../../../stores/useSettingsStore';

export default function AppearanceTab() {
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
  const { theme, setTheme } = useSettingsStore();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setNextTheme(newTheme);
  };

  const THEMES = [
    { id: 'light', label: 'Sáng', icon: Sun, desc: 'Giao diện nền trắng sáng sủa.' },
    { id: 'dark', label: 'Tối', icon: Moon, desc: 'Bảo vệ mắt, thiết kế chuẩn Dev.' },
    { id: 'system', label: 'Hệ thống', icon: Laptop, desc: 'Tự động thay đổi theo máy tính của bạn.' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-xl font-bold mb-1">Giao diện hiển thị</h3>
        <p className="text-sm text-slate-500">Tùy chỉnh màu sắc và cách ứng dụng hiển thị trên thiết bị của bạn.</p>
      </div>

      <div>
        <h4 className="text-sm font-bold mb-4">Chọn Theme</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              className={`flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all ${
                theme === t.id 
                  ? 'border-cyan-500 bg-cyan-500/10' 
                  : 'border-slate-200 dark:border-white/10 hover:border-cyan-500/50'
              }`}
            >
              <div className={`p-4 rounded-full mb-4 ${theme === t.id ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                <t.icon size={24} />
              </div>
              <span className="font-bold mb-1">{t.label}</span>
              <span className="text-xs text-slate-500">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
