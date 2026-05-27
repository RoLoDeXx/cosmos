import type { Body, BodyType, Camera } from './types'
import { hexToRgb } from './physics'

export const bodyTypes: Record<BodyType, { mass: number; palette: string[] }> = {
  moon: { mass: 4, palette: ['#D8D5C8', '#B0B8C0', '#E0CFB8', '#C8C0AC', '#A8ACB0'] },
  planet: { mass: 30, palette: ['#5CB8FF', '#5CFFD2', '#FFEC8A', '#9CFF7A', '#C97BFF', '#FF8E5C', '#FF5C7A'] },
  star: { mass: 280, palette: ['#FFD27A', '#FFEC8A', '#FFFFFF', '#FFAA60', '#90BBFF', '#FFC458'] },
  blackhole: { mass: 1500, palette: ['#1a0a14'] },
}

export const uiPalette = [
  '#FFD27A', '#FF8E5C', '#FF5C7A', '#C97BFF', '#5CB8FF',
  '#5CFFD2', '#FFEC8A', '#9CFF7A', '#FFFFFF', '#90BBFF', '#D8D5C8', '#1a0a14',
]

export function makeBody(
  x: number, y: number, vx: number, vy: number,
  mass: number, color: string | null, type: BodyType = 'planet',
): Body {
  const palette = bodyTypes[type].palette
  const c = color ?? palette[Math.floor(Math.random() * palette.length)]
  return { x, y, vx, vy, ax: 0, ay: 0, mass, r: Math.cbrt(mass) * 1.7 + 1.3, color: c, rgb: hexToRgb(c), type, trail: [] }
}

export function applyPreset(name: string, bodies: Body[], G: number, W: number, H: number, cam: Camera) {
  bodies.length = 0
  cam.x = 0; cam.y = 0; cam.zoom = 1
  const cx = W / 2, cy = H / 2

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
  }
}
