export type Point = { x: number; y: number };

export type Tool = 'pen' | 'eraser';

export interface Stroke {
  color: string;
  width: number;
  points: Point[];
  tool: Tool;
}

export type AppMode = 'pen' | 'eraser' | 'idle';
