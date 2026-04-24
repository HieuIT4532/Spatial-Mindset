import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, ChevronRight, BookText, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { THEORY_CHAPTERS, CATEGORIES } from '../data/theoryData';

export default function TheoryPanel({ isOpen, onClose }) {
  const [activeTheory, setActiveTheory] = useState(THEORY_CHAPTERS[0]);
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = THEORY_CHAPTERS.filter(t => {
    if (filterCat !== 'all' && t.category !== filterCat) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
            className="relative w-full max-w-5xl h-[80vh] rounded-[32px] overflow-hidden flex flex-col md:flex-row"
            style={{
              background: 'linear-gradient(135deg, rgba(2,6,23,0.95) 0%, rgba(15,23,42,0.95) 100%)',
              border: '1px solid rgba(34,211,238,0.2)',
              boxShadow: '0 0 60px rgba(34,211,238,0.1), 0 40px 80px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sidebar */}
            <div className="w-full md:w-[300px] border-r border-white/10 flex flex-col bg-black/20 shrink-0">
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <BookOpen size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-black uppercase tracking-widest text-sm">Cẩm nang</h2>
                    <p className="text-[10px] text-cyan-400/70 font-bold uppercase tracking-[0.15em]">100 Ngày Phá Kén</p>
                  </div>
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm chủ đề..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/30"
                  />
                </div>
              </div>

              {/* Category filter */}
              <div className="px-4 py-2 flex gap-1.5 flex-wrap border-b border-white/5">
                <button
                  onClick={() => setFilterCat('all')}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${filterCat === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                >Tất cả</button>
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setFilterCat(c)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${filterCat === c ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                  >{c}</button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                {filtered.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTheory(t)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group ${
                      activeTheory.id === t.id
                        ? 'bg-cyan-500/15 border border-cyan-500/30'
                        : 'bg-white/[0.02] border border-transparent hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[11px] font-bold block truncate ${activeTheory.id === t.id ? 'text-cyan-300' : 'text-slate-300'}`}>
                        {t.title}
                      </span>
                      <span className="text-[9px] text-slate-500">{t.source} · {t.exercises.length} bài tập</span>
                    </div>
                    <ChevronRight size={12} className={activeTheory.id === t.id ? 'text-cyan-400' : 'text-slate-600'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col relative bg-gradient-to-br from-transparent to-cyan-900/5">
              <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all z-10">
                <X size={16} />
              </button>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{activeTheory.icon}</span>
                  <div>
                    <h3 className="text-xl font-black text-white">{activeTheory.title}</h3>
                    <p className="text-[10px] text-cyan-400/60 font-bold uppercase tracking-widest">{activeTheory.source} · {activeTheory.category}</p>
                  </div>
                </div>
                <div className="mt-6 prose prose-invert prose-cyan max-w-none text-slate-300 text-sm leading-relaxed prose-headings:text-white prose-strong:text-cyan-300 prose-code:text-cyan-400 prose-code:bg-cyan-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {activeTheory.content}
                  </ReactMarkdown>
                </div>

                {/* Exercises section */}
                {activeTheory.exercises.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      <BookText size={16} className="text-cyan-400" /> Bài tập áp dụng ({activeTheory.exercises.length})
                    </h4>
                    <div className="space-y-3">
                      {activeTheory.exercises.map((ex, i) => (
                        <div key={ex.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/20 transition-all">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Câu {i+1}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                              ex.difficulty === 'easy' ? 'text-emerald-400 bg-emerald-500/10' :
                              ex.difficulty === 'medium' ? 'text-yellow-400 bg-yellow-500/10' :
                              'text-red-400 bg-red-500/10'
                            }`}>{ex.difficulty === 'easy' ? 'Dễ' : ex.difficulty === 'medium' ? 'Vừa' : 'Khó'}</span>
                            <span className="text-[9px] text-yellow-400/70 font-bold">+{ex.xp} XP</span>
                            <span className="text-[9px] text-slate-600 ml-auto">{ex.source}</span>
                          </div>
                          <div className="text-xs text-slate-200 leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {ex.problem}
                            </ReactMarkdown>
                          </div>
                          {ex.options && (
                            <div className="grid grid-cols-2 gap-1.5 mt-3">
                              {ex.options.map((opt, oi) => (
                                <div key={oi} className="px-3 py-1.5 rounded-lg bg-black/20 border border-white/5 text-[11px] text-slate-300">
                                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                    {`**${String.fromCharCode(65+oi)}.** ${opt}`}
                                  </ReactMarkdown>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
