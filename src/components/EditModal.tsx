import { useEffect, useState } from 'react'
import type { Body } from '../lib/types'
import { uiPalette } from '../lib/bodies'

interface Props {
  body: Body | null
  onApply: (mass: number, vx: number, vy: number, color: string) => void
  onDelete: () => void
  onClose: () => void
}

export function EditModal({ body, onApply, onDelete, onClose }: Props) {
  const [mass, setMass] = useState('')
  const [vx, setVx] = useState('')
  const [vy, setVy] = useState('')
  const [color, setColor] = useState('')

  useEffect(() => {
    if (body) {
      setMass(body.mass.toFixed(2))
      setVx(body.vx.toFixed(3))
      setVy(body.vy.toFixed(3))
      setColor(body.color)
    }
  }, [body])

  if (!body) return null

  function handleApply() {
    const m = parseFloat(mass)
    const parsedVx = parseFloat(vx)
    const parsedVy = parseFloat(vy)
    if (isNaN(m) || m <= 0) return
    onApply(m, isNaN(parsedVx) ? body!.vx : parsedVx, isNaN(parsedVy) ? body!.vy : parsedVy, color)
  }

  return (
    <div className="gv-modal show" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="gv-card">
        <button className="gv-x" onClick={onClose} aria-label="close">×</button>
        <h3>edit {body.type}</h3>

        <div className="gv-fld">
          <label>mass</label>
          <input type="number" value={mass} min={0.5} max={5000} step={1}
            onChange={e => setMass(e.target.value)} />
        </div>
        <div className="gv-fld">
          <label>velocity x</label>
          <input type="number" value={vx} step={0.05} onChange={e => setVx(e.target.value)} />
        </div>
        <div className="gv-fld">
          <label>velocity y</label>
          <input type="number" value={vy} step={0.05} onChange={e => setVy(e.target.value)} />
        </div>
        <div className="gv-fld" style={{ alignItems: 'flex-start' }}>
          <label style={{ paddingTop: 4 }}>color</label>
          <div className="gv-swatches">
            {uiPalette.map(c => (
              <button key={c} className={'gv-swatch' + (c === color ? ' gv-active' : '')}
                style={{ '--c': c } as React.CSSProperties}
                onClick={() => setColor(c)} />
            ))}
          </div>
        </div>

        <div className="gv-row-between">
          <button className="gv-danger" onClick={onDelete}>delete</button>
          <button onClick={handleApply}>apply</button>
        </div>
      </div>
    </div>
  )
}
