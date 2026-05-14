'use client';

import { type RefObject } from 'react';
import { exportAsPNG } from '@/lib/exportCanvas';

interface Props {
  drawCanvasRef: RefObject<HTMLCanvasElement | null>;
}

export default function SaveButton({ drawCanvasRef }: Props) {
  function handleSave() {
    if (drawCanvasRef.current) {
      exportAsPNG(drawCanvasRef.current);
    }
  }

  return (
    <button
      onClick={handleSave}
      className="absolute top-3 right-44 z-20 px-3 py-1 rounded-full bg-white border border-gray-300 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 transition"
    >
      💾 Save PNG
    </button>
  );
}
