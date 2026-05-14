'use client';

import { type RefObject } from 'react';

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
}

export default function CameraFeed({ videoRef }: Props) {
  return (
    <video
      ref={videoRef}
      className="absolute top-3 right-3 w-40 rounded-lg opacity-70 z-20 scale-x-[-1]"
      playsInline
      muted
    />
  );
}
