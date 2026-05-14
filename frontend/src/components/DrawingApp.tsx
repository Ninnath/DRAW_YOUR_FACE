'use client';

import { useRef } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useDrawing } from '@/hooks/useDrawing';
import CameraFeed from '@/components/CameraFeed';
import DrawingCanvas from '@/components/DrawingCanvas';
import PaletteHUD from '@/components/PaletteHUD';
import ModeIndicator from '@/components/ModeIndicator';
import SaveButton from '@/components/SaveButton';
import ActionButtons from '@/components/ActionButtons';

export default function DrawingApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  useCamera(videoRef);

  const { currentStrokeRef, cursorRef, handleResults } = useDrawing(drawCanvasRef);

  useHandTracking(videoRef, handleResults);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Hidden camera feed (shown as PiP) */}
      <CameraFeed videoRef={videoRef} />

      {/* Drawing surface */}
      <DrawingCanvas
        drawCanvasRef={drawCanvasRef}
        currentStrokeRef={currentStrokeRef}
        cursorRef={cursorRef}
      />

      {/* HUD overlays */}
      <ModeIndicator />
      <PaletteHUD />
      <SaveButton drawCanvasRef={drawCanvasRef} />
      <ActionButtons />
    </div>
  );
}
