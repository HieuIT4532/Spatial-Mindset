import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ArrowLeft, CheckCircle, Clock, Play, AlertCircle, Sparkles } from 'lucide-react';
import App from '../../App'; // Re-use 3D Canvas

// Mock data for problems
const ALL_PROBLEMS = {
  'weekly-1': [
    { id: '1', title: 'Q1. Góc giữa SC và mặt phẳng (ABCD)', content: 'Cho hình chóp $S.ABCD$ có đáy là hình vuông, $SA \\perp (ABCD)$. Góc giữa đường thẳng $SC$ và mặt phẳng $(ABCD)$ là gì?', correctAnswer: 'SCA', points: 3 },
    { id: '2', title: 'Q2. Tính góc giữa SD và mặt đáy', content: 'Cho hình chóp $S.ABCD$ có đáy là hình vuông cạnh $a$, $SA \\perp (ABCD)$ và $SA = a$. Tính góc giữa $SD$ và mặt đáy $(ABCD)$.', correctAnswer: '45', points: 4 },
    { id: '3', title: 'Q3. Tính góc giữa SC và (ABC)', content: 'Cho hình chóp $S.ABC$ có $SA \\perp (ABC)$, $SA = 2a$. Tam giác $ABC$ vuông tại $B$, $AB = a\\sqrt{3}$ và $BC = a$. Tính góc giữa đường thẳng $SC$ và mặt phẳng $(ABC)$.', correctAnswer: '45', points: 5 },
    { id: '4', title: 'Q4. Góc giữa SB và đáy', content: 'Cho hình chóp $S.ABCD$ có đáy là hình vuông cạnh $a$, $SA \\perp (ABCD)$ và $SB = 2a$. Góc giữa đường thẳng $SB$ và mặt phẳng đáy bằng bao nhiêu độ?', correctAnswer: '60', points: 6 }
  ]
};

const RotateCw = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

export default function ContestWorkspace() {
  const { contestId, problemId } = useParams();
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  
  const contestProblems = ALL_PROBLEMS[contestId] || ALL_PROBLEMS['weekly-1'];
  const problem = contestProblems.find(p => p.id === problemId) || contestProblems[0];

  const [explanationText, setExplanationText] = useState('');
  const [finalAnswer, setFinalAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [showMathKeyboard, setShowMathKeyboard] = useState(true);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const insertMath = (latex, cursorOffset) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = explanationText.substring(0, start);
    const after = explanationText.substring(end);

    const newText = before + latex + after;
    setExplanationText(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + (cursorOffset !== undefined ? cursorOffset : latex.length);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const evaluateMathProblem = async (probId, explain, answer) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isAnswerCorrect = answer.replace(/\s/g, '') === problem.correctAnswer.replace(/\s/g, '');
        const hasLogicalExplanation = explain.trim().length > 40 && (explain.includes('Ta có') || explain.includes('Suy ra') || explain.includes('⇒'));

        if (isAnswerCorrect && hasLogicalExplanation) {
          resolve({ status: 'AC', message: 'Lập luận xuất sắc!' });
        } else if (isAnswerCorrect && !hasLogicalExplanation) {
          resolve({ status: 'WA', message: 'Kết quả đúng nhưng bạn chưa trình bày được logic giải toán.' });
        } else {
          resolve({ status: 'WA', message: 'Kết quả chưa chính xác. Hãy kiểm tra lại các bước tính toán.' });
        }
      }, 2500);
    });
  };

  const handleSubmit = async () => {
    if (!finalAnswer.trim()) {
      showToast('error', 'Vui lòng nhập kết quả cuối cùng trước khi Submit.');
      return;
    }

    setIsSubmitting(true);
    setToast(null);

    const result = await evaluateMathProblem(problemId, explanationText, finalAnswer);

    if (result.status === 'AC') {
      showToast('success', `Accepted! ${result.message}`);
      setTimeout(() => {
        setIsSubmitting(false);
        const nextId = String(parseInt(problemId) + 1);
        const nextProblem = contestProblems.find(p => p.id === nextId);
        if (nextProblem) {
          setExplanationText('');
          setFinalAnswer('');
          navigate(`/contest/${contestId}/workspace/${nextId}`);
        } else {
          navigate(`/contest/${contestId}/ranking`);
        }
      }, 1500);
    } else {
      showToast('error', `${result.message} (+5 phút Penalty)`);
      setIsSubmitting(false);
      setTimeLeft(prev => Math.max(0, prev - 300));
    }
  };

  // Reset 3D Camera by dispatching global event that App.jsx or its components can listen to
  const handleResetCamera = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true })); // Hoặc có thể thêm logic custom riêng
  };

  return (
    <div className="h-screen w-full font-sans bg-[#0a0a0a] flex flex-col overflow-hidden text-gray-300">
      
      {/* Topbar */}
      <div className="h-14 border-b border-zinc-800 flex items-center px-4 justify-between bg-zinc-900 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/contest/${contestId}`)}
            className="p-2 hover:bg-zinc-800 rounded-lg text-gray-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="font-bold text-base text-white truncate max-w-[400px]">{problem.title}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-400 bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">
            <Clock size={16} className={timeLeft < 300 ? 'text-red-500 animate-pulse' : ''} />
            <span className={`font-mono font-bold text-lg tracking-wider ${timeLeft < 300 ? 'text-red-500' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-xl transition-all shadow-sm ${
              isSubmitting 
                ? 'bg-green-500/50 text-white/70 cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/20 shadow-lg'
            }`}
          >
            {isSubmitting ? <RotateCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
            {isSubmitting ? 'Đang chấm...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="flex-1 relative">
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
            <div className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold shadow-xl border ${
              toast.type === 'success' 
                ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {toast.message}
            </div>
          </div>
        )}

        <PanelGroup direction="horizontal">
          
          {/* Pane Trái: Học thuật */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col bg-[#0a0a0a] border-r border-zinc-800">
              
              {/* Khu vực 1: Đề bài */}
              <div className="flex-none p-6 border-b border-zinc-800 bg-zinc-900/30 max-h-[40%] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={14} className="text-cyan-400" /> Đề Bài
                  </h3>
                </div>
                <div className="prose prose-sm prose-invert max-w-none text-gray-300 leading-relaxed text-[15px]">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {problem.content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Khu vực 2: Phần Trình Bày */}
              <div className="flex-1 flex flex-col min-h-0 bg-zinc-900/10">
                <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between flex-none">
                  <h3 className="text-sm font-bold text-gray-300">Phần Trình bày</h3>
                  <button 
                    onClick={() => setShowMathKeyboard(!showMathKeyboard)}
                    className="text-[10px] font-black uppercase tracking-widest text-cyan-500 hover:text-cyan-400 transition-colors"
                  >
                    {showMathKeyboard ? 'Ẩn phím' : 'Bàn phím Toán'}
                  </button>
                </div>

                {showMathKeyboard && (
                  <div className="px-4 py-2 bg-zinc-900/40 border-b border-zinc-800/50 grid grid-cols-6 sm:grid-cols-8 gap-1 flex-none">
                    {[
                      { label: '$$', latex: '$  $', offset: 2 },
                      { label: 'a/b', latex: '\\frac{}{} ', offset: 6 },
                      { label: '√', latex: '\\sqrt{} ', offset: 6 },
                      { label: 'x²', latex: '^{} ', offset: 2 },
                      { label: 'x₂', latex: '_{} ', offset: 2 },
                      { label: '∠', latex: '\\widehat{} ', offset: 9 },
                      { label: '°', latex: '^\\circ ' },
                      { label: 'v⃗', latex: '\\vec{} ', offset: 5 },
                      { label: '⊥', latex: '\\perp ' },
                      { label: '∥', latex: '\\parallel ' },
                      { label: '△', latex: '\\triangle ' },
                      { label: 'π', latex: '\\pi ' }
                    ].map((btn, i) => (
                      <button
                        key={i}
                        onClick={() => insertMath(btn.latex, btn.offset)}
                        className="flex items-center justify-center py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-cyan-100 text-[11px] transition-all font-mono"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex-1 p-6 overflow-hidden">
                  <textarea
                    ref={textareaRef}
                    value={explanationText}
                    onChange={(e) => setExplanationText(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Nhập phần trình bày lời giải chi tiết (Hỗ trợ gõ văn bản kết hợp công thức toán)..."
                    className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-[15px] text-gray-300 placeholder:text-zinc-600 custom-scrollbar leading-relaxed"
                  />
                </div>
              </div>

              {/* Khu vực 3: Kết quả cuối cùng */}
              <div className="flex-none p-6 border-t border-zinc-800 bg-zinc-900/50">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Kết quả cuối cùng <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-cyan-500 font-mono font-bold">$</span>
                  </div>
                  <input
                    type="text"
                    value={finalAnswer}
                    onChange={(e) => setFinalAnswer(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Ví dụ: a^3\sqrt{2}/3"
                    className="w-full bg-[#050505] border border-zinc-700 group-hover:border-zinc-600 rounded-xl py-4 pl-9 pr-4 text-white font-mono text-base focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

            </div>
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-zinc-900 hover:bg-zinc-700 active:bg-cyan-500/50 transition-colors cursor-col-resize flex flex-col justify-center items-center">
            <div className="w-0.5 h-8 bg-zinc-700 rounded-full" />
          </PanelResizeHandle>

          {/* Pane Phải: Trực quan 3D */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full w-full relative bg-[#050505] flex flex-col">
              <button 
                onClick={handleResetCamera}
                className="absolute top-4 right-4 z-10 px-3 py-2 bg-zinc-900/80 hover:bg-zinc-800 text-gray-400 hover:text-white rounded-lg backdrop-blur-md transition-all border border-zinc-800 shadow-xl flex items-center gap-2 text-xs font-bold"
                title="Reset Camera View"
              >
                <Play size={14} fill="currentColor" className="text-cyan-500" /> Reset View
              </button>
              
              <div className="flex-1">
                <App isWorkspaceMode={true} initialProblem={{ title: problem.title, content: problem.content }} />
              </div>
            </div>
          </Panel>

        </PanelGroup>
      </div>
    </div>
  );
}
