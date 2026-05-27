export type BodyType = 'moon' | 'planet' | 'star' | 'blackhole'

export interface RGB { r: number; g: number; b: number }

export interface Body {
  x: number; y: number
  vx: number; vy: number
  ax: number; ay: number
  mass: number; r: number
  color: string; rgb: RGB
  type: BodyType
  trail: number[]
}

export interface Camera { x: number; y: number; zoom: number }

export interface Star {
  x: number; y: number
  p: number; r: number; a: number
  col: string; tw: number; ph: number
}

export interface SerializedState {
  v: number
  g: number
  sp: number
  t: number
  m: number
  ct: BodyType
  cam: [number, number, number]
  sf: 0 | 1
  ve: 0 | 1
  bh: 0 | 1
  b: [number, number, number, number, number, string, BodyType][]
}
