import React, { useState, useMemo, useRef } from 'react';
import { Mafs, Coordinates, Plot, Line, Point, Text } from 'mafs';
import 'mafs/core.css';
import 'mafs/font.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Eye, EyeOff, Sparkles, Info, ChevronDown, ChevronUp, Layers, Maximize2, Minimize2
} from 'lucide-react';

// =====================
// Preset Gallery
// =====================
const PRESETS = [
  {
    label: 'Trái tim', icon: '❤️',
    formulas: ['(x^2 + y^2 - 1)^3 - x^2 * y^3 = 0'],
  },
  {
    label: 'Mặt cười', icon: '😊',
    formulas: ['x^2 + y^2 - 25 = 0', '(x+2.5)^2 + (y-2)^2 - 0.5 = 0', '(x-2.5)^2 + (y-2)^2 - 0.5 = 0', 'y + 0.1*x^2 + 2 = 0'],
  },
  {
    label: 'Vô cực', icon: '♾️',
    formulas: ['(x^2 + y^2)^2 - 16*(x^2 - y^2) = 0'],
  },
  {
    label: 'Hoa 4 cánh', icon: '🌸',
    formulas: ['(x^2 + y^2)^3 - 16*x^2*y^2 = 0'],
  },
  {
    label: 'Cánh bướm', icon: '🦋',
    formulas: ['x^6 + y^6 - x^2 = 0'],
  },
  {
    label: 'Sóng lượng tử', icon: '🌊',
    formulas: ['sin(x) * exp(-0.1 * abs(x))', '-sin(x) * exp(-0.1 * abs(x))', 'exp(-0.1 * abs(x))', '-exp(-0.1 * abs(x))'],
  },
  {
    label: 'Quả cầu 3D', icon: '🌐',
    formulas: ['x^2 + y^2 - 25 = 0', 'x^2 + y^2/0.1 - 25 = 0', 'x^2 + y^2/0.3 - 25 = 0', 'x^2 + y^2/0.6 - 25 = 0', 'x^2/0.1 + y^2 - 25 = 0', 'x^2/0.3 + y^2 - 25 = 0', 'x^2/0.6 + y^2 - 25 = 0'],
  },
  {
    label: 'Hoa Mandala', icon: '🏵️',
    formulas: ['x^2 + y^2 - 16 = 0', '(x-4)^2 + y^2 - 16 = 0', '(x+4)^2 + y^2 - 16 = 0', 'x^2 + (y-4)^2 - 16 = 0', 'x^2 + (y+4)^2 - 16 = 0', '(x-2.83)^2 + (y-2.83)^2 - 16 = 0', '(x+2.83)^2 + (y-2.83)^2 - 16 = 0', '(x-2.83)^2 + (y+2.83)^2 - 16 = 0', '(x+2.83)^2 + (y+2.83)^2 - 16 = 0'],
  },
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

function isImplicit(formula) {
  return formula.includes('=');
}

function buildExplicitFn(formula) {
  try {
    const js = parseExpr(formula);
    // eslint-disable-next-line no-new-func
    return new Function('x', `try { const v = ${js}; return (isFinite(v) ? v : NaN); } catch(e) { return NaN; }`);
  } catch {
    return () => NaN;
  }
}

function buildImplicitFn(formula) {
  try {
    const [lhs, rhs] = formula.split('=').map(s => s.trim());
    const expr = `(${parseExpr(lhs)}) - (${parseExpr(rhs || '0')})`;
    // eslint-disable-next-line no-new-func
    return new Function('x', 'y', `try { const v = ${expr}; return (isFinite(v) ? v : NaN); } catch(e) { return NaN; }`);
  } catch {
    return () => NaN;
  }
}

// =====================
// Marching Squares for Implicit Curves
// =====================
function marchingSquares(fn, xRange, yRange, resolution = 180) {
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

// =====================
// Numerical Derivative
// =====================
function numericalDerivative(fn, x, h = 1e-6) {
  return (fn(x + h) - fn(x - h)) / (2 * h);
}

// =====================
// Implicit Curve via Line.Segment
// =====================
function ImplicitCurve({ fn, color, xRange = [-100, 100], yRange = [-100, 100] }) {
  const segments = useMemo(
    () => marchingSquares(fn, xRange, yRange, 300),
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
// Tangent Line Component
// =====================
function TangentLineVis({ fn, x0, color }) {
  const y0 = fn(x0);
  const slope = numericalDerivative(fn, x0);
  if (!isFinite(y0) || !isFinite(slope)) return null;

  const len = 4;
  const p1 = [x0 - len, y0 - slope * len];
  const p2 = [x0 + len, y0 + slope * len];

  return (
    <>
      <Line.Segment point1={p1} point2={p2} color="#fbbf24" weight={2} opacity={0.7} />
      <Point x={x0} y={y0} color={color} />
      <Text x={x0 + 0.6} y={y0 + 0.9} attach="e" size={12} color="#fbbf24">
        {`y'(${x0.toFixed(1)}) ≈ ${slope.toFixed(3)}`}
      </Text>
    </>
  );
}

// =====================
// Main Component
// =====================
export default function FunctionPlotter({
  expression = 'sin(x)',
  domain = [-10, 10],
  color = '#22d3ee'
}) {
  const [expressions, setExpressions] = useState([
    { id: '1', formula: expression, color: EXPR_COLORS[0], visible: true },
  ]);
  const [showPresets, setShowPresets] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

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
    <div className="w-full h-full flex bg-[#0d1117] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      {/* ─── FLOATING DRAGGABLE SIDEBAR ─── */}
      <motion.div
        drag
        dragMomentum={false}
        className={`absolute top-4 left-4 z-[100] flex flex-col bg-[#0d1117]/80 backdrop-blur-xl border border-cyan-500/30 shadow-2xl transition-all overflow-hidden ${
          isMinimized ? 'w-14 h-14 rounded-full cursor-grab active:cursor-grabbing' : 'w-[340px] rounded-2xl cursor-default'
        }`}
      >
        {isMinimized ? (
          <div 
            className="w-full h-full flex items-center justify-center text-cyan-400 hover:text-white transition-colors"
            onDoubleClick={() => setIsMinimized(false)}
          >
            <Layers size={24} />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-5 border-b border-white/5 cursor-grab active:cursor-grabbing flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                  <Sparkles size={18} />
                  <h2 className="font-black text-sm uppercase tracking-widest">Biểu thức</h2>
                </div>
                <p className="text-[11px] text-slate-500">Nhập các hàm số để vẽ đồ thị</p>
              </div>
              <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                <Minimize2 size={16} />
              </button>
            </div>

            {/* Expression List */}
            <div className="max-h-[40vh] overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {expressions.map((expr) => (
                <div
                  key={expr.id}
                  className="rounded-xl p-3 transition-all"
                  style={{
                    background: expr.visible ? 'rgba(88,166,255,0.03)' : 'rgba(0,0,0,0.2)',
                    border: `1px solid ${expr.visible ? 'rgba(88,166,255,0.15)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateExpression(expr.id, { visible: !expr.visible })}
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
                      style={{
                        background: expr.visible ? expr.color : 'transparent',
                        border: `2px solid ${expr.color}`,
                      }}
                    >
                      {expr.visible ? <Eye size={10} color="#000" /> : <EyeOff size={10} style={{ color: expr.color }} />}
                    </button>
                    <input
                      type="text"
                      value={expr.formula}
                      onChange={e => updateExpression(expr.id, { formula: e.target.value })}
                      placeholder="sin(x)  hoặc  x^2 + y^2 = 25"
                      className="flex-1 w-0 bg-transparent border-none text-white text-sm font-mono outline-none placeholder:text-slate-600"
                    />
                    <button
                      onClick={() => removeExpression(expr.id)}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={addExpression}
                className="w-full py-3 rounded-xl border border-dashed border-white/15 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/30 hover:bg-cyan-500/5 transition-all flex items-center justify-center gap-2 text-xs font-bold"
              >
                <Plus size={16} /> Thêm biểu thức mới
              </button>
            </div>

            {/* Presets */}
            <div className="border-t border-white/5 bg-black/20">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="w-full p-4 flex items-center justify-between text-slate-400 hover:text-white transition-all"
              >
                <span className="text-xs font-bold">✨ Khám phá ví dụ</span>
                {showPresets ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <AnimatePresence>
                {showPresets && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                      {PRESETS.map(p => (
                        <button
                          key={p.label}
                          onClick={() => loadPreset(p)}
                          className="p-2.5 rounded-xl text-left text-xs text-slate-300 hover:text-white flex items-center gap-2 transition-all bg-white/[0.02] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20"
                        >
                          <span>{p.icon}</span> {p.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tangent Explorer */}
            <div className="p-4 border-t border-white/5 bg-black/30">
              <div className="text-xs text-slate-500 mb-2 font-semibold">Khám phá tiếp tuyến x₀</div>
              <input
                type="range"
                min={domain[0]}
                max={domain[1]}
                step="0.1"
                value={x0}
                onChange={e => setX0(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="text-right text-xs text-cyan-400 mt-1 font-mono">x₀ = {x0.toFixed(1)}</div>
            </div>
          </>
        )}
      </motion.div>

      {/* ─── GRAPH AREA ─── */}
      <div className="flex-1 relative">
        <Mafs pan={true} zoom={true} viewBox={{ x: domain, y: domain }}>
          <Coordinates.Cartesian subdivisions={2} />

          {/* Render all expressions */}
          {fns.map(e => {
            if (!e.fn || !e.visible) return null;
            if (e.implicit) {
              return <ImplicitCurve key={e.id} fn={e.fn} color={e.color} xRange={domain} yRange={domain} />;
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

          {/* Tangent line for first explicit function */}
          {firstExplicit && <TangentLineVis fn={firstExplicit.fn} x0={x0} color={firstExplicit.color} />}
        </Mafs>

        {/* Bottom hint */}
        <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-500"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          🖱 Kéo: Di chuyển · 🔍 Cuộn: Zoom
        </div>
      </div>
    </div>
  );
}
