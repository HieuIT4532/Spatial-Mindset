import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ArrowLeft, CheckCircle, Clock, Play, AlertCircle } from 'lucide-react';
import App from '../../App'; // Re-use 3D Canvas

// Mock data for problems in a contest
const MOCK_PROBLEMS = {
  '1': {
    id: '1',
    title: 'Q1. Hình học cơ bản',
    content: 'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$. Cạnh bên $SA$ vuông góc với mặt phẳng đáy và $SA = a\\sqrt{2}$. \n\nTính thể tích khối chóp $S.ABCD$.',
    correctAnswer: 'a^3\\sqrt{2}/3',
    points: 3,
  },
  '2': {
    id: '2',
    title: 'Q2. Khoảng cách',
    content: 'Cho hình lập phương $ABCD.A\'B\'C\'D\'$ cạnh $a$. Tính khoảng cách giữa hai đường thẳng $A\'B$ và $B\'C$.',
    correctAnswer: 'a\\sqrt{3}/3',
    points: 4,
  }
};

export default function ContestWorkspace() {
  const { contestId, problemId } = useParams();
  const navigate = useNavigate();
  
  const problem = MOCK_PROBLEMS[problemId] || MOCK_PROBLEMS['1'];

  const [explanationText, setExplanationText] = useState('');
  const [finalAnswer, setFinalAnswer] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: str }

  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes

  // Countdown timer logic
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
    setTimeout(() => setToast(null), 5000); // clear after 5s
  };

  // Mock API Call
  const evaluateMathProblem = async (probId, explain, answer) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isAnswerCorrect = answer.replace(/\s/g, '') === problem.correctAnswer.replace(/\s/g, '');
        const hasExplanation = explain.trim().length > 20;

        if (isAnswerCorrect && hasExplanation) {
          resolve({ status: 'AC', message: 'Lập luận xuất sắc!' });
        } else if (isAnswerCorrect && !hasExplanation) {
          resolve({ status: 'WA', message: 'Kết quả đúng nhưng bạn chưa chứng minh cụ thể.' });
        } else {
          resolve({ status: 'WA', message: 'Kết quả chưa chính xác hoặc lập luận có lỗ hổng.' });
        }
      }, 2500); // 2.5s delay
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
      // Navigate to next problem after 1.5s
      setTimeout(() => {
        setIsSubmitting(false);
        const nextId = String(parseInt(problemId) + 1);
        if (MOCK_PROBLEMS[nextId]) {
          setExplanationText('');
          setFinalAnswer('');
          navigate(`/contest/${contestId}/workspace/${nextId}`);
        } else {
          // Finished all problems
          navigate(`/contest/${contestId}/ranking`);
        }
      }, 1500);
    } else {
      showToast('error', `Wrong Answer: ${result.message} (+5 phút Penalty)`);
      setIsSubmitting(false);
      // Giả lập thêm 5 phút penalty
      // (Thực tế sẽ gọi API cập nhật db)
    }
  };

  return (
    <div className="h-screen w-full font-sans bg-[#0a0a0a] flex flex-col overflow-hidden text-gray-300">
      {/* Topbar */}
      <div className="h-14 border-b border-zinc-800 flex items-center px-4 justify-between bg-zinc-900">
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
          {/* Countdown */}
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
                : 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/20'
            }`}
          >
            <CheckCircle size={16} className={isSubmitting ? 'animate-spin' : ''} />
            {isSubmitting ? 'Đang nhờ AI chấm...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="flex-1 relative">
        {/* Toast Notification overlay */}
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
          
          {/* Left Pane: Academic (50%) */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col bg-[#0a0a0a] border-r border-zinc-800">
              
              {/* Khu vực 1: Đề bài (Scrollable) */}
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar border-b border-zinc-800/50">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Đề Bài</h3>
                <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {problem.content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Khu vực 2: Phần Trình Bày */}
              <div className="h-[40%] flex flex-col border-b border-zinc-800/50 bg-zinc-900/30">
                <div className="px-6 py-3 border-b border-zinc-800/50 bg-zinc-900/80">
                  <h3 className="text-sm font-bold text-gray-400">Phần Trình bày</h3>
                </div>
                <div className="flex-1 p-4">
                  <textarea
                    value={explanationText}
                    onChange={(e) => setExplanationText(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Viết các bước lập luận của bạn ở đây... (Hỗ trợ text thường kết hợp LaTeX)"
                    className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-sm text-gray-300 placeholder:text-zinc-600 custom-scrollbar"
                  />
                </div>
              </div>

              {/* Khu vực 3: Kết quả cuối cùng */}
              <div className="p-6 bg-zinc-900/50">
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Kết quả cuối cùng <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-mono">$</span>
                  </div>
                  <input
                    type="text"
                    value={finalAnswer}
                    onChange={(e) => setFinalAnswer(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="VD: a^3\sqrt{2}/3"
                    className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-xl py-3 pl-8 pr-4 text-white font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
              </div>

            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-cyan-500 transition-colors cursor-col-resize" />

          {/* Right Pane: Visual 3D (50%) */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full w-full relative bg-[#050505]">
              {/* Reset View Button */}
              <button 
                className="absolute top-4 right-4 z-10 p-2 bg-zinc-800/80 hover:bg-zinc-700 text-gray-400 hover:text-white rounded-lg backdrop-blur-sm transition-colors border border-zinc-700"
                title="Reset View"
              >
                <Play size={18} />
              </button>

              {/* 3D Canvas */}
              <App isWorkspaceMode={true} initialProblem={{ title: problem.title, content: problem.content }} />
            </div>
          </Panel>

        </PanelGroup>
      </div>
    </div>
  );
}
