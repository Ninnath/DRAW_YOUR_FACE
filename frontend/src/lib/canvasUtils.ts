import type { Point, Stroke } from '@/types';

type Lm = { x: number; y: number };

// Standard MediaPipe hand skeleton connections
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],          // thumb
  [0, 5], [5, 6], [6, 7], [7, 8],          // index
  [5, 9], [9, 10], [10, 11], [11, 12],     // middle
  [9, 13], [13, 14], [14, 15], [15, 16],   // ring
  [13, 17], [17, 18], [18, 19], [19, 20],  // pinky
  [0, 17],                                   // palm base
];

const FINGERTIPS = new Set([4, 8, 12, 16, 20]);

export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
  const { points, color, width, tool } = stroke;
  if (points.length < 2) return;

  ctx.save();
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = color;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2;
    const my = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
  }

  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();
  ctx.restore();
}

export function drawHandSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Lm[],
  w: number,
  h: number,
  videoW = 0,
  videoH = 0,
): void {
  if (landmarks.length < 21) return;

  const pts = landmarks.map((lm) => mapToCanvas(lm.x, lm.y, w, h, videoW, videoH));

  ctx.save();

  // Bone connections — thin white lines
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  for (const [a, b] of HAND_CONNECTIONS) {
    ctx.beginPath();
    ctx.moveTo(pts[a].x, pts[a].y);
    ctx.lineTo(pts[b].x, pts[b].y);
    ctx.stroke();
  }

  // Joint dots — filled white circles
  for (let i = 0; i < pts.length; i++) {
    const r = FINGERTIPS.has(i) ? 5 : 3;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(pts[i].x, pts[i].y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function mapToCanvas(
  normX: number,
  normY: number,
  canvasW: number,
  canvasH: number,
  videoW = 0,
  videoH = 0,
): Point {
  const vw = videoW || canvasW;
  const vh = videoH || canvasH;
  // Match object-cover: scale uniformly to fill, center, crop excess
  const scale = Math.max(canvasW / vw, canvasH / vh);
  const offsetX = (vw * scale - canvasW) / 2;
  const offsetY = (vh * scale - canvasH) / 2;
  return {
    x: canvasW - (normX * vw * scale - offsetX), // mirror to match CSS scale-x-[-1]
    y: normY * vh * scale - offsetY,
  };
}
