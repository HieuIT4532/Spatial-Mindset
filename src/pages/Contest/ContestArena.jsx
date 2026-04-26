import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ChevronLeft, Check, Terminal, Play, Loader2, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment } from '@react-three/drei';
import GeometryViewer from '../../components/GeometryViewer';
import { useAppStore } from '../../stores/useAppStore';

export default function ContestArena() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setContestMode = useAppStore(state => state.setContestMode);

  useEffect(() => {
    setContestMode(true);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timer);
      setContestMode(false);
    };
  }, [setContestMode]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Đã ghi nhận đáp án! Chờ kết quả khi cuộc thi kết thúc.');
    }, 1000);
  };

  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col pt-[72px]">
      
      {/* Contest Top Bar */}
      <div className="h-14 border-b border-rose-500/20 bg-rose-950/20 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/contest')}
            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400/70 hover:text-rose-400 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <span className="font-black uppercase tracking-wider text-sm text-rose-400">Arena #{id}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-slate-400">
              Bài 1 / 4
            </span>
          </div>
        </div>
        
        {/* Timer */}
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-mono text-xl font-bold shadow-inner
          ${timeLeft < 300 ? 'bg-rose-500 text-white animate-pulse' : 'bg-black/50 text-rose-400 border border-rose-500/30'}`}
        >
          <Clock size={18} />
          {formatTime(timeLeft)}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || timeLeft === 0}
            className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Submit Answer
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden p-2 relative">
        {/* Anti-cheat overlay warning */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold tracking-widest uppercase backdrop-blur-md">
          <ShieldAlert size={14} /> Chế độ thi đấu: AI Socratic đã bị vô hiệu hóa
        </div>

        <PanelGroup direction="horizontal" className="h-full rounded-xl border border-white/10 overflow-hidden">
          
          <Panel defaultSize={40} minSize={25} className="bg-slate-900/80 flex flex-col h-full">
            <div className="h-10 bg-slate-800/50 border-b border-white/5 flex items-center px-4">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Terminal size={14} className="text-rose-400" /> Bài 1: Hình nón ngoại tiếp
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {`Cho hình nón có chiều cao $h = 4a$, bán kính đáy $R = 3a$. 
Một hình trụ được nội tiếp trong hình nón sao cho một đáy của hình trụ nằm trên mặt đáy của hình nón. 
Gọi $x$ là bán kính đáy của hình trụ ($0 < x < 3a$). 
Tìm $x$ để thể tích khối trụ là lớn nhất?`}
              </ReactMarkdown>

              <div className="mt-12 pt-8 border-t border-white/10">
                <h3 className="text-sm font-bold text-slate-300 mb-4">Gửi đáp án:</h3>
                <input 
                  type="text" 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Nhập giá trị x (VD: 2a)"
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  onPaste={(e) => { e.preventDefault(); alert('Cảnh báo: Không dán dữ liệu trong lúc thi!'); }}
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-slate-800 hover:bg-rose-500/50 transition-colors cursor-col-resize flex items-center justify-center">
            <div className="w-0.5 h-8 bg-slate-600 rounded-full" />
          </PanelResizeHandle>

          <Panel defaultSize={60} minSize={30} className="bg-[#020617] relative">
            <Canvas dpr={[1, 2]} shadows gl={{ antialias: true }}>
              <Suspense fallback={null}>
                <PerspectiveCamera makeDefault fov={45} position={[6, 4, 8]} />
                <OrbitControls makeDefault />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <gridHelper args={[20, 20, '#1e293b', '#0f172a']} rotation={[Math.PI / 2, 0, 0]} />
                <axesHelper args={[2]} />
              </Suspense>
            </Canvas>
          </Panel>

        </PanelGroup>
      </div>
    </div>
  );
}
