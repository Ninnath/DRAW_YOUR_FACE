'use client';

import { useRef, useCallback } from 'react';
import type { NormalizedLandmark } from '@mediapipe/hands';
import { useCamera } from '@/hooks/useCamera';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useDrawing } from '@/hooks/useDrawing';
import { type GestureEvent } from '@/lib/gestures';
import CameraFeed from '@/components/CameraFeed';
import DrawingCanvas from '@/components/DrawingCanvas';
import PaletteHUD from '@/components/PaletteHUD';
import ModeIndicator from '@/components/ModeIndicator';
import BottomBar from '@/components/BottomBar';

export default function DrawingApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const landmarksRef = useRef<NormalizedLandmark[]>([]);

  useCamera(videoRef);

  const { currentStrokeRef, handleResults } = useDrawing(drawCanvasRef, videoRef);

  const onResults = useCallback(
    (lms: NormalizedLandmark[], gesture: GestureEvent) => {
      landmarksRef.current = lms;
      handleResults(lms, gesture);
    },
    [handleResults],
  );

  useHandTracking(videoRef, onResults);

  // Layer order (z-index):
  //   0 — camera video (background, 85% opacity)
  //  10 — draw canvas (transparent, strokes above camera)
  //  20 — landmark canvas (skeleton above strokes)
  //  30 — HUD (palette, status, bottom bar)
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <CameraFeed videoRef={videoRef} />

      <DrawingCanvas
        drawCanvasRef={drawCanvasRef}
        currentStrokeRef={currentStrokeRef}
        landmarksRef={landmarksRef}
        videoRef={videoRef}
      />

      {/* HUD */}
      <ModeIndicator />
      <PaletteHUD />
      <BottomBar drawCanvasRef={drawCanvasRef} />
    </div>
  );
}
