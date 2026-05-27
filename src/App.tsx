import { useState } from 'react'
import { useSimulation } from './hooks/useSimulation'
import { Controls } from './components/Controls'
import { EditModal } from './components/EditModal'
import { ShareModal } from './components/ShareModal'

export function App() {
  const sim = useSimulation()
  const [shareOpen, setShareOpen] = useState(false)

  return (
    <>
      <div className="page-head">
        <h1>cosmos<span> · n-body gravity simulator</span></h1>
        <div className="meta">react · vite · canvas 2d · zero deps</div>
      </div>

      <div className="gv-wrap">
        <div className="gv-stage">
          <canvas ref={sim.canvasRef} className="gv-canvas" />

          <div className="gv-hud" dangerouslySetInnerHTML={{ __html: sim.hudText.replace(/\b(bodies|fps|zoom|solver)\b/g, '<b>$1</b>') }} />

          <div className="gv-hint">
            left-drag to launch · right-click body to edit<br />
            wheel to zoom · right-drag empty to pan
          </div>

          <div className="gv-toast" style={{ opacity: sim.toastVisible ? 1 : 0 }}>
            {sim.toast}
          </div>

          <EditModal
            body={sim.editingBody}
            onApply={sim.applyEdit}
            onDelete={sim.deleteEdit}
            onClose={sim.closeEdit}
          />

          <ShareModal
            open={shareOpen}
            getShareCode={sim.getShareCode}
            loadCode={sim.loadCode}
            showToast={sim.showToast}
            onClose={() => setShareOpen(false)}
          />
        </div>

        <Controls
          paused={sim.paused}
          starfieldOn={sim.starfieldOn}
          vectorsOn={sim.vectorsOn}
          barnesHutOn={sim.barnesHutOn}
          currentType={sim.currentType}
          timeScale={sim.timeScale}
          gravity={sim.gravity}
          trailMax={sim.trailMax}
          nextMass={sim.nextMass}
          togglePause={sim.togglePause}
          toggleStarfield={sim.toggleStarfield}
          toggleVectors={sim.toggleVectors}
          toggleBarnesHut={sim.toggleBarnesHut}
          setTimeScale={sim.setTimeScale}
          setGravity={sim.setGravity}
          setTrailMax={sim.setTrailMax}
          setNextMass={sim.setNextMass}
          setCurrentType={sim.setCurrentType}
          clearBodies={sim.clearBodies}
          resetCamera={sim.resetCamera}
          loadPreset={sim.loadPreset}
          getShareCode={sim.getShareCode}
          showToast={sim.showToast}
          onShareOpen={() => setShareOpen(true)}
        />
      </div>

      <footer>
        <div>cosmos · barnes-hut o(n log n) n-body solver</div>
        <div>
          <a href="https://github.com/RoLoDeXx/cosmos" target="_blank" rel="noopener">
            source on github →
          </a>
        </div>
      </footer>
    </>
  )
}
