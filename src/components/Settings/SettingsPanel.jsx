// =====================================================
// SpatialMind — Settings Panel (Master Layout)
// =====================================================
// Premium full-screen overlay with sidebar navigation
// Tabs: Profile, Appearance, Workspace, Shortcuts
// =====================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Palette, Monitor, Keyboard,
  ChevronRight, Settings,
} from 'lucide-react';
import useSettingsStore from '../../stores/useSettingsStore';
import ProfileTab from './tabs/ProfileTab';
import AppearanceTab from './tabs/AppearanceTab';
import WorkspaceTab from './tabs/WorkspaceTab';
import ShortcutsTab from './tabs/ShortcutsTab';

const TABS = [
  { id: 'profile',    label: 'Hồ sơ',      icon: User,     description: 'Thông tin & thành tích' },
  { id: 'appearance', label: 'Giao diện',   icon: Palette,  description: 'Theme & màu sắc' },
  { id: 'workspace',  label: 'Workspace',   icon: Monitor,  description: 'Cài đặt Canvas 3D' },
  { id: 'shortcuts',  label: 'Phím tắt',    icon: Keyboard, description: 'Tùy chỉnh phím tắt' },
];

const TAB_COMPONENTS = {
  profile: ProfileTab,
  appearance: AppearanceTab,
  workspace: WorkspaceTab,
  shortcuts: ShortcutsTab,
};

export default function SettingsPanel() {
  const { isSettingsOpen, closeSettings, settingsTab, setSettingsTab } = useSettingsStore();
  const effectiveTheme = useSettingsStore((s) => s.getEffectiveTheme());
  const isDark = effectiveTheme === 'dark';

  const ActiveTab = TAB_COMPONENTS[settingsTab] || ProfileTab;

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500]"
            style={{
              background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={closeSettings}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed inset-6 md:inset-12 lg:inset-16 z-[501] flex overflow-hidden rounded-3xl"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(2,6,23,0.98), rgba(15,23,42,0.98))'
                : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              boxShadow: isDark
                ? '0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(34,211,238,0.05)'
                : '0 40px 120px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Sidebar ── */}
            <div
              className="w-64 flex-shrink-0 flex flex-col border-r"
              style={{
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
              }}
            >
              {/* Sidebar Header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(99,102,241,0.15))',
                      border: '1px solid rgba(34,211,238,0.2)',
                    }}
                  >
                    <Settings size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Cài đặt
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      Settings
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                {TABS.map((tab) => {
                  const isActive = settingsTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsTab(tab.id)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative"
                      style={{
                        background: isActive
                          ? (isDark ? 'rgba(34,211,238,0.08)' : 'rgba(34,211,238,0.1)')
                          : 'transparent',
                        border: isActive
                          ? (isDark ? '1px solid rgba(34,211,238,0.15)' : '1px solid rgba(34,211,238,0.2)')
                          : '1px solid transparent',
                      }}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="settings-tab-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-cyan-400"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                        />
                      )}

                      <tab.icon
                        size={18}
                        className={`transition-colors ${
                          isActive
                            ? 'text-cyan-400'
                            : isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-semibold transition-colors ${
                          isActive
                            ? 'text-cyan-400'
                            : isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'
                        }`}>
                          {tab.label}
                        </p>
                        <p className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                          {tab.description}
                        </p>
                      </div>
                      {isActive && <ChevronRight size={14} className="text-cyan-400" />}
                    </button>
                  );
                })}
              </nav>

              {/* Sidebar Footer */}
              <div className="px-4 py-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.15em] text-center">
                  SpatialMind v3.0
                </p>
              </div>
            </div>

            {/* ── Content Area ── */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Content Header */}
              <div
                className="flex items-center justify-between px-8 py-5 border-b flex-shrink-0"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
              >
                <div>
                  <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {TABS.find(t => t.id === settingsTab)?.label}
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {TABS.find(t => t.id === settingsTab)?.description}
                  </p>
                </div>
                <button
                  onClick={closeSettings}
                  className={`p-2.5 rounded-xl transition-all ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                      : 'bg-black/5 hover:bg-black/10 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={settingsTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ActiveTab />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
