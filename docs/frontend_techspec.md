# Frontend Tech Spec — Draw Your Face (Prototype)

> **Phase:** Prototype — frontend only. No backend integration. Focus is on proving the hand-tracking + canvas drawing loop works in-browser.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Hand tracking | MediaPipe Hands (WASM) |
| Camera | WebRTC `getUserMedia` |
| Drawing surface | HTML5 Canvas 2D API |
| State | Zustand |
| Styling | Tailwind CSS |

---

## Project Structure

```
src/
├── app/
│   └── page.tsx                  # single route — the drawing page
├── components/
│   ├── DrawingCanvas.tsx          # canvas element + stroke rendering
│   ├── CameraFeed.tsx             # hidden video element for webcam
│   ├── PaletteHUD.tsx             # color strip overlay
│   └── ModeIndicator.tsx          # PEN / ERASER badge
├── hooks/
│   ├── useCamera.ts               # getUserMedia, stream lifecycle
│   ├── useHandTracking.ts         # MediaPipe init + landmark stream
│   ├── useGestureClassifier.ts    # landmarks → GestureEvent
│   └── useDrawing.ts              # stroke state, undo stack
├── lib/
│   ├── gestures.ts                # classification rules
│   ├── canvasUtils.ts             # Bézier smoothing, eraser composite
│   └── exportCanvas.ts            # PNG download
└── store/
    └── appStore.ts                # Zustand store
```

---

## Next.js Considerations

MediaPipe, `getUserMedia`, and Canvas are browser-only APIs — they cannot run during server-side rendering.

- Mark every component that touches these APIs with `'use client'` at the top.
- Import `DrawingCanvas` and `CameraFeed` using `next/dynamic` with `ssr: false` to prevent SSR errors:

```ts
// app/page.tsx
import dynamic from 'next/dynamic';

const DrawingCanvas = dynamic(() => import('@/components/DrawingCanvas'), { ssr: false });
const CameraFeed    = dynamic(() => import('@/components/CameraFeed'),    { ssr: false });
```

- `next.config.ts` — no special config needed for prototype; WASM is supported out of the box in Next.js 14.

---

## Hand Tracking Pipeline

```
getUserMedia (webcam)
      │  video element (hidden)
      ▼
MediaPipe Hands  →  21 landmarks [x, y, z]
      │
      ▼
useGestureClassifier  →  GestureEvent enum
      │
      ▼
useDrawing + appStore  →  stroke points / mode change
      │
      ▼
DrawingCanvas (requestAnimationFrame loop)
```

### `useHandTracking.ts`

```ts
'use client';
import { Hands } from '@mediapipe/hands';

export function useHandTracking(videoRef, onResults) {
  useEffect(() => {
    const hands = new Hands({ locateFile: (f) => `/mediapipe/hands/${f}` });
    hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7 });
    hands.onResults(onResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => hands.send({ image: videoRef.current }),
      width: 1280, height: 720,
    });
    camera.start();
    return () => camera.stop();
  }, []);
}
```

Place MediaPipe WASM files in `public/mediapipe/hands/` so Next.js serves them statically.

---

## Gesture Classifier (`lib/gestures.ts`)

```ts
export enum GestureEvent {
  PenDown,
  PenUp,
  EraserMode,
  Pinch,
  Undo,
  Clear,
  Idle,
}
```

| Gesture | Landmark rule |
|---|---|
| PenDown | Index finger extended (MCP→TIP dist > threshold), others curled |
| PenUp | All fingers curled |
| EraserMode | All five fingers extended |
| Pinch | Thumb tip ↔ index tip distance < 30 px |
| Undo | Index + middle extended, velocity spike |
| Clear | Index + middle + ring extended, Δx < −120 px in 300 ms |

---

## Canvas Module

### Stroke type

```ts
type Point  = { x: number; y: number };
type Stroke = { color: string; width: number; points: Point[]; tool: 'pen' | 'eraser' };
```

### Smoothing

Render strokes as quadratic Bézier curves between consecutive midpoints — prevents jagged lines at 30 fps input rate.

### Coordinate mapping

MediaPipe returns `[0, 1]` normalized coords relative to the video frame:

```ts
const cx = (1 - lm.x) * canvas.width;   // mirror flip
const cy = lm.y * canvas.height;
```

### Eraser

Two-canvas approach:
- `bg-canvas` — white background (never cleared)
- `draw-canvas` — transparent; strokes drawn here; eraser uses `globalCompositeOperation = 'destination-out'`

### Undo

`strokes: Stroke[]` array in Zustand. On undo, pop the last stroke and repaint from scratch. Keep max 50 strokes for prototype.

---

## Zustand Store (`store/appStore.ts`)

```ts
interface AppState {
  mode: 'pen' | 'eraser' | 'idle';
  color: string;        // hex, e.g. '#e63946'
  brushSize: number;    // px
  strokes: Stroke[];
  setMode: (m: AppState['mode']) => void;
  setColor: (c: string) => void;
  pushStroke: (s: Stroke) => void;
  undoStroke: () => void;
  clearStrokes: () => void;
}
```

Do **not** store live `Point[]` (in-progress stroke) in Zustand — use a `useRef` inside `useDrawing` to avoid triggering re-renders at 30 fps.

---

## Prototype Palette

Hardcode 8 colors for the prototype; no dynamic theming needed:

```ts
const PALETTE = ['#000000','#e63946','#457b9d','#2a9d8f','#e9c46a','#f4a261','#ffffff','#6d6875'];
```

---

## Performance Targets

| Metric | Target |
|---|---|
| Gesture → canvas latency | < 50 ms |
| Tracking frame rate | ≥ 24 fps |
| Canvas repaint | < 16 ms |
| MediaPipe WASM cold load | < 3 s (cached after first visit) |

---

## Dev Setup

```bash
npx create-next-app@latest draw-your-face --typescript --tailwind --app --src-dir
cd draw-your-face
npm install @mediapipe/hands zustand
# copy WASM files
cp -r node_modules/@mediapipe/hands public/mediapipe/hands
npm run dev
```

---

## Out of Scope for Prototype

- Backend API calls (save / load drawings)
- User authentication
- Cloud storage
- Mobile / touch support
- Collaborative drawing
