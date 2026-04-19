import React, { useState, useRef, Suspense, useEffect } from 'react';
import axios from 'axios';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Stars, Float, PerspectiveCamera, ContactShadows, Sky } from '@react-three/drei';
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
  Loader2,
  ChevronLeft,
  LayoutDashboard,
  Dna,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon
} from 'lucide-react';

// Components
import GeometryViewer from './components/GeometryViewer';
import FunctionPlotter from './components/Math/FunctionPlotter';
import Graph2DViewer from './components/Math/Graph2DViewer';
import SpatialVector from './components/Math/SpatialVector';
import ImageUpload from './components/ImageUpload';
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
      <meshBasicMaterial color="#22d3ee" wireframe />
    </mesh>
  );
}

// (GeometryModel has been replaced by GeometryViewer component)

// =====================
// Utility: Preprocess LaTeX from AI
// =====================
const preprocessLatex = (text) => {
  if (!text) return "";
  return text
    .replace(/\\\( /g, "$")
    .replace(/ \\\)/g, "$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\\[ /g, "$$")
    .replace(/ \\\]/g, "$$")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\\/g, "\\"); // Fix double escaping common in JSON
};

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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[30%] bg-black/40 backdrop-blur-3xl border-l border-white/5 shadow-2xl z-[101] flex flex-col aqua-glass"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Lightbulb size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-[var(--text-main)] font-black text-lg leading-none uppercase tracking-tight">Gợi ý Giải bài</h2>
                  <p className="text-cyan-500/60 text-[10px] mt-1.5 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={10} /> Phân tích bởi Gemini 3 Flash
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
                  className="prose prose-invert prose-cyan max-w-none text-slate-300 markdown-content"
                >
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-cyan-400 font-black text-2xl mt-8 mb-4 uppercase tracking-tight" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-sky-500 font-bold text-lg mt-6 mb-3 flex items-center gap-2 uppercase tracking-wide" {...props} />,
                      p: ({node, ...props}) => <p className="leading-relaxed mb-4 text-[var(--text-main)]" {...props} />,
                      strong: ({node, ...props}) => <strong className="text-[var(--text-main)] font-black" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-2 mb-4" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-4 space-y-2 mb-4" {...props} />,
                      li: ({node, ...props}) => <li className="text-[var(--text-dim)]" {...props} />,
                    }}
                  >
                    {preprocessLatex(hint)}
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

            <div className="p-8 border-t border-white/5 bg-black/10">
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex items-start gap-3">
                <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-[var(--text-dim)] leading-relaxed italic">
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeMode, setActiveMode] = useState('GEOMETRY'); // GEOMETRY, VECTOR, GRAPH
  const [graphExpression, setGraphExpression] = useState('sin(x)');
  const [algebraData, setAlgebraData] = useState(null);
  const [theme, setTheme] = useState('dark'); // dark, light
  const [showAxes, setShowAxes] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const controlsRef = useRef();

  // Đồng bộ theme vào thuộc tính của body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleGenerate = async () => {
    if (!promptInput.trim()) {
      setError('Vui lòng nhập đề bài để bắt đầu.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
      
      if (activeMode === 'GEOMETRY' || activeMode === 'VECTOR') {
        const apiUrl = baseUrl 
          ? `${baseUrl}/api/geometry/calculate` 
          : 'http://localhost:8000/api/geometry/calculate';
          
        // Thêm gợi ý cho AI nếu là chế độ Vector
        const query = activeMode === 'VECTOR' 
          ? `${promptInput} (Hãy xử lý bài toán này dưới góc độ vector không gian, vẽ các mũi tên vector)`
          : promptInput;

        const response = await axios.post(apiUrl, { 
          query,
          image: uploadedImage // Gửi kèm ảnh base64 nếu có
        });
        
        const data = response.data;
        setGeometryData(data);
        setHintData(data.hint ?? null);
        setActiveStep(0);

        // Tự động chuyển mode dựa trên type trả về từ AI
        if (data.type === '2D') {
          setActiveMode('GRAPH');
        } else {
          setActiveMode('GEOMETRY');
        }
      } else if (activeMode === 'GRAPH') {
        const apiUrl = baseUrl 
          ? `${baseUrl}/api/algebra/solve` 
          : 'http://localhost:8000/api/algebra/solve';
          
        const response = await axios.post(apiUrl, { query: promptInput });
        setAlgebraData(response.data);
        if (response.data.function_string) {
          setGraphExpression(response.data.function_string);
        }
        setHintData(null); // Hoặc bạn có thể gọi thêm Socratic Hint nếu cần
      }
      
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
    <div className="flex h-screen w-full bg-[#020617] text-slate-100 font-sans overflow-hidden select-none ocean-gradient">
      
      {/* 🚀 Top Navigation HUD */}
      <div className="fixed top-8 left-0 w-full flex justify-center z-[60] pointer-events-none">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-1 p-1.5 aqua-glass rounded-2xl pointer-events-auto shadow-2xl"
        >
          <div className="flex bg-black/10 rounded-xl p-1 mr-2 overflow-hidden border border-white/5">
            {[
              { id: 'GEOMETRY', icon: Box, label: 'Hình học' },
              { id: 'VECTOR', icon: Dna, label: 'Vector' },
              { id: 'GRAPH', icon: Layers, label: 'Đồ thị' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`relative px-5 py-2 rounded-lg transition-all flex items-center gap-2 group`}
              >
                {activeMode === mode.id && (
                  <motion.div 
                    layoutId="active-tab"
                    className="absolute inset-0 bg-cyan-500/20 border border-cyan-400/30 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <mode.icon size={14} className={activeMode === mode.id ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${activeMode === mode.id ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {mode.label}
                </span>
              </button>
            ))}
          </div>

          <div className="h-6 w-[1px] bg-white/10 mx-1" />

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl hover:bg-white/5 text-slate-500 hover:text-cyan-400 transition-all flex items-center justify-center"
            title="Chuyển chế độ Sáng/Tối"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
 
          <div className="h-6 w-[1px] bg-white/10 mx-1" />
 
          <button
            onClick={() => setShowAxes(!showAxes)}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${showAxes ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500 hover:text-cyan-400 hover:bg-white/5'}`}
            title="Bật/Tắt Trục Tọa Độ"
          >
            <LayoutDashboard size={18} />
          </button>
        </motion.div>
      </div>

      {/* 🔮 Floating Sidebar */}
      <motion.div 
        initial={false}
        animate={{ 
          width: isSidebarCollapsed ? 80 : 380,
          x: 0,
          opacity: 1
        }}
        className="fixed left-8 top-1/2 -translate-y-1/2 h-[85vh] z-50 aqua-glass rounded-[32px] overflow-hidden flex flex-col shadow-2xl border-white/5 group/sidebar transition-all duration-500 ease-in-out"
      >
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-cyan-400 transition-all z-[70]"
        >
          {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>

        <div className="p-8 flex flex-col h-full overflow-hidden">
          <div className={`mb-10 flex items-center gap-4 transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 scale-90 invisible' : 'opacity-100 scale-100 visible'}`}>
            <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Box size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-[var(--text-main)] uppercase leading-none">
                SpatialMind
              </h1>
              <p className="text-[10px] text-cyan-500/80 font-bold uppercase tracking-widest mt-1">
                v2.1 {theme === 'dark' ? 'HUD' : 'Light'} Edition
              </p>
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto pr-2 custom-scrollbar transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 translate-x-10 invisible' : 'opacity-100 translate-x-0 visible'}`}>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <LayoutDashboard size={10} className="text-cyan-500" /> Nhập nhiệm vụ
                </label>
                <textarea
                  rows={5}
                  className="w-full px-5 py-4 bg-black/10 text-[var(--text-main)] text-sm rounded-2xl border border-[var(--glass-border)] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-[var(--text-dim)] resize-none shadow-inner leading-relaxed"
                  placeholder="Nhập đề bài hình học hoặc đồ thị tại đây..."
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                />
                <ImageUpload image={uploadedImage} setImage={setUploadedImage} />
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={loading}
                  className={`py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all shadow-xl flex items-center justify-center gap-3 relative overflow-hidden
                    ${loading 
                      ? 'bg-cyan-600/40 cursor-not-allowed opacity-50' 
                      : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40 border border-cyan-400/40'}`}
                >
                  {loading ? <RotateCcw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  {loading ? 'Đang phân tích...' : 'Khởi tạo không gian'}
                </motion.button>

                <motion.button
                  whileHover={hintData ? { scale: 1.02, backgroundColor: 'rgba(34, 211, 238, 0.15)' } : {}}
                  whileTap={hintData ? { scale: 0.98 } : {}}
                  onClick={() => setIsHintOpen(true)}
                  disabled={!hintData}
                  className={`py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3
                    ${hintData 
                      ? 'bg-cyan-500/5 border border-cyan-500/20 text-cyan-400' 
                      : 'bg-slate-800/10 border border-white/5 text-slate-700 cursor-not-allowed'}`}
                >
                  <Lightbulb size={16} />
                  Gợi ý Socratic
                </motion.button>
              </div>

              {/* Steps Area */}
              <AnimatePresence>
                {activeMode === 'GEOMETRY' && geometryData && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tiến trình giải</span>
                      <span className="text-[10px] text-cyan-500 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full">
                        {activeStep}/{geometryData.steps?.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {geometryData.steps?.map((step, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setActiveStep(idx + 1)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            activeStep >= idx + 1 ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-[var(--glass-bg)] border-transparent opacity-40 grayscale hover:opacity-100'
                          }`}
                        >
                          <p className="text-[11px] font-black text-cyan-500 mb-2 uppercase tracking-tighter">Bước {idx + 1}</p>
                          <div className="text-[12px] text-[var(--text-main)] leading-relaxed opacity-90">
                             <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {preprocessLatex(step.explanation)}
                             </ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className={`absolute left-0 top-32 w-full flex flex-col items-center gap-8 transition-all duration-300 ${isSidebarCollapsed ? 'opacity-100 visible translate-x-0' : 'opacity-0 invisible -translate-x-10'}`}>
            <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
               {activeMode === 'GEOMETRY' ? <Box size={22} className="text-white" /> : 
                activeMode === 'VECTOR' ? <Dna size={22} className="text-white" /> : 
                <Layers size={22} className="text-white" />}
            </div>
            <div className="flex flex-col gap-6 items-center">
              <button onClick={handleGenerate} className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500/20 transition-all"><Sparkles size={20} /></button>
              <button onClick={() => setIsHintOpen(true)} className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500/20 transition-all"><Lightbulb size={20} /></button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🧊 Pop-up Results Box */}
      {activeMode === 'GRAPH' && algebraData && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6"
        >
          <div className="aqua-glass rounded-3xl p-8 shadow-2xl overflow-hidden relative border border-cyan-400/20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <div className="flex items-start justify-between mb-6">
              <div>
                <h4 className="text-xs font-black text-cyan-500 uppercase tracking-widest mb-1">Kết quả Giải tích</h4>
                <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-tighter">Phân tích chuyên sâu từ SymPy & LLM</p>
              </div>
              <button 
                onClick={() => setAlgebraData(null)}
                className="p-2 rounded-full bg-black/10 text-[var(--text-dim)] hover:text-cyan-400"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border border-white/5 overflow-x-auto ${theme === 'dark' ? 'bg-black/40' : 'bg-white/40'}`}>
                 <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                   {`$$${algebraData.result_latex}$$`}
                 </ReactMarkdown>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar no-scrollbar text-[var(--text-main)]">
                {algebraData.steps?.map((step, idx) => (
                  <div key={idx} className="shrink-0 w-64 p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[9px] font-black text-cyan-500 uppercase mb-2">Pha {idx + 1}</p>
                    <div className="text-[11px] text-slate-400">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {preprocessLatex(step)}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

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

        {/* 🎨 Views based on activeMode */}
        {activeMode === 'GRAPH' ? (
          <div className="absolute inset-0 z-10 p-12 flex items-center justify-center">
            {geometryData?.type === '2D' ? (
              <Graph2DViewer functions={geometryData.functions} />
            ) : (
              <FunctionPlotter expression={graphExpression} />
            )}
          </div>
        ) : (
          <Canvas dpr={[1, 2]} shadows gl={{ antialias: true }}>
            <Suspense fallback={<SceneLoader />}>
              <PerspectiveCamera makeDefault fov={45} position={[8, 6, 12]} />
              <color attach="background" args={[theme === 'dark' ? '#020617' : '#e0f2fe']} />
              
              <ambientLight intensity={theme === 'dark' ? 0.8 : 1.0} />
              <spotLight position={[10, 20, 10]} intensity={2} angle={0.3} penumbra={1} castShadow />
              <pointLight position={[-10, 10, -10]} intensity={theme === 'dark' ? 2 : 1.5} color="#22d3ee" />
              <pointLight position={[5, -5, 5]} intensity={1} color="#0ea5e9" />
              
              {theme === 'dark' ? (
                <>
                  <Stars radius={150} depth={50} count={3000} factor={4} saturation={1} fade speed={1.5} />
                  <fog attach="fog" args={['#020617', 5, 25]} />
                </>
              ) : (
                <>
                  <Sky sunPosition={[100, 20, 100]} />
                  <fog attach="fog" args={['#e0f2fe', 10, 40]} />
                </>
              )}

              <group position={[0, -1, 0]}>
                {(activeMode === 'GEOMETRY' || activeMode === 'VECTOR') && geometryData && (
                  <GeometryViewer data={geometryData} currentStep={activeStep} theme={theme} showAxes={showAxes} />
                )}
                
                {activeMode === 'GEOMETRY' && !geometryData && (
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
                autoRotate={!geometryData && activeMode === 'GEOMETRY'}
                autoRotateSpeed={0.5}
              />
              
              {/* Trục & Lưới phụ đã được ẩn theo yêu cầu */}
            </Suspense>
          </Canvas>
        )}

        {activeMode === 'GEOMETRY' && !geometryData && (
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
