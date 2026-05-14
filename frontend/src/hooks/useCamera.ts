'use client';

import { useEffect, type RefObject } from 'react';

export function useCamera(videoRef: RefObject<HTMLVideoElement | null>): void {
  useEffect(() => {
    let stream: MediaStream | null = null;
    let active = true;

    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } })
      .then((s) => {
        if (!active || !videoRef.current) return;
        stream = s;
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(() => {});
      })
      .catch(console.error);

    return () => {
      active = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [videoRef]);
}
