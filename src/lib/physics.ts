import type { Body, BodyType, Camera, RGB } from './types'

const SOFT = 5
const THETA = 0.6

// Mass thresholds for body-type promotion on merge (descending order)
const PROMOTE: [number, BodyType, string][] = [
  [1700, 'blackhole', '#1a0a14'],
  [1100, 'neutron',   '#CCEEFF'],
  [650,  'blue-giant','#90D0FF'],
  [460,  'red-giant', '#FF8030'],
  [320,  'star',      '#FFD27A'],
  [200,  'red-dwarf', '#FF5030'],
]
// Tier rank — only ever promote upward, never downward
const TYPE_TIER: Partial<Record<BodyType, number>> = {
  'red-dwarf': 1, 'star': 2, 'red-giant': 3, 'blue-giant': 4, 'white-dwarf': 3,
  'neutron': 5, 'blackhole': 6,
}
function resolvePromotion(mass: number, currentType: BodyType, currentColor: string): [BodyType, string] {
  const currentTier = TYPE_TIER[currentType] ?? 0
  for (const [threshold, type, color] of PROMOTE) {
    if (mass >= threshold) {
      if ((TYPE_TIER[type] ?? 0) > currentTier) return [type, color]
      break
    }
  }
  return [currentType, currentColor]
}

export function hexToRgb(hex: string): RGB {
  const m = hex.replace('#', '')
  return {
    r: parseInt(m.slice(0, 2), 16),
    g: parseInt(m.slice(2, 4), 16),
    b: parseInt(m.slice(4, 6), 16),
  }
}

class QNode {
  x: number; y: number; size: number
  mass = 0; cx = 0; cy = 0
  body: Body | null = null
  children: QNode[] | null = null
  constructor(x: number, y: number, size: number) {
    this.x = x; this.y = y; this.size = size
  }
}

function qInsert(node: QNode, b: Body, depth: number) {
  if (depth > 16) {
    const nm = node.mass + b.mass
    node.cx = (node.cx * node.mass + b.x * b.mass) / nm
    node.cy = (node.cy * node.mass + b.y * b.mass) / nm
    node.mass = nm
    return
  }
  if (node.mass === 0) {
    node.body = b; node.mass = b.mass; node.cx = b.x; node.cy = b.y
    return
  }
  if (node.body) {
    const old = node.body
    node.body = null
    const h = node.size / 2
    node.children = [
      new QNode(node.x, node.y, h),
      new QNode(node.x + h, node.y, h),
      new QNode(node.x, node.y + h, h),
      new QNode(node.x + h, node.y + h, h),
    ]
    qInsertChild(node, old, depth)
  }
  qInsertChild(node, b, depth)
  const nm = node.mass + b.mass
  node.cx = (node.cx * node.mass + b.x * b.mass) / nm
  node.cy = (node.cy * node.mass + b.y * b.mass) / nm
  node.mass = nm
}

function qInsertChild(node: QNode, b: Body, depth: number) {
  const h = node.size / 2
  const ix = b.x < node.x + h ? 0 : 1
  const iy = b.y < node.y + h ? 0 : 1
  qInsert(node.children![iy * 2 + ix], b, depth + 1)
}

function buildTree(bs: Body[]): QNode {
  let mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity
  for (const b of bs) {
    if (b.x < mnx) mnx = b.x
    if (b.y < mny) mny = b.y
    if (b.x > mxx) mxx = b.x
    if (b.y > mxy) mxy = b.y
  }
  const size = Math.max(mxx - mnx, mxy - mny, 1) + 2
  const ccx = (mnx + mxx) / 2, ccy = (mny + mxy) / 2
  const root = new QNode(ccx - size / 2, ccy - size / 2, size)
  for (const b of bs) qInsert(root, b, 0)
  return root
}

function qForce(node: QNode, b: Body, acc: { x: number; y: number }, G: number) {
  if (node.mass === 0 || node.body === b) return
  const dx = node.cx - b.x, dy = node.cy - b.y
  const d2 = dx * dx + dy * dy + SOFT * SOFT
  if (node.body || node.size * node.size < THETA * THETA * d2) {
    const invD3 = 1 / (Math.sqrt(d2) * d2)
    const f = G * node.mass * invD3
    acc.x += f * dx; acc.y += f * dy
  } else {
    const c = node.children!
    qForce(c[0], b, acc, G); qForce(c[1], b, acc, G)
    qForce(c[2], b, acc, G); qForce(c[3], b, acc, G)
  }
}

export function physicsStep(
  bodies: Body[],
  dt: number,
  G: number,
  barnesHutOn: boolean,
  W: number,
  H: number,
  editingBodyRef: { current: Body | null },
) {
  const n = bodies.length
  if (n === 0) return
  for (let i = 0; i < n; i++) { bodies[i].ax = 0; bodies[i].ay = 0 }

  if (barnesHutOn && n > 8) {
    const tree = buildTree(bodies)
    const acc = { x: 0, y: 0 }
    for (let i = 0; i < n; i++) {
      acc.x = 0; acc.y = 0
      qForce(tree, bodies[i], acc, G)
      bodies[i].ax = acc.x; bodies[i].ay = acc.y
    }
  } else {
    for (let i = 0; i < n; i++) {
      const a = bodies[i]
      for (let j = i + 1; j < n; j++) {
        const b = bodies[j]
        const dx = b.x - a.x, dy = b.y - a.y
        const d2 = dx * dx + dy * dy + SOFT * SOFT
        const invD3 = 1 / (Math.sqrt(d2) * d2)
        const f = G * invD3
        a.ax += f * b.mass * dx; a.ay += f * b.mass * dy
        b.ax -= f * a.mass * dx; b.ay -= f * a.mass * dy
      }
    }
  }

  for (let i = 0; i < n; i++) {
    const b = bodies[i]
    b.vx += b.ax * dt; b.vy += b.ay * dt
    b.x += b.vx * dt; b.y += b.vy * dt
  }

  const pad = 2500
  for (let i = bodies.length - 1; i >= 0; i--) {
    const b = bodies[i]
    if (b.x < -pad || b.x > W + pad || b.y < -pad || b.y > H + pad)
      bodies.splice(i, 1)
  }

  for (let i = bodies.length - 1; i >= 1; i--) {
    const a = bodies[i]
    if (!a) continue
    for (let j = i - 1; j >= 0; j--) {
      const b = bodies[j]
      if (!b) continue
      const dx = b.x - a.x, dy = b.y - a.y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < (a.r + b.r) * 0.7) {
        const m = a.mass + b.mass
        b.vx = (a.vx * a.mass + b.vx * b.mass) / m
        b.vy = (a.vy * a.mass + b.vy * b.mass) / m
        b.x = (a.x * a.mass + b.x * b.mass) / m
        b.y = (a.y * a.mass + b.y * b.mass) / m
        // Winner provides base type/color, then promote if mass crosses a threshold
        const winnerType  = a.mass >= b.mass ? a.type  : b.type
        const winnerColor = a.mass >= b.mass ? a.color : b.color
        const [newType, newColor] = resolvePromotion(m, winnerType, winnerColor)
        b.type = newType; b.color = newColor; b.rgb = hexToRgb(newColor)
        b.mass = m
        b.r = Math.cbrt(m) * 1.7 + 1.3
        if (a.trail.length > b.trail.length) b.trail = a.trail
        if (editingBodyRef.current === a) editingBodyRef.current = b
        bodies.splice(i, 1)
        break
      }
    }
  }
}

export function recordTrails(bodies: Body[], trailMax: number) {
  for (const b of bodies) {
    b.trail.push(b.x, b.y)
    if (b.trail.length / 2 > trailMax)
      b.trail.splice(0, b.trail.length - trailMax * 2)
  }
}

export function findBodyAt(bodies: Body[], wx: number, wy: number, cam: Camera): number {
  for (let i = bodies.length - 1; i >= 0; i--) {
    const b = bodies[i]
    const dx = wx - b.x, dy = wy - b.y
    const hitR = Math.max(b.r * 1.6, 9 / cam.zoom)
    if (dx * dx + dy * dy < hitR * hitR) return i
  }
  return -1
}
