import { useState } from 'react'
import type { SimControls } from '../hooks/useSimulation'
import type { BodyType } from '../lib/types'

type BodyPreset = { id: string; label: string; mass: number }

const BODY_PRESETS: Record<BodyType, BodyPreset[]> = {
  moon: [
    { id: 'luna',       label: 'Luna (Earth Moon)',        mass: 4   },
    { id: 'europa',     label: 'Europa-like',              mass: 3   },
    { id: 'titan',      label: 'Titan-like',               mass: 5   },
    { id: 'ganymede',   label: 'Ganymede-like',            mass: 6   },
    { id: 'io',         label: 'Io-like',                  mass: 4   },
  ],
  asteroid: [
    { id: 'ceres',      label: 'Ceres',                    mass: 5   },
    { id: 'vesta',      label: 'Vesta',                    mass: 3   },
    { id: 'ryugu',      label: 'Ryugu',                    mass: 2   },
    { id: 'pallas',     label: 'Pallas',                   mass: 3   },
  ],
  comet: [
    { id: 'halley',     label: "Halley's Comet",           mass: 3   },
    { id: 'hale-bopp',  label: 'Hale-Bopp-like',          mass: 4   },
    { id: 'churyumov',  label: 'Churyumov-Gerasimenko',   mass: 2   },
  ],
  rocky: [
    { id: 'mercury',    label: 'Mercury-like',             mass: 8   },
    { id: 'mars',       label: 'Mars-like',                mass: 10  },
    { id: 'kepler186f', label: 'Kepler-186f',              mass: 12  },
    { id: 'custom',     label: 'Custom Rocky',             mass: 12  },
  ],
  planet: [
    { id: 'earth',      label: 'Earth-like',               mass: 30  },
    { id: 'venus',      label: 'Venus-like',               mass: 28  },
    { id: 'super-earth',label: 'Super-Earth',              mass: 45  },
    { id: 'mini-neptune',label:'Mini-Neptune',             mass: 60  },
  ],
  ocean: [
    { id: 'water-world',label: 'Water World',              mass: 22  },
    { id: 'kepler22b',  label: 'Kepler-22b',               mass: 35  },
    { id: 'ocean-giant',label: 'Ocean Giant',              mass: 50  },
  ],
  lava: [
    { id: 'proto',      label: 'Protoplanet',              mass: 15  },
    { id: '55cnce',     label: '55 Cancri e',              mass: 18  },
    { id: 'lava-giant', label: 'Lava Giant',               mass: 25  },
  ],
  'ice-giant': [
    { id: 'uranus',     label: 'Uranus-like',              mass: 80  },
    { id: 'neptune',    label: 'Neptune-like',             mass: 85  },
    { id: 'mini-ice',   label: 'Mini Ice Giant',           mass: 60  },
  ],
  'gas-giant': [
    { id: 'saturn',     label: 'Saturn-like',              mass: 120 },
    { id: 'jupiter',    label: 'Jupiter-like',             mass: 150 },
    { id: 'hot-jupiter',label: 'Hot Jupiter',              mass: 180 },
    { id: 'super-jup',  label: 'Super Jupiter',            mass: 300 },
  ],
  'red-dwarf': [
    { id: 'proxima',    label: 'Proxima Centauri',         mass: 100 },
    { id: 'trappist1',  label: 'TRAPPIST-1',               mass: 120 },
    { id: 'barnard',    label: "Barnard's Star",           mass: 110 },
  ],
  star: [
    { id: 'sun',        label: 'Sun-like',                 mass: 280 },
    { id: 'alpha-cen',  label: 'Alpha Centauri A',         mass: 300 },
    { id: 'tau-ceti',   label: 'Tau Ceti',                 mass: 250 },
    { id: 'sirius-a',   label: 'Sirius A',                 mass: 350 },
  ],
  'red-giant': [
    { id: 'aldebaran',  label: 'Aldebaran-like',           mass: 380 },
    { id: 'betelgeuse', label: 'Betelgeuse-like',          mass: 450 },
    { id: 'arcturus',   label: 'Arcturus-like',            mass: 400 },
  ],
  'blue-giant': [
    { id: 'rigel',      label: 'Rigel-like',               mass: 500 },
    { id: 'spica',      label: 'Spica-like',               mass: 550 },
    { id: 'deneb',      label: 'Deneb-like',               mass: 600 },
  ],
  'white-dwarf': [
    { id: 'sirius-b',   label: 'Sirius B',                 mass: 200 },
    { id: 'avg-wd',     label: 'Average White Dwarf',      mass: 220 },
    { id: 'massive-wd', label: 'Massive White Dwarf',      mass: 250 },
  ],
  neutron: [
    { id: 'pulsar',     label: 'Typical Pulsar',           mass: 800 },
    { id: 'magnetar',   label: 'Magnetar',                 mass: 950 },
    { id: 'ms-pulsar',  label: 'Millisecond Pulsar',       mass: 900 },
  ],
  blackhole: [
    { id: 'stellar-bh', label: 'Stellar Black Hole',       mass: 1200 },
    { id: 'intermed',   label: 'Intermediate BH',          mass: 1500 },
    { id: 'supermass',  label: 'Supermassive BH',          mass: 2000 },
  ],
}

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
    ['solar',         'Solar System'],
    ['binary',        'Binary Stars'],
    ['chaos',         'Three-Body Chaos'],
    ['cluster',       'Star Cluster'],
    ['galaxy',        'Galaxy'],
  ]},
  { label: 'Famous Systems', items: [
    ['trappist',      'TRAPPIST-1'],
    ['asteroid',      'Asteroid Belt'],
  ]},
  { label: 'Special Orbits', items: [
    ['figure8',       'Figure-8 Choreography'],
  ]},
  { label: 'Collisions & Events', items: [
    ['collision',     'Galaxy Collision'],
    ['rogue',         'Rogue Star Flyby'],
  ]},
  { label: 'Compact Objects', items: [
    ['pulsar',        'Pulsar System'],
  ]},
  { label: 'Real Events', items: [
    ['sl9',           'Shoemaker-Levy 9 Impact'],
    ['gw150914',      'GW150914 (First Gravitational Wave)'],
    ['oumuamua',      'ʻOumuamua Flyby'],
  ]},
  { label: 'Real Systems', items: [
    ['alphacentauri', 'Alpha Centauri Triple'],
    ['kepler16',      'Kepler-16 (Tatooine)'],
    ['toi178',        'TOI-178 Resonance Chain'],
  ]},
] as const

const ALL_SCENARIO_BTNS = [
  { id: 'solar',         label: 'Solar System'    },
  { id: 'binary',        label: 'Binary Stars'    },
  { id: 'chaos',         label: '3-Body Chaos'    },
  { id: 'cluster',       label: 'Star Cluster'    },
  { id: 'galaxy',        label: 'Galaxy'          },
  { id: 'trappist',      label: 'TRAPPIST-1'      },
  { id: 'asteroid',      label: 'Asteroid Belt'   },
  { id: 'figure8',       label: 'Figure-8'        },
  { id: 'collision',     label: 'Gal. Collision'  },
  { id: 'rogue',         label: 'Rogue Star'      },
  { id: 'pulsar',        label: 'Pulsar'          },
  { id: 'sl9',           label: 'SL9 Impact'      },
  { id: 'gw150914',      label: 'GW150914'        },
  { id: 'oumuamua',      label: 'ʻOumuamua'       },
  { id: 'alphacentauri', label: 'α Centauri'      },
  { id: 'kepler16',      label: 'Kepler-16'       },
  { id: 'toi178',        label: 'TOI-178'         },
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
  const [selectedBodyPreset, setSelectedBodyPreset] = useState<string>(
    BODY_PRESETS[props.currentType][0].id
  )

  function trailDisplay(v: number) {
    return String(Math.round(50 + (v / 100) * 1450))
  }

  function handlePresetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    setSelectedPreset(val)
    props.loadPreset(val)
  }

  function handleBodyTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const type = e.target.value as BodyType
    props.setCurrentType(type)
    const firstPreset = BODY_PRESETS[type][0]
    setSelectedBodyPreset(firstPreset.id)
    props.setNextMass(firstPreset.mass)
  }

  function handleBodyPresetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    setSelectedBodyPreset(id)
    const preset = BODY_PRESETS[props.currentType].find(p => p.id === id)
    if (preset) props.setNextMass(preset.mass)
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
      <div className="gv-scenario-grid">
        {ALL_SCENARIO_BTNS.map(({ id, label }) => (
          <button
            key={id}
            className={selectedPreset === id ? 'gv-scene-active' : ''}
            onClick={() => { setSelectedPreset(id); props.loadPreset(id) }}
          >{label}</button>
        ))}
      </div>
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
      <div className="gv-row">
        <select className="gv-select" value={selectedBodyPreset} onChange={handleBodyPresetChange}>
          {BODY_PRESETS[currentType].map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
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
