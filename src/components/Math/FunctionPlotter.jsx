import React, { useEffect, useRef } from 'react';
import functionPlot from 'function-plot';

/**
 * Component FunctionPlotter hiển thị đồ thị hàm số 2D
 * @param {string} expression - Chuỗi biểu thức toán học (Vd: "sin(x)", "x**2")
 * @param {Array} domain - Phạm vi hiển thị trục tọa độ [min, max] (Mặc định: [-10, 10])
 * @param {string} color - Màu sắc của đồ thị (Mặc định: Xanh dương)
 */
export default function FunctionPlotter({ 
  expression = "sin(x)", 
  domain = [-10, 10],
  color = "#22d3ee" 
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current) return;
    
    const renderPlot = () => {
      try {
        // Clean up previous plot
        rootRef.current.innerHTML = '';
        
        // Convert python style to math.js style if needed
        const mathExpr = expression.replace(/\*\*/g, '^');

        functionPlot({
          target: rootRef.current,
          width: rootRef.current.clientWidth || 600,
          height: rootRef.current.clientHeight || 400,
          grid: true,
          xAxis: { domain: domain },
          yAxis: { domain: domain },
          data: [{
            fn: mathExpr,
            color: color
          }]
        });
      } catch (err) {
        console.warn("Lỗi vẽ đồ thị:", err);
      }
    };

    renderPlot();

    // Re-render on window resize
    window.addEventListener('resize', renderPlot);
    return () => window.removeEventListener('resize', renderPlot);
  }, [expression, domain, color]);

  return (
    <div className="w-full h-full bg-slate-50/5 rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/5 text-[10px] font-mono text-cyan-400">
        f(x) = {expression}
      </div>
      <div ref={rootRef} className="w-full h-full min-h-[400px] flex items-center justify-center [&>svg]:!text-white" />
    </div>
  );
}
