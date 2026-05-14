# ✋ Draw Your Face

A browser-based drawing app that lets you paint on a digital canvas using your hands — no mouse, no stylus, just your webcam and fingers.

---

## 🎨 How It Works

Open the app, allow camera access, and start drawing with your hand in front of the webcam. Hand gestures control everything — the pen, eraser, and more.

---

## 🤌 Gesture Reference

| Gesture | Action |
|---|---|
| ☝️ Index finger extended | **Pen down** — draw on the canvas |
| ✊ Fist (all fingers curled) | **Pen up** — stop drawing |
| 🖐️ All five fingers spread | **Eraser mode** — erase where you move |

Use the on-screen buttons to:
- 🎨 **Click a color swatch** — pick a color (left edge)
- ↩ **Undo** — remove the last stroke
- 🗑️ **Clear** — wipe the whole canvas
- 💾 **Save PNG** — download your drawing

---

## 🛠️ Tech Stack

| | |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Hand tracking | MediaPipe Hands (WASM, runs 100% in-browser) |
| Drawing | HTML5 Canvas 2D API |
| State | Zustand |
| Styling | Tailwind CSS 4 |
| Backend *(planned)* | FastAPI + PostgreSQL |

---

## 🚀 Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and allow camera permission.

> Tested on Chrome 90+ / Firefox 90+ / Edge 90+ with a webcam.

---

## 📁 Project Structure

```
DRAW_YOUR_FACE/
├── docs/
│   ├── conceptual.md          # user flow, gestures, UI layout
│   ├── frontend_techspec.md   # frontend architecture & decisions
│   └── backend_techspec.md    # FastAPI backend spec (planned)
└── frontend/                  # Next.js prototype
    └── src/
        ├── app/               # Next.js App Router
        ├── components/        # UI + canvas components
        ├── hooks/             # camera, hand tracking, drawing
        ├── lib/               # gesture classifier, canvas utils
        └── store/             # Zustand store
```

---

## 🔒 Privacy

All hand tracking runs locally in your browser via WebAssembly. No video or image data is ever sent to a server.
