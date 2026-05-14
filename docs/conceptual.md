# Conceptual — Draw Your Face

## Overview
A browser-based drawing application that uses the device camera to track hand and finger movements in real time, allowing users to draw on a digital canvas without any physical input device.

---

## Core User Flow

1. **Web interface application** — runs entirely in-browser; no install required.
2. **Drawing in camera by fingers** — the webcam feed is processed live; finger positions drive the drawing cursor.
3. **User เปิดหน้าต่างขึ้นมา ใช้มือในการวาดรูป** — on page load, the camera feed appears alongside the canvas. The user raises their hand to begin.
4. **Hand and finger pattern control เปิดใช้งานปากกา** — extending the index finger activates the pen (draws on canvas); closing the fist or folding the finger lifts the pen (stops drawing). This separates intentional strokes from idle hand movement.
5. **Hand and finger pattern control เลือก palette** — hovering the open hand over the color palette zone (on-screen HUD) and holding for a brief dwell time selects a color. Pinching (thumb + index) confirms selection.
6. **Hand and finger pattern control เพื่อ erase** — an eraser gesture (e.g., spreading all five fingers wide) switches to eraser mode, allowing the user to rub out strokes by moving the hand over painted areas.

---

## Feature Set

| Feature | Gesture / Trigger | Notes |
|---|---|---|
| Draw stroke | Index finger extended | Tracks fingertip XY → canvas |
| Lift pen | Fist or index curled | No stroke drawn while pen is up |
| Select color | Hover over palette HUD → dwell | Color highlights on hover |
| Confirm color | Pinch (thumb + index) | Snaps selection |
| Eraser mode | All five fingers spread | Erases on move |
| Undo last stroke | Two-finger tap gesture | Pops stroke history stack |
| Clear canvas | Three-finger swipe left | Confirms with brief animation |
| Save drawing | UI button (click/tap) | Exports canvas as PNG |

---

## Gesture Reference

```
Index only extended    →  Pen DOWN  (drawing)
All fingers curled     →  Pen UP    (idle)
All fingers spread     →  Eraser mode
Pinch (thumb+index)    →  Confirm / select
Two-finger tap         →  Undo
Three-finger swipe L   →  Clear canvas
```

---

## UI Layout (rough)

```
┌──────────────────────────────────────────────────────┐
│  [Camera Feed — small, top-right corner]              │
│                                                       │
│              CANVAS (full page)                       │
│                                                       │
│  [Color Palette HUD — left edge, vertical strip]     │
│  [Brush size indicator — bottom-left]                │
│  [Mode badge: PEN / ERASER — top-left]               │
│  [Save button — top-right]                           │
└──────────────────────────────────────────────────────┘
```

---

## Key Constraints

- All hand tracking runs **client-side** (no video data leaves the browser).
- Target latency: < 50 ms from gesture to canvas response.
- Works on desktop Chrome/Firefox/Edge with a webcam; mobile support is stretch goal.
- No login required to draw; login required only to save drawings to the cloud.
