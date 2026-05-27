import type { Lens, Star, Camera } from './types'

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
  lenses: Lens[] = [],
) {
  for (const s of stars) {
    let ex = ((s.x - cam.x * s.p) % W + W) % W
    let ey = ((s.y - cam.y * s.p) % H + H) % H
    let alpha = s.a
    if (s.tw) alpha *= 0.6 + 0.4 * Math.sin(now * s.tw + s.ph)

    // Gravitational lensing: deflect apparent position outward from each lens
    for (const lens of lenses) {
      const dx = ex - lens.sx, dy = ey - lens.sy
      const r2 = dx * dx + dy * dy
      if (r2 < lens.outerCutoff2 && r2 > 1) {
        const r = Math.sqrt(r2)
        // Classic lensing: image pushed outward by Re²/r, capped to avoid divergence
        const defl = Math.min(lens.Re2 / r, lens.Re * 2.5)
        ex += (dx / r) * defl
        ey += (dy / r) * defl
        // Stars inside the Einstein radius are occluded — fade them out
        if (r2 < lens.Re2) {
          alpha *= Math.sqrt(r2 / lens.Re2) * 0.45
        }
      }
    }

    if (alpha <= 0) continue
    ctx.fillStyle = `rgba(${s.col},${alpha.toFixed(3)})`
    ctx.beginPath()
    ctx.arc(ex, ey, s.r, 0, Math.PI * 2)
    ctx.fill()
  }
}
