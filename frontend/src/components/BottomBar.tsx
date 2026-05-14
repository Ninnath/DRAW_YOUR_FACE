'use client';

import { type RefObject } from 'react';
import { useAppStore } from '@/store/appStore';
import { exportAsPNG } from '@/lib/exportCanvas';

interface Props {
  drawCanvasRef: RefObject<HTMLCanvasElement | null>;
}

export default function BottomBar({ drawCanvasRef }: Props) {
  const { brushSize, clearStrokes, undoStroke } = useAppStore();
  const setBrushSize = useAppStore((s) => s.brushSize);

  function handleBrushChange(e: React.ChangeEvent<HTMLInputElement>) {
    useAppStore.setState({ brushSize: Number(e.target.value) });
  }

  function handleSave() {
    if (drawCanvasRef.current) exportAsPNG(drawCanvasRef.current);
  }

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-sm">
      <button
        onClick={clearStrokes}
        className="px-3 py-1 rounded-full hover:bg-white/15 transition font-medium"
      >
        Clear
      </button>

      <div className="w-px h-4 bg-white/25" />

      <button
        onClick={undoStroke}
        className="px-3 py-1 rounded-full hover:bg-white/15 transition font-medium"
      >
        Undo
      </button>

      <div className="w-px h-4 bg-white/25" />

      <button
        onClick={handleSave}
        className="px-3 py-1 rounded-full hover:bg-white/15 transition font-medium"
      >
        Save PNG
      </button>

      <div className="w-px h-4 bg-white/25" />

      {/* Brush size slider */}
      <div className="flex items-center gap-2">
        <span className="text-white/60 text-xs">Size</span>
        <input
          type="range"
          min={2}
          max={40}
          value={setBrushSize}
          onChange={handleBrushChange}
          className="w-24 accent-blue-400 cursor-pointer"
        />
        <span className="w-5 text-center text-white/80 text-xs">{setBrushSize}</span>
      </div>
    </div>
  );
}
