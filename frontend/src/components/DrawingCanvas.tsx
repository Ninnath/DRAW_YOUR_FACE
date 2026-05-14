'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { drawStroke, drawHandSkeleton } from '@/lib/canvasUtils';
import { useAppStore } from '@/store/appStore';
import type { Stroke } from '@/types';

type Lm = { x: number; y: number };

interface Props {
  drawCanvasRef: RefObject<HTMLCanvasElement | null>;
  currentStrokeRef: RefObject<Stroke | null>;
  landmarksRef: RefObject<Lm[]>;
  videoRef: RefObject<HTMLVideoElement | null>;
}

export default function DrawingCanvas({ drawCanvasRef, currentStrokeRef, landmarksRef, videoRef }: Props) {
  const lmCanvasRef = useRef<HTMLCanvasElement>(null);

  // Size canvases on mount
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const draw = drawCanvasRef.current;
    if (draw) { draw.width = w; draw.height = h; }
    const lm = lmCanvasRef.current;
    if (lm) { lm.width = w; lm.height = h; }
  }, [drawCanvasRef]);

  // RAF loop: strokes on draw-canvas, skeleton on lm-canvas
  useEffect(() => {
    const draw = drawCanvasRef.current;
    const lm = lmCanvasRef.current;
    if (!draw || !lm) return;

    const ctx   = draw.getContext('2d')!;
    const lmCtx = lm.getContext('2d')!;
    let rafId: number;

    function render() {
      const { strokes } = useAppStore.getState();
      const w = draw!.width;
      const h = draw!.height;

      ctx.clearRect(0, 0, w, h);
      for (const stroke of strokes) drawStroke(ctx, stroke);
      const current = currentStrokeRef.current;
      if (current && current.points.length >= 2) drawStroke(ctx, current);

      lmCtx.clearRect(0, 0, w, h);
      const lms = landmarksRef.current;
      if (lms.length >= 21) {
        const vw = videoRef.current?.videoWidth ?? 0;
        const vh = videoRef.current?.videoHeight ?? 0;
        drawHandSkeleton(lmCtx, lms, w, h, vw, vh);
      }

      rafId = requestAnimationFrame(render);
    }

    render();
    return () => cancelAnimationFrame(rafId);
  }, [drawCanvasRef, currentStrokeRef, landmarksRef, videoRef]);

  return (
    <>
      {/* z-10: stroke canvas (transparent — camera shows through) */}
      <canvas ref={drawCanvasRef} className="absolute inset-0" style={{ zIndex: 10 }} />
      {/* z-20: landmark skeleton canvas */}
      <canvas ref={lmCanvasRef} className="absolute inset-0" style={{ zIndex: 20 }} />
    </>
  );
}
