// =====================================================
// SpatialMind — Problem Workspace (Split Screen)
// =====================================================

import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ArrowLeft, Send, GripVertical, CheckCircle2 } from 'lucide-react';
import useSettingsStore from '../../stores/useSettingsStore';

// We receive `problem` and `onBack` from parent (App.jsx)
// We also receive `renderCanvas` as a render prop to embed the existing 3D Canvas
export default function ProblemWorkspace({ problem, onBack, renderCanvas }) {
  const isDark = useSettingsStore((s) => s.getEffectiveTheme()) === 'dark';
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mock description with LaTeX
  const markdownContent = `
### Đề bài: ${problem.title}

Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$. Cạnh bên $SA$ vuông góc với mặt phẳng đáy và $SA = a\\sqrt{2}$.

1. Dựng hình chóp $S.ABCD$ trên Canvas 3D.
2. Tính thể tích khối chóp $S.ABCD$.
3. Tính khoảng cách từ điểm $A$ đến mặt phẳng $(SBD)$.

**Gợi ý:**
- Thể tích khối chóp: $V = \\frac{1}{3} B h$
- Sử dụng công cụ đo khoảng cách để kiểm chứng kết quả.
  `;

  const handleSubmit = () => {
    if (!answer) return;
    setIsSubmitted(true);
    // In a real app, we would validate the answer and update XP via useUserSync or backend
  };

  return (
    <div className="h-full w-full flex flex-col bg-transparent">
      {/* Top Navbar for Workspace */}
      <div 
        className="h-14 flex items-center justify-between px-4 border-b flex-shrink-0"
        style={{
          background: isDark ? 'rgba(2,6,23,0.8)' : 'rgba(255,255,255,0.8)',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-black/5 text-slate-500 hover:text-black'}`}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{problem.title}</span>
            <span className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Bài toán #{problem.id} • {problem.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Panel: Description & Input */}
          <Panel defaultSize={35} minSize={25} maxSize={50}>
            <div className={`h-full flex flex-col ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`}>
              <div className="flex-1 overflow-y-auto p-6 prose prose-sm dark:prose-invert max-w-none custom-scrollbar">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {markdownContent}
                </ReactMarkdown>
              </div>

              {/* Submit Area */}
              <div className={`p-4 border-t ${isDark ? 'border-white/10 bg-[#020617]' : 'border-black/10 bg-slate-50'}`}>
                {isSubmitted ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <CheckCircle2 size={24} />
                    <div>
                      <p className="text-sm font-bold">Chính xác!</p>
                      <p className="text-xs opacity-80">+100 XP. Bạn đã hoàn thành bài toán này.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Nhập đáp án (hoặc tọa độ mục tiêu)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="VD: a^3 * sqrt(2) / 3"
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                          isDark
                            ? 'bg-white/5 border border-white/10 text-white placeholder-slate-500'
                            : 'bg-black/5 border border-black/10 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                      <button
                        onClick={handleSubmit}
                        disabled={!answer}
                        className="px-4 py-2.5 rounded-xl bg-cyan-500 text-white font-bold text-sm hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send size={16} /> Gửi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          {/* Resizer */}
          <PanelResizeHandle className="w-1.5 hover:w-2 bg-transparent hover:bg-cyan-500/30 transition-all flex items-center justify-center cursor-col-resize group">
            <div className={`h-8 w-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-black/20'} group-hover:bg-cyan-400`} />
          </PanelResizeHandle>

          {/* Right Panel: 3D Workspace */}
          <Panel defaultSize={65}>
            <div className="h-full w-full relative bg-transparent">
              {/* This is where we inject the existing 3D Canvas */}
              {renderCanvas && renderCanvas()}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
