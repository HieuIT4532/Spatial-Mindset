import React, { Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ChevronLeft, ThumbsUp, MessageSquare, Share2, Box } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import GeometryViewer from '../../components/GeometryViewer';

const MOCK_POST_DATA = {
  id: 1,
  title: '[Hướng dẫn] Mẹo xác định nhanh góc giữa hai mặt phẳng',
  author: 'MathWiz99',
  time: '2 giờ trước',
  content: `
Xin chào mọi người, hôm nay mình xin chia sẻ một meta cực nhanh để xác định góc giữa hai mặt phẳng trong không gian.

Giả sử chúng ta có hình chóp $S.ABCD$ với đáy là hình vuông. Đề bài yêu cầu tìm góc giữa mặt phẳng $(SCD)$ và mặt đáy $(ABCD)$.

Cách làm chuẩn SGK:
1. Tìm giao tuyến của 2 mặt phẳng: $CD$
2. Từ $S$ kẻ $SH \\perp (ABCD)$
3. Từ $H$ kẻ $HK \\perp CD$
4. Suy ra góc cần tìm là $\\widehat{SKH}$

Các bạn có thể tương tác trực tiếp với mô hình 3D mình đã dựng bên dưới để dễ hình dung đoạn kẻ đường phụ nhé. Thử xoay các góc để thấy rõ tam giác $SKH$ vuông tại $H$!
  `,
  // The magic feature: Embedded 3D Model data
  spatialData: {
    type: '3D',
    vertices: {
      A: [-1, 0, 1], B: [1, 0, 1], C: [1, 0, -1], D: [-1, 0, -1],
      S: [-1, 2, 1], // H is A
      K: [-1, 0, -1] // K is D because CD is perpendicular to AD
    },
    edges: [
      ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
      ['S', 'A'], ['S', 'B'], ['S', 'C'], ['S', 'D']
    ],
    steps: [
      {
        step_number: 1,
        draw_elements: [
          { type: 'line', from: 'S', to: 'D', color: 'red', style: 'dashed' },
          { type: 'line', from: 'A', to: 'D', color: 'blue', style: 'dashed' }
        ]
      }
    ]
  }
};

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 px-8 pb-12 bg-[#020617] text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/discuss')}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-400 transition-colors mb-8"
        >
          <ChevronLeft size={16} /> Quay lại diễn đàn
        </button>

        {/* Post Content */}
        <article className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <header className="mb-8 border-b border-white/5 pb-8">
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 leading-tight mb-4">
              {MOCK_POST_DATA.title}
            </h1>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                  {MOCK_POST_DATA.author.charAt(0)}
                </div>
                <span className="text-emerald-400">{MOCK_POST_DATA.author}</span>
              </div>
              <span>•</span>
              <span>{MOCK_POST_DATA.time}</span>
            </div>
          </header>

          <div className="prose prose-invert prose-emerald max-w-none text-[15px] leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {MOCK_POST_DATA.content}
            </ReactMarkdown>
          </div>

          {/* MAGIC: Embedded 3D Model */}
          {MOCK_POST_DATA.spatialData && (
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
                      data={MOCK_POST_DATA.spatialData} 
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

          <footer className="mt-8 pt-6 border-t border-white/5 flex items-center gap-6">
            <button className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors font-bold text-sm">
              <ThumbsUp size={16} /> 342 Thích
            </button>
            <button className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors font-bold text-sm">
              <MessageSquare size={16} /> 45 Bình luận
            </button>
            <button className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors font-bold text-sm ml-auto">
              <Share2 size={16} /> Chia sẻ
            </button>
          </footer>
        </article>

      </div>
    </div>
  );
}
