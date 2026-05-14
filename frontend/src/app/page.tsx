'use client';

import dynamic from 'next/dynamic';

// DrawingApp uses browser APIs (Canvas, getUserMedia, MediaPipe WASM) — disable SSR
const DrawingApp = dynamic(() => import('@/components/DrawingApp'), { ssr: false });

export default function Home() {
  return <DrawingApp />;
}
