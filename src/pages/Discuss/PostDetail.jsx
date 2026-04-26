import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ChevronLeft, ThumbsUp, MessageSquare, Share2, Box, Send, Trash2 } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import GeometryViewer from '../../components/GeometryViewer';
import { useDiscussStore } from '../../stores/useDiscussStore';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = parseInt(id);

  const { posts, toggleLike, incrementView, addComment, deleteComment, deletePost } = useDiscussStore();
  const post = posts.find(p => p.id === postId);

  const [newComment, setNewComment] = useState('');

  // Tăng view khi mở bài viết
  useEffect(() => {
    if (post) incrementView(postId);
  }, [postId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!post) {
    return (
      <div className="min-h-screen pt-24 px-8 pb-12 bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl font-bold">Bài viết không tồn tại hoặc đã bị xóa.</p>
          <button onClick={() => navigate('/discuss')} className="px-4 py-2 bg-emerald-500 text-black rounded-xl font-bold">
            Quay lại diễn đàn
          </button>
        </div>
      </div>
    );
  }

  const isLiked = post.likedBy.includes('local_user');

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(postId, newComment);
    setNewComment('');
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      deletePost(postId);
      navigate('/discuss');
    }
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
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/discuss')}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ChevronLeft size={16} /> Quay lại diễn đàn
          </button>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 text-xs font-bold text-rose-400/60 hover:text-rose-400 transition-colors"
          >
            <Trash2 size={14} /> Xóa bài
          </button>
        </div>

        {/* Post Content */}
        <article className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <header className="mb-8 border-b border-white/5 pb-8">
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 leading-tight mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                  {post.avatar}
                </div>
                <span className="text-emerald-400">{post.author}</span>
              </div>
              <span>•</span>
              <span>{getTimeAgo(post.createdAt)}</span>
              <span>•</span>
              <span>{post.views} lượt xem</span>
            </div>
            {post.tags.length > 0 && (
              <div className="flex gap-1.5 mt-4">
                {post.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-400 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="prose prose-invert prose-emerald max-w-none text-[15px] leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Embedded 3D Model */}
          {post.spatialData && (
            <div className="mt-8 rounded-2xl border border-emerald-500/20 overflow-hidden bg-black/50">
              <div className="bg-emerald-950/30 px-4 py-2 border-b border-emerald-500/20 flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                <Box size={14} /> Embedded Spatial Model
              </div>
              <div className="h-[400px] w-full relative">
                <Canvas dpr={[1, 2]} shadows gl={{ antialias: true }}>
                  <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault fov={45} position={[4, 3, 5]} />
                    <OrbitControls makeDefault />
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <gridHelper args={[20, 20, '#1e293b', '#0f172a']} rotation={[Math.PI / 2, 0, 0]} />
                    <GeometryViewer 
                      data={post.spatialData} 
                      currentStep={1} 
                      theme="dark" 
                      showAxes={false} 
                      showGrid={false} 
                    />
                  </Suspense>
                </Canvas>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <footer className="mt-8 pt-6 border-t border-white/5 flex items-center gap-6">
            <button 
              onClick={() => toggleLike(postId)}
              className={`flex items-center gap-2 font-bold text-sm transition-colors ${isLiked ? 'text-emerald-400' : 'text-slate-400 hover:text-emerald-400'}`}
            >
              <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} /> {post.likes} Thích
            </button>
            <span className="flex items-center gap-2 text-slate-400 font-bold text-sm">
              <MessageSquare size={16} /> {post.comments.length} Bình luận
            </span>
            <button className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors font-bold text-sm ml-auto">
              <Share2 size={16} /> Chia sẻ
            </button>
          </footer>
        </article>

        {/* Comments Section */}
        <div className="bg-slate-900/30 border border-white/10 rounded-3xl p-6 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Bình luận ({post.comments.length})</h3>
          
          {/* Add Comment */}
          <div className="flex gap-3">
            <input 
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddComment()}
              placeholder="Viết bình luận..."
              className="flex-1 px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Send size={14} /> Gửi
            </button>
          </div>

          {/* Comment List */}
          <div className="space-y-3">
            {post.comments.length === 0 && (
              <p className="text-sm text-slate-600 italic">Chưa có bình luận. Hãy là người đầu tiên!</p>
            )}
            {post.comments.map(comment => (
              <div key={comment.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-xs font-black text-white shrink-0">
                  {comment.author.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">{comment.author}</span>
                    <span className="text-[10px] text-slate-600">{getTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{comment.content}</p>
                </div>
                <button 
                  onClick={() => deleteComment(postId, comment.id)}
                  className="text-slate-700 hover:text-rose-400 transition-colors p-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
