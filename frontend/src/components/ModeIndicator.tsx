'use client';

import { useAppStore } from '@/store/appStore';

const MODE_CONFIG: Record<string, { label: string; dot: string }> = {
  pen:    { label: 'Drawing',  dot: 'bg-blue-400' },
  eraser: { label: 'Erasing',  dot: 'bg-orange-400' },
  idle:   { label: 'Pointing', dot: 'bg-gray-400' },
};

export default function ModeIndicator() {
  const { mode, color, brushSize } = useAppStore();
  const { label, dot } = MODE_CONFIG[mode] ?? MODE_CONFIG.idle;

  return (
    <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        {label}
      </div>

      {mode !== 'idle' && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs">
          <span
            className="w-3 h-3 rounded-full border border-white/30"
            style={{ background: mode === 'eraser' ? 'transparent' : color }}
          />
          <span className="text-white/70 font-mono">{color}</span>
          <span className="text-white/40">·</span>
          <span className="text-white/70">{brushSize}px</span>
        </div>
      )}
    </div>
  );
}
