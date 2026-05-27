import type { Star, Camera } from './types'

const TINTS = ['255,255,255', '255,255,255', '255,255,255', '255,255,255', '200,220,255', '255,225,190']

export function generateStars(W: number, H: number): Star[] {
  const stars: Star[] = []
  const layers = [
    { count: Math.round(W * H * 0.0005), p: 0.04, rMin: 0.4, rMax: 0.7, aMin: 0.25, aMax: 0.5 },
    { count: Math.round(W * H * 0.00025), p: 0.14, rMin: 0.6, rMax: 1.0, aMin: 0.45, aMax: 0.7 },
    { count: Math.round(W * H * 0.0001), p: 0.3, rMin: 0.8, rMax: 1.6, aMin: 0.7, aMax: 1.0 },
  ]
  for (const L of layers) {
    for (let i = 0; i < L.count; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        p: L.p,
        r: L.rMin + Math.random() * (L.rMax - L.rMin),
        a: L.aMin + Math.random() * (L.aMax - L.aMin),
        col: TINTS[Math.floor(Math.random() * TINTS.length)],
        tw: Math.random() < 0.22 ? 0.0008 + Math.random() * 0.0018 : 0,
        ph: Math.random() * Math.PI * 2,
      })
    }
  }
  return stars
}

export function drawStarfield(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  cam: Camera,
  W: number,
  H: number,
  now: number,
) {
  for (const s of stars) {
    let ex = ((s.x - cam.x * s.p) % W + W) % W
    let ey = ((s.y - cam.y * s.p) % H + H) % H
    let alpha = s.a
    if (s.tw) alpha *= 0.6 + 0.4 * Math.sin(now * s.tw + s.ph)
    ctx.fillStyle = `rgba(${s.col},${alpha.toFixed(3)})`
    ctx.beginPath()
    ctx.arc(ex, ey, s.r, 0, Math.PI * 2)
    ctx.fill()
  }
}
