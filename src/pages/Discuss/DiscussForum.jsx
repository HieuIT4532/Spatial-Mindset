// =====================================================
// SpatialMind — Discuss Forum
// =====================================================

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { MessageSquare, ThumbsUp, MessageCircle, Eye, Tag, Share2, CornerDownRight, Box } from 'lucide-react';
import useSettingsStore from '../../stores/useSettingsStore';

// Custom Markdown Component to render 3D embeds
// Syntax: [spatial:12345] -> Renders a mini 3D canvas
const MarkdownComponents = {
  a: ({ node, ...props }) => {
    // If text is like [spatial:123]
    if (props.children?.[0] && typeof props.children[0] === 'string' && props.children[0].startsWith('[spatial:')) {
      const id = props.children[0].match(/\[spatial:(\d+)\]/)?.[1];
      if (id) {
        return (
          <div className="my-4 rounded-xl overflow-hidden border border-cyan-500/30 bg-black/5 dark:bg-white/5 relative aspect-video flex items-center justify-center group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
            <Box className="text-cyan-500/50 w-16 h-16 group-hover:scale-110 transition-transform" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold rounded-lg border border-white/10">
                Mô hình 3D #{id}
              </span>
              <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all">
                Mở trong Workspace
              </button>
            </div>
            {/* Note: In full implementation, we render <Canvas> here fetching the JSON geometry */}
          </div>
        );
      }
    }
    return <a {...props} className="text-cyan-500 hover:underline" />;
  }
};

const POSTS = [
  {
    id: 1,
    author: 'Alex Math',
    avatar: null,
    title: 'Mẹo dựng đường vuông góc chung nhanh nhất!',
    content: `Chào mọi người,
Hôm nay mình chia sẻ một "meta" để dựng đường vuông góc chung giữa hai đường chéo nhau $a$ và $b$ cực nhanh trên SpatialMind.

**Bước 1:** Dựng mặt phẳng $(P)$ chứa $a$ và song song với $b$.
**Bước 2:** Lấy điểm $M$ tùy ý trên $b$, dựng $MH \\perp (P)$ tại $H$.
**Bước 3:** Từ $H$ dựng đường thẳng $a'$ song song với $b$, cắt $a$ tại $A$.
**Bước 4:** Từ $A$ dựng đường thẳng song song với $MH$, cắt $b$ tại $B$. Khi đó $AB$ chính là đường vuông góc chung!

Mọi người có thể xem ví dụ trực quan mình dựng ở đây:
[[spatial:84920]](#)

Chúc các bạn leo rank tốt nhé!`,
    tags: ['Mẹo giải nhanh', 'Khoảng cách'],
    likes: 124,
    comments: 18,
    views: 1050,
    time: '2 giờ trước'
  },
  {
    id: 2,
    author: 'Sarah_99',
    avatar: null,
    title: 'Xin cách giải bài thể tích khối lăng trụ xiên?',
    content: `Mình đang kẹt ở bài tập tuần này. Cho hình lăng trụ xiên $ABC.A'B'C'$ có đáy là tam giác đều cạnh $a$. Hình chiếu vuông góc của $A'$ lên $(ABC)$ trùng với trọng tâm tam giác $ABC$. Góc giữa cạnh bên và mặt đáy là $60^\\circ$.

Mình tính được chiều cao $h = a\\frac{\\sqrt{3}}{3} \\cdot \\tan(60^\\circ) = a$ nhưng submit vào hệ thống cứ báo sai. 
Có ai biết mình sai ở đâu không?`,
    tags: ['Hỏi đáp', 'Thể tích'],
    likes: 15,
    comments: 4,
    views: 120,
    time: '5 giờ trước'
  }
];

export default function DiscussForum() {
  const isDark = useSettingsStore((s) => s.getEffectiveTheme()) === 'dark';

  return (
    <div className="h-full w-full max-w-5xl mx-auto px-6 py-8 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-8">
      {/* Main Feed */}
      <div className="flex-1 space-y-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-black mb-2 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <MessageSquare className="text-cyan-400" size={32} />
              Cộng Đồng
            </h1>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Thảo luận, chia sẻ mô hình 3D và học hỏi "meta" giải toán.
            </p>
          </div>
          <button className="px-6 py-2.5 bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-colors">
            + Bài viết mới
          </button>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {POSTS.map((post) => (
            <div 
              key={post.id}
              className="p-6 rounded-3xl border transition-colors hover:border-cyan-500/30"
              style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              }}
            >
              {/* Author & Tags */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white" style={{ background: 'linear-gradient(135deg, #22d3ee, #6366f1)' }}>
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{post.author}</p>
                    <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{post.time}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {post.tags.map(t => (
                    <span key={t} className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${isDark ? 'bg-white/5 text-slate-300' : 'bg-black/5 text-slate-600'}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Title & Content */}
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{post.title}</h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-500 dark:text-slate-400">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={MarkdownComponents}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Interaction Bar */}
              <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-500/10">
                <button className={`flex items-center gap-2 text-xs font-bold transition-colors ${isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-500 hover:text-cyan-600'}`}>
                  <ThumbsUp size={16} /> {post.likes}
                </button>
                <button className={`flex items-center gap-2 text-xs font-bold transition-colors ${isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-500 hover:text-cyan-600'}`}>
                  <MessageCircle size={16} /> {post.comments}
                </button>
                <button className={`flex items-center gap-2 text-xs font-bold transition-colors ${isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-500 hover:text-cyan-600'}`}>
                  <Eye size={16} /> {post.views}
                </button>
                <button className={`ml-auto flex items-center gap-2 text-xs font-bold transition-colors ${isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-500 hover:text-cyan-600'}`}>
                  <Share2 size={16} /> Chia sẻ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div className="p-5 rounded-2xl border" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
          <h4 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <Tag size={14} className="text-cyan-400" /> Topic nổi bật
          </h4>
          <div className="flex flex-wrap gap-2">
            {['Khối chóp', 'Tỉ số thể tích', 'Mặt cầu', 'Mẹo giải nhanh', 'Kỳ thi tuần'].map(t => (
              <span key={t} className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${isDark ? 'bg-white/5 text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-400' : 'bg-black/5 text-slate-600 hover:bg-cyan-500/10 hover:text-cyan-600'}`}>
                #{t}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl border" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
          <h4 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <Box size={14} className="text-cyan-400" /> Mô hình thịnh hành
          </h4>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 group cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-black/20 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent" />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-bold line-clamp-1 group-hover:text-cyan-400 transition-colors ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Hình chóp cụt đều</p>
                  <p className={`text-[9px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Đăng bởi User_{i}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
