import { useState } from 'react'
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

const PRESET_GROUPS = [
  { label: 'Classic Systems', items: [
    ['solar',     'Solar System'],
    ['binary',    'Binary Stars'],
    ['chaos',     'Three-Body Chaos'],
    ['cluster',   'Star Cluster'],
    ['galaxy',    'Galaxy'],
  ]},
  { label: 'Famous Systems', items: [
    ['trappist',  'TRAPPIST-1'],
    ['asteroid',  'Asteroid Belt'],
  ]},
  { label: 'Special Orbits', items: [
    ['figure8',   'Figure-8 Choreography'],
  ]},
  { label: 'Collisions & Events', items: [
    ['collision', 'Galaxy Collision'],
    ['rogue',     'Rogue Star Flyby'],
  ]},
  { label: 'Compact Objects', items: [
    ['pulsar',    'Pulsar System'],
  ]},
] as const

const BODY_GROUPS = [
  { label: 'Small Bodies', items: [
    ['moon',        'Moon'],
    ['asteroid',    'Asteroid'],
    ['comet',       'Comet'],
  ]},
  { label: 'Planets', items: [
    ['rocky',       'Rocky Planet'],
    ['planet',      'Terrestrial Planet'],
    ['ocean',       'Ocean World'],
    ['lava',        'Lava World'],
    ['ice-giant',   'Ice Giant'],
    ['gas-giant',   'Gas Giant'],
  ]},
  { label: 'Stars', items: [
    ['red-dwarf',   'Red Dwarf  (M-type)'],
    ['star',        'Yellow Dwarf  (Sun-like)'],
    ['red-giant',   'Red Giant'],
    ['blue-giant',  'Blue Giant  (O/B-type)'],
    ['white-dwarf', 'White Dwarf'],
  ]},
  { label: 'Compact Objects', items: [
    ['neutron',     'Neutron Star'],
    ['blackhole',   'Black Hole'],
  ]},
] as const

export function Controls(props: Props) {
  const { paused, starfieldOn, vectorsOn, barnesHutOn, currentType } = props
  const { timeScale, gravity, trailMax, nextMass } = props

  const [selectedPreset, setSelectedPreset] = useState('solar')

  function trailDisplay(v: number) {
    return String(Math.round(50 + (v / 100) * 1450))
  }

  function handlePresetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    setSelectedPreset(val)
    props.loadPreset(val)
  }

  function handleBodyTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    props.setCurrentType(e.target.value as BodyType)
  }

  return (
    <div className="gv-controls">

      {/* ── Playback ── */}
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

      <hr className="gv-sep" />

      {/* ── Preset Scenarios ── */}
      <div className="gv-sec-head">scenario</div>
      <div className="gv-row">
        <select className="gv-select" value={selectedPreset} onChange={handlePresetChange}>
          {PRESET_GROUPS.map(group => (
            <optgroup key={group.label} label={group.label}>
              {group.items.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <hr className="gv-sep" />

      {/* ── Spawn Body ── */}
      <div className="gv-sec-head">spawn</div>
      <div className="gv-row">
        <select className="gv-select" value={currentType} onChange={handleBodyTypeChange}>
          {BODY_GROUPS.map(group => (
            <optgroup key={group.label} label={group.label}>
              {group.items.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <SliderRow label="mass" id="gv-mass" min={2} max={2000} step={1}
        value={nextMass} display={String(nextMass)}
        onChange={props.setNextMass} />

      <hr className="gv-sep" />

      {/* ── Physics ── */}
      <div className="gv-sec-head">physics</div>

      <SliderRow label="gravity" id="gv-g" min={10} max={400} step={5}
        value={Math.round(gravity * 100)} display={gravity.toFixed(2)}
        onChange={v => props.setGravity(v / 100)} />

      <SliderRow label="speed" id="gv-speed" min={0} max={4} step={0.05}
        value={timeScale} display={timeScale.toFixed(2) + '×'}
        onChange={props.setTimeScale} />

      <SliderRow label="trail" id="gv-trail" min={0} max={100} step={1}
        value={Math.round((trailMax - 50) / 14.5)} display={trailDisplay(Math.round((trailMax - 50) / 14.5))}
        onChange={v => props.setTrailMax(Math.round(50 + (v / 100) * 1450))} />

    </div>
  )
}
