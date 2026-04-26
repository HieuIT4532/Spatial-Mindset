import React, { useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ChevronLeft, Check, Terminal, Play, Loader2 } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment } from '@react-three/drei';
import GeometryViewer from '../../components/GeometryViewer';
import { useProblemsStore } from '../../stores/useProblemsStore';
import { useGamificationStore } from '../../stores/useGamificationStore';

// Mock geometry data (sẽ được gắn vào từng problem trong tương lai)
const mockGeometryData = {
  type: '3D',
  vertices: {
    A: [-1, 0, 1], B: [1, 0, 1], C: [1, 0, -1], D: [-1, 0, -1],
    S: [-1, 2.828, 1]
  },
  edges: [
    ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],
    ['S', 'A'], ['S', 'B'], ['S', 'C'], ['S', 'D']
  ]
};

// Mock content per problem (sẽ chuyển vào store khi backend sẵn sàng)
const PROBLEM_CONTENT = {
  1: `Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$. 
Biết cạnh bên $SA$ vuông góc với mặt đáy $(ABCD)$ và $SA = a\\sqrt{2}$.

**Yêu cầu:**
1. Hãy dựng mô hình hình chóp này trong không gian 3D bên phải.
2. Tính thể tích khối chóp $S.ABCD$ theo $a$. (Nhập đáp án bỏ qua $a^3$)

**Gợi ý:**
Công thức tính thể tích khối chóp là $V = \\frac{1}{3} B h$, trong đó $B$ là diện tích đáy và $h$ là chiều cao.`,
};

export default function ProblemWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const problemId = parseInt(id);

  const { problems, solvedStatus, submissions, submitAnswer } = useProblemsStore();
  const { addXP, incrementSolved } = useGamificationStore();

  const problem = problems.find(p => p.id === problemId);
  const status = solvedStatus[problemId] || 'unsolved';
  const pastSubmissions = submissions[problemId] || [];

  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null); // 'accepted' | 'wrong' | null

  if (!problem) {
    return (
      <div className="h-screen w-full bg-[#020617] text-white flex items-center justify-center pt-[72px]">
        <div className="text-center space-y-4">
          <p className="text-xl font-bold">Không tìm thấy bài toán #{id}</p>
          <button onClick={() => navigate('/problems')} className="px-4 py-2 bg-cyan-500 text-black rounded-xl font-bold">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      submitAnswer(problemId, answer);

      const isCorrect = answer.replace(/\s/g, '') === problem.expectedAnswer.replace(/\s/g, '');
      if (isCorrect && status !== 'solved') {
        addXP(100);
        incrementSolved();
      }
      setLastResult(isCorrect ? 'accepted' : 'wrong');
      setIsSubmitting(false);
    }, 800);
  };

  const content = PROBLEM_CONTENT[problemId] || `Đề bài cho bài toán: **${problem.title}**\n\nHãy nhập đáp án vào ô bên dưới.`;

  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col pt-[72px]">
      
      {/* Top Bar */}
      <div className="h-12 border-b border-white/5 bg-slate-900/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/problems')}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">{problem.id}. {problem.title}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider
              ${problem.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' :
                problem.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20' :
                'text-rose-400 bg-rose-400/10 border border-rose-400/20'}`}
            >
              {problem.difficulty}
            </span>
            {status === 'solved' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                ✓ Accepted
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 mr-2">{pastSubmissions.length} lần nộp</span>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !answer.trim()}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Submit
          </button>
        </div>
      </div>

      {/* Main Workspace (Split Pane) */}
      <div className="flex-1 overflow-hidden p-2">
        <PanelGroup direction="horizontal" className="h-full rounded-xl border border-white/10 overflow-hidden">
          
          {/* Left Panel: Problem Description */}
          <Panel defaultSize={40} minSize={25} className="bg-slate-900/80 flex flex-col h-full">
            <div className="h-10 bg-slate-800/50 border-b border-white/5 flex items-center px-4">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Terminal size={14} className="text-cyan-400" /> Mô tả bài toán
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {content}
              </ReactMarkdown>

              <div className="mt-12 pt-8 border-t border-white/10">
                <h3 className="text-sm font-bold text-slate-300 mb-4">Gửi đáp án:</h3>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Nhập đáp án LaTeX (VD: \sqrt{2}/3)"
                    className="flex-1 px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                {lastResult === 'accepted' && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center gap-2">
                    <Check size={16} /> Accepted! Lời giải chính xác. (+100 XP)
                  </div>
                )}
                {lastResult === 'wrong' && (
                  <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold">
                    Wrong Answer. Thử lại nhé!
                  </div>
                )}

                {/* Submission History */}
                {pastSubmissions.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lịch sử nộp bài</h4>
                    {pastSubmissions.slice(-5).reverse().map((sub, i) => (
                      <div key={i} className={`text-xs font-mono p-2 rounded-lg border ${
                        sub.result === 'accepted' 
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                      }`}>
                        <span className="font-bold">{sub.result === 'accepted' ? '✓ AC' : '✗ WA'}</span> — "{sub.answer}" — {new Date(sub.timestamp).toLocaleTimeString('vi-VN')}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Panel>

          {/* Resizer */}
          <PanelResizeHandle className="w-1.5 bg-slate-800 hover:bg-cyan-500/50 transition-colors cursor-col-resize flex items-center justify-center">
            <div className="w-0.5 h-8 bg-slate-600 rounded-full" />
          </PanelResizeHandle>

          {/* Right Panel: Spatial 3D Canvas */}
          <Panel defaultSize={60} minSize={30} className="bg-[#020617] relative">
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Spatial Canvas
            </div>
            
            <Canvas dpr={[1, 2]} shadows gl={{ antialias: true }}>
              <Suspense fallback={null}>
                <PerspectiveCamera makeDefault fov={45} position={[6, 4, 8]} />
                <OrbitControls makeDefault />
                
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <Environment preset="city" opacity={0.2} />
                
                <gridHelper args={[20, 20, '#1e293b', '#0f172a']} rotation={[Math.PI / 2, 0, 0]} />
                <axesHelper args={[2]} />

                <GeometryViewer 
                  data={mockGeometryData} 
                  currentStep={0} 
                  theme="dark" 
                  showAxes={false} 
                  showGrid={false} 
                />
              </Suspense>
            </Canvas>
          </Panel>

        </PanelGroup>
      </div>
    </div>
  );
}
