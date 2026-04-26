import React, { useEffect, useRef } from 'react';
import functionPlot from 'function-plot';

const Graph2DViewer = ({ functions }) => {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current || !functions || functions.length === 0) return;

    const renderPlot = () => {
      try {
        rootRef.current.innerHTML = '';
        
        const plotData = functions.map(func => {
          // Convert 'Math.sin(x)' back to 'sin(x)', and '**' to '^'
          const cleanExpr = func.expression
            .replace(/Math\./g, '')
            .replace(/\*\*/g, '^');
            
          return {
            fn: cleanExpr,
            color: func.color || '#22d3ee'
          };
        });

        functionPlot({
          target: rootRef.current,
          width: rootRef.current.clientWidth || 600,
          height: rootRef.current.clientHeight || 400,
          grid: true,
          xAxis: { domain: [-10, 10] },
          yAxis: { domain: [-10, 10] },
          data: plotData
        });
      } catch (err) {
        console.warn("Error rendering function-plot:", err);
      }
    };

    renderPlot();
    window.addEventListener('resize', renderPlot);
    return () => window.removeEventListener('resize', renderPlot);
  }, [functions]);

  if (!functions || functions.length === 0) return null;

  return (
    <div className="w-full h-full bg-slate-50/5 rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
      <div ref={rootRef} className="w-full h-full min-h-[400px] flex items-center justify-center [&>svg]:!text-white" />
    </div>
  );
};

export default Graph2DViewer;
