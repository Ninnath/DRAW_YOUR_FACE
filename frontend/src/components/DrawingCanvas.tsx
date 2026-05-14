'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { drawStroke } from '@/lib/canvasUtils';
import { useAppStore } from '@/store/appStore';
import type { Point, Stroke } from '@/types';

interface Props {
  drawCanvasRef: RefObject<HTMLCanvasElement | null>;
  currentStrokeRef: RefObject<Stroke | null>;
  cursorRef: RefObject<Point | null>;
}

export default function DrawingCanvas({ drawCanvasRef, currentStrokeRef, cursorRef }: Props) {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);

  // Fill white background once
  useEffect(() => {
    const bg = bgCanvasRef.current;
    if (!bg) return;
    bg.width = window.innerWidth;
    bg.height = window.innerHeight;
    const ctx = bg.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, bg.width, bg.height);
  }, []);

  // Size draw canvas on mount
  useEffect(() => {
    const draw = drawCanvasRef.current;
    if (!draw) return;
    draw.width = window.innerWidth;
    draw.height = window.innerHeight;
  }, [drawCanvasRef]);

  // RAF render loop — reads store state directly to avoid re-render overhead
  useEffect(() => {
    const draw = drawCanvasRef.current;
    if (!draw) return;
    const ctx = draw.getContext('2d')!;
    let rafId: number;

    function render() {
      const { strokes, mode, color, brushSize } = useAppStore.getState();

      ctx.clearRect(0, 0, draw!.width, draw!.height);

      // Paint all committed strokes
      for (const stroke of strokes) {
        drawStroke(ctx, stroke);
      }

      // Paint current in-progress stroke
      const current = currentStrokeRef.current;
      if (current && current.points.length >= 2) {
        drawStroke(ctx, current);
      }

      // Cursor dot at index fingertip
      const cursor = cursorRef.current;
      if (cursor) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        const isEraser = mode === 'eraser';
        ctx.strokeStyle = isEraser ? '#94a3b8' : color;
        ctx.fillStyle = isEraser ? 'transparent' : color;
        ctx.lineWidth = 2;
        const r = isEraser ? brushSize * 1.5 : brushSize / 2;
        ctx.beginPath();
        ctx.arc(cursor.x, cursor.y, r, 0, Math.PI * 2);
        if (isEraser) {
          ctx.stroke();
        } else {
          ctx.fill();
        }
        ctx.restore();
      }

      rafId = requestAnimationFrame(render);
    }

    render();
    return () => cancelAnimationFrame(rafId);
  }, [drawCanvasRef, currentStrokeRef, cursorRef]);

  return (
    <div className="absolute inset-0">
      <canvas ref={bgCanvasRef} className="absolute inset-0" />
      <canvas ref={drawCanvasRef} className="absolute inset-0" />
    </div>
  );
}
