# cosmos

Interactive N-body gravity simulator running in the browser. Uses a Barnes-Hut O(N log N) quadtree solver so it stays smooth with hundreds of bodies.

**[Live demo →](https://rolodex.github.io/cosmos)**

![cosmos screenshot](https://github.com/RoLoDeXx/cosmos/assets/placeholder/preview.png)

## Features

- **Barnes-Hut solver** — O(N log N) approximation via quadtree, falls back to O(N²) for small N
- **Parallax starfield** — multi-layer with per-star twinkle
- **5 presets** — solar system, binary stars, three-body chaos, cluster, galaxy with black hole
- **Click to edit** — right-click any body to adjust mass, velocity, and color
- **Share codes** — encode the full simulation state to a base64 string, shareable via URL hash
- **Zoom & pan** — scroll to zoom, right-drag to pan, pinch-to-zoom on touch
- **Velocity vectors** — toggle to visualise instantaneous velocity

## Stack

| | |
|---|---|
| Framework | React 19 + TypeScript 5.8 |
| Build | Vite 6 |
| Rendering | Canvas 2D |
| Runtime deps | React only |

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

## How it works

The physics loop runs entirely outside React's render cycle in a `requestAnimationFrame` callback. React only re-renders when UI state changes (button toggles, modals, HUD text). This keeps rendering at 60 fps regardless of body count.

```
src/
  lib/
    physics.ts      Barnes-Hut quadtree solver + collision merging
    bodies.ts       Body factory, type configs, preset spawners
    render.ts       Canvas 2D drawing (trails, glow, vectors, drag arrow)
    stars.ts        Parallax starfield generator + renderer
    stateCodec.ts   Encode / decode share codes
    types.ts        Shared TypeScript interfaces
  hooks/
    useSimulation.ts  Canvas loop, all input handling, reactive state bridge
  components/
    Controls.tsx    Sliders, preset and spawn-type buttons, action buttons
    EditModal.tsx   Per-body mass / velocity / color editor
    ShareModal.tsx  Copy and load share codes
```

## Controls

| Input | Action |
|---|---|
| Left drag | Launch a body (drag sets velocity direction & magnitude) |
| Right-click body | Open body editor |
| Right drag (empty) | Pan camera |
| Scroll | Zoom |
| Pinch (touch) | Zoom |

## License

MIT
