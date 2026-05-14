import { create } from 'zustand';
import type { Stroke, AppMode } from '@/types';

export const PALETTE = [
  '#000000',
  '#e63946',
  '#457b9d',
  '#2a9d8f',
  '#e9c46a',
  '#f4a261',
  '#6d6875',
  '#ffffff',
];

interface AppState {
  mode: AppMode;
  color: string;
  brushSize: number;
  strokes: Stroke[];
  setMode: (mode: AppMode) => void;
  setColor: (color: string) => void;
  pushStroke: (stroke: Stroke) => void;
  undoStroke: () => void;
  clearStrokes: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'idle',
  color: '#000000',
  brushSize: 8,
  strokes: [],
  setMode: (mode) => set({ mode }),
  setColor: (color) => set({ color }),
  pushStroke: (stroke) =>
    set((s) => ({ strokes: [...s.strokes.slice(-49), stroke] })),
  undoStroke: () => set((s) => ({ strokes: s.strokes.slice(0, -1) })),
  clearStrokes: () => set({ strokes: [] }),
}));
