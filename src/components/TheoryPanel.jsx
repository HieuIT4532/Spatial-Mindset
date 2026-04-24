import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, ChevronRight, BookText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const THEORIES = [
  {
    id: 1,
    title: 'Thể tích khối chóp',
    content: 'Thể tích của một khối chóp được tính bằng 1/3 diện tích mặt đáy nhân với chiều cao của khối chóp.\n\n$$V = \\frac{1}{3} B h$$\n\nTrong đó $B$ là diện tích đáy, $h$ là chiều cao.'
  },
  {
    id: 2,
    title: 'Góc giữa đường thẳng và mặt phẳng',
    content: 'Góc giữa đường thẳng $d$ không vuông góc với mặt phẳng $(P)$ là góc giữa $d$ và hình chiếu vuông góc $d\'$ của nó trên $(P)$.\n\nNếu $d \\perp (P)$ thì góc bằng $90^\\circ$.'
  },
  {
    id: 3,
    title: 'Khoảng cách từ điểm đến mặt phẳng',
    content: 'Khoảng cách từ điểm $M(x_0, y_0, z_0)$ đến mặt phẳng $(P): Ax + By + Cz + D = 0$ được tính bằng công thức:\n\n$$d(M, P) = \\frac{|A x_0 + B y_0 + C z_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}$$'
  }
];

export default function TheoryPanel({ isOpen, onClose }) {
  const [activeTheory, setActiveTheory] = useState(THEORIES[0]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl h-[70vh] rounded-[32px] overflow-hidden flex flex-col md:flex-row"
            style={{
              background: 'linear-gradient(135deg, rgba(2,6,23,0.95) 0%, rgba(15,23,42,0.95) 100%)',
              border: '1px solid rgba(34,211,238,0.2)',
              boxShadow: '0 0 60px rgba(34,211,238,0.1), 0 40px 80px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sidebar List */}
            <div className="w-full md:w-1/3 border-r border-white/10 flex flex-col bg-black/20">
              <div className="p-6 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <BookOpen size={20} className="text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-white font-black uppercase tracking-widest text-sm">Cẩm nang</h2>
                  <p className="text-[10px] text-cyan-400/70 font-bold uppercase tracking-[0.2em]">Lý thuyết không gian</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {THEORIES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTheory(t)}
                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group ${
                      activeTheory.id === t.id 
                        ? 'bg-cyan-500/20 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                        : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <span className={`text-xs font-bold ${activeTheory.id === t.id ? 'text-cyan-300' : 'text-slate-300 group-hover:text-white'}`}>
                      {t.title}
                    </span>
                    <ChevronRight size={14} className={activeTheory.id === t.id ? 'text-cyan-400' : 'text-slate-500'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col relative bg-gradient-to-br from-transparent to-cyan-900/10">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all z-10"
              >
                <X size={16} />
              </button>
              
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="flex items-center gap-3 mb-6">
                  <BookText size={24} className="text-cyan-400" />
                  <h3 className="text-2xl font-black text-white">{activeTheory.title}</h3>
                </div>
                <div className="prose prose-invert prose-cyan max-w-none text-slate-300 text-sm leading-relaxed markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {activeTheory.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
