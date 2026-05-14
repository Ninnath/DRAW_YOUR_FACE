'use client';

import { PALETTE, useAppStore } from '@/store/appStore';

export default function PaletteHUD() {
  const { color, setColor } = useAppStore();

  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
      {PALETTE.map((c) => (
        <button
          key={c}
          onClick={() => setColor(c)}
          className="w-9 h-9 rounded-full border-2 transition-transform hover:scale-110"
          style={{
            backgroundColor: c,
            borderColor: color === c ? '#000' : '#d1d5db',
            boxShadow: color === c ? '0 0 0 2px white, 0 0 0 4px black' : undefined,
          }}
          aria-label={`Select color ${c}`}
        />
      ))}
    </div>
  );
}
