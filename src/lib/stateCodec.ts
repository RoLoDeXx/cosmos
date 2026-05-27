import type { Body, BodyType, Camera, SerializedState } from './types'
import { makeBody } from './bodies'

export function encodeState(
  bodies: Body[], cam: Camera,
  G: number, timeScale: number, trailMax: number, nextMass: number,
  currentType: BodyType, starfieldOn: boolean, vectorsOn: boolean, barnesHutOn: boolean,
): string {
  const state: SerializedState = {
    v: 2, g: +G.toFixed(3), sp: +timeScale.toFixed(3),
    t: trailMax, m: nextMass, ct: currentType,
    cam: [Math.round(cam.x), Math.round(cam.y), +cam.zoom.toFixed(3)],
    sf: starfieldOn ? 1 : 0, ve: vectorsOn ? 1 : 0, bh: barnesHutOn ? 1 : 0,
    b: bodies.map(b => [
      Math.round(b.x * 10) / 10, Math.round(b.y * 10) / 10,
      Math.round(b.vx * 1000) / 1000, Math.round(b.vy * 1000) / 1000,
      Math.round(b.mass * 10) / 10, b.color, b.type,
    ]),
  }
  return btoa(JSON.stringify(state))
}

export interface DecodedAppState {
  G: number; timeScale: number; trailMax: number; nextMass: number
  currentType: BodyType; starfieldOn: boolean; vectorsOn: boolean; barnesHutOn: boolean
}

export function decodeAndApply(code: string, bodies: Body[], cam: Camera): DecodedAppState {
  const state = JSON.parse(atob(code)) as SerializedState
  if (!state || (state.v !== 1 && state.v !== 2)) throw new Error('invalid')
  cam.x = state.cam[0]; cam.y = state.cam[1]; cam.zoom = state.cam[2]
  bodies.length = 0
  for (const arr of state.b)
    bodies.push(makeBody(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6] ?? 'planet'))
  return {
    G: state.g, timeScale: state.sp ?? 1, trailMax: state.t,
    nextMass: state.m, currentType: state.ct,
    starfieldOn: !!state.sf, vectorsOn: !!state.ve, barnesHutOn: !!state.bh,
  }
}
