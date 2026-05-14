'use client';

import { useCallback, useRef, type RefObject } from 'react';
import type { NormalizedLandmark } from '@mediapipe/hands';
import { GestureEvent } from '@/lib/gestures';
import { mapToCanvas } from '@/lib/canvasUtils';
import { useAppStore } from '@/store/appStore';
import type { Point, Stroke } from '@/types';

interface DrawingRefs {
  currentStrokeRef: RefObject<Stroke | null>;
  cursorRef: RefObject<Point | null>;
  handleResults: (landmarks: NormalizedLandmark[], gesture: GestureEvent) => void;
}

export function useDrawing(drawCanvasRef: RefObject<HTMLCanvasElement | null>): DrawingRefs {
  const currentStrokeRef = useRef<Stroke | null>(null);
  const cursorRef = useRef<Point | null>(null);

  const handleResults = useCallback(
    (landmarks: NormalizedLandmark[], gesture: GestureEvent) => {
      const { color, brushSize, setMode, pushStroke } = useAppStore.getState();
      const canvas = drawCanvasRef.current;

      // No hand detected — commit any pending stroke and clear cursor
      if (!landmarks.length) {
        if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
          pushStroke({ ...currentStrokeRef.current, points: [...currentStrokeRef.current.points] });
        }
        currentStrokeRef.current = null;
        cursorRef.current = null;
        setMode('idle');
        return;
      }

      const w = canvas?.width ?? window.innerWidth;
      const h = canvas?.height ?? window.innerHeight;

      // Index fingertip = landmark 8
      const tip = landmarks[8];
      const cursor = mapToCanvas(tip.x, tip.y, w, h);
      cursorRef.current = cursor;

      switch (gesture) {
        case GestureEvent.PenDown: {
          setMode('pen');
          if (!currentStrokeRef.current || currentStrokeRef.current.tool !== 'pen') {
            // Commit any prior eraser stroke
            if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
              pushStroke({ ...currentStrokeRef.current, points: [...currentStrokeRef.current.points] });
            }
            currentStrokeRef.current = { color, width: brushSize, points: [cursor], tool: 'pen' };
          } else {
            currentStrokeRef.current.points.push(cursor);
          }
          break;
        }

        case GestureEvent.EraserMode: {
          setMode('eraser');
          if (!currentStrokeRef.current || currentStrokeRef.current.tool !== 'eraser') {
            // Commit any prior pen stroke
            if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
              pushStroke({ ...currentStrokeRef.current, points: [...currentStrokeRef.current.points] });
            }
            currentStrokeRef.current = { color: '', width: brushSize * 3, points: [cursor], tool: 'eraser' };
          } else {
            currentStrokeRef.current.points.push(cursor);
          }
          break;
        }

        case GestureEvent.PenUp:
        case GestureEvent.Idle:
        default: {
          if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
            pushStroke({ ...currentStrokeRef.current, points: [...currentStrokeRef.current.points] });
          }
          currentStrokeRef.current = null;
          setMode('idle');
          break;
        }
      }
    },
    [drawCanvasRef],
  );

  return { currentStrokeRef, cursorRef, handleResults };
}
