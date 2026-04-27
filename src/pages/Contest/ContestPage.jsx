import React, { useState } from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Trophy, Clock, Users, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data
const UPCOMING_CONTEST = {
  id: "weekly-01",
  title: "SpatialMind Weekly Contest 1",
  startTime: "2026-05-10T08:00:00Z",
  registered: 1250
};

const MOCK_LEADERBOARD = [
  { rank: 1, username: "HieuIT", score: 4, penalty: 45 },
  { rank: 2, username: "AliceSpace", score: 4, penalty: 52 },
  { rank: 3, username: "BobBuilder", score: 4, penalty: 68 },
  { rank: 4, username: "Charlie3D", score: 3, penalty: 30 },
  { rank: 5, username: "DavidGeometry", score: 3, penalty: 45 },
  { rank: 6, username: "EveMath", score: 2, penalty: 15 },
  { rank: 7, username: "FrankCube", score: 2, penalty: 20 },
];

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor('rank', {
    header: 'Hạng',
    cell: (info) => {
      const rank = info.getValue();
      if (rank === 1) return <span className="font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] text-xl">🏆 1</span>;
      if (rank === 2) return <span className="font-bold text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.8)] text-lg">🥈 2</span>;
      if (rank === 3) return <span className="font-bold text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.8)] text-lg">🥉 3</span>;
      return <span className="text-slate-500 font-medium pl-3">{rank}</span>;
    },
  }),
  columnHelper.accessor('username', {
    header: 'Học sinh',
    cell: (info) => <span className="font-bold text-white">{info.getValue()}</span>,
  }),
  columnHelper.accessor('score', {
    header: 'Điểm',
    cell: (info) => <span className="text-emerald-400 font-bold">{info.getValue()}</span>,
  }),
  columnHelper.accessor('penalty', {
    header: 'Phạt (Phút)',
    cell: (info) => <span className="text-red-400 font-medium">{info.getValue()}</span>,
  }),
];

export default function ContestPage() {
  const { formattedText, isOver } = useCountdown(UPCOMING_CONTEST.startTime);
  const [activeTab, setActiveTab] = useState('ranking');

  const table = useReactTable({
    data: MOCK_LEADERBOARD,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-[#020617] pt-20 px-4 md:px-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-[#020617] border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                <Trophy size={14} /> Upcoming Contest
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                {UPCOMING_CONTEST.title}
              </h1>
              <p className="text-slate-400 text-lg">Tham gia đấu trường không gian thực tế ảo. Giải quyết các bài toán hình học hóc búa và thăng hạng trên bảng phong thần.</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                <button className="px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center gap-2">
                  Đăng ký tham gia <ArrowRight size={18} />
                </button>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium px-4 py-3 bg-white/5 rounded-xl">
                  <Users size={16} className="text-cyan-400" />
                  {UPCOMING_CONTEST.registered.toLocaleString()} người đã đăng ký
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center shadow-2xl min-w-[280px]">
              <Clock size={32} className="text-cyan-400 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Bắt đầu sau</p>
              <div className="font-mono text-3xl font-black text-white tracking-wider">
                {isOver ? (
                  <span className="text-green-400 animate-pulse">ĐANG DIỄN RA!</span>
                ) : (
                  formattedText
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Anti-cheat Banner */}
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <ShieldAlert size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-red-500 font-bold text-sm">Hệ thống chống gian lận (Anti-Cheat) được kích hoạt</h4>
            <p className="text-red-400/80 text-xs mt-1 leading-relaxed">
              Thời gian nộp bài được đồng bộ hóa thông qua Server của Google (Firebase Server Timestamp). Mọi hành vi cố tình thay đổi đồng hồ hệ thống (Client-side time manipulation) sẽ bị vô hiệu hóa. 
              Các công cụ AI bị vô hiệu hóa hoàn toàn trong phòng thi.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Custom Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <button 
              onClick={() => setActiveTab('ranking')}
              className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'ranking' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Bảng Phong Thần (Global Ranking)
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'past' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Kỳ Thi Đã Qua (Past Contests)
            </button>
          </div>

          {/* Tab Content: Ranking */}
          {activeTab === 'ranking' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f172a]/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id} className="border-b border-white/10 bg-black/20">
                        {headerGroup.headers.map(header => (
                          <th key={header.id} className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-6 py-4">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Tab Content: Past Contests */}
          {activeTab === 'past' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[1, 2, 3].map((num) => (
                <div key={num} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider">Đã kết thúc</span>
                    <Users size={16} className="text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Weekly Contest 0{4-num}</h3>
                  <p className="text-sm text-slate-400 mb-6">Đã diễn ra vào tháng trước. Hơn 800 thí sinh tham dự.</p>
                  <button className="w-full py-2.5 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors text-sm">
                    Thi thử lại (Virtual)
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
