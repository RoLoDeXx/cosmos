# Contributing to cosmos

Thanks for your interest. This document covers setup, architecture, and the conventions used so your PR fits in cleanly.

---

## Setup

```bash
git clone https://github.com/RoLoDeXx/cosmos.git
cd cosmos
npm install
npm run dev
```

No environment variables, no external services, no database. The whole thing is a static Vite + React app.

TypeScript check (no emit):

```bash
npx tsc --noEmit
```

---

## Architecture

The simulation is split into two completely separate tracks:

**Physics track** — runs at every `requestAnimationFrame`, touches no React state:
- `useSimulation.ts` owns the `rAF` loop, all pointer events, and camera state as refs
- `physics.ts` computes forces and handles collisions
- `render.ts` draws directly to the `<canvas>`

**UI track** — React state and components that render the controls panel and modals. React only sees counts and scalar values (body count, HUD text, modal open/closed). It does **not** own the body array.

This boundary is deliberate. Don't move simulation data into React state — it will tank performance.

---

## Adding a scenario

1. **Config** — add an entry to `PRESET_CONFIGS` in `src/lib/bodies.ts`:

```ts
mypreset: { gravity: 1.0, timeScale: 0.8, zoom: 1.0, trailMax: 1000 },
```

2. **Bodies** — add a branch in `applyPreset()` in the same file. Use `makeBody(x, y, vx, vy, mass, color | null, type)`. Pass `null` for color to pick randomly from the type's palette.

3. **UI** — add it to `PRESET_GROUPS` (for the dropdown) and `ALL_SCENARIO_BTNS` (for the button grid) in `src/components/Controls.tsx`.

**Orbital velocity formula:** for a circular orbit around mass `M` at radius `r` with gravity constant `G`:

```
v = sqrt(G * M / r)
```

Tangential components: `vx = -sin(angle) * v`, `vy = cos(angle) * v`.

---

## Adding a body type

1. Add the type string to the `BodyType` union in `src/lib/types.ts`.
2. Add `{ mass, palette }` to `bodyTypes` in `src/lib/bodies.ts`. The palette is an array of hex colors — one is chosen at random when `color` is `null`.
3. If the type should participate in collision type-promotion, add it to `TYPE_TIERS` and set a `MASS_THRESHOLDS` entry in `src/lib/physics.ts`.
4. Add it to `BODY_GROUPS` (dropdown group) and `BODY_PRESETS` (named presets) in `src/components/Controls.tsx`.

---

## Style conventions

- TypeScript strict mode is on — no `any`, no non-null assertions without a comment
- No comments explaining *what* the code does; only add one if the *why* is non-obvious
- No new dependencies — the zero-dep rule is intentional
- Prefer editing existing files over creating new ones
- Keep the physics loop free of React imports

---

## Opening a PR

- One logical change per PR
- Describe *what* and *why* in the PR body; the diff shows the *how*
- Run `npx tsc --noEmit` before opening — PRs with type errors won't be merged
- If you're adding a scenario, include a short description of what makes it interesting

---

## Reporting a bug

Open an issue with:
- What you expected
- What actually happened
- Browser + OS
- Share code if the bug is state-specific (use the Share button to get one)
