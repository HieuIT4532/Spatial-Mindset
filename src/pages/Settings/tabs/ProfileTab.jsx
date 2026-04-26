import React from 'react';
import ActivityCalendar from 'react-activity-calendar';
import { useAuth } from '../../../contexts/AuthContext';
import { getRankInfo } from '../../../components/GameHUD';

export default function ProfileTab() {
  const { user, userProfile } = useAuth();
  
  // Mock data for the heatmap
  const mockActivityData = Array.from({ length: 365 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (364 - i));
    return {
      date: date.toISOString().slice(0, 10),
      count: Math.floor(Math.random() * 5),
      level: Math.floor(Math.random() * 4)
    };
  });

  const xp = parseInt(localStorage.getItem('spatialmind_xp') || '0', 10);
  const streak = parseInt(localStorage.getItem('daily_progress') ? JSON.parse(localStorage.getItem('daily_progress')).streak : '0', 10);
  const { current: rank } = getRankInfo(xp);

  const displayName = user?.displayName || userProfile?.displayName || user?.email?.split('@')[0] || 'Guest';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-xl font-bold mb-1">Hồ sơ cá nhân</h3>
        <p className="text-sm text-slate-500">Quản lý thông tin và theo dõi thành tích của bạn.</p>
      </div>

      {/* ID Card */}
      <div className="flex items-center gap-6 p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/5 to-indigo-500/5">
        <div className="relative">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={displayName} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-cyan-500/20" />
          ) : (
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black text-white bg-gradient-to-br from-cyan-500 to-indigo-500 shadow-xl shadow-cyan-500/20">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md text-[10px] font-black text-white bg-indigo-500 border-2 border-white dark:border-[#020617]">
            HỌC SINH
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">{displayName}</h2>
          <p className="text-sm text-slate-500 mt-1">"Học hỏi không ngừng, tư duy không giới hạn."</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Rank hiện tại', value: rank.name, sub: rank.emoji, color: 'text-yellow-500' },
          { label: 'Tổng số bài', value: '142', sub: 'bài tập', color: 'text-cyan-500' },
          { label: 'Tỷ lệ giải đúng', value: '87.5%', sub: 'Acceptance Rate', color: 'text-emerald-500' },
          { label: 'Chuỗi ngày', value: streak, sub: 'ngày liên tiếp', color: 'text-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <p className={`text-2xl font-black mt-2 ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-x-auto">
        <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
          Biểu đồ hoạt động <span className="text-[10px] font-normal text-slate-500">(1 năm qua)</span>
        </h4>
        <ActivityCalendar 
          data={mockActivityData} 
          theme={{
            light: ['#f1f5f9', '#bae6fd', '#38bdf8', '#0284c7', '#0369a1'],
            dark: ['#1e293b', '#0c4a6e', '#0284c7', '#38bdf8', '#7dd3fc'],
          }}
          colorScheme="dark" // Ideally bound to current theme
          labels={{
            totalCount: '{{count}} hoạt động trong năm qua',
          }}
        />
      </div>
    </div>
  );
}
