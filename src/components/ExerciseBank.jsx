import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Search, ChevronRight, Trophy, Flame } from 'lucide-react';
import axios from 'axios';

const DIFF_LABEL = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
const DIFF_COLOR = {
  easy:   { text: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)'  },
  medium: { text: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)'  },
  hard:   { text: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
};

export default function ExerciseBank({ isOpen, onClose, onSelectChallenge }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // We can fetch from a new endpoint /api/exercises or just reuse daily-challenge for now
    const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';
    axios.get(`${baseUrl}/api/daily-challenge`)
      .then(res => {
        // Just mock a larger bank by multiplying the daily challenges for demonstration
        const base = res.data.challenges || [];
        setChallenges([...base, ...base.map(c => ({...c, id: c.id+100, title: c.title + ' (Nâng cao)'}))]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? challenges : challenges.filter(c => c.difficulty === filter);

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
            className="relative w-full max-w-4xl h-[80vh] rounded-[32px] overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(135deg, rgba(2,6,23,0.95) 0%, rgba(15,23,42,0.95) 100%)',
              border: '1px solid rgba(139,92,246,0.2)',
              boxShadow: '0 0 60px rgba(139,92,246,0.1), 0 40px 80px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  <Layers size={24} className="text-violet-400" />
                </div>
                <div>
                  <h2 className="text-white font-black uppercase tracking-widest text-lg">Kho Bài Tập</h2>
                  <p className="text-[10px] text-violet-400/70 font-bold uppercase tracking-[0.2em] mt-0.5">SpatialMind Exercise Bank</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-white/5 flex gap-2">
              {['all', 'easy', 'medium', 'hard'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f 
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
                      : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                  }`}
                >
                  {f === 'all' ? 'Tất cả' : DIFF_LABEL[f]}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="text-center text-slate-500 mt-10">Đang tải dữ liệu...</div>
              ) : (
                filtered.map(c => {
                  const dc = DIFF_COLOR[c.difficulty] || DIFF_COLOR.medium;
                  return (
                    <motion.div
                      key={c.id}
                      whileHover={{ scale: 1.01 }}
                      className="rounded-2xl p-4 flex gap-4 transition-all bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer group"
                      onClick={() => {
                        onSelectChallenge && onSelectChallenge(c.problem);
                        onClose();
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: dc.bg, border: `1px solid ${dc.border}` }}>
                        <Trophy size={16} style={{ color: dc.text }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md" style={{ background: dc.bg, color: dc.text }}>
                            {DIFF_LABEL[c.difficulty]}
                          </span>
                          <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-1"><Flame size={10}/> {c.xp} XP</span>
                        </div>
                        <h3 className="text-white font-bold text-sm group-hover:text-violet-300 transition-colors">{c.title}</h3>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-1">{c.problem}</p>
                      </div>
                      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
