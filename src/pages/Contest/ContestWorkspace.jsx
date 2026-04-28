import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ArrowLeft, CheckCircle, Clock, Play, AlertCircle, Sparkles, LayoutDashboard } from 'lucide-react';
import App from '../../App'; // Re-use 3D Canvas

// Mock data for problems in a contest
const ALL_PROBLEMS = {
  'weekly-1': [
    { id: '1', title: 'Q1. Góc giữa SC và mặt phẳng (ABCD)', content: 'Cho hình chóp $S.ABCD$ có đáy là hình vuông, $SA \\perp (ABCD)$. Góc giữa đường thẳng $SC$ và mặt phẳng $(ABCD)$ là gì?', correctAnswer: 'SCA', points: 3 },
    { id: '2', title: 'Q2. Tính góc giữa SD và mặt đáy', content: 'Cho hình chóp $S.ABCD$ có đáy là hình vuông cạnh $a$, $SA \\perp (ABCD)$ và $SA = a$. Tính góc giữa $SD$ và mặt đáy $(ABCD)$.', correctAnswer: '45', points: 4 },
    { id: '3', title: 'Q3. Tính góc giữa SC và (ABC)', content: 'Cho hình chóp $S.ABC$ có $SA \\perp (ABC)$, $SA = 2a$. Tam giác $ABC$ vuông tại $B$, $AB = a\\sqrt{3}$ và $BC = a$. Tính góc giữa đường thẳng $SC$ và mặt phẳng $(ABC)$.', correctAnswer: '45', points: 5 },
    { id: '4', title: 'Q4. Góc giữa SB và đáy', content: 'Cho hình chóp $S.ABCD$ có đáy là hình vuông cạnh $a$, $SA \\perp (ABCD)$ và $SB = 2a$. Góc giữa đường thẳng $SB$ và mặt phẳng đáy bằng bao nhiêu độ?', correctAnswer: '60', points: 6 }
  ],
  'weekly-2': [
    { id: '1', title: 'Q1. Tính góc giữa SM và (ABCD)', content: 'Cho hình chóp $S.ABCD$ có đáy là hình chữ nhật $ABCD$ có $AB = a$, $AD = 2a$. Cạnh $SA = a\\sqrt{6}$ và vuông góc với mặt phẳng đáy. Gọi $M$ là trung điểm của $BC$. Tính góc giữa $SM$ và $(ABCD)$.', correctAnswer: '60', points: 3 },
    { id: '2', title: 'Q2. Góc tạo bởi SC và mặt phẳng (ABCD)', content: 'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình chữ nhật, $AB = a$, $BC = 2a$. Hai mặt bên $(SAB)$, $(SAD)$ cùng vuông góc với mặt phẳng $(ABCD)$ và $SA = a\\sqrt{15}$. Góc tạo bởi $SC$ và mặt phẳng $(ABCD)$ là bao nhiêu?', correctAnswer: '60', points: 4 },
    { id: '3', title: 'Q3. Tính tan góc giữa SC và (ABCD)', content: 'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình chữ nhật, cạnh $AB = a$, $AD = 2a$, $SA \\perp (ABCD)$, $SA = 5a$. Tính $\\tan$ góc giữa $SC$ và mặt phẳng $(ABCD)$.', correctAnswer: '\\sqrt{5}', points: 5 },
    { id: '4', title: 'Q4. Góc nhị diện [S, CD, A]', content: 'Cho hình chóp $S.ABCD$ có đáy là hình vuông cạnh $a$, $SA \\perp (ABCD)$ và $SA = 2a\\sqrt{3}$. Tính số đo của góc nhị diện $[S, CD, A]$.', correctAnswer: '60', points: 6 }
  ],
  'weekly-3': [
    { id: '1', title: 'Q1. Khoảng cách giữa BD và SC', content: 'Cho hình chóp đều $S.ABCD$ có đáy là hình vuông $ABCD$ tâm $O$ cạnh $2a$, cạnh bên $SA = a\\sqrt{5}$. Khoảng cách giữa $BD$ và $SC$ là bao nhiêu?', correctAnswer: 'a\\sqrt{30}/6', points: 3 },
    { id: '2', title: 'Q2. Khoảng cách AB và CD', content: 'Cho tứ diện đều $ABCD$ cạnh $a\\sqrt{3}$. Khoảng cách giữa hai đường thẳng $AB$ và $CD$ bằng bao nhiêu?', correctAnswer: 'a\\sqrt{6}/2', points: 4 },
    { id: '3', title: 'Q3. Khoảng cách AB và SC', content: 'Cho hình chóp $S.ABC$ có đáy $ABC$ là tam giác vuông cân tại $B$, $AB = a$, cạnh bên $SA$ vuông góc với mặt phẳng đáy, góc tạo bởi hai mặt phẳng $(ABC)$ và $(SBC)$ bằng $60^\\circ$. Khoảng cách giữa hai đường thẳng $AB$ và $SC$ bằng bao nhiêu?', correctAnswer: 'a\\sqrt{3}/2', points: 5 },
    { id: '4', title: 'Q4. Khoảng cách SD và BM', content: 'Cho hình chóp $S.ABCD$ có đáy là hình vuông cạnh $2a$, $SA \\perp (ABCD)$. Gọi $M$ là trung điểm của cạnh $CD$, biết $SA = a\\sqrt{5}$. Khoảng cách giữa hai đường thẳng $SD$ và $BM$ là bao nhiêu?', correctAnswer: '2a\\sqrt{145}/29', points: 6 }
  ],
  'weekly-4': [
    { id: '1', title: 'Q1. Thể tích khối chóp S.ABC', content: 'Cho khối chóp $S.ABC$ có đáy $ABC$ là tam giác vuông cân tại $A$, $AB = a$, $\\widehat{SBA} = \\widehat{SCA} = 90^\\circ$, góc giữa hai mặt phẳng $(SAB)$ và $(SAC)$ bằng $60^\\circ$. Thể tích của khối chóp đã cho bằng bao nhiêu?', correctAnswer: 'a^3/6', points: 3 },
    { id: '2', title: 'Q2. Thể tích lăng trụ', content: 'Tính thể tích khối lăng trụ tam giác đều có tất cả các cạnh bằng $a$.', correctAnswer: 'a^3\\sqrt{3}/4', points: 4 },
    { id: '3', title: 'Q3. Khoảng cách điểm đến mặt phẳng', content: 'Trong không gian $Oxyz$, tính khoảng cách từ điểm $M(1, 2, 3)$ đến mặt phẳng $(P): x + y + z - 1 = 0$.', correctAnswer: '\\sqrt{3}', points: 5 },
    { id: '4', title: 'Q4. Thể tích chóp nâng cao', content: 'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$. Cạnh bên $SA$ vuông góc với mặt phẳng đáy và $SA = a\\sqrt{2}$. Tính thể tích khối chóp $S.ABCD$.', correctAnswer: 'a^3\\sqrt{2}/3', points: 6 }
  ]
};

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

  // Logic "AI Chấm Điểm Kép" (Dual-Validation)
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
      setTimeLeft(prev => Math.max(0, prev - 300)); // Trừ 5 phút vào đồng hồ
    }
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
          <span className="font-bold text-base text-white truncate max-w-[300px]">{problem.title}</span>
          <span className="px-2 py-1 text-xs font-mono font-bold text-cyan-400 bg-cyan-400/10 rounded border border-cyan-400/20">
            {problem.points} Points
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-400 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700/50">
            <Clock size={16} className={timeLeft < 300 ? 'text-red-500 animate-pulse' : ''} />
            <span className={`font-mono font-bold text-lg ${timeLeft < 300 ? 'text-red-500' : 'text-white'}`}>
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
            {isSubmitting ? 'Đang nhờ AI chấm...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="flex-1 relative">
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
            <div className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold shadow-2xl border ${
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
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col bg-[#0a0a0a] border-r border-zinc-800 overflow-hidden">
              
              {/* Khu vực 1: Đề bài (Scrollable) */}
              <div className="h-[35%] p-6 overflow-y-auto custom-scrollbar border-b border-zinc-800/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={14} className="text-cyan-400" /> Đề Bài
                  </h3>
                </div>
                <div className="prose prose-sm prose-invert max-w-none text-gray-300 leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {problem.content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Khu vực 2: Phần Trình Bày + Math Keyboard */}
              <div className="flex-1 flex flex-col border-b border-zinc-800/50 bg-zinc-900/10 overflow-hidden">
                <div className="px-6 py-3 border-b border-zinc-800/50 bg-zinc-900/60 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-400">Phần Trình bày</h3>
                  <button 
                    onClick={() => setShowMathKeyboard(!showMathKeyboard)}
                    className="text-[10px] font-black uppercase tracking-widest text-cyan-500 hover:text-cyan-400 transition-colors"
                  >
                    {showMathKeyboard ? 'Ẩn phím' : 'Bàn phím Toán'}
                  </button>
                </div>

                {/* Math Keyboard Inline */}
                {showMathKeyboard && (
                  <div className="px-4 py-2 bg-zinc-900/40 border-b border-zinc-800/30 grid grid-cols-6 sm:grid-cols-8 gap-1">
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
                        className="flex items-center justify-center py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-cyan-100 text-[10px] transition-all font-mono"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex-1 p-4 overflow-hidden">
                  <textarea
                    ref={textareaRef}
                    value={explanationText}
                    onChange={(e) => setExplanationText(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Sử dụng bàn phím toán học để trình bày lời giải chi tiết..."
                    className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-sm text-gray-300 placeholder:text-zinc-700 custom-scrollbar leading-relaxed"
                  />
                </div>
              </div>

              {/* Khu vực 3: Kết quả cuối cùng */}
              <div className="p-6 bg-zinc-900/40">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
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
                    placeholder="Nhập kết quả cuối cùng (VD: a^3\sqrt{2}/3)"
                    className="w-full bg-[#050505] border border-zinc-800 group-hover:border-zinc-700 rounded-xl py-3.5 pl-9 pr-4 text-white font-mono text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-cyan-500/50 transition-colors cursor-col-resize" />

          <Panel defaultSize={50} minSize={30}>
            <div className="h-full w-full relative bg-[#050505]">
              <button 
                className="absolute top-4 right-4 z-10 p-2.5 bg-zinc-900/80 hover:bg-zinc-800 text-gray-400 hover:text-white rounded-xl backdrop-blur-md transition-all border border-zinc-800 shadow-xl flex items-center gap-2 text-xs font-bold"
                title="Reset View"
              >
                <Play size={14} fill="currentColor" /> Play
              </button>
              <App isWorkspaceMode={true} initialProblem={{ title: problem.title, content: problem.content }} />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

// Add RotateCw icon missing from lucide-react imports
const RotateCw = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);
