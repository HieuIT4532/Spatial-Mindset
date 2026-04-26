import React from 'react';
import { Box, LayoutDashboard, Zap, Sun, Palette } from 'lucide-react';
import { useSettingsStore } from '../../../stores/useSettingsStore';

export default function WorkspaceTab() {
  const { 
    showGrid, setShowGrid,
    showAxes, setShowAxes,
    antiAliasing, setAntiAliasing,
    shadows, setShadows,
    canvasBackgroundColor, setCanvasBackgroundColor
  } = useSettingsStore();

  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${checked ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-xl font-bold mb-1">Không gian làm việc (Canvas)</h3>
        <p className="text-sm text-slate-500">Tùy chỉnh không gian 3D để có trải nghiệm tốt nhất.</p>
      </div>

      <div className="space-y-8">
        
        {/* Hiển thị */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-6">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <LayoutDashboard size={16} className="text-cyan-500" /> Hiển thị (Display)
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Lưới tọa độ (Grid)</p>
              <p className="text-xs text-slate-500">Hiển thị lưới nền vuông giúp dễ quan sát khoảng cách.</p>
            </div>
            <ToggleSwitch checked={showGrid} onChange={setShowGrid} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Trục tọa độ X-Y-Z (Axes)</p>
              <p className="text-xs text-slate-500">Hiển thị các đường màu Đỏ (X), Xanh lá (Y), Xanh dương (Z).</p>
            </div>
            <ToggleSwitch checked={showAxes} onChange={setShowAxes} />
          </div>
        </div>

        {/* Hiệu năng */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-6">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Zap size={16} className="text-yellow-500" /> Hiệu năng (Performance)
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Khử răng cưa (Anti-aliasing)</p>
              <p className="text-xs text-slate-500">Làm mịn các đường kẻ thẳng. Tắt đi nếu máy cấu hình yếu.</p>
            </div>
            <ToggleSwitch checked={antiAliasing} onChange={setAntiAliasing} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Đổ bóng (Shadows)</p>
              <p className="text-xs text-slate-500">Hiệu ứng bóng đổ chân thực. Có thể gây giật lag trên máy cũ.</p>
            </div>
            <ToggleSwitch checked={shadows} onChange={setShadows} />
          </div>
        </div>

        {/* Môi trường */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-6">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Palette size={16} className="text-emerald-500" /> Môi trường (Environment)
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Màu nền Không gian 3D</p>
              <p className="text-xs text-slate-500">Thay đổi màu phông nền của Canvas theo sở thích.</p>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={canvasBackgroundColor}
                onChange={(e) => setCanvasBackgroundColor(e.target.value)}
                className="w-10 h-10 p-0 border-0 rounded overflow-hidden cursor-pointer bg-transparent"
              />
              <span className="text-sm font-mono uppercase bg-slate-200 dark:bg-black/30 px-2 py-1 rounded">{canvasBackgroundColor}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
