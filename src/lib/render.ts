import type { Body, Camera, Lens, Star } from './types'
import { drawStarfield } from './stars'

const LENS_MIN_MASS = 100  // minimum mass to produce a visible lens

function collectLenses(bodies: Body[], cam: Camera): Lens[] {
  const lenses: Lens[] = []
  for (const b of bodies) {
    if (b.mass < LENS_MIN_MASS) continue
    const sx = (b.x - cam.x) * cam.zoom
    const sy = (b.y - cam.y) * cam.zoom
    // Einstein radius scales as mass^0.4 so heavy objects dominate dramatically
    const Re = Math.pow(b.mass, 0.4) * 4.5 * cam.zoom
    const Re2 = Re * Re
    lenses.push({ sx, sy, Re, Re2, outerCutoff2: Re2 * 9, mass: b.mass })
  }
  return lenses
}

function drawLensRings(ctx: CanvasRenderingContext2D, lenses: Lens[]) {
  for (const { sx, sy, Re, mass } of lenses) {
    const t = Math.min(1, mass / 1500)  // 0–1 intensity scale

    // Gravitational shadow — darkens the region inside the Einstein radius
    const shadow = ctx.createRadialGradient(sx, sy, 0, sx, sy, Re * 0.95)
    shadow.addColorStop(0,   `rgba(0,0,8,${(t * 0.80).toFixed(3)})`)
    shadow.addColorStop(0.6, `rgba(0,0,8,${(t * 0.45).toFixed(3)})`)
    shadow.addColorStop(1,   'rgba(0,0,8,0)')
    ctx.fillStyle = shadow
    ctx.beginPath(); ctx.arc(sx, sy, Re * 0.95, 0, Math.PI * 2); ctx.fill()

    // Einstein ring — golden glow at the lensing radius
    const ring = ctx.createRadialGradient(sx, sy, Re * 0.72, sx, sy, Re * 1.28)
    ring.addColorStop(0,    'rgba(255,195,70,0)')
    ring.addColorStop(0.35, `rgba(255,215,100,${(t * 0.60).toFixed(3)})`)
    ring.addColorStop(0.55, `rgba(255,240,170,${(t * 0.40).toFixed(3)})`)
    ring.addColorStop(1,    'rgba(255,195,70,0)')
    ctx.fillStyle = ring
    ctx.beginPath(); ctx.arc(sx, sy, Re * 1.28, 0, Math.PI * 2); ctx.fill()

    // Outer spacetime-distortion halo — only for heavy objects (stars+)
    if (mass >= 250) {
      const halo = ctx.createRadialGradient(sx, sy, Re * 1.2, sx, sy, Re * 2.8)
      halo.addColorStop(0, `rgba(160,120,255,${(t * 0.13).toFixed(3)})`)
      halo.addColorStop(1, 'rgba(160,120,255,0)')
      ctx.fillStyle = halo
      ctx.beginPath(); ctx.arc(sx, sy, Re * 2.8, 0, Math.PI * 2); ctx.fill()
    }
  }
}

export function drawTrail(ctx: CanvasRenderingContext2D, b: Body, cam: Camera) {
  const t = b.trail
  const points = t.length >> 1
  if (points < 3) return
  const bands = 8
  const perBand = Math.ceil(points / bands)
  const c = b.rgb
  ctx.lineWidth = 1.3 / cam.zoom
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let band = 0; band < bands; band++) {
    const s = band * perBand
    const e = Math.min((band + 1) * perBand, points - 1)
    if (e - s < 1) continue
    const alpha = ((band + 1) / bands) * 0.75
    ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha.toFixed(3)})`
    ctx.beginPath()
    ctx.moveTo(t[s * 2], t[s * 2 + 1])
    for (let k = s + 1; k <= e; k++) ctx.lineTo(t[k * 2], t[k * 2 + 1])
    ctx.stroke()
  }
}

const STAR_LIKE = new Set(['star', 'red-dwarf', 'blue-giant', 'red-giant', 'white-dwarf', 'neutron'])

export function drawBody(ctx: CanvasRenderingContext2D, b: Body) {
  if (b.type === 'blackhole') {
    const r2 = b.r * 2.7
    const gr = ctx.createRadialGradient(b.x, b.y, b.r * 0.7, b.x, b.y, r2)
    gr.addColorStop(0, '#FFC080')
    gr.addColorStop(0.25, '#FF6020')
    gr.addColorStop(0.6, '#801008')
    gr.addColorStop(1, 'rgba(40,0,0,0)')
    ctx.fillStyle = gr
    ctx.beginPath(); ctx.arc(b.x, b.y, r2, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#06030a'
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.88, 0, Math.PI * 2); ctx.fill()
    return
  }
  const isStarLike = STAR_LIKE.has(b.type)
  const glowMult = isStarLike ? 2.9 : 2.2
  const r2 = b.r * glowMult
  const gr = ctx.createRadialGradient(b.x, b.y, b.r * 0.4, b.x, b.y, r2)
  gr.addColorStop(0, b.color)
  gr.addColorStop(0.5, b.color + (isStarLike ? '78' : '60'))
  gr.addColorStop(1, b.color + '00')
  ctx.fillStyle = gr
  ctx.beginPath(); ctx.arc(b.x, b.y, r2, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = b.color
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill()
}

function drawVectors(ctx: CanvasRenderingContext2D, bodies: Body[], cam: Camera) {
  const scale = 7
  ctx.lineWidth = 1.1 / cam.zoom
  ctx.strokeStyle = 'rgba(255,255,255,0.78)'
  const head = 4 / cam.zoom
  for (const b of bodies) {
    const tx = b.x + b.vx * scale, ty = b.y + b.vy * scale
    const dx = tx - b.x, dy = ty - b.y
    if (dx * dx + dy * dy < 1) continue
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tx, ty); ctx.stroke()
    const ang = Math.atan2(dy, dx)
    ctx.beginPath()
    ctx.moveTo(tx, ty); ctx.lineTo(tx - Math.cos(ang - 0.45) * head, ty - Math.sin(ang - 0.45) * head)
    ctx.moveTo(tx, ty); ctx.lineTo(tx - Math.cos(ang + 0.45) * head, ty - Math.sin(ang + 0.45) * head)
    ctx.stroke()
  }
}

function drawSelectionRing(ctx: CanvasRenderingContext2D, body: Body, cam: Camera, now: number) {
  const r = body.r * 2.6
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'
  ctx.lineWidth = 1.5 / cam.zoom
  ctx.setLineDash([5 / cam.zoom, 4 / cam.zoom])
  ctx.lineDashOffset = -(now * 0.02) % 16
  ctx.beginPath(); ctx.arc(body.x, body.y, r, 0, Math.PI * 2); ctx.stroke()
  ctx.setLineDash([]); ctx.lineDashOffset = 0
}

function drawDragArrow(
  ctx: CanvasRenderingContext2D,
  dragStart: { x: number; y: number },
  dragCurrent: { x: number; y: number },
  nextMass: number,
  cam: Camera,
) {
  const dx = dragCurrent.x - dragStart.x, dy = dragCurrent.y - dragStart.y
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth = 1.2 / cam.zoom
  ctx.setLineDash([5 / cam.zoom, 5 / cam.zoom])
  ctx.beginPath(); ctx.moveTo(dragStart.x, dragStart.y); ctx.lineTo(dragCurrent.x, dragCurrent.y); ctx.stroke()
  ctx.setLineDash([])
  const r = Math.cbrt(nextMass) * 1.7 + 1.3
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.beginPath(); ctx.arc(dragStart.x, dragStart.y, r, 0, Math.PI * 2); ctx.fill()
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len * cam.zoom > 4) {
    const ang = Math.atan2(-dy, -dx)
    const tipx = dragStart.x - dx, tipy = dragStart.y - dy
    const tipLen = 8 / cam.zoom
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.lineWidth = 1.4 / cam.zoom
    ctx.beginPath()
    ctx.moveTo(tipx, tipy); ctx.lineTo(tipx - Math.cos(ang - 0.4) * tipLen, tipy - Math.sin(ang - 0.4) * tipLen)
    ctx.moveTo(tipx, tipy); ctx.lineTo(tipx - Math.cos(ang + 0.4) * tipLen, tipy - Math.sin(ang + 0.4) * tipLen)
    ctx.stroke()
  }
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  bodies: Body[],
  cam: Camera,
  stars: Star[],
  W: number, H: number, dpr: number, now: number,
  starfieldOn: boolean, vectorsOn: boolean,
  editingBody: Body | null,
  dragging: boolean,
  dragStart: { x: number; y: number } | null,
  dragCurrent: { x: number; y: number } | null,
  nextMass: number,
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = '#07070d'
  ctx.fillRect(0, 0, W, H)
  const lenses = collectLenses(bodies, cam)
  if (starfieldOn) drawStarfield(ctx, stars, cam, W, H, now, lenses)
  if (lenses.length > 0) drawLensRings(ctx, lenses)
  const k = cam.zoom * dpr
  ctx.setTransform(k, 0, 0, k, -cam.x * k, -cam.y * k)
  for (const b of bodies) drawTrail(ctx, b, cam)
  for (const b of bodies) drawBody(ctx, b)
  if (vectorsOn) drawVectors(ctx, bodies, cam)
  if (editingBody) drawSelectionRing(ctx, editingBody, cam, now)
  if (dragging && dragStart && dragCurrent)
    drawDragArrow(ctx, dragStart, dragCurrent, nextMass, cam)
}
