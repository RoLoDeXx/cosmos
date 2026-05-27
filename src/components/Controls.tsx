import type { SimControls } from '../hooks/useSimulation'
import type { BodyType } from '../lib/types'

type Props = Pick<SimControls,
  | 'paused' | 'starfieldOn' | 'vectorsOn' | 'barnesHutOn' | 'currentType'
  | 'timeScale' | 'gravity' | 'trailMax' | 'nextMass'
  | 'togglePause' | 'toggleStarfield' | 'toggleVectors' | 'toggleBarnesHut'
  | 'setTimeScale' | 'setGravity' | 'setTrailMax' | 'setNextMass' | 'setCurrentType'
  | 'clearBodies' | 'resetCamera' | 'loadPreset' | 'getShareCode' | 'showToast'
> & { onShareOpen: () => void }

function SliderRow({ label, id, min, max, step, value, display, onChange }: {
  label: string; id: string; min: number; max: number; step: number
  value: number; display: string; onChange: (v: number) => void
}) {
  return (
    <div className="gv-row">
      <label htmlFor={id}>{label}</label>
      <input type="range" id={id} min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)} />
      <span className="gv-out">{display}</span>
    </div>
  )
}

const PRESETS = ['solar', 'binary', 'three-body', 'cluster', 'galaxy'] as const
const PRESET_KEYS: Record<string, string> = { 'three-body': 'chaos' }
const TYPES: BodyType[] = ['moon', 'planet', 'star', 'blackhole']

export function Controls(props: Props) {
  const { paused, starfieldOn, vectorsOn, barnesHutOn, currentType } = props
  const { timeScale, gravity, trailMax, nextMass } = props

  function trailDisplay(v: number) {
    return String(Math.round(50 + (v / 100) * 1450))
  }

  return (
    <div className="gv-controls">
      {/* Action buttons */}
      <div className="gv-row">
        <div className="gv-actions">
          <button onClick={props.togglePause} title="pause/play">
            {paused ? (
              <><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 4v16l13-8z" /></svg>play</>
            ) : (
              <><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>pause</>
            )}
          </button>
          <button onClick={props.clearBodies} title="clear all bodies">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>clear
          </button>
          <button onClick={props.resetCamera} title="reset camera">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /></svg>reset
          </button>
          <button onClick={props.toggleStarfield} className={starfieldOn ? '' : 'gv-off'} title="toggle starfield">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" /></svg>stars
          </button>
          <button onClick={props.toggleVectors} className={vectorsOn ? '' : 'gv-off'} title="toggle velocity vectors">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M9 7h8v8" /></svg>vectors
          </button>
          <button onClick={props.toggleBarnesHut} className={barnesHutOn ? '' : 'gv-off'} title="toggle Barnes-Hut solver">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="2" /><circle cx="6" cy="14" r="2" /><circle cx="18" cy="14" r="2" />
              <circle cx="9" cy="20" r="2" /><path d="M12 7l-6 5M12 7l6 5M7 16l1 2" /></svg>bh
          </button>
          <button onClick={props.onShareOpen} title="share configuration">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" />
              <path d="M8 11l8-4M8 13l8 4" /></svg>share
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="gv-row">
        <div className="gv-presets">
          {PRESETS.map(p => (
            <button key={p} onClick={() => props.loadPreset(PRESET_KEYS[p] ?? p)}>{p}</button>
          ))}
        </div>
      </div>

      {/* Spawn type */}
      <div className="gv-row">
        <label>spawn</label>
        <div className="gv-types">
          {TYPES.map(t => (
            <button key={t} className={currentType === t ? '' : 'gv-dim'}
              onClick={() => props.setCurrentType(t)}>{t.replace('blackhole', 'black hole')}</button>
          ))}
        </div>
      </div>

      <SliderRow label="gravity" id="gv-g" min={10} max={400} step={5}
        value={Math.round(gravity * 100)} display={gravity.toFixed(2)}
        onChange={v => props.setGravity(v / 100)} />

      <SliderRow label="speed" id="gv-speed" min={0} max={4} step={0.05}
        value={timeScale} display={timeScale.toFixed(2) + '×'}
        onChange={props.setTimeScale} />

      <SliderRow label="trail" id="gv-trail" min={0} max={100} step={1}
        value={Math.round((trailMax - 50) / 14.5)} display={trailDisplay(Math.round((trailMax - 50) / 14.5))}
        onChange={v => props.setTrailMax(Math.round(50 + (v / 100) * 1450))} />

      <SliderRow label="mass" id="gv-mass" min={2} max={2000} step={1}
        value={nextMass} display={String(nextMass)}
        onChange={props.setNextMass} />
    </div>
  )
}
