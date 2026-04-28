import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Calendar, Trophy, ChevronRight, AlertCircle, PlayCircle, BarChart2, BookOpen } from 'lucide-react';

export default function ContestDetailPage() {
  const { contestId } = useParams();
  const navigate = useNavigate();

  // Mock data for the contest
  const contestName = contestId.includes('weekly') ? `Weekly Contest ${contestId.replace('weekly-', '')}` : 'SpatialMind Contest';

  return (
    <div className="min-h-screen font-sans bg-[#0a0a0a] text-gray-300 py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (8): Main Info */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Header Section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-fuchsia-500/20 text-fuchsia-500 text-xs font-bold uppercase tracking-widest rounded-md border border-fuchsia-500/30">
                  Virtual
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-400 font-mono">
                  <Calendar size={14} /> 10 May 2026
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-400 font-mono">
                  <Clock size={14} /> 08:00 AM - 09:30 AM
                </span>
              </div>
              
              <h1 className="text-4xl font-black text-white mb-6 leading-tight">
                {contestName}
              </h1>

              <button 
                onClick={() => navigate(`/contest/${contestId}/workspace/1`)}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors shadow-sm"
              >
                <PlayCircle size={20} />
                Start Virtual Contest
              </button>
            </div>

            {/* Rules Section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <AlertCircle className="text-yellow-500" size={20} />
                Contest Rules
              </h2>
              
              <ul className="space-y-4 text-gray-400 text-sm leading-relaxed list-none">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0" />
                  <p>Kỳ thi kéo dài <strong>90 phút</strong>. Thời gian đếm ngược sẽ bắt đầu ngay khi bạn ấn "Start Virtual Contest".</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0" />
                  <p>Mỗi lần nộp bài sai (Wrong Answer), bạn sẽ bị phạt <strong>5 phút</strong> vào tổng thời gian hoàn thành (Penalty).</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0" />
                  <p>Hệ thống AI sẽ đánh giá đồng thời cả <strong>kết quả cuối cùng</strong> và <strong>phần lập luận/trình bày</strong> của bạn. Vui lòng trình bày mạch lạc.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0" />
                  <p>Xếp hạng dựa trên tổng điểm. Nếu bằng điểm, người có tổng thời gian (bao gồm Penalty) ít hơn sẽ xếp trên.</p>
                </li>
              </ul>
            </div>

          </div>

          {/* Right Column (4): Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Card 1: Ranking */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <Trophy size={40} className="text-yellow-500 mb-4 drop-shadow-md" />
              <h3 className="text-lg font-bold text-white mb-2">Bảng Xếp Hạng</h3>
              <p className="text-sm text-gray-400 mb-6">Xem vị trí của bạn so với các thí sinh khác trong kỳ thi này.</p>
              
              <button 
                onClick={() => navigate(`/contest/${contestId}/ranking`)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors border border-zinc-700"
              >
                <BarChart2 size={18} /> View Ranking
              </button>
            </div>

            {/* Card 2: Problems List */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <BookOpen size={18} className="text-cyan-400" />
                Danh Sách Bài Toán
              </h3>
              
              <div className="divide-y divide-zinc-800/60 border border-zinc-800/60 rounded-xl overflow-hidden bg-zinc-900/50">
                <div className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-300 w-6">Q1</span>
                    <span className="text-sm text-gray-400">Hình học cơ bản</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">3pt</span>
                </div>
                
                <div className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-300 w-6">Q2</span>
                    <span className="text-sm text-gray-400">Khoảng cách</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">4pt</span>
                </div>

                <div className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-300 w-6">Q3</span>
                    <span className="text-sm text-gray-400">Thể tích chóp</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded">5pt</span>
                </div>

                <div className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-300 w-6">Q4</span>
                    <span className="text-sm text-gray-400">Min-Max</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded">6pt</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
