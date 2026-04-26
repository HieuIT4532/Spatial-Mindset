import React, { useState } from 'react';
import ActivityCalendar from 'react-activity-calendar';
import { useAuth } from '../../../contexts/AuthContext';
import { getRankInfo } from '../../../components/GameHUD';
import { useProfileStore } from '../../../stores/useProfileStore';
import { useGamificationStore } from '../../../stores/useGamificationStore';
import { useProblemsStore } from '../../../stores/useProblemsStore';
import { Edit2, Check, X } from 'lucide-react';

export default function ProfileTab() {
  const { user } = useAuth();
  const profile = useProfileStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: profile.displayName,
    bio: profile.bio,
    school: profile.school,
    role: profile.role,
  });

  const handleSave = () => {
    profile.updateProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      displayName: profile.displayName,
      bio: profile.bio,
      school: profile.school,
      role: profile.role,
    });
    setIsEditing(false);
  };
  
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

  const { xp, streak } = useGamificationStore();
  const problemStats = useProblemsStore.getState().getStats();
  const { current: rank } = getRankInfo(xp);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-1">Hồ sơ cá nhân</h3>
          <p className="text-sm text-slate-500">Quản lý thông tin và theo dõi thành tích của bạn.</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl transition-colors"
          >
            <Edit2 size={16} /> Chỉnh sửa
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-xl transition-colors"
            >
              <X size={16} /> Hủy
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold rounded-xl transition-colors"
            >
              <Check size={16} /> Lưu
            </button>
          </div>
        )}
      </div>

      {/* ID Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/5 to-indigo-500/5">
        <div className="relative shrink-0">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={profile.displayName} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-cyan-500/20" />
          ) : (
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black text-white bg-gradient-to-br from-cyan-500 to-indigo-500 shadow-xl shadow-cyan-500/20 uppercase">
              {profile.displayName.charAt(0)}
            </div>
          )}
          <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md text-[10px] font-black text-white bg-indigo-500 border-2 border-white dark:border-[#020617] uppercase">
            {profile.role}
          </span>
        </div>
        <div className="flex-1 w-full space-y-3">
          {!isEditing ? (
            <>
              <div>
                <h2 className="text-2xl font-black tracking-tight">{profile.displayName}</h2>
                <p className="text-sm font-medium text-cyan-400">{profile.school}</p>
              </div>
              <p className="text-sm text-slate-400 italic">"{profile.bio}"</p>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-3 max-w-md">
              <input 
                type="text" 
                value={editForm.displayName} 
                onChange={e => setEditForm({...editForm, displayName: e.target.value})}
                placeholder="Tên hiển thị"
                className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-sm font-bold focus:outline-none focus:border-cyan-500"
              />
              <input 
                type="text" 
                value={editForm.school} 
                onChange={e => setEditForm({...editForm, school: e.target.value})}
                placeholder="Trường học"
                className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-sm text-cyan-400 focus:outline-none focus:border-cyan-500"
              />
              <input 
                type="text" 
                value={editForm.bio} 
                onChange={e => setEditForm({...editForm, bio: e.target.value})}
                placeholder="Tiểu sử / Câu nói yêu thích"
                className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-sm text-slate-400 italic focus:outline-none focus:border-cyan-500"
              />
              <select 
                value={editForm.role}
                onChange={e => setEditForm({...editForm, role: e.target.value})}
                className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="HỌC SINH">Học sinh</option>
                <option value="GIÁO VIÊN">Giáo viên</option>
                <option value="CHUYÊN GIA">Chuyên gia</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Rank hiện tại', value: rank.name, sub: rank.emoji, color: 'text-yellow-500' },
          { label: 'Tổng số bài', value: problemStats.solved, sub: `/ ${problemStats.total} bài tập`, color: 'text-cyan-500' },
          { label: 'Tỷ lệ giải đúng', value: `${problemStats.acceptRate}%`, sub: 'Acceptance Rate', color: 'text-emerald-500' },
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
          colorScheme="dark"
          labels={{
            totalCount: '{{count}} hoạt động trong năm qua',
          }}
        />
      </div>
    </div>
  );
}
