#!/usr/bin/env bash
# Run this once after installing gh CLI and running `gh auth login`
# Creates all planned roadmap issues on GitHub

set -e
REPO="RoLoDeXx/cosmos"

gh issue create --repo "$REPO" --label "enhancement" \
  --title "Camera follow mode" \
  --body "Lock the viewport to a selected body — track a moon orbiting a planet, or watch a rogue star escape the system.

- Click a body to select it, press \`F\` or a toolbar button to enter follow mode
- Camera pans each frame to keep it centred; zoom still works
- Click empty space or \`Escape\` to exit"

gh issue create --repo "$REPO" --label "enhancement" \
  --title "Orbital path preview while dragging to spawn" \
  --body "Show a dotted projected orbit path while the user is dragging to spawn a body, so they can see whether it will be circular, elliptical, or escape before releasing."

gh issue create --repo "$REPO" --label "enhancement" \
  --title "Hover tooltip — type, mass, speed" \
  --body "Show a small tooltip on mouse-over (type, mass, current speed) without requiring a right-click to open the full editor. Should disappear as soon as the cursor moves away."

gh issue create --repo "$REPO" --label "enhancement" \
  --title "Undo last spawn" \
  --body "Single keystroke (e.g. \`Ctrl+Z\`) to remove the last spawned body. Useful when a drag goes slightly wrong and you want to retry without clearing everything."

gh issue create --repo "$REPO" --label "enhancement" \
  --title "Orbital stats panel for selected body" \
  --body "When a body is selected/clicked, show live orbital parameters in a small HUD panel: orbital period, semi-major axis, eccentricity, and the body it's most bound to."

gh issue create --repo "$REPO" --label "enhancement,visual" \
  --title "Collision flash effect" \
  --body "Brief bright flash at the merge point when two bodies collide, scaled to the combined mass. Makes collisions feel impactful rather than silent."

gh issue create --repo "$REPO" --label "enhancement,visual" \
  --title "Trails colored by body type" \
  --body "Instead of all-white trails, tint each trail by the body's color/type — warm orange for stars, blue for ice giants, dark for black holes, etc. Should respect the existing trail length setting."

gh issue create --repo "$REPO" --label "enhancement,visual" \
  --title "Habitable zone ring around stars" \
  --body "Render a faint translucent green annulus showing the approximate habitable zone radius around star-type bodies. Calculated from the star's mass as a proxy for luminosity. Toggle alongside velocity vectors."

gh issue create --repo "$REPO" --label "enhancement" \
  --title "Body labels toggle" \
  --body "Optional floating name labels on each body (type name + index, e.g. 'star 1', 'planet 3'). Useful for educational use and when tracking specific bodies in a crowded simulation."

gh issue create --repo "$REPO" --label "enhancement" \
  --title "'Spawn system' shortcut — one drag drops a star + orbiting planets" \
  --body "A special spawn mode where dragging places a mini solar system: a star at the drag origin and 2–4 planets automatically given circular orbits around it. Saves the tedium of placing each body individually when building a system from scratch."

gh issue create --repo "$REPO" --label "enhancement,scenario" \
  --title "Scenario: GW170817 — neutron star merger (kilonova)" \
  --body "Two neutron stars inspiraling toward merger, with a faint kilonova afterglow visualisation. GW170817 (2017) was the first multi-messenger event — simultaneously detected in gravitational waves and visible light."

gh issue create --repo "$REPO" --label "enhancement,scenario" \
  --title "Scenario: 2I/Borisov — first confirmed interstellar comet" \
  --body "Similar to the ʻOumuamua preset but with a comet-type interloper and a visible coma tail. Borisov (2019) was the first clearly cometary interstellar visitor."

gh issue create --repo "$REPO" --label "enhancement" \
  --title "Custom scenario editor — build and save named presets" \
  --body "A UI that lets users configure and save their own scenarios to localStorage with a custom name, then load them from a 'My Scenarios' section in the dropdown/button grid."

gh issue create --repo "$REPO" --label "enhancement" \
  --title "Multiple named save slots (localStorage)" \
  --body "Currently the share code is the only way to persist a state. Add named save slots in localStorage (e.g. 'quicksave', 'my galaxy', etc.) so users can save and reload without copying codes."

gh issue create --repo "$REPO" --label "enhancement" \
  --title "Export simulation as GIF or MP4" \
  --body "Capture a short clip (5–10 seconds) of the canvas and download it as a GIF or MP4. Could use the Canvas Capture API or a JS encoder like gif.js."

gh issue create --repo "$REPO" --label "enhancement" \
  --title "Embed / iframe snippet in share modal" \
  --body "Add an iframe embed code to the share modal alongside the existing share code, so users can embed a specific simulation state directly into a webpage."

gh issue create --repo "$REPO" --label "enhancement,mobile" \
  --title "Improve mobile touch controls" \
  --body "Current pinch-to-zoom works but dragging to spawn on touch is inconsistent. Goals: reliable single-finger spawn drag, two-finger pan, pinch zoom — all without conflicts."

gh issue create --repo "$REPO" --label "enhancement" \
  --title "Keyboard shortcuts panel" \
  --body "A discoverable shortcuts overlay (press \`?\` to open) listing all keyboard shortcuts. Proposed shortcuts: \`Space\` pause/play, \`C\` clear, \`R\` reset camera, \`F\` follow selected, \`V\` vectors, \`Ctrl+Z\` undo."

gh issue create --repo "$REPO" --label "enhancement,performance" \
  --title "Auto-cull distant low-mass bodies when count exceeds threshold" \
  --body "When body count exceeds a configurable threshold (e.g. 300), automatically remove the smallest/most-distant bodies with a visual warning. Prevents the simulation from becoming unresponsive during long sessions."

gh issue create --repo "$REPO" --label "enhancement,visual" \
  --title "Soft-body tidal disruption effect near black holes" \
  --body "When a small body passes within the Roche limit of a black hole or neutron star, stretch its trail and visually elongate it before it's absorbed, simulating a tidal disruption event."

echo "All issues created."
