import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Eye, Search, Filter, PenSquare, X, Send } from 'lucide-react';
import { useDiscussStore } from '../../stores/useDiscussStore';

export default function DiscussForum() {
  const navigate = useNavigate();
  const { posts, createPost } = useDiscussStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'top'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostForm, setNewPostForm] = useState({ title: '', content: '', tags: '' });

  // Filter & sort
  const filteredPosts = posts
    .filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'top') return b.likes - a.likes;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const handleCreatePost = () => {
    if (!newPostForm.title.trim() || !newPostForm.content.trim()) return;
    createPost({
      title: newPostForm.title,
      content: newPostForm.content,
      tags: newPostForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setNewPostForm({ title: '', content: '', tags: '' });
    setShowCreateModal(false);
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  return (
    <div className="min-h-screen pt-24 px-8 pb-12 bg-[#020617] text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Cộng đồng <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Discuss</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">{posts.length} bài</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm">Chia sẻ lời giải, thảo luận phương pháp và nhúng trực tiếp mô hình 3D.</p>
          </div>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-sm uppercase tracking-wider transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <PenSquare size={16} /> Tạo bài viết mới
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết, tác giả..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>
          <div className="flex items-center p-1 bg-slate-900/50 border border-white/10 rounded-xl">
            <button 
              onClick={() => setSortBy('newest')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${sortBy === 'newest' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Mới nhất
            </button>
            <button 
              onClick={() => setSortBy('top')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${sortBy === 'top' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Top (All time)
            </button>
          </div>
        </div>

        {/* Post List */}
        <div className="space-y-3">
          {filteredPosts.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <p className="text-lg font-bold">Chưa có bài viết nào.</p>
              <p className="text-sm mt-2">Hãy là người đầu tiên chia sẻ!</p>
            </div>
          )}
          {filteredPosts.map(post => (
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
                    <span>{getTimeAgo(post.createdAt)}</span>
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
                <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {post.comments.length}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Tạo bài viết mới</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <input 
              type="text"
              value={newPostForm.title}
              onChange={e => setNewPostForm({...newPostForm, title: e.target.value})}
              placeholder="Tiêu đề bài viết..."
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
            />
            <textarea 
              value={newPostForm.content}
              onChange={e => setNewPostForm({...newPostForm, content: e.target.value})}
              placeholder="Nội dung (hỗ trợ Markdown và LaTeX)..."
              rows={6}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none"
            />
            <input 
              type="text"
              value={newPostForm.tags}
              onChange={e => setNewPostForm({...newPostForm, tags: e.target.value})}
              placeholder="Tags (phân cách bằng dấu phẩy: Hình chóp, Mẹo, ...)"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
            />
            <button 
              onClick={handleCreatePost}
              disabled={!newPostForm.title.trim() || !newPostForm.content.trim()}
              className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send size={16} /> Đăng bài
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
