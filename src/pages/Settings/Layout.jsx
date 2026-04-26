import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { User, Palette, Box, Keyboard } from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';

export default function SettingsLayout() {
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const TABS = [
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: User, path: '/settings/profile' },
    { id: 'appearance', label: 'Giao diện', icon: Palette, path: '/settings/appearance' },
    { id: 'workspace', label: 'Không gian làm việc', icon: Box, path: '/settings/workspace' },
    { id: 'shortcuts', label: 'Phím tắt', icon: Keyboard, path: '/settings/shortcuts' },
  ];

  return (
    <div className={`min-h-screen pt-20 px-6 ${isDark ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <h2 className="text-2xl font-black mb-6 tracking-tight">Cài đặt</h2>
          <nav className="flex flex-col gap-2">
            {TABS.map(tab => (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                  ${isActive 
                    ? (isDark ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-cyan-50 text-cyan-600 border border-cyan-200')
                    : (isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-black')}
                `}
              >
                <tab.icon size={18} />
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className={`flex-1 rounded-3xl border p-8 shadow-sm transition-colors duration-300 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <Outlet />
        </main>

      </div>
    </div>
  );
}
