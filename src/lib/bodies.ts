import type { Body, BodyType, Camera, PresetConfig } from './types'
import { hexToRgb } from './physics'

export const bodyTypes: Record<BodyType, { mass: number; palette: string[] }> = {
  // Small bodies
  moon:          { mass: 4,    palette: ['#D8D5C8', '#B0B8C0', '#E0CFB8', '#C8C0AC', '#A8ACB0'] },
  asteroid:      { mass: 2,    palette: ['#807060', '#706050', '#908070', '#807868', '#706858'] },
  comet:         { mass: 3,    palette: ['#C8E8FF', '#D0EEFF', '#B8D8FF', '#A0C8F0', '#E0F0FF'] },
  // Planets
  rocky:         { mass: 12,   palette: ['#A07860', '#907050', '#B08870', '#C09070', '#806050'] },
  planet:        { mass: 30,   palette: ['#5CB8FF', '#5CFFD2', '#FFEC8A', '#9CFF7A', '#C97BFF', '#FF8E5C', '#FF5C7A'] },
  ocean:         { mass: 22,   palette: ['#1878D8', '#0A60C0', '#2888E8', '#1070D0', '#0A68D0'] },
  lava:          { mass: 15,   palette: ['#FF4010', '#E03008', '#FF6020', '#CC2808', '#FF5018'] },
  'ice-giant':   { mass: 80,   palette: ['#70C0D8', '#60B0CC', '#80D0E8', '#50A0C0', '#90D8F0'] },
  'gas-giant':   { mass: 150,  palette: ['#E8C080', '#D0A060', '#C89050', '#E0B878', '#D8C090'] },
  // Stars
  'red-dwarf':   { mass: 120,  palette: ['#FF4020', '#FF5030', '#E03010', '#FF6040', '#CC3010'] },
  star:          { mass: 280,  palette: ['#FFD27A', '#FFEC8A', '#FFFFFF', '#FFAA60', '#90BBFF', '#FFC458'] },
  'red-giant':   { mass: 400,  palette: ['#FF7020', '#FF8030', '#E06010', '#FF9040', '#FF6010'] },
  'blue-giant':  { mass: 550,  palette: ['#80C0FF', '#90D0FF', '#A0E0FF', '#70B0FF', '#B0E8FF'] },
  'white-dwarf': { mass: 220,  palette: ['#F0F0FF', '#FFFFFF', '#E8E8FF', '#D8D8F8', '#F8F8FF'] },
  // Compact
  neutron:       { mass: 900,  palette: ['#CCEEFF', '#DDEEFF', '#BBDDFF', '#AACCFF', '#EEEEFF'] },
  blackhole:     { mass: 1500, palette: ['#1a0a14'] },
}

export const uiPalette = [
  '#FFD27A', '#FF8E5C', '#FF5C7A', '#C97BFF', '#5CB8FF',
  '#5CFFD2', '#FFEC8A', '#9CFF7A', '#FFFFFF', '#90BBFF', '#D8D5C8', '#1a0a14',
]

export function makeBody(
  x: number, y: number, vx: number, vy: number,
  mass: number, color: string | null, type: BodyType = 'planet',
): Body {
  const palette = bodyTypes[type]?.palette ?? bodyTypes.planet.palette
  const c = color ?? palette[Math.floor(Math.random() * palette.length)]
  return { x, y, vx, vy, ax: 0, ay: 0, mass, r: Math.cbrt(mass) * 1.7 + 1.3, color: c, rgb: hexToRgb(c), type, trail: [] }
}

// Per-preset recommended settings
const PRESET_CONFIGS: Record<string, PresetConfig> = {
  solar:     { gravity: 1.0,  timeScale: 1.0,  zoom: 0.85, trailMax: 850  },
  binary:    { gravity: 1.0,  timeScale: 1.0,  zoom: 0.9,  trailMax: 850  },
  chaos:     { gravity: 1.0,  timeScale: 0.7,  zoom: 1.0,  trailMax: 1200 },
  cluster:   { gravity: 0.8,  timeScale: 0.6,  zoom: 1.2,  trailMax: 600  },
  galaxy:    { gravity: 1.0,  timeScale: 1.5,  zoom: 0.55, trailMax: 1200 },
  trappist:  { gravity: 1.0,  timeScale: 0.45, zoom: 1.6,  trailMax: 800  },
  figure8:   { gravity: 1.0,  timeScale: 0.8,  zoom: 1.2,  trailMax: 1400 },
  collision: { gravity: 0.8,  timeScale: 0.5,  zoom: 0.45, trailMax: 1200 },
  asteroid:  { gravity: 1.0,  timeScale: 1.2,  zoom: 0.58, trailMax: 700  },
  pulsar:    { gravity: 1.5,  timeScale: 0.35, zoom: 0.75, trailMax: 1000 },
  rogue:     { gravity: 1.0,  timeScale: 0.75, zoom: 0.8,  trailMax: 1100 },
}

export function applyPreset(name: string, bodies: Body[], W: number, H: number, cam: Camera): PresetConfig {
  bodies.length = 0
  const cfg = PRESET_CONFIGS[name] ?? PRESET_CONFIGS.solar
  const G = cfg.gravity
  const cx = W / 2, cy = H / 2

  // Center the viewport on (cx, cy) at the requested zoom
  cam.zoom = cfg.zoom
  cam.x = cx * (1 - 1 / cfg.zoom)
  cam.y = cy * (1 - 1 / cfg.zoom)

  if (name === 'solar') {
    bodies.push(makeBody(cx, cy, 0, 0, 400, '#FFD27A', 'star'))
    for (const r of [55, 88, 125, 170, 220, 275]) {
      const ang = Math.random() * Math.PI * 2
      const v = Math.sqrt(G * 400 / r)
      bodies.push(makeBody(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, -Math.sin(ang) * v, Math.cos(ang) * v, 3 + Math.random() * 8, null, 'planet'))
    }

  } else if (name === 'binary') {
    const M = 220, sep = 55
    const v = Math.sqrt(G * M / (4 * sep))
    bodies.push(makeBody(cx - sep, cy, 0, -v, M, '#FF8E5C', 'star'))
    bodies.push(makeBody(cx + sep, cy, 0, v, M, '#5CB8FF', 'star'))
    for (let i = 0; i < 4; i++) {
      const r = 160 + i * 30, ang = Math.random() * Math.PI * 2
      const vp = Math.sqrt(G * (2 * M) / r) * 0.95
      bodies.push(makeBody(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, -Math.sin(ang) * vp, Math.cos(ang) * vp, 2 + Math.random() * 3, null, 'planet'))
    }

  } else if (name === 'chaos') {
    const M = 90
    bodies.push(makeBody(cx, cy - 70, 1.0, 0, M, '#FF5C7A', 'star'))
    bodies.push(makeBody(cx - 75, cy + 45, -0.5, -0.9, M, '#5CB8FF', 'star'))
    bodies.push(makeBody(cx + 75, cy + 45, -0.5, 0.9, M, '#FFEC8A', 'star'))

  } else if (name === 'cluster') {
    for (let i = 0; i < 26; i++) {
      const r = Math.random() * 110, a = Math.random() * Math.PI * 2
      bodies.push(makeBody(cx + Math.cos(a) * r, cy + Math.sin(a) * r, -Math.sin(a) * 0.35, Math.cos(a) * 0.35, 6 + Math.random() * 12, null, 'planet'))
    }

  } else if (name === 'galaxy') {
    bodies.push(makeBody(cx, cy, 0, 0, 1800, '#1a0a14', 'blackhole'))
    for (let i = 0; i < 240; i++) {
      const r = 28 + Math.pow(Math.random(), 0.55) * 230
      const ang = Math.random() * Math.PI * 2
      const v = Math.sqrt(G * 1800 / r) * (0.92 + Math.random() * 0.12)
      const type: BodyType = Math.random() < 0.15 ? 'star' : 'planet'
      bodies.push(makeBody(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, -Math.sin(ang) * v, Math.cos(ang) * v, 0.8 + Math.random() * 2.2, null, type))
    }

  } else if (name === 'trappist') {
    // TRAPPIST-1: ultracool red dwarf with 7 tightly packed planets
    bodies.push(makeBody(cx, cy, 0, 0, 120, '#FF5030', 'red-dwarf'))
    const radii = [35, 45, 57, 71, 88, 106, 130]
    const colors = ['#FF9060', '#FFB040', '#70B0FF', '#50D0FF', '#90FF80', '#80C0FF', '#B0B0C0']
    for (let i = 0; i < radii.length; i++) {
      const r = radii[i], ang = Math.random() * Math.PI * 2
      const v = Math.sqrt(G * 120 / r)
      bodies.push(makeBody(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, -Math.sin(ang) * v, Math.cos(ang) * v, 1.5 + Math.random() * 2, colors[i], 'rocky'))
    }

  } else if (name === 'figure8') {
    // Figure-8 three-body choreography (Chenciner & Montgomery 2000)
    // m = 130/G ensures orbit shape and period are independent of the G slider
    const m8 = 130 / G
    const kv = Math.sqrt(1.3)  // ≈ 1.140
    bodies.push(makeBody(cx + 97.0, cy - 24.3,  0.46620368 * kv,  0.43236573 * kv, m8, '#FF8E5C', 'star'))
    bodies.push(makeBody(cx - 97.0, cy + 24.3,  0.46620368 * kv,  0.43236573 * kv, m8, '#5CB8FF', 'star'))
    bodies.push(makeBody(cx,        cy,         -0.93240737 * kv, -0.86473146 * kv, m8, '#FFEC8A', 'star'))

  } else if (name === 'collision') {
    // Two galaxies on a collision course
    const bhM = 800, sep = 155, drift = 1.0, count = 70
    const pairs: [number, number, number][] = [[cx - sep, cy, drift], [cx + sep, cy, -drift]]
    for (const [gx, gy, dvx] of pairs) {
      bodies.push(makeBody(gx, gy, dvx, 0, bhM, '#1a0a14', 'blackhole'))
      for (let i = 0; i < count; i++) {
        const r = 18 + Math.pow(Math.random(), 0.55) * 110
        const ang = Math.random() * Math.PI * 2
        const ov = Math.sqrt(G * bhM / r) * (0.9 + Math.random() * 0.15)
        const type: BodyType = Math.random() < 0.18 ? 'star' : 'planet'
        bodies.push(makeBody(gx + Math.cos(ang) * r, gy + Math.sin(ang) * r,
          dvx - Math.sin(ang) * ov, Math.cos(ang) * ov, 0.7 + Math.random() * 1.8, null, type))
      }
    }

  } else if (name === 'asteroid') {
    // Solar system with asteroid belt and outer gas giants
    bodies.push(makeBody(cx, cy, 0, 0, 380, '#FFD27A', 'star'))
    const inner: [number, number][] = [[50, 3], [80, 5], [120, 4], [165, 7]]
    for (const [r, m] of inner) {
      const ang = Math.random() * Math.PI * 2, v = Math.sqrt(G * 380 / r)
      bodies.push(makeBody(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, -Math.sin(ang) * v, Math.cos(ang) * v, m, null, 'rocky'))
    }
    for (let i = 0; i < 45; i++) {
      const r = 210 + Math.random() * 55, ang = Math.random() * Math.PI * 2
      const v = Math.sqrt(G * 380 / r) * (0.97 + Math.random() * 0.05)
      bodies.push(makeBody(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, -Math.sin(ang) * v, Math.cos(ang) * v, 0.8 + Math.random() * 0.6, null, 'asteroid'))
    }
    const outer: [number, number][] = [[310, 45], [390, 38]]
    for (const [r, m] of outer) {
      const ang = Math.random() * Math.PI * 2, v = Math.sqrt(G * 380 / r)
      bodies.push(makeBody(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, -Math.sin(ang) * v, Math.cos(ang) * v, m, null, 'gas-giant'))
    }

  } else if (name === 'pulsar') {
    // Neutron star with tight planetary orbits and a debris disk
    bodies.push(makeBody(cx, cy, 0, 0, 1100, '#DDEEFF', 'neutron'))
    const planets: [number, number][] = [[28, 3], [42, 5], [60, 4]]
    for (const [r, m] of planets) {
      const ang = Math.random() * Math.PI * 2, v = Math.sqrt(G * 1100 / r)
      bodies.push(makeBody(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, -Math.sin(ang) * v, Math.cos(ang) * v, m, null, 'rocky'))
    }
    for (let i = 0; i < 80; i++) {
      const r = 90 + Math.pow(Math.random(), 0.45) * 200, ang = Math.random() * Math.PI * 2
      const v = Math.sqrt(G * 1100 / r) * (0.93 + Math.random() * 0.1)
      bodies.push(makeBody(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, -Math.sin(ang) * v, Math.cos(ang) * v, 0.6 + Math.random() * 0.8, null, 'asteroid'))
    }

  } else if (name === 'rogue') {
    // Stable solar system disrupted by a rogue star on a hyperbolic flyby
    bodies.push(makeBody(cx, cy, 0, 0, 350, '#FFD27A', 'star'))
    for (const r of [55, 90, 130, 175, 225]) {
      const ang = Math.random() * Math.PI * 2, v = Math.sqrt(G * 350 / r)
      bodies.push(makeBody(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, -Math.sin(ang) * v, Math.cos(ang) * v, 4 + Math.random() * 8, null, 'planet'))
    }
    const d = Math.min(W, H) * 0.42
    bodies.push(makeBody(cx + d, cy - d, -2.1, 2.1, 260, '#FF5C7A', 'red-giant'))
  }

  return cfg
}
