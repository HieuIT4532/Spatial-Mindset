import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Eye, Search, Filter, PenSquare } from 'lucide-react';

const MOCK_POSTS = [
  {
    id: 1,
    title: '[Hướng dẫn] Mẹo xác định nhanh góc giữa hai mặt phẳng',
    author: 'MathWiz99',
    avatar: 'M',
    views: 1250,
    likes: 342,
    replies: 45,
    tags: ['Góc', 'Mẹo', 'Lý thuyết'],
    time: '2 giờ trước'
  },
  {
    id: 2,
    title: 'Hỏi bài: Thiết diện cắt bởi mặt phẳng (MNP) đi qua trọng tâm',
    author: 'geometry_noob',
    avatar: 'G',
    views: 89,
    likes: 5,
    replies: 12,
    tags: ['Thiết diện', 'Hỏi đáp'],
    time: '5 giờ trước'
  },
  {
    id: 3,
    title: 'Showcase: Dựng mô hình khối chóp tứ giác đều SIÊU ĐẸP bằng SpatialMind',
    author: 'Architect2026',
    avatar: 'A',
    views: 5400,
    likes: 1205,
    replies: 108,
    tags: ['3D Showcase', 'Mô hình'],
    time: '1 ngày trước'
  }
];

export default function DiscussForum() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 px-8 pb-12 bg-[#020617] text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Cộng đồng <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Discuss</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm">Chia sẻ lời giải, thảo luận phương pháp và nhúng trực tiếp mô hình 3D.</p>
          </div>

          <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-sm uppercase tracking-wider transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <PenSquare size={16} /> Tạo bài viết mới
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài viết, tác giả..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>
          <button className="px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-sm hover:bg-white/5 transition-colors flex items-center gap-2 text-slate-300">
            <Filter size={16} /> Lọc theo Tag
          </button>
          <div className="flex items-center p-1 bg-slate-900/50 border border-white/10 rounded-xl">
            <button className="px-4 py-1.5 rounded-lg bg-white/10 text-white text-sm font-bold">Mới nhất</button>
            <button className="px-4 py-1.5 rounded-lg text-slate-400 hover:text-white text-sm font-bold transition-colors">Top (All time)</button>
          </div>
        </div>

        {/* Post List */}
        <div className="space-y-3">
          {MOCK_POSTS.map(post => (
            <div 
              key={post.id}
              onClick={() => navigate(`/discuss/${post.id}`)}
              className="group p-5 bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-emerald-500/30 rounded-2xl cursor-pointer transition-all flex flex-col md:flex-row gap-4 justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-black text-slate-900 shrink-0">
                  {post.avatar}
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span className="text-slate-300">{post.author}</span>
                    <span>•</span>
                    <span>{post.time}</span>
                    <span>•</span>
                    <div className="flex gap-1.5">
                      {post.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-500 shrink-0 ml-14 md:ml-0">
                <span className="flex items-center gap-1.5"><Eye size={14} /> {post.views}</span>
                <span className="flex items-center gap-1.5"><ThumbsUp size={14} /> {post.likes}</span>
                <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {post.replies}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
