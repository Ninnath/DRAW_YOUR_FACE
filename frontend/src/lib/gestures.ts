import type { NormalizedLandmark } from '@mediapipe/hands';

export enum GestureEvent {
  PenDown = 'PenDown',
  PenUp = 'PenUp',
  EraserMode = 'EraserMode',
  Idle = 'Idle',
}

function isExtended(lm: NormalizedLandmark[], tip: number, pip: number): boolean {
  return lm[tip].y < lm[pip].y;
}

export function classifyGesture(landmarks: NormalizedLandmark[]): GestureEvent {
  if (landmarks.length < 21) return GestureEvent.Idle;

  const index  = isExtended(landmarks, 8,  6);
  const middle = isExtended(landmarks, 12, 10);
  const ring   = isExtended(landmarks, 16, 14);
  const pinky  = isExtended(landmarks, 20, 18);

  // All four fingers spread → eraser
  if (index && middle && ring && pinky) return GestureEvent.EraserMode;

  // Only index extended → pen down
  if (index && !middle && !ring && !pinky) return GestureEvent.PenDown;

  // All curled → pen up
  if (!index && !middle && !ring && !pinky) return GestureEvent.PenUp;

  return GestureEvent.Idle;
}
