'use client';

import { useAppStore } from '@/store/appStore';

export default function ActionButtons() {
  const { undoStroke, clearStrokes } = useAppStore();

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-3">
      <button
        onClick={undoStroke}
        className="px-4 py-2 rounded-full bg-white border border-gray-300 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 transition"
      >
        ↩ Undo
      </button>
      <button
        onClick={clearStrokes}
        className="px-4 py-2 rounded-full bg-white border border-gray-300 text-sm font-medium text-red-500 shadow hover:bg-red-50 transition"
      >
        🗑 Clear
      </button>
    </div>
  );
}
