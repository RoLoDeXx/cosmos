import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { Body, BodyType, Camera, Star } from '../lib/types'
import { physicsStep, recordTrails, findBodyAt, hexToRgb } from '../lib/physics'
import { makeBody, bodyTypes, applyPreset } from '../lib/bodies'
import { generateStars } from '../lib/stars'
import { renderFrame } from '../lib/render'
import { encodeState, decodeAndApply } from '../lib/stateCodec'

const MIN_ZOOM = 0.15
const MAX_ZOOM = 10

export interface SimControls {
  canvasRef: RefObject<HTMLCanvasElement | null>
  // Toggle state
  paused: boolean
  starfieldOn: boolean
  vectorsOn: boolean
  barnesHutOn: boolean
  // Continuous values
  timeScale: number
  gravity: number
  trailMax: number
  nextMass: number
  currentType: BodyType
  // Display
  hudText: string
  toast: string
  toastVisible: boolean
  // Edit modal
  editingBody: Body | null
  // Actions
  togglePause: () => void
  toggleStarfield: () => void
  toggleVectors: () => void
  toggleBarnesHut: () => void
  setTimeScale: (v: number) => void
  setGravity: (v: number) => void
  setTrailMax: (v: number) => void
  setNextMass: (v: number) => void
  setCurrentType: (t: BodyType) => void
  clearBodies: () => void
  resetCamera: () => void
  loadPreset: (name: string) => void
  applyEdit: (mass: number, vx: number, vy: number, color: string) => void
  deleteEdit: () => void
  closeEdit: () => void
  getShareCode: () => string
  loadCode: (code: string) => void
  showToast: (msg: string) => void
}

function useSyncedState<T>(initial: T): [T, (v: T) => void, RefObject<T>] {
  const [state, setState] = useState<T>(initial)
  const ref = useRef<T>(initial)
  const set = useCallback((v: T) => { ref.current = v; setState(v) }, [])
  return [state, set, ref]
}

export function useSimulation(): SimControls {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Mutable simulation data (never triggers re-renders)
  const bodies = useRef<Body[]>([])
  const cam = useRef<Camera>({ x: 0, y: 0, zoom: 1 })
  const stars = useRef<Star[]>([])
  const W = useRef(0)
  const H = useRef(0)
  const dpr = useRef(window.devicePixelRatio || 1)

  // Drag/pan/touch state
  const dragging = useRef(false)
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const dragCurrent = useRef<{ x: number; y: number } | null>(null)
  const panning = useRef(false)
  const panStart = useRef<{ sx: number; sy: number; camX: number; camY: number } | null>(null)
  const touchMode = useRef<'drag' | 'pinch' | null>(null)
  const touchStartData = useRef<{ cx: number; cy: number; dist: number; zoom: number; worldX: number; worldY: number } | null>(null)

  // editingBodyRef tracks the body reference inside physics (for merge tracking)
  const editingBodyRef = useRef<Body | null>(null)
  const wasPausedBeforeEdit = useRef(false)

  // Animation timing
  const lastTime = useRef(performance.now())
  const frames = useRef(0)
  const lastFps = useRef(performance.now())

  // Synced state (ref + React state)
  const [paused, setPaused, pausedRef] = useSyncedState(false)
  const [starfieldOn, setStarfieldOn, starfieldOnRef] = useSyncedState(true)
  const [vectorsOn, setVectorsOn, vectorsOnRef] = useSyncedState(false)
  const [barnesHutOn, setBarnesHutOn, barnesHutOnRef] = useSyncedState(true)
  const [timeScale, setTimeScale, timeScaleRef] = useSyncedState(1.0)
  const [gravity, setGravity, gravityRef] = useSyncedState(1.0)
  const [trailMax, setTrailMax, trailMaxRef] = useSyncedState(850)
  const [nextMass, setNextMass, nextMassRef] = useSyncedState(30)
  const [currentType, setCurrentType, currentTypeRef] = useSyncedState<BodyType>('planet')

  // UI-only state
  const [editingBody, setEditingBody] = useState<Body | null>(null)
  const [hudText, setHudText] = useState('bodies 0  fps 0  zoom 1.00×  solver bh')
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setToastVisible(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 1700)
  }, [])

  const screenToWorld = useCallback((sx: number, sy: number) => {
    const c = cam.current
    return { x: sx / c.zoom + c.x, y: sy / c.zoom + c.y }
  }, [])

  const localPos = useCallback((e: MouseEvent | TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const t = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : (e as MouseEvent)
    return { x: t.clientX - rect.left, y: t.clientY - rect.top }
  }, [])

  const openEdit = useCallback((idx: number) => {
    const body = bodies.current[idx]
    editingBodyRef.current = body
    wasPausedBeforeEdit.current = pausedRef.current
    setPaused(true)
    setEditingBody(body)
  }, [pausedRef, setPaused])

  const closeEdit = useCallback(() => {
    editingBodyRef.current = null
    setEditingBody(null)
    setPaused(wasPausedBeforeEdit.current)
  }, [setPaused])

  const applyEdit = useCallback((mass: number, vx: number, vy: number, color: string) => {
    const b = editingBodyRef.current
    if (b) {
      b.mass = mass
      b.r = Math.cbrt(mass) * 1.7 + 1.3
      b.vx = vx; b.vy = vy
      b.color = color; b.rgb = hexToRgb(color)
    }
    closeEdit()
  }, [closeEdit])

  const deleteEdit = useCallback(() => {
    const b = editingBodyRef.current
    if (b) {
      const idx = bodies.current.indexOf(b)
      if (idx >= 0) bodies.current.splice(idx, 1)
    }
    closeEdit()
  }, [closeEdit])

  const clearBodies = useCallback(() => { bodies.current.length = 0 }, [])

  const resetCamera = useCallback(() => {
    cam.current.x = 0; cam.current.y = 0; cam.current.zoom = 1
  }, [])

  const loadPreset = useCallback((name: string) => {
    applyPreset(name, bodies.current, gravityRef.current, W.current, H.current, cam.current)
  }, [gravityRef])

  const getShareCode = useCallback(() => {
    return encodeState(
      bodies.current, cam.current,
      gravityRef.current, timeScaleRef.current, trailMaxRef.current,
      nextMassRef.current, currentTypeRef.current,
      starfieldOnRef.current, vectorsOnRef.current, barnesHutOnRef.current,
    )
  }, [gravityRef, timeScaleRef, trailMaxRef, nextMassRef, currentTypeRef, starfieldOnRef, vectorsOnRef, barnesHutOnRef])

  const loadCode = useCallback((code: string) => {
    const decoded = decodeAndApply(code, bodies.current, cam.current)
    setGravity(decoded.G)
    setTimeScale(decoded.timeScale)
    setTrailMax(decoded.trailMax)
    setNextMass(decoded.nextMass)
    setCurrentType(decoded.currentType)
    setStarfieldOn(decoded.starfieldOn)
    setVectorsOn(decoded.vectorsOn)
    setBarnesHutOn(decoded.barnesHutOn)
  }, [setGravity, setTimeScale, setTrailMax, setNextMass, setCurrentType, setStarfieldOn, setVectorsOn, setBarnesHutOn])

  const spawnBody = useCallback((x: number, y: number, vx: number, vy: number) => {
    bodies.current.push(makeBody(x, y, vx, vy, nextMassRef.current, null, currentTypeRef.current))
  }, [nextMassRef, currentTypeRef])

  // Canvas resize
  const resize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    W.current = rect.width
    H.current = rect.height
    canvas.width = rect.width * dpr.current
    canvas.height = rect.height * dpr.current
    stars.current = generateStars(rect.width, rect.height)
  }, [])

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let rafId: number

    function loop(now: number) {
      let dt = (now - lastTime.current) / 16.667
      lastTime.current = now
      if (dt > 2.5) dt = 2.5

      if (!pausedRef.current && timeScaleRef.current > 0) {
        const effDt = dt * timeScaleRef.current
        const maxStep = bodies.current.length > 100 ? 0.7 : 0.5
        const subSteps = Math.min(12, Math.max(1, Math.ceil(effDt / maxStep)))
        const sdt = effDt / subSteps
        for (let s = 0; s < subSteps; s++)
          physicsStep(bodies.current, sdt, gravityRef.current, barnesHutOnRef.current, W.current, H.current, editingBodyRef)
        recordTrails(bodies.current, trailMaxRef.current)
      }

      renderFrame(
        ctx, bodies.current, cam.current, stars.current,
        W.current, H.current, dpr.current, now,
        starfieldOnRef.current, vectorsOnRef.current,
        editingBodyRef.current,
        dragging.current, dragStart.current, dragCurrent.current,
        nextMassRef.current,
      )

      frames.current++
      if (now - lastFps.current > 400) {
        const fps = Math.round(frames.current * 1000 / (now - lastFps.current))
        const solver = barnesHutOnRef.current && bodies.current.length > 8 ? 'bh' : 'n²'
        setHudText(`bodies ${bodies.current.length}  fps ${fps}  zoom ${cam.current.zoom.toFixed(2)}×  solver ${solver}`)
        frames.current = 0
        lastFps.current = now
      }

      rafId = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)

    // Boot from hash or default preset
    setTimeout(() => {
      if (location.hash && location.hash.length > 5) {
        try {
          loadCode(location.hash.slice(1))
        } catch {
          loadPreset('solar')
        }
      } else {
        loadPreset('solar')
      }
    }, 80)

    rafId = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [resize, loadCode, loadPreset, pausedRef, timeScaleRef, gravityRef, barnesHutOnRef, trailMaxRef, starfieldOnRef, vectorsOnRef, nextMassRef])

  // Canvas event handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const p = localPos(e)
      const before = screenToWorld(p.x, p.y)
      const factor = e.deltaY > 0 ? 0.88 : 1.136
      cam.current.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cam.current.zoom * factor))
      cam.current.x = before.x - p.x / cam.current.zoom
      cam.current.y = before.y - p.y / cam.current.zoom
    }

    function onMouseDown(e: MouseEvent) {
      e.preventDefault()
      if (e.button === 1 || e.button === 2) {
        const p = localPos(e)
        const w = screenToWorld(p.x, p.y)
        const idx = findBodyAt(bodies.current, w.x, w.y, cam.current)
        if (idx >= 0) { openEdit(idx); return }
        panning.current = true
        panStart.current = { sx: e.clientX, sy: e.clientY, camX: cam.current.x, camY: cam.current.y }
        canvas!.style.cursor = 'grabbing'
        return
      }
      const p = localPos(e)
      const w = screenToWorld(p.x, p.y)
      dragging.current = true
      dragStart.current = w
      dragCurrent.current = { x: w.x, y: w.y }
    }

    function onMouseMove(e: MouseEvent) {
      if (panning.current && panStart.current) {
        cam.current.x = panStart.current.camX - (e.clientX - panStart.current.sx) / cam.current.zoom
        cam.current.y = panStart.current.camY - (e.clientY - panStart.current.sy) / cam.current.zoom
        return
      }
      if (dragging.current) {
        const p = localPos(e)
        dragCurrent.current = screenToWorld(p.x, p.y)
      }
    }

    function onMouseUp() {
      if (panning.current) {
        panning.current = false; panStart.current = null
        canvas!.style.cursor = 'crosshair'
        return
      }
      if (!dragging.current || !dragStart.current || !dragCurrent.current) return
      spawnBody(
        dragStart.current.x, dragStart.current.y,
        (dragStart.current.x - dragCurrent.current.x) * 0.04,
        (dragStart.current.y - dragCurrent.current.y) * 0.04,
      )
      dragging.current = false; dragStart.current = null
    }

    function onContextMenu(e: Event) { e.preventDefault() }

    function onTouchStart(e: TouchEvent) {
      e.preventDefault()
      if (e.touches.length === 1) {
        const p = localPos(e)
        const w = screenToWorld(p.x, p.y)
        touchMode.current = 'drag'
        dragging.current = true
        dragStart.current = w
        dragCurrent.current = { x: w.x, y: w.y }
      } else if (e.touches.length === 2) {
        dragging.current = false; dragStart.current = null
        touchMode.current = 'pinch'
        const rect = canvas!.getBoundingClientRect()
        const t1 = e.touches[0], t2 = e.touches[1]
        const cxp = (t1.clientX + t2.clientX) / 2 - rect.left
        const cyp = (t1.clientY + t2.clientY) / 2 - rect.top
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
        touchStartData.current = {
          cx: cxp, cy: cyp, dist, zoom: cam.current.zoom,
          worldX: cxp / cam.current.zoom + cam.current.x,
          worldY: cyp / cam.current.zoom + cam.current.y,
        }
      }
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      if (touchMode.current === 'drag' && e.touches.length === 1) {
        const p = localPos(e)
        dragCurrent.current = screenToWorld(p.x, p.y)
      } else if (touchMode.current === 'pinch' && e.touches.length === 2 && touchStartData.current) {
        const rect = canvas!.getBoundingClientRect()
        const t1 = e.touches[0], t2 = e.touches[1]
        const cxp = (t1.clientX + t2.clientX) / 2 - rect.left
        const cyp = (t1.clientY + t2.clientY) / 2 - rect.top
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
        cam.current.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, touchStartData.current.zoom * dist / touchStartData.current.dist))
        cam.current.x = touchStartData.current.worldX - cxp / cam.current.zoom
        cam.current.y = touchStartData.current.worldY - cyp / cam.current.zoom
      }
    }

    function onTouchEnd() {
      if (touchMode.current === 'drag' && dragging.current && dragStart.current && dragCurrent.current) {
        spawnBody(
          dragStart.current.x, dragStart.current.y,
          (dragStart.current.x - dragCurrent.current.x) * 0.04,
          (dragStart.current.y - dragCurrent.current.y) * 0.04,
        )
        dragging.current = false; dragStart.current = null
      }
      touchMode.current = null
    }

    canvas.addEventListener('contextmenu', onContextMenu)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)

    return () => {
      canvas.removeEventListener('contextmenu', onContextMenu)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [localPos, screenToWorld, openEdit, spawnBody])

  return {
    canvasRef,
    paused, starfieldOn, vectorsOn, barnesHutOn,
    timeScale, gravity, trailMax, nextMass, currentType,
    hudText, toast, toastVisible,
    editingBody,
    togglePause: () => setPaused(!pausedRef.current),
    toggleStarfield: () => setStarfieldOn(!starfieldOnRef.current),
    toggleVectors: () => setVectorsOn(!vectorsOnRef.current),
    toggleBarnesHut: () => setBarnesHutOn(!barnesHutOnRef.current),
    setTimeScale, setGravity, setTrailMax, setNextMass,
    setCurrentType: (t: BodyType) => {
      setCurrentType(t)
      setNextMass(bodyTypes[t].mass)
    },
    clearBodies, resetCamera, loadPreset,
    applyEdit, deleteEdit, closeEdit,
    getShareCode, loadCode, showToast,
  }
}
