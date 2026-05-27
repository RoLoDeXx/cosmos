import { useEffect, useRef, useState } from 'react'

interface Props {
  open: boolean
  getShareCode: () => string
  loadCode: (code: string) => void
  showToast: (msg: string) => void
  onClose: () => void
}

export function ShareModal({ open, getShareCode, loadCode, showToast, onClose }: Props) {
  const [code, setCode] = useState('')
  const [loadInput, setLoadInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      const c = getShareCode()
      setCode(c)
      setLoadInput('')
      location.hash = c
      setTimeout(() => { textareaRef.current?.focus(); textareaRef.current?.select() }, 50)
    }
  }, [open, getShareCode])

  if (!open) return null

  function handleCopy() {
    navigator.clipboard.writeText(code)
      .then(() => showToast('copied to clipboard'))
      .catch(() => {
        textareaRef.current?.select()
        document.execCommand('copy')
        showToast('copied')
      })
  }

  function handleLoad() {
    const trimmed = loadInput.trim()
    if (!trimmed) return
    try {
      loadCode(trimmed)
      onClose()
      showToast('configuration loaded')
    } catch {
      showToast('invalid code')
    }
  }

  return (
    <div className="gv-modal show" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="gv-card">
        <button className="gv-x" onClick={onClose} aria-label="close">×</button>
        <h3>share configuration</h3>
        <div className="gv-section">
          <label>your code (copy + share)</label>
          <textarea ref={textareaRef} value={code} readOnly />
          <div className="gv-row-end">
            <button onClick={handleCopy}>copy</button>
          </div>
        </div>
        <div className="gv-section">
          <label>load a code</label>
          <input type="text" value={loadInput} placeholder="paste a shared code"
            onChange={e => setLoadInput(e.target.value)} />
          <div className="gv-row-end">
            <button onClick={handleLoad}>load</button>
          </div>
        </div>
      </div>
    </div>
  )
}
