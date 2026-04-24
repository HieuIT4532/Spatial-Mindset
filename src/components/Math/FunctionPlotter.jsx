import React, { useState, useMemo } from 'react';
import { Mafs, Coordinates, Plot, Theme } from 'mafs';
import 'mafs/core.css';
import 'mafs/font.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Eye, EyeOff, Sparkles, Info, ChevronDown, ChevronUp
} from 'lucide-react';

// =====================
// Preset Gallery
// =====================
const PRESETS = [
  { label: 'Trái tim', icon: '❤️', formulas: ['(x^2 + y^2 - 1)^3 - x^2 * y^3 = 0'] },
  { label: 'Sóng lượng tử', icon: '🌊', formulas: ['sin(x) * exp(-0.1 * abs(x))', '-sin(x) * exp(-0.1 * abs(x))', 'exp(-0.1 * abs(x))', '-exp(-0.1 * abs(x))'] },
  { label: 'Parabol', icon: '📐', formulas: ['x^2'] },
  { label: 'Sin & Cos', icon: '〰️', formulas: ['sin(x)', 'cos(x)'] },
  { label: 'Hàm bậc 3', icon: '📊', formulas: ['x^3 - 3*x'] },
  { label: 'Tan(x)', icon: '📈', formulas: ['tan(x)'] },
  { label: 'Exp & Log', icon: '🔢', formulas: ['exp(x/3)', 'log(x)'] },
  { label: '1/x', icon: '♾️', formulas: ['1/x'] },
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
    return new Function('x', `try { var v = ${js}; return (isFinite(v) ? v : NaN); } catch(e) { return NaN; }`);
  } catch (err) {
    return function() { return NaN; };
  }
}

function numericalDerivative(fn, xVal, h) {
  if (!h) h = 1e-6;
  return (fn(xVal + h) - fn(xVal - h)) / (2 * h);
}

// =====================
// Main Component - uses ONLY Plot.OfX from Mafs (safe)
// =====================
export default function FunctionPlotter({
  expression,
  domain,
  color
}) {
  if (!expression) expression = 'sin(x)';
  if (!domain) domain = [-10, 10];
  if (!color) color = '#22d3ee';

  var initExprs = [{ id: '1', formula: expression, color: EXPR_COLORS[0], visible: true }];

  var _exprState = useState(initExprs);
  var expressions = _exprState[0];
  var setExpressions = _exprState[1];

  var _x0State = useState(0);
  var x0Val = _x0State[0];
  var setX0Val = _x0State[1];

  var _presetsState = useState(false);
  var showPresets = _presetsState[0];
  var setShowPresets = _presetsState[1];

  var _guideState = useState(true);
  var showGuide = _guideState[0];
  var setShowGuide = _guideState[1];

  var addExpression = function() {
    var id = Math.random().toString(36).substr(2, 9);
    var ci = expressions.length % EXPR_COLORS.length;
    setExpressions(function(prev) {
      return prev.concat([{ id: id, formula: '', color: EXPR_COLORS[ci], visible: true }]);
    });
  };

  var removeExpression = function(id) {
    setExpressions(function(prev) { return prev.filter(function(e) { return e.id !== id; }); });
  };

  var updateExpression = function(id, updates) {
    setExpressions(function(prev) {
      return prev.map(function(e) { return e.id === id ? Object.assign({}, e, updates) : e; });
    });
  };

  var loadPreset = function(preset) {
    var newExprs = preset.formulas.map(function(f, i) {
      return {
        id: Math.random().toString(36).substr(2, 9),
        formula: f,
        color: EXPR_COLORS[i % EXPR_COLORS.length],
        visible: true,
      };
    });
    setExpressions(newExprs);
    setShowPresets(false);
  };

  // Build functions - only explicit (Plot.OfX supported)
  var fns = useMemo(function() {
    return expressions.map(function(e) {
      if (!e.formula || !e.formula.trim()) return Object.assign({}, e, { fn: null, implicit: false });
      var impl = isImplicit(e.formula);
      if (impl) {
        // Skip implicit equations for now - they crash Line.Segment
        return Object.assign({}, e, { fn: null, implicit: true });
      }
      return Object.assign({}, e, { fn: buildExplicitFn(e.formula), implicit: false });
    });
  }, [expressions]);

  // First explicit fn for tangent
  var firstExplicit = fns.find(function(f) { return f.fn && !f.implicit && f.visible; });

  // Tangent line as explicit function
  var tangentFn = useMemo(function() {
    if (!firstExplicit || !firstExplicit.fn) return null;
    var fn = firstExplicit.fn;
    var y0 = fn(x0Val);
    var slope = numericalDerivative(fn, x0Val);
    if (!isFinite(y0) || !isFinite(slope)) return null;
    return function(x) { return y0 + slope * (x - x0Val); };
  }, [firstExplicit, x0Val]);

  var tangentSlope = firstExplicit && firstExplicit.fn ? numericalDerivative(firstExplicit.fn, x0Val) : null;

  return (
    <div className="w-full h-full flex bg-[#0d1117] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      {/* LEFT SIDEBAR */}
      <div className="w-[320px] flex flex-col border-r border-white/10 bg-[#0d1117]/80 backdrop-blur-xl shrink-0">
        {/* Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Sparkles size={18} />
            <h2 className="font-black text-sm uppercase tracking-widest">Biểu thức</h2>
          </div>
          <p className="text-[11px] text-slate-500">Nhập các hàm số để vẽ đồ thị</p>
        </div>

        {/* Expression List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {expressions.map(function(expr) {
            return (
              <div
                key={expr.id}
                className="rounded-xl p-3 transition-all"
                style={{
                  background: expr.visible ? 'rgba(88,166,255,0.03)' : 'rgba(0,0,0,0.2)',
                  border: '1px solid ' + (expr.visible ? 'rgba(88,166,255,0.15)' : 'rgba(255,255,255,0.05)'),
                }}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={function() { updateExpression(expr.id, { visible: !expr.visible }); }}
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: expr.visible ? expr.color : 'transparent',
                      border: '2px solid ' + expr.color,
                    }}
                  >
                    {expr.visible ? <Eye size={10} color="#000" /> : <EyeOff size={10} style={{ color: expr.color }} />}
                  </button>
                  <input
                    type="text"
                    value={expr.formula}
                    onChange={function(e) { updateExpression(expr.id, { formula: e.target.value }); }}
                    placeholder="sin(x), x^2, ..."
                    className="flex-1 bg-transparent border-none text-white text-sm font-mono outline-none placeholder:text-slate-600"
                  />
                  <button
                    onClick={function() { removeExpression(expr.id); }}
                    className="p-1 rounded hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}

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
            onClick={function() { setShowPresets(!showPresets); }}
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
                  {PRESETS.map(function(p) {
                    return (
                      <button
                        key={p.label}
                        onClick={function() { loadPreset(p); }}
                        className="p-2.5 rounded-xl text-left text-xs text-slate-300 hover:text-white flex items-center gap-2 transition-all bg-white/[0.02] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20"
                      >
                        <span>{p.icon}</span> {p.label}
                      </button>
                    );
                  })}
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
            value={x0Val}
            onChange={function(e) { setX0Val(parseFloat(e.target.value)); }}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-xs mt-1 font-mono">
            <span className="text-cyan-400">x₀ = {x0Val.toFixed(1)}</span>
            {tangentSlope != null && isFinite(tangentSlope) && (
              <span className="text-yellow-400">y' ≈ {tangentSlope.toFixed(3)}</span>
            )}
          </div>
        </div>
      </div>

      {/* GRAPH AREA */}
      <div className="flex-1 relative">
        <Mafs pan={true} zoom={true} viewBox={{ x: domain, y: domain }}>
          <Coordinates.Cartesian subdivisions={2} />

          {/* Render explicit expressions via Plot.OfX */}
          {fns.map(function(e) {
            if (!e.fn || !e.visible || e.implicit) return null;
            return (
              <Plot.OfX
                key={e.id}
                y={function(x) {
                  try {
                    var v = e.fn(x);
                    return isFinite(v) ? v : NaN;
                  } catch (err) {
                    return NaN;
                  }
                }}
                color={e.color}
                weight={2.5}
              />
            );
          })}

          {/* Tangent line as Plot.OfX */}
          {tangentFn && (
            <Plot.OfX
              y={tangentFn}
              color="#fbbf24"
              weight={1.5}
              style="dashed"
            />
          )}
        </Mafs>

        {/* Syntax Guide Overlay */}
        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 right-4 z-10 max-w-[280px] rounded-xl p-4 text-xs pointer-events-auto"
              style={{
                background: 'rgba(13,17,23,0.75)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(34,211,238,0.15)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Info size={14} /> Hướng dẫn cú pháp
                </span>
                <button onClick={function() { setShowGuide(false); }} className="text-slate-500 hover:text-white"><X size={12} /></button>
              </div>
              <ul className="text-slate-400 space-y-1 list-disc pl-4">
                <li><b className="text-white">Hàm số:</b> <code className="text-cyan-300">x^2</code>, <code className="text-cyan-300">sin(x)</code>, <code className="text-cyan-300">sqrt(x)</code></li>
                <li><b className="text-white">Toán tử:</b> <code className="text-cyan-300">*</code> <code className="text-cyan-300">/</code> <code className="text-cyan-300">^</code></li>
                <li><i className="text-slate-500">Tiếp tuyến tự động hiện khi kéo slider</i></li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom hint */}
        <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-500"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          🖱 Kéo: Di chuyển · 🔍 Cuộn: Zoom
        </div>
      </div>
    </div>
  );
}
