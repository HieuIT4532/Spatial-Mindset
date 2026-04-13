import React, { useState, useRef, Suspense } from 'react';
import axios from 'axios';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Stars, Float, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Lightbulb, 
  X, 
  RotateCcw, 
  ChevronRight, 
  Info, 
  Box, 
  Maximize, 
  Copy, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Components
import GeometryViewer from './components/GeometryViewer';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// =====================
// Component: Simple 3D Loader
// =====================
function SceneLoader() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#3b82f6" wireframe />
    </mesh>
  );
}

// (GeometryModel has been replaced by GeometryViewer component)

// =====================
// Component: Hint Panel (Slide Over)
// =====================
function HintPanel({ hint, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!hint) return;
    navigator.clipboard.writeText(hint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] cursor-pointer"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Lightbulb size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-none">Gợi ý Giải bài</h2>
                  <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
                    <Sparkles size={10} /> Phân tích bởi Gemini AI CS
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hint && (
                  <button 
                    onClick={handleCopy}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                    title="Sao chép"
                  >
                    {copied ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Copy size={18} />}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content with Markdown & LaTeX */}
            <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
              {hint ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="prose prose-invert prose-emerald max-w-none text-slate-300 markdown-content"
                >
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-blue-400 font-extrabold text-2xl mt-8 mb-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-emerald-400 font-bold text-lg mt-6 mb-3 flex items-center gap-2" {...props} />,
                      p: ({node, ...props}) => <p className="leading-relaxed mb-4" {...props} />,
                      strong: ({node, ...props}) => <strong className="text-slate-100 font-bold" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-2 mb-4" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-4 space-y-2 mb-4" {...props} />,
                      li: ({node, ...props}) => <li className="text-slate-400" {...props} />,
                    }}
                  >
                    {hint}
                  </ReactMarkdown>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center">
                    <Box size={32} className="text-slate-700" />
                  </div>
                  <p className="text-slate-500 text-sm max-w-[200px]">Tạo mô hình 3D trước để kích hoạt trí tuệ nhân tạo trợ giúp.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-800 bg-slate-900/80">
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed italic">
                  Gợi ý này được tạo tự động nhằm hỗ trợ tư duy không gian. Hãy sử dụng nó như một tài liệu tham khảo để rèn luyện kỹ năng tự giải toán nhé!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =====================
// Component: Main App
// =====================
export default function App() {
  const [promptInput, setPromptInput] = useState('');
  const [geometryData, setGeometryData] = useState(null);
  const [hintData, setHintData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const controlsRef = useRef();

  const handleGenerate = async () => {
    if (!promptInput.trim()) {
      setError('Vui lòng nhập đề bài để bắt đầu.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      // Sử dụng biến môi trường VITE_API_URL để trỏ tới API độc lập (Render)
      const apiUrl = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api/geometry/calculate` 
        : 'http://localhost:8000/api/geometry/calculate';
        
      const response = await axios.post(apiUrl, {
        query: promptInput
      });
      
      setGeometryData(response.data);
      setHintData(response.data.hint ?? null);
      setActiveStep(0); // Reset về bước 0 khi có lời giải mới
      
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || 'Mất kết nối với AI Backend. Hãy kiểm tra server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-100 font-sans overflow-hidden select-none">
      
      {/* 🔮 Sidebar */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-[380px] shrink-0 p-8 flex flex-col z-50 relative border-r border-white/5 bg-slate-900/40 backdrop-blur-3xl shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-transparent opacity-50" />
        
        <div className="mb-10 group cursor-default">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Box size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-br from-white via-white to-slate-400 bg-clip-text text-transparent uppercase">
              SpatialMind
            </h1>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-10">
            Augmented Reality Geometry · <span className="text-emerald-500">v2.0 Beta</span>
          </p>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ChevronRight size={10} className="text-blue-500" /> Nhập đề bài
              </label>
              <span className="text-[9px] text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded uppercase font-bold">NLP Processor</span>
            </div>
            <textarea
              rows={5}
              className="w-full px-5 py-4 bg-slate-950/50 text-slate-100 text-sm rounded-2xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-700 resize-none shadow-inner leading-relaxed"
              placeholder="VD: Cho hình chóp S.ABCD, đáy là hình vuông cạnh 4cm. SA vuông góc với đáy, SA = 3cm..."
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleGenerate(); }}
            />
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] text-slate-600">Phân tích bởi <span className="text-slate-500 font-bold italic">Gemini Flash</span></span>
              <span className="text-[10px] text-slate-500/50 font-medium">Ctrl + Enter</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={loading}
              className={`py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all shadow-xl flex items-center justify-center gap-3 overflow-hidden group relative
                ${loading 
                  ? 'bg-blue-600/40 cursor-not-allowed border border-blue-400/20' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40 border border-blue-400/40 hover:border-blue-300'}`}
            >
              {loading ? (
                <>
                  <RotateCcw className="animate-spin" size={16} />
                  Đang phân tích cấu trúc...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="group-hover:animate-pulse" />
                  Tạo mô hình 3D
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={hintData ? { scale: 1.01 } : {}}
              whileTap={hintData ? { scale: 0.98 } : {}}
              onClick={() => setIsHintOpen(true)}
              disabled={!hintData}
              className={`py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3
                ${hintData 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 shadow-emerald-900/10' 
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-600 cursor-not-allowed opacity-50'}`}
            >
              <Lightbulb size={16} />
              Hướng dẫn (Hint)
            </motion.button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[11px] font-bold flex items-start gap-3"
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {geometryData && !error && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ChevronRight size={10} className="text-emerald-500" /> Các bước giải
                </label>
                <span className="text-[9px] text-slate-500 bg-slate-800 font-bold px-2 py-0.5 rounded">
                  {Math.min(activeStep + 1, geometryData.steps?.length || 0)} / {geometryData.steps?.length || 0}
                </span>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {geometryData.steps?.map((step, idx) => (
                  <motion.div 
                    key={idx}
                    onClick={() => setActiveStep(idx + 1)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      activeStep >= idx + 1 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-slate-800/20 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                        activeStep >= idx + 1 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[11px] font-bold ${activeStep >= idx + 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        Bước {idx + 1}
                      </span>
                    </div>
                    <p className={`text-[12px] leading-relaxed ${activeStep >= idx + 1 ? 'text-slate-200' : 'text-slate-500'}`}>
                      {step.explanation}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveStep(0)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  Gốc
                </button>
                <button 
                  onClick={() => setActiveStep(geometryData.steps?.length || 0)}
                  className="flex-1 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400"
                >
                  Kết quả
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-8 border-t border-slate-800/50 space-y-4">
          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Mô phỏng 3D</h3>
          <div className="space-y-2.5">
            {[
              ['Left Click', 'Xoay vật thể'],
              ['Right Click', 'Dịch chuyển tâm'],
              ['Scroll', 'Phóng to thu nhỏ'],
            ].map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-bold text-slate-400">{key}</span>
                <span className="opacity-60 italic">{value}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={handleResetCamera}
            className="w-full mt-4 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <RotateCcw size={12} /> Camera Reset
          </button>
        </div>
      </motion.div>

      {/* 🧊 3D Canvas Box */}
      <div className="flex-1 relative overflow-hidden bg-[#020617]">
        <div className="absolute top-8 right-8 z-40 flex flex-col gap-2">
          <button className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all hover:bg-white/10">
            <Maximize size={20} />
          </button>
        </div>

        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* 🎨 Canvas with internal Suspense */}
        <Canvas dpr={[1, 2]} shadows gl={{ antialias: true }}>
          <Suspense fallback={<SceneLoader />}>
            <PerspectiveCamera makeDefault fov={45} position={[8, 6, 12]} />
            <color attach="background" args={['#020617']} />
            
            <ambientLight intensity={1.0} />
            <spotLight position={[10, 20, 10]} intensity={1.5} angle={0.3} penumbra={1} castShadow />
            <pointLight position={[-10, 10, -10]} intensity={1.5} color="#3b82f6" />
            <pointLight position={[5, -5, 5]} intensity={1.0} color="#10b981" />
            
            <Stars radius={150} depth={50} count={6000} factor={4} saturation={0.5} fade speed={1} />

            <group position={[0, -1, 0]}>
              {geometryData ? (
                <GeometryViewer data={geometryData} currentStep={activeStep} />
              ) : (
                <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                  <mesh rotation={[0.5, 0.5, 0]}>
                    <boxGeometry args={[3, 3, 3]} />
                    <meshStandardMaterial 
                      color="#1e293b" 
                      wireframe 
                      transparent 
                      opacity={0.1}
                      emissive="#1e3a8a" 
                    />
                  </mesh>
                </Float>
              )}
              
              <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.2} far={10} color="#000000" />
            </group>

            <OrbitControls 
              ref={controlsRef}
              makeDefault 
              enableDamping 
              dampingFactor={0.06}
              minDistance={3}
              maxDistance={30}
              autoRotate={!geometryData}
              autoRotateSpeed={0.5}
            />
            
            <gridHelper args={[20, 20, '#1e293b', '#0f172a']} position={[0, -2, 0]} opacity={0.3} transparent />
            <axesHelper args={[4]} />
          </Suspense>
        </Canvas>

        {!geometryData && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <motion.div 
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] text-center opacity-40 px-10 py-5 border border-slate-800 rounded-full backdrop-blur-sm"
            >
              Waiting for Input · Enter Problem Description
            </motion.div>
          </div>
        )}
      </div>

      {/* 📑 Hint Panel Side-over */}
      <HintPanel
        hint={hintData}
        isOpen={isHintOpen}
        onClose={() => setIsHintOpen(false)}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
        
        .markdown-content p {
          margin-bottom: 1.25rem;
          line-height: 1.7;
        }
        .markdown-content .katex {
          font-size: 1.1em;
        }
        .markdown-content .katex-display {
          margin: 1.5rem 0;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 0.5rem 0;
        }
      `}} />
    </div>
  );
}
