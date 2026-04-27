// =====================================================
// SpatialMind — Contest Tab
// =====================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Trophy, Timer, Star, Users, Calendar, ArrowRight } from 'lucide-react';
import useSettingsStore from '../../stores/useSettingsStore';
import { getRankInfo } from '../../components/GameHUD';

const UPCOMING_CONTESTS = [
  { id: 1, title: 'Weekly Geometry Contest 101', startTime: new Date(Date.now() + 86400000 * 2), participants: 1450, duration: 60 },
  { id: 2, title: 'Spatial Masters Cup', startTime: new Date(Date.now() + 86400000 * 5), participants: 890, duration: 90 },
];

const PAST_CONTESTS = [
  { id: 3, title: 'Bi-weekly Contest 50', date: '25/04/2026', participants: 2100 },
  { id: 4, title: 'Beginner Space Challenge', date: '18/04/2026', participants: 3500 },
];

export default function ContestList() {
  const isDark = useSettingsStore((s) => s.getEffectiveTheme()) === 'dark';
  const xp = parseInt(localStorage.getItem('spatialmind_xp') || '0', 10);
  const { current: rank } = getRankInfo(xp);

  // Simple countdown timer for the next contest
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const target = UPCOMING_CONTESTS[0].startTime.getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      
      if (distance < 0) {
        setTimeLeft('Đang diễn ra');
        clearInterval(interval);
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full max-w-6xl mx-auto px-6 py-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className={`text-3xl font-black mb-2 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Swords className="text-cyan-400" size={32} />
            Đấu Trường
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            Cạnh tranh giải toán không gian theo thời gian thực để nâng cao Rating của bạn.
          </p>
        </div>

        {/* User Rank Card */}
        <div 
          className="flex items-center gap-4 px-5 py-3 rounded-2xl border"
          style={{
            background: isDark ? 'rgba(2,6,23,0.6)' : 'rgba(255,255,255,0.6)',
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `rgba(${rank.shadow},0.15)` }}>
            {rank.emoji}
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Rating Hiện Tại</p>
            <p className="text-xl font-black" style={{ color: rank.color }}>
              1542 <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({rank.name})</span>
            </p>
          </div>
        </div>
      </div>

      {/* Next Contest Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 mb-10 border"
        style={{
          background: isDark ? 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(2,6,23,0.9))' : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
          borderColor: isDark ? 'rgba(34,211,238,0.2)' : 'rgba(34,211,238,0.3)',
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 flex items-center gap-1.5">
                <Star size={10} /> Sắp diễn ra
              </span>
            </div>
            <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {UPCOMING_CONTESTS[0].title}
            </h2>
            <div className={`flex items-center gap-4 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="flex items-center gap-1.5"><Calendar size={16} /> {UPCOMING_CONTESTS[0].startTime.toLocaleDateString()}</span>
              <span className="flex items-center gap-1.5"><Timer size={16} /> {UPCOMING_CONTESTS[0].duration} Phút</span>
              <span className="flex items-center gap-1.5"><Users size={16} /> {UPCOMING_CONTESTS[0].participants} Đăng ký</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Bắt đầu sau</p>
            <div className="text-3xl font-mono font-black text-cyan-400 mb-4 tracking-tight">
              {timeLeft}
            </div>
            <button className="px-8 py-3 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20">
              Đăng ký tham gia
            </button>
          </div>
        </div>
      </motion.div>

      {/* Two columns: Past Contests & Global Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Past Contests */}
        <div className="lg:col-span-2">
          <h3 className={`text-lg font-black mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Các kỳ thi đã qua</h3>
          <div className="space-y-3">
            {PAST_CONTESTS.map((contest, i) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={contest.id}
                className="flex items-center justify-between p-4 rounded-2xl transition-all hover:bg-black/5 dark:hover:bg-white/5 border"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                }}
              >
                <div>
                  <h4 className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{contest.title}</h4>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Diễn ra ngày: {contest.date} • {contest.participants} người tham gia
                  </p>
                </div>
                <button className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-slate-800'}`}>
                  Luyện tập lại
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Global Leaderboard Snapshot */}
        <div className="lg:col-span-1">
          <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <Trophy size={18} className="text-yellow-400" /> Top Rating
          </h3>
          <div 
            className="rounded-2xl border p-4"
            style={{
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            }}
          >
            {[
              { name: 'Alex Math', rating: 2840, rank: 'Thách Đấu' },
              { name: 'Sarah_99', rating: 2750, rank: 'Đại Cao Thủ' },
              { name: 'JohnDoe', rating: 2600, rank: 'Cao Thủ' },
              { name: 'GeometryKing', rating: 2450, rank: 'Kim Cương I' },
            ].map((u, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-0 border-white/5">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black ${i < 3 ? 'text-yellow-500' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                    #{i + 1}
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{u.name}</p>
                    <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{u.rank}</p>
                  </div>
                </div>
                <span className="text-sm font-mono font-bold text-cyan-500">{u.rating}</span>
              </div>
            ))}
            
            <button className={`w-full mt-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-1 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'}`}>
              Xem toàn bộ bảng xếp hạng <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
