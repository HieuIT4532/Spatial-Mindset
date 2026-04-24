import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Mafs, Coordinates, Plot, Line, Point, Text } from 'mafs';
import 'mafs/core.css';
import 'mafs/font.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Eye, EyeOff, Sparkles, ChevronDown, ChevronUp, PanelLeftClose, GripVertical
} from 'lucide-react';

// =====================
// Preset Gallery
// =====================
const PRESETS = [
  { label: 'Trái tim', icon: '❤️', formulas: ['(x^2 + y^2 - 1)^3 - x^2 * y^3 = 0'] },
  { label: 'Mặt cười', icon: '😊', formulas: ['x^2 + y^2 - 25 = 0', '(x+2.5)^2 + (y-2)^2 - 0.5 = 0', '(x-2.5)^2 + (y-2)^2 - 0.5 = 0', 'y + 0.1*x^2 + 2 = 0'] },
  { label: 'Vô cực', icon: '♾️', formulas: ['(x^2 + y^2)^2 - 16*(x^2 - y^2) = 0'] },
  { label: 'Hoa 4 cánh', icon: '🌸', formulas: ['(x^2 + y^2)^3 - 16*x^2*y^2 = 0'] },
  { label: 'Cánh bướm', icon: '🦋', formulas: ['x^6 + y^6 - x^2 = 0'] },
  { label: 'Sóng lượng tử', icon: '🌊', formulas: ['sin(x) * exp(-0.1 * abs(x))', '-sin(x) * exp(-0.1 * abs(x))', 'exp(-0.1 * abs(x))', '-exp(-0.1 * abs(x))'] },
  { label: 'Quả cầu 3D', icon: '🌐', formulas: ['x^2 + y^2 - 25 = 0', 'x^2 + y^2/0.1 - 25 = 0', 'x^2 + y^2/0.3 - 25 = 0', 'x^2 + y^2/0.6 - 25 = 0', 'x^2/0.1 + y^2 - 25 = 0', 'x^2/0.3 + y^2 - 25 = 0', 'x^2/0.6 + y^2 - 25 = 0'] },
  { label: 'Hoa Mandala', icon: '🏵️', formulas: ['x^2 + y^2 - 16 = 0', '(x-4)^2 + y^2 - 16 = 0', '(x+4)^2 + y^2 - 16 = 0', 'x^2 + (y-4)^2 - 16 = 0', 'x^2 + (y+4)^2 - 16 = 0', '(x-2.83)^2 + (y-2.83)^2 - 16 = 0', '(x+2.83)^2 + (y-2.83)^2 - 16 = 0', '(x-2.83)^2 + (y+2.83)^2 - 16 = 0', '(x+2.83)^2 + (y+2.83)^2 - 16 = 0'] },
];

const EXPR_COLORS = ['#22d3ee', '#f97316', '#a78bfa', '#34d399', '#f43f5e', '#fbbf24', '#60a5fa', '#fb7185'];

// =====================
// Math Parser
// =====================
function parseExpr(expr) {
  return expr
    .replace(/\*\*/g, '___POW___')
    .replace(/\babs\b/g, 'Math.abs')
    .replace(/\bsin\b/g, 'Math.sin')
    .replace(/\bcos\b/g, 'Math.cos')
    .replace(/\btan\b/g, 'Math.tan')
    .replace(/\bexp\b/g, 'Math.exp')
    .replace(/\blog\b/g, 'Math.log')
    .replace(/\bsqrt\b/g, 'Math.sqrt')
    .replace(/\bpi\b/g, 'Math.PI')
    .replace(/\^/g, '___POW___')
    .replace(/___POW___/g, '**');
}

function isImplicit(formula) { return formula.includes('='); }

function buildExplicitFn(formula) {
  try {
    const js = parseExpr(formula);
    // eslint-disable-next-line no-new-func
    return new Function('x', `try { const v = ${js}; return (isFinite(v) ? v : NaN); } catch(e) { return NaN; }`);
  } catch { return () => NaN; }
}

function buildImplicitFn(formula) {
  try {
    const [lhs, rhs] = formula.split('=').map(s => s.trim());
    const expr = `(${parseExpr(lhs)}) - (${parseExpr(rhs || '0')})`;
    // eslint-disable-next-line no-new-func
    return new Function('x', 'y', `try { const v = ${expr}; return (isFinite(v) ? v : NaN); } catch(e) { return NaN; }`);
  } catch { return () => NaN; }
}

// =====================
// Marching Squares — large domain for "infinite" feel
// =====================
function marchingSquares(fn, xRange, yRange, resolution = 220) {
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const dx = (xMax - xMin) / resolution;
  const dy = (yMax - yMin) / resolution;
  const segments = [];

  const grid = [];
  for (let i = 0; i <= resolution; i++) {
    grid[i] = [];
    for (let j = 0; j <= resolution; j++) {
      grid[i][j] = fn(xMin + i * dx, yMin + j * dy);
    }
  }

  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const x = xMin + i * dx;
      const y = yMin + j * dy;
      const v00 = grid[i][j], v10 = grid[i+1][j], v01 = grid[i][j+1], v11 = grid[i+1][j+1];
      if (isNaN(v00) || isNaN(v10) || isNaN(v01) || isNaN(v11)) continue;

      const idx = (v00 > 0 ? 8 : 0) | (v10 > 0 ? 4 : 0) | (v11 > 0 ? 2 : 0) | (v01 > 0 ? 1 : 0);
      if (idx === 0 || idx === 15) continue;

      const lerp = (a, b, va, vb) => a + (b - a) * (-va) / (vb - va);
      const top    = [lerp(x, x+dx, v00, v10), y];
      const bottom = [lerp(x, x+dx, v01, v11), y+dy];
      const left   = [x, lerp(y, y+dy, v00, v01)];
      const right  = [x+dx, lerp(y, y+dy, v10, v11)];

      const add = (a, b) => segments.push([a, b]);
      switch (idx) {
        case 1: case 14: add(left, bottom); break;
        case 2: case 13: add(bottom, right); break;
        case 3: case 12: add(left, right); break;
        case 4: case 11: add(top, right); break;
        case 5: add(left, top); add(bottom, right); break;
        case 6: case 9: add(top, bottom); break;
        case 7: case 8: add(left, top); break;
        case 10: add(top, right); add(left, bottom); break;
      }
    }
  }
  return segments;
}

// Numerical Derivative
function numericalDerivative(fn, x, h = 1e-6) {
  return (fn(x + h) - fn(x - h)) / (2 * h);
}

// =====================
// Implicit Curve Renderer
// =====================
function ImplicitCurve({ fn, color, xRange, yRange }) {
  const segments = useMemo(
    () => marchingSquares(fn, xRange, yRange, 220),
    [fn, xRange, yRange]
  );
  return (
    <>
      {segments.map(([a, b], i) => (
        <Line.Segment key={i} point1={a} point2={b} color={color} weight={2} />
      ))}
    </>
  );
}

// =====================
// Tangent Line
// =====================
function TangentLineVis({ fn, x0, color }) {
  const y0 = fn(x0);
  const slope = numericalDerivative(fn, x0);
  if (!isFinite(y0) || !isFinite(slope)) return null;
  const len = 4;
  return (
    <>
      <Line.Segment point1={[x0-len, y0-slope*len]} point2={[x0+len, y0+slope*len]} color="#fbbf24" weight={2} opacity={0.7} />
      <Point x={x0} y={y0} color={color} />
      <Text x={x0+0.6} y={y0+0.9} attach="e" size={12} color="#fbbf24">
        {`y'(${x0.toFixed(1)}) ≈ ${slope.toFixed(3)}`}
      </Text>
    </>
  );
}

// =====================
// Draggable Floating Panel
// =====================
function DraggablePanel({ children, defaultPos = { x: 16, y: 80 } }) {
  const panelRef = useRef(null);
  const [pos, setPos] = useState(defaultPos);
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        zIndex: 50,
        cursor: dragging ? 'grabbing' : 'default',
        userSelect: 'none',
      }}
    >
      {/* Drag Handle */}
      <div
        onMouseDown={onMouseDown}
        style={{ cursor: 'grab', padding: '6px 0', display: 'flex', justifyContent: 'center' }}
      >
        <div className="w-8 h-1 rounded-full bg-white/20" />
      </div>
      {children}
    </div>
  );
}

// =====================
// LARGE implicit domain — makes the graph feel "infinite"
// =====================
const IMPLICIT_DOMAIN = [-50, 50];

// =====================
// Main Component
// =====================
export default function FunctionPlotter({
  expression = 'sin(x)',
  domain = [-10, 10],
}) {
  const [expressions, setExpressions] = useState([
    { id: '1', formula: expression, color: EXPR_COLORS[0], visible: true },
  ]);
  const [x0, setX0] = useState(0);
  const [showPresets, setShowPresets] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  const addExpression = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const ci = expressions.length % EXPR_COLORS.length;
    setExpressions(prev => [...prev, { id, formula: '', color: EXPR_COLORS[ci], visible: true }]);
  };

  const removeExpression = (id) => setExpressions(prev => prev.filter(e => e.id !== id));
  const updateExpression = (id, updates) => setExpressions(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));

  const loadPreset = (preset) => {
    setExpressions(preset.formulas.map((f, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      formula: f,
      color: EXPR_COLORS[i % EXPR_COLORS.length],
      visible: true,
    })));
    setShowPresets(false);
  };

  // Build functions
  const fns = useMemo(() => {
    return expressions.map(e => {
      if (!e.formula.trim()) return { ...e, fn: null, implicit: false };
      const impl = isImplicit(e.formula);
      return {
        ...e,
        fn: impl ? buildImplicitFn(e.formula) : buildExplicitFn(e.formula),
        implicit: impl,
      };
    });
  }, [expressions]);

  const firstExplicit = fns.find(f => f.fn && !f.implicit && f.visible);

  return (
    <div className="w-full h-full relative bg-[#0d1117] overflow-hidden">
      {/* ─── FULL-SCREEN GRAPH (no viewBox restriction = infinite panning) ─── */}
      <Mafs pan={true} zoom={true}>
        <Coordinates.Cartesian subdivisions={2} />

        {/* Render all expressions */}
        {fns.map(e => {
          if (!e.fn || !e.visible) return null;
          if (e.implicit) {
            return <ImplicitCurve key={e.id} fn={e.fn} color={e.color} xRange={IMPLICIT_DOMAIN} yRange={IMPLICIT_DOMAIN} />;
          }
          return (
            <Plot.OfX
              key={e.id}
              y={(x) => { const v = e.fn(x); return isFinite(v) ? v : NaN; }}
              color={e.color}
              weight={2.5}
            />
          );
        })}

        {/* Tangent line */}
        {firstExplicit && <TangentLineVis fn={firstExplicit.fn} x0={x0} color={firstExplicit.color} />}
      </Mafs>

      {/* ─── FLOATING PANEL (collapsed = single icon) ─── */}
      <AnimatePresence>
        {!panelOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setPanelOpen(true)}
            className="absolute top-20 left-4 z-50 w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:scale-110"
            style={{
              background: 'rgba(13,17,23,0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(34,211,238,0.3)',
              boxShadow: '0 0 20px rgba(34,211,238,0.15)',
            }}
            title="Mở bảng biểu thức"
          >
            <Sparkles size={20} className="text-cyan-400" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {panelOpen && (
          <DraggablePanel defaultPos={{ x: 16, y: 70 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-[320px] flex flex-col rounded-2xl overflow-hidden shadow-2xl max-h-[75vh]"
              style={{
                background: 'rgba(13,17,23,0.92)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(34,211,238,0.15)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(34,211,238,0.08)',
              }}
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Sparkles size={16} />
                  <span className="font-black text-xs uppercase tracking-widest">Biểu thức</span>
                </div>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-cyan-400 transition-all"
                  title="Thu nhỏ"
                >
                  <PanelLeftClose size={14} />
                </button>
              </div>

              {/* Expression List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar" style={{ maxHeight: '280px' }}>
                {expressions.map((expr) => (
                  <div
                    key={expr.id}
                    className="rounded-xl p-2.5 transition-all"
                    style={{
                      background: expr.visible ? 'rgba(88,166,255,0.04)' : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${expr.visible ? 'rgba(88,166,255,0.12)' : 'rgba(255,255,255,0.04)'}`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateExpression(expr.id, { visible: !expr.visible })}
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: expr.visible ? expr.color : 'transparent',
                          border: `2px solid ${expr.color}`,
                        }}
                      >
                        {expr.visible ? <Eye size={8} color="#000" /> : <EyeOff size={8} style={{ color: expr.color }} />}
                      </button>
                      <input
                        type="text"
                        value={expr.formula}
                        onChange={e => updateExpression(expr.id, { formula: e.target.value })}
                        placeholder="sin(x) hoặc x^2+y^2=25"
                        className="flex-1 bg-transparent border-none text-white text-xs font-mono outline-none placeholder:text-slate-600"
                      />
                      <button
                        onClick={() => removeExpression(expr.id)}
                        className="p-0.5 rounded text-red-400/40 hover:text-red-400 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addExpression}
                  className="w-full py-2 rounded-xl border border-dashed border-white/10 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/30 hover:bg-cyan-500/5 transition-all flex items-center justify-center gap-1.5 text-[10px] font-bold"
                >
                  <Plus size={12} /> Thêm biểu thức mới
                </button>
              </div>

              {/* Presets */}
              <div className="border-t border-white/5">
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-slate-400 hover:text-white transition-all text-[10px] font-bold"
                >
                  ✨ Khám phá ví dụ
                  {showPresets ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                <AnimatePresence>
                  {showPresets && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-1.5 px-3 pb-3">
                        {PRESETS.map(p => (
                          <button
                            key={p.label}
                            onClick={() => loadPreset(p)}
                            className="p-2 rounded-lg text-left text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5 transition-all bg-white/[0.02] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20"
                          >
                            <span className="text-sm">{p.icon}</span> {p.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tangent Explorer */}
              <div className="p-3 border-t border-white/5 bg-black/20">
                <div className="text-[10px] text-slate-500 mb-1.5 font-semibold">Tiếp tuyến x₀</div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={x0}
                  onChange={e => setX0(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                  style={{ height: '4px' }}
                />
                <div className="text-right text-[10px] text-cyan-400 mt-0.5 font-mono">x₀ = {x0.toFixed(1)}</div>
              </div>
            </motion.div>
          </DraggablePanel>
        )}
      </AnimatePresence>
    </div>
  );
}
