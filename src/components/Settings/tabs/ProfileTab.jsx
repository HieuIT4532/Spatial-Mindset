// =====================================================
// SpatialMind — Profile Tab (Settings)
// =====================================================
// ID Card, Stats Overview, GitHub-style Contribution Graph
// Gamification: streak, rank, acceptance rate
// =====================================================

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Flame, Target, Trophy, Star, TrendingUp,
  Calendar, Edit3, Award, BarChart3,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getRankInfo, RANKS } from '../../GameHUD';
import useSettingsStore from '../../../stores/useSettingsStore';

// ── Contribution Graph (GitHub-style SVG Heatmap) ──
function ContributionGraph() {
  const isDark = useSettingsStore((s) => s.getEffectiveTheme()) === 'dark';

  // Generate 365 days of mock activity data
  const data = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      // Deterministic pseudo-random based on date
      const seed = date.getFullYear() * 1000 + date.getMonth() * 31 + date.getDate();
      const hash = ((seed * 9301 + 49297) % 233280) / 233280;
      const count = hash > 0.6 ? Math.floor(hash * 6) : 0;
      days.push({
        date: date.toISOString().slice(0, 10),
        count,
        dayOfWeek: date.getDay(),
        weekIndex: Math.floor(i / 7),
      });
    }
    return days;
  }, []);

  // Group by weeks
  const weeks = useMemo(() => {
    const w = [];
    let currentWeek = [];
    data.forEach((day) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6 || data.indexOf(day) === data.length - 1) {
        w.push([...currentWeek]);
        currentWeek = [];
      }
    });
    if (currentWeek.length) w.push(currentWeek);
    return w;
  }, [data]);

  const getColor = (count) => {
    if (count === 0) return isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
    if (count === 1) return isDark ? 'rgba(34,211,238,0.2)' : 'rgba(34,211,238,0.3)';
    if (count === 2) return isDark ? 'rgba(34,211,238,0.4)' : 'rgba(34,211,238,0.5)';
    if (count === 3) return isDark ? 'rgba(34,211,238,0.6)' : 'rgba(34,211,238,0.7)';
    return isDark ? 'rgba(34,211,238,0.85)' : 'rgba(34,211,238,0.9)';
  };

  const totalContributions = data.reduce((sum, d) => sum + d.count, 0);
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          <span className="text-cyan-400 font-black">{totalContributions}</span> hoạt động trong năm qua
        </p>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-[3px] min-w-[720px]">
          {/* Month labels */}
          <div className="flex gap-[3px] ml-[18px] mb-1">
            {monthLabels.map((m, i) => (
              <span
                key={m}
                className={`text-[9px] font-bold ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
                style={{ width: `${(365 / 12) * 13 / 12}px`, minWidth: 44 }}
              >
                {m}
              </span>
            ))}
          </div>
          {/* Day grid */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => (
            <div key={dayOfWeek} className="flex items-center gap-[3px]">
              <span
                className={`text-[9px] font-bold w-[14px] text-right ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
              >
                {dayOfWeek === 1 ? 'M' : dayOfWeek === 3 ? 'W' : dayOfWeek === 5 ? 'F' : ''}
              </span>
              {data
                .filter((d) => d.dayOfWeek === dayOfWeek)
                .map((day) => (
                  <div
                    key={day.date}
                    className="w-[11px] h-[11px] rounded-[2px] transition-colors cursor-pointer hover:ring-1 hover:ring-cyan-400/50"
                    style={{ backgroundColor: getColor(day.count) }}
                    title={`${day.date}: ${day.count} hoạt động`}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 justify-end">
        <span className={`text-[9px] font-bold ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Ít</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="w-[11px] h-[11px] rounded-[2px]"
            style={{ backgroundColor: getColor(level) }}
          />
        ))}
        <span className={`text-[9px] font-bold ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Nhiều</span>
      </div>
    </div>
  );
}

// ── Stat Card ──
function StatCard({ label, value, sub, color, icon: Icon, delay = 0 }) {
  const isDark = useSettingsStore((s) => s.getEffectiveTheme()) === 'dark';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex-1 p-4 rounded-2xl"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {label}
        </span>
      </div>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      {sub && <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{sub}</p>}
    </motion.div>
  );
}

export default function ProfileTab() {
  const { user, userProfile } = useAuth();
  const isDark = useSettingsStore((s) => s.getEffectiveTheme()) === 'dark';

  const xp = parseInt(localStorage.getItem('spatialmind_xp') || '0', 10);
  const streakData = (() => {
    try {
      return JSON.parse(localStorage.getItem('daily_progress') || '{}');
    } catch { return {}; }
  })();
  const streak = streakData.streak || 0;
  const { current: rank, next } = getRankInfo(xp);
  const solved = Math.floor(xp / 35);
  const accuracy = Math.min(99, 60 + Math.floor(xp / 80));

  const displayName = user?.displayName || userProfile?.displayName || user?.email?.split('@')[0] || 'Guest';
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const role = userProfile?.role || 'Học sinh';

  return (
    <div className="space-y-8 max-w-3xl">
      {/* ── ID Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: isDark
            ? `linear-gradient(135deg, rgba(${rank.shadow},0.08), rgba(99,102,241,0.05))`
            : `linear-gradient(135deg, rgba(${rank.shadow},0.1), rgba(99,102,241,0.05))`,
          border: isDark
            ? `1px solid rgba(${rank.shadow},0.15)`
            : `1px solid rgba(${rank.shadow},0.2)`,
        }}
      >
        {/* Background glow */}
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 blur-3xl"
          style={{ background: `radial-gradient(circle, rgba(${rank.shadow},0.6), transparent)` }}
        />

        <div className="relative flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                className="w-20 h-20 rounded-2xl object-cover ring-4"
                style={{ ringColor: `rgba(${rank.shadow},0.3)` }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white"
                style={{
                  background: `linear-gradient(135deg, ${rank.color}88, #6366f1)`,
                  boxShadow: `0 8px 24px rgba(${rank.shadow},0.3)`,
                }}
              >
                {avatarInitial}
              </div>
            )}
            {/* Rank badge */}
            <div
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{
                background: isDark ? 'rgba(2,6,23,0.9)' : 'rgba(255,255,255,0.9)',
                border: `2px solid ${rank.color}`,
                boxShadow: `0 4px 12px rgba(${rank.shadow},0.4)`,
              }}
            >
              {rank.emoji}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {displayName}
              </h3>
              <button className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-slate-500' : 'hover:bg-black/5 text-slate-400'}`}>
                <Edit3 size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-md"
                style={{ background: `${rank.color}20`, color: rank.color, border: `1px solid ${rank.color}30` }}
              >
                {rank.emoji} {rank.name}
              </span>
              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>·</span>
              <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {role}
              </span>
            </div>
            <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Đang trên hành trình chinh phục hình học không gian 🚀
            </p>

            {/* XP Progress to next rank */}
            {next && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-bold" style={{ color: rank.color }}>{xp.toLocaleString()} XP</span>
                  <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>{next.minXP.toLocaleString()} XP → {next.emoji} {next.name}</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, rgba(${rank.shadow},0.5), ${rank.color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((xp - rank.minXP) / (next.minXP - rank.minXP)) * 100)}%` }}
                    transition={{ type: 'spring', damping: 25, delay: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Stats Overview ── */}
      <div>
        <h4 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <BarChart3 size={14} className="text-cyan-400" />
          Tổng quan thống kê
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Đã giải" value={solved} sub="bài toán" color="#a78bfa" icon={Target} delay={0.05} />
          <StatCard label="Tỷ lệ đúng" value={`${accuracy}%`} sub="acceptance rate" color="#34d399" icon={Trophy} delay={0.1} />
          <StatCard label="Streak" value={`${streak}🔥`} sub="ngày liên tiếp" color="#fb923c" icon={Flame} delay={0.15} />
          <StatCard label="Rank" value={rank.name} sub={`${rank.emoji} Level ${rank.level}`} color={rank.color} icon={Award} delay={0.2} />
        </div>
      </div>

      {/* ── Contribution Graph ── */}
      <div>
        <h4 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <Calendar size={14} className="text-cyan-400" />
          Biểu đồ hoạt động
        </h4>
        <div
          className="p-5 rounded-2xl"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <ContributionGraph />
        </div>
      </div>

      {/* ── Rank Journey ── */}
      <div>
        <h4 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <TrendingUp size={14} className="text-cyan-400" />
          Hành trình thăng hạng
        </h4>
        <div
          className="p-5 rounded-2xl"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-center gap-1">
            {RANKS.map((r, i) => {
              const unlocked = xp >= r.minXP;
              const isCurrent = rank.name === r.name;
              return (
                <React.Fragment key={r.name}>
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: isCurrent ? 1.2 : 1, opacity: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all"
                      style={{
                        background: unlocked ? `rgba(${r.shadow},0.2)` : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                        border: isCurrent ? `2px solid ${r.color}` : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                        opacity: unlocked ? 1 : 0.3,
                        boxShadow: isCurrent ? `0 0 16px rgba(${r.shadow},0.4)` : 'none',
                      }}
                    >
                      {r.emoji}
                    </motion.div>
                    <span
                      className="text-[8px] font-bold"
                      style={{ color: unlocked ? r.color : (isDark ? '#334155' : '#94a3b8') }}
                    >
                      {r.name}
                    </span>
                  </div>
                  {i < RANKS.length - 1 && (
                    <div
                      className="flex-1 h-0.5 rounded-full mx-0.5 mb-5"
                      style={{
                        background: xp >= RANKS[i + 1].minXP
                          ? `rgba(${r.shadow},0.4)`
                          : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
