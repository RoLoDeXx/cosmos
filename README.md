# cosmos

An interactive N-body gravity simulator that runs entirely in the browser — no backend, no install, just open and play.

Inspired by [Universe Sandbox](https://universesandbox.com/), cosmos started as a personal experiment to explore what AI-assisted development could produce when given a fun, physics-driven challenge. The goal was to see how far you could push a lightweight, zero-dependency simulation using only browser-native technologies — and to build something genuinely enjoyable along the way.

**[Live demo →](https://rolodexx.github.io/cosmos)**

<img width="1701" height="1315" alt="image" src="https://github.com/user-attachments/assets/9de615b5-ca7e-4179-b999-d5f2c4ce7084" />


---

## Motivation

Universe Sandbox showed that simulating gravity at a human scale could be both beautiful and educational. This project takes that spirit and strips it down to its essence: a real-time physics loop, a Canvas 2D renderer, and nothing else standing between you and the simulation.

It was also a test of AI capability in a creative engineering context — using AI as a collaborator to design algorithms, write TypeScript, tune physics constants, and iterate quickly. The result is a tool that feels hand-crafted but was built at a pace that wouldn't have been possible alone.

---

## Features

**Physics**
- Barnes-Hut O(N log N) solver via quadtree; falls back to O(N²) for small N
- Gravitational lensing distortion around black holes
- Collision merging with automatic type promotion (e.g. two merging stars become a blue giant if combined mass crosses a threshold)
- Tunable gravity constant, time scale, and trail length in real time

**Scenarios — 17 presets, one click to load**

| Category | Scenarios |
|---|---|
| Classic | Solar System, Binary Stars, Three-Body Chaos, Star Cluster, Galaxy |
| Famous | TRAPPIST-1, Asteroid Belt, Figure-8 Choreography |
| Collisions & events | Galaxy Collision, Rogue Star Flyby, Pulsar System |
| Real events | Shoemaker-Levy 9 Impact, GW150914, ʻOumuamua Flyby |
| Real systems | Alpha Centauri Triple, Kepler-16 (Tatooine), TOI-178 Resonance Chain |

**Spawning**
- 16 body types: moons, asteroids, comets, rocky/terrestrial/ocean/lava/ice-giant/gas-giant planets, red dwarf/yellow dwarf/red giant/blue giant/white dwarf stars, neutron stars, black holes
- Named real-world presets per type (Earth-like, Jupiter-like, Proxima Centauri, Magnetar, …)
- Left-drag on canvas sets velocity direction and magnitude
- Right-click any body to edit mass, velocity, and color live

**UI**
- Scenario quick-load button grid + grouped dropdown
- Parallax starfield with per-star twinkle
- Velocity vector overlay
- Share codes — encode full simulation state to base64, loadable via URL hash
- Zoom & pan (scroll, right-drag, pinch-to-zoom on touch)

---

## Stack

| | |
|---|---|
| Framework | React 19 + TypeScript 5.8 |
| Build | Vite 6 |
| Rendering | Canvas 2D |
| Runtime deps | React only (zero physics libraries) |

Keeping runtime dependencies to a minimum was intentional — the whole point was to prove that a rich, interactive physics simulation doesn't need a heavy framework or WebGL to feel good.

---

## Getting started

```bash
git clone https://github.com/RoLoDeXx/cosmos.git
cd cosmos
npm install
npm run dev        # → http://localhost:5173
```

```bash
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

---

## Controls

| Input | Action |
|---|---|
| Left drag | Spawn a body — drag direction & length sets initial velocity |
| Right-click body | Open body editor (mass, velocity, color) |
| Right drag (empty space) | Pan camera |
| Scroll wheel | Zoom in / out |
| Pinch (touch) | Zoom |

---

## Code structure

```
src/
├── lib/
│   ├── physics.ts        Barnes-Hut quadtree, force integration, collision merging & type promotion
│   ├── bodies.ts         Body factory, per-type configs, all 17 preset spawners
│   ├── render.ts         Canvas 2D — trails, glow, lensing, velocity arrows
│   ├── stars.ts          Parallax starfield generator + renderer
│   ├── stateCodec.ts     Encode / decode simulation share codes
│   └── types.ts          Shared TypeScript interfaces
├── hooks/
│   └── useSimulation.ts  rAF loop, pointer input, reactive state bridge to React
└── components/
    ├── Controls.tsx       Scenario buttons, spawn-type/preset dropdowns, physics sliders
    ├── EditModal.tsx      Per-body live editor
    └── ShareModal.tsx     Share code copy & load
```

**Architecture note:** the physics loop runs entirely outside React's render cycle via `requestAnimationFrame` and refs. React only re-renders on UI state changes (toggles, modals, HUD text), keeping the simulation at 60 fps regardless of body count.

---

## How to add a scenario

1. Add a `PresetConfig` entry in `PRESET_CONFIGS` in `src/lib/bodies.ts` (gravity, timeScale, zoom, trailMax).
2. Add a branch in `applyPreset()` that pushes bodies via `makeBody()`.
3. Add it to `PRESET_GROUPS` and `ALL_SCENARIO_BTNS` in `src/components/Controls.tsx`.

## How to add a body type

1. Add the type string to the `BodyType` union in `src/lib/types.ts`.
2. Add a `{ mass, palette }` entry to `bodyTypes` in `src/lib/bodies.ts`.
3. Add mass-threshold and tier entries in `TYPE_TIERS` / `MASS_THRESHOLDS` in `src/lib/physics.ts` if it should participate in type promotion on collision.
4. Add it to `BODY_GROUPS` and `BODY_PRESETS` in `src/components/Controls.tsx`.

---

## Roadmap

See the [open issues](https://github.com/RoLoDeXx/cosmos/issues) for planned features. High-priority items:

- [ ] Camera follow mode — lock viewport to a selected body
- [ ] Orbital path preview while dragging to spawn
- [ ] Hover tooltip (type, mass, speed) without opening the editor
- [ ] Collision visual flash
- [ ] Trails colored by body type
- [ ] Habitable zone ring around stars
- [ ] Keyboard shortcuts panel
- [ ] Export simulation as GIF / MP4

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, architecture notes, and PR guidelines.

---

## License

MIT
