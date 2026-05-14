'use client';

import { useAppStore } from '@/store/appStore';

const LABELS: Record<string, { label: string; bg: string }> = {
  pen:    { label: '✏️  PEN',    bg: 'bg-blue-500' },
  eraser: { label: '◯  ERASER', bg: 'bg-orange-400' },
  idle:   { label: '●  IDLE',   bg: 'bg-gray-400' },
};

export default function ModeIndicator() {
  const mode = useAppStore((s) => s.mode);
  const { label, bg } = LABELS[mode] ?? LABELS.idle;

  return (
    <div className={`absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-white text-sm font-medium ${bg}`}>
      {label}
    </div>
  );
}
