'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { NormalizedLandmark } from '@mediapipe/hands';
import { classifyGesture, GestureEvent } from '@/lib/gestures';

type ResultsHandler = (landmarks: NormalizedLandmark[], gesture: GestureEvent) => void;

export function useHandTracking(
  videoRef: RefObject<HTMLVideoElement | null>,
  onResults: ResultsHandler,
): void {
  const onResultsRef = useRef(onResults);
  onResultsRef.current = onResults;

  useEffect(() => {
    let active = true;
    let rafId = 0;

    async function init() {
      const { Hands } = await import('@mediapipe/hands');

      const hands = new Hands({
        locateFile: (f: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/mediapipe/hands/${f}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results) => {
        if (!active) return;
        const lms: NormalizedLandmark[] = results.multiHandLandmarks?.[0] ?? [];
        onResultsRef.current(lms, classifyGesture(lms));
      });

      async function loop() {
        if (!active) return;
        const video = videoRef.current;
        if (video && video.readyState >= 2) {
          await hands.send({ image: video });
        }
        rafId = requestAnimationFrame(loop);
      }

      loop();
    }

    init();

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
    };
  }, [videoRef]);
}
