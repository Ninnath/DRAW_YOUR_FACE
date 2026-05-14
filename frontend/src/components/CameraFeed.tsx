'use client';

import { type RefObject } from 'react';

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
}

export default function CameraFeed({ videoRef }: Props) {
  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
      style={{ zIndex: 0, opacity: 0.85 }}
      playsInline
      muted
    />
  );
}
