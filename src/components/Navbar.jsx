// =====================================================
// SpatialMind — Navbar (LeetCode-style)
// =====================================================
// Sticky full-width header với:
//  - Logo + Brand name
//  - Menu: Problems, Contest, Discuss
//  - Search bar (trigger Command Palette Ctrl+K)
//  - Streak badge 🔥
//  - Notification bell với unread dot
//  - User avatar dropdown
// =====================================================

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, Flame, User, LogOut, LogIn,
  Settings, Sun, Moon, ChevronDown, LayoutDashboard,
  Trophy, BookOpen, Users, Sliders, Share2,
  X, CheckCheck, Zap, Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRankInfo } from './GameHUD';

// ── Nav menu items ──
const NAV_ITEMS = [
  { id: 'problems',  label: 'Problems',  labelVi: 'Bài tập',    action: 'exercise-bank' },
  { id: 'contest',   label: 'Contest',   labelVi: 'Thi đấu',    action: 'daily-challenge' },
  { id: 'discuss',   label: 'Discuss',   labelVi: 'Thảo luận',  action: 'gallery' },
];

// ── Mock notifications ──
const MOCK_NOTIFICATIONS = [
  { id: 1, read: false, icon: '🔥', text: 'Streak 7 ngày! Bạn đang làm tốt lắm!', time: '2 phút trước' },
  { id: 2, read: false, icon: '🏆', text: 'Bạn vừa lên hạng Bronze!', time: '1 giờ trước' },
  { id: 3, read: true,  icon: '💬', text: 'HieuIT đã reply trong Discuss', time: '3 giờ trước' },
  { id: 4, read: true,  icon: '⚡', text: 'Daily Challenge mới đã sẵn sàng', time: 'Hôm qua' },
];

export default function Navbar({
  // Gamification
  xp = 0,
  streak = 0,
  // Callbacks
  onOpenCommandPalette,
  onOpenProfile,
  onOpenNotifications,
  onNavigate,
  onToggleTheme,
  onOpenExerciseBank,
  onOpenDailyChallenge,
  onOpenGallery,
  // State
  theme = 'dark',
  activeNavItem = null,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const { user, isAuthenticated, logout, userProfile, isOfflineMode } = useAuth();
  const { current: rank } = getRankInfo(xp);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNavClick = (item) => {
    if (item.action === 'exercise-bank') onOpenExerciseBank?.();
    if (item.action === 'daily-challenge') onOpenDailyChallenge?.();
    if (item.action === 'gallery') onOpenGallery?.();
  };

  const displayName = user?.displayName
    || userProfile?.displayName
    || user?.email?.split('@')[0]
    || 'Guest';

  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-[100] h-14
          flex items-center
          transition-all duration-300
          ${scrolled
            ? 'backdrop-blur-xl border-b border-white/8 shadow-[0_1px_40px_rgba(0,0,0,0.4)]'
            : 'backdrop-blur-md border-b border-white/5'
          }
        `}
        style={{
          background: theme === 'dark'
            ? 'rgba(2, 6, 23, 0.88)'
            : 'rgba(248, 250, 252, 0.92)',
        }}
      >
        <div className="w-full max-w-screen-2xl mx-auto px-6 flex items-center gap-6 h-full">

          {/* ── LEFT: Logo + Brand ── */}
          <div className="flex items-center gap-5 flex-shrink-0">
            {/* Logo mark */}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); }}
              className="flex items-center gap-2.5 group"
            >
              <img
                src="/logo.png"
                alt="SpatialMind"
                className="h-8 w-8 object-contain rounded-lg group-hover:brightness-110 transition-all"
              />
              <span
                className="text-lg font-black tracking-tight hidden sm:block"
                style={{
                  background: 'linear-gradient(135deg, #22d3ee 0%, #4ade80 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                SpatialMind
              </span>
            </a>

            {/* Divider */}
            <div className="h-5 w-px bg-white/10 hidden md:block" />

            {/* ── Nav menu items ── */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activeNavItem === item.id}
                  theme={theme}
                  onClick={() => handleNavClick(item)}
                />
              ))}
            </nav>
          </div>

          {/* ── SPACER ── */}
          <div className="flex-1" />

          {/* ── RIGHT: Tools ── */}
          <div className="flex items-center gap-1.5">

            {/* Search bar (fake button → opens Command Palette) */}
            <button
              onClick={onOpenCommandPalette}
              className={`
                hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl
                border transition-all duration-200 group
                hover:border-cyan-500/40
                ${theme === 'dark'
                  ? 'bg-white/[0.04] border-white/8 hover:bg-white/[0.07]'
                  : 'bg-black/[0.04] border-black/8 hover:bg-black/[0.07]'
                }
              `}
              title="Command Palette (Ctrl+K)"
            >
              <Search
                size={14}
                className={`transition-colors ${theme === 'dark' ? 'text-slate-500 group-hover:text-cyan-400' : 'text-slate-400 group-hover:text-cyan-600'}`}
              />
              <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Search...
              </span>
              <div className="flex items-center gap-0.5 ml-2">
                <kbd className={`
                  flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-bold
                  font-mono tracking-wider border
                  ${theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-slate-500'
                    : 'bg-black/5 border-black/10 text-slate-400'
                  }
                `}>
                  Ctrl
                </kbd>
                <kbd className={`
                  flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-bold
                  font-mono border
                  ${theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-slate-500'
                    : 'bg-black/5 border-black/10 text-slate-400'
                  }
                `}>
                  K
                </kbd>
              </div>
            </button>

            {/* Search icon (mobile) */}
            <button
              onClick={onOpenCommandPalette}
              className="sm:hidden p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-cyan-400 transition-all"
            >
              <Search size={18} />
            </button>

            {/* ── Streak badge ── */}
            <button
              onClick={onOpenDailyChallenge}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-orange-500/10 transition-all group"
              title={`Streak: ${streak} ngày liên tiếp`}
            >
              <Flame
                size={17}
                className={`transition-all ${streak > 0
                  ? 'text-orange-400 fire-glow group-hover:scale-110'
                  : 'text-slate-600 group-hover:text-orange-400'
                }`}
              />
              <span className={`text-sm font-black tabular-nums ${streak > 0 ? 'text-orange-400' : 'text-slate-500'}`}>
                {streak}
              </span>
            </button>

            {/* ── Notification bell ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(v => !v)}
                className="relative p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-slate-200 transition-all"
                title="Thông báo"
              >
                <Bell size={18} />
                {/* Unread dot */}
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[#020617]"
                  />
                )}
              </button>

              {/* Notification dropdown */}
              <AnimatePresence>
                {isNotifOpen && (
                  <NotificationPanel
                    notifications={notifications}
                    onMarkAllRead={markAllRead}
                    onOpenSettings={onOpenNotifications}
                    theme={theme}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* ── Theme toggle ── */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-yellow-400 transition-all"
              title="Đổi giao diện"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* ── User area ── */}
            <div className="relative ml-1" ref={dropdownRef}>
              {isAuthenticated ? (
                <button
                  onClick={() => setIsDropdownOpen(v => !v)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-white/5 transition-all group"
                >
                  {/* Avatar */}
                  <div className="relative">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={displayName}
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-cyan-500/30 group-hover:ring-cyan-500/60 transition-all"
                      />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white ring-2 ring-cyan-500/30 group-hover:ring-cyan-500/60 transition-all"
                        style={{ background: `linear-gradient(135deg, ${rank.color}88, #6366f1)` }}
                      >
                        {avatarInitial}
                      </div>
                    )}
                    {/* Online dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-[#020617]" />
                  </div>

                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-xs font-bold text-slate-200 leading-tight max-w-[80px] truncate">
                      {displayName}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: rank.color }}>
                      {rank.emoji} {rank.name}
                    </span>
                  </div>

                  <ChevronDown
                    size={13}
                    className={`text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              ) : (
                <button
                  onClick={() => onNavigate?.('login')}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold text-xs transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(99,102,241,0.15))',
                    border: '1px solid rgba(34,211,238,0.25)',
                    color: '#22d3ee',
                  }}
                >
                  <LogIn size={14} />
                  Đăng nhập
                </button>
              )}

              {/* User dropdown */}
              <AnimatePresence>
                {isDropdownOpen && isAuthenticated && (
                  <UserDropdown
                    user={user}
                    userProfile={userProfile}
                    rank={rank}
                    displayName={displayName}
                    xp={xp}
                    theme={theme}
                    onProfile={() => { onOpenProfile?.(); setIsDropdownOpen(false); }}
                    onToggleTheme={() => { onToggleTheme?.(); }}
                    onOpenSettings={() => { setIsDropdownOpen(false); }}
                    onLogout={() => { logout(); setIsDropdownOpen(false); }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer so content doesn't hide under fixed header */}
      <div className="h-14 flex-shrink-0" />
    </>
  );
}

// ── Nav Item Component ──
function NavItem({ item, isActive, theme, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all group"
      style={{
        color: isActive
          ? (theme === 'dark' ? '#f8fafc' : '#0f172a')
          : (theme === 'dark' ? '#64748b' : '#64748b'),
      }}
    >
      <span className="relative z-10 group-hover:text-white transition-colors">
        {item.label}
      </span>

      {/* Active underline */}
      {isActive && (
        <motion.div
          layoutId="nav-underline"
          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, #22d3ee, #6366f1)' }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
        />
      )}

      {/* Hover bg */}
      <span
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
      />
    </button>
  );
}

// ── Notification Panel ──
function NotificationPanel({ notifications, onMarkAllRead, onOpenSettings, theme }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      className="absolute right-0 top-[calc(100%+8px)] w-80 rounded-2xl overflow-hidden shadow-2xl z-[200]"
      style={{
        background: theme === 'dark'
          ? 'rgba(2,6,23,0.97)'
          : 'rgba(248,250,252,0.97)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="text-sm font-black text-white">Thông báo</span>
        <button
          onClick={onMarkAllRead}
          className="flex items-center gap-1 text-[10px] font-bold text-cyan-500 hover:text-cyan-400 transition-colors"
        >
          <CheckCheck size={11} />
          Đọc tất cả
        </button>
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] cursor-pointer transition-all ${
              !notif.read ? 'bg-cyan-500/[0.04]' : 'hover:bg-white/[0.02]'
            }`}
          >
            <span className="text-base mt-0.5 flex-shrink-0">{notif.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs leading-relaxed ${!notif.read ? 'text-slate-200' : 'text-slate-400'}`}>
                {notif.text}
              </p>
              <p className="text-[9px] text-slate-600 mt-1 font-bold">{notif.time}</p>
            </div>
            {!notif.read && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <button
        onClick={onOpenSettings}
        className="w-full py-2.5 text-[10px] font-black text-slate-500 hover:text-cyan-400 uppercase tracking-[0.15em] transition-colors"
      >
        Cài đặt thông báo →
      </button>
    </motion.div>
  );
}

// ── User Dropdown ──
function UserDropdown({ user, userProfile, rank, displayName, xp, theme, onProfile, onToggleTheme, onOpenSettings, onLogout }) {
  const menuItems = [
    { icon: User,          label: 'Hồ sơ cá nhân',    action: onProfile },
    { icon: LayoutDashboard, label: 'Dashboard',       action: onProfile },
    { icon: Settings,      label: 'Cài đặt',           action: onOpenSettings },
    { icon: Sun,           label: 'Đổi giao diện',     action: onToggleTheme },
    { divider: true },
    { icon: LogOut,        label: 'Đăng xuất',         action: onLogout, danger: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-2xl overflow-hidden shadow-2xl z-[200]"
      style={{
        background: theme === 'dark' ? 'rgba(2,6,23,0.97)' : 'rgba(248,250,252,0.97)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* User info header */}
      <div
        className="p-4 border-b border-white/5"
        style={{ background: `linear-gradient(135deg, ${rank.color}10, transparent)` }}
      >
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white"
              style={{ background: `linear-gradient(135deg, ${rank.color}99, #6366f1)` }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-black text-white truncate max-w-[150px]">{displayName}</p>
            <p className="text-[10px] font-bold" style={{ color: rank.color }}>
              {rank.emoji} {rank.name} · {xp} XP
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-2 mt-3">
          {[
            { label: 'XP', value: xp, icon: Zap, color: '#22d3ee' },
            { label: 'Rank', value: rank.name.slice(0, 3), icon: Trophy, color: rank.color },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{ background: `${stat.color}12`, border: `1px solid ${stat.color}25` }}
            >
              <stat.icon size={10} style={{ color: stat.color }} />
              <span className="text-[10px] font-black" style={{ color: stat.color }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1.5">
        {menuItems.map((item, idx) => {
          if (item.divider) {
            return <div key={idx} className="my-1 border-t border-white/5" />;
          }
          return (
            <button
              key={idx}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all
                ${item.danger
                  ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon size={15} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
