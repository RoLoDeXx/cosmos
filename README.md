# cosmos

An interactive N-body gravity simulator that runs entirely in the browser — no backend, no install, just open and play.

Inspired by [Universe Sandbox](https://universesandbox.com/), cosmos started as a personal experiment to explore what AI-assisted development could produce when given a fun, physics-driven challenge. The goal was to see how far you could push a lightweight, zero-dependency simulation using only browser-native technologies — and to build something genuinely enjoyable along the way.

**[Live demo →](https://rolodexx.github.io/cosmos)**

<img width="1720" height="1044" alt="image" src="https://github.com/user-attachments/assets/77ce18de-831f-4f8f-a07a-60b0977ac5e6" />

---

## Motivation

Universe Sandbox showed that simulating gravity at a human scale could be both beautiful and educational. This project takes that spirit and strips it down to its essence: a real-time physics loop, a Canvas 2D renderer, and nothing else standing between you and the simulation.

It was also a test of AI capability in a creative engineering context — using AI as a collaborator to design algorithms, write TypeScript, tune physics constants, and iterate quickly. The result is a tool that feels hand-crafted but was built at a pace that wouldn't have been possible alone.

---

## Features

- **Barnes-Hut solver** — O(N log N) approximation via quadtree, falls back to O(N²) for small N
- **Parallax starfield** — multi-layer with per-star twinkle
- **5 presets** — solar system, binary stars, three-body chaos, cluster, galaxy with black hole
- **Click to edit** — right-click any body to adjust mass, velocity, and color
- **Share codes** — encode the full simulation state to a base64 string, shareable via URL hash
- **Zoom & pan** — scroll to zoom, right-drag to pan, pinch-to-zoom on touch
- **Velocity vectors** — toggle to visualise instantaneous velocity

---

## Stack

| | |
|---|---|
| Framework | React 19 + TypeScript 5.8 |
| Build | Vite 6 |
| Rendering | Canvas 2D |
| Runtime deps | React only |

Keeping runtime dependencies to a minimum was intentional — the whole point was to prove that a rich, interactive physics simulation doesn't need a heavy framework or WebGL to feel good.

---

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

```bash
npm run build   # production build → dist/
npm run preview # preview the build locally
```

---

## How it works

The physics loop runs entirely outside React's render cycle in a `requestAnimationFrame` callback. React only re-renders when UI state changes (button toggles, modals, HUD text). This keeps rendering at 60 fps regardless of body count.

```
src/
  lib/
    physics.ts        Barnes-Hut quadtree solver + collision merging
    bodies.ts         Body factory, type configs, preset spawners
    render.ts         Canvas 2D drawing (trails, glow, vectors, drag arrow)
    stars.ts          Parallax starfield generator + renderer
    stateCodec.ts     Encode / decode share codes
    types.ts          Shared TypeScript interfaces
  hooks/
    useSimulation.ts  Canvas loop, all input handling, reactive state bridge
  components/
    Controls.tsx      Sliders, preset and spawn-type buttons, action buttons
    EditModal.tsx     Per-body mass / velocity / color editor
    ShareModal.tsx    Copy and load share codes
```

---

## Controls

| Input | Action |
|---|---|
| Left drag | Launch a body (drag sets velocity direction & magnitude) |
| Right-click body | Open body editor |
| Right drag (empty) | Pan camera |
| Scroll | Zoom |
| Pinch (touch) | Zoom |

---

## License

MIT
