import { useEffect, useRef, useState } from 'react'

let lmP
function getLandmarker() {
  if (!lmP) lmP = (async () => {
    const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
    const fs = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm')
    return FaceLandmarker.createFromOptions(fs, {
      baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task', delegate: 'GPU' },
      runningMode: 'VIDEO', numFaces: 1,
    })
  })().catch(() => null) // falls back to the fixed oval
  return lmP
}

function tiara(g, cx, cy, w, ang) {
  g.save(); g.translate(cx, cy); g.rotate(ang)
  g.shadowColor = 'rgba(255,230,150,.9)'; g.shadowBlur = w * 0.06
  const gr = g.createLinearGradient(-w / 2, 0, w / 2, 0); gr.addColorStop(0, '#a67c00'); gr.addColorStop(0.5, '#fff0a0'); gr.addColorStop(1, '#a67c00')
  g.strokeStyle = gr; g.lineWidth = w * 0.035; g.beginPath(); g.ellipse(0, 0, w / 2, w * 0.3, 0, Math.PI * 1.06, Math.PI * 1.94); g.stroke()
  for (let k = -3; k <= 3; k++) {
    const x = (k * w) / 7.4, y = -w * 0.3 * Math.sqrt(1 - (x / (w / 2)) ** 2), h = w * (0.07 + 0.09 * (1 - Math.abs(k) / 3.2)), r = w * (0.035 + 0.02 * (1 - Math.abs(k) / 3.2))
    g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.lineWidth = w * 0.015; g.stroke()
    g.beginPath(); g.moveTo(x, y - h - r * 1.5); g.lineTo(x + r, y - h); g.lineTo(x, y - h + r * 0.4); g.lineTo(x - r, y - h); g.closePath()
    g.fillStyle = '#fff'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#e8c860'; g.stroke()
  }
  g.restore()
}

function paint(c, src, mirror, face, guide) {
  const g = c.getContext('2d'), W = c.width, H = c.height
  g.clearRect(0, 0, W, H); g.save()
  if (mirror) { g.translate(W, 0); g.scale(-1, 1) }
  g.drawImage(src, 0, 0, W, H); g.restore()
  let cx = W / 2, cy = H * 0.3, w = W * 0.5, ang = 0
  if (face && mirror) { // landmarks: 10 = forehead top, 234/454 = cheeks
    const a = { x: (1 - face[234].x) * W, y: face[234].y * H }, b = { x: (1 - face[454].x) * W, y: face[454].y * H }
    w = Math.hypot(b.x - a.x, b.y - a.y) * 1.08; ang = Math.atan2(b.y - a.y, b.x - a.x); if (Math.abs(ang) > Math.PI / 2) ang += Math.PI
    cx = (1 - face[10].x) * W; cy = face[10].y * H + w * 0.1
  }
  tiara(g, cx, cy, w, ang)
  if (guide) {
    g.save(); g.setLineDash([6, 10]); g.lineWidth = 3; g.strokeStyle = 'rgba(243,221,139,.9)'
    g.beginPath(); g.ellipse(W / 2, H * 0.46, W * 0.28, H * 0.27, 0, 0, 6.283); g.stroke(); g.restore()
  }
}

export default function Crown({ onClose }) {
  const [phase, setPhase] = useState('ask'), [count, setCount] = useState(0), [out, setOut] = useState(null)
  const vid = useRef(), cv = useRef(), stream = useRef(), lm = useRef(), face = useRef(), guide = useRef(true), file = useRef()

  const stop = () => stream.current?.getTracks().forEach((t) => t.stop())
  useEffect(() => stop, [])

  async function start() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } }, audio: false })
      stream.current = s; vid.current.srcObject = s; await vid.current.play()
      setPhase('live'); getLandmarker().then((l) => (lm.current = l))
    } catch { setPhase('denied') }
  }

  useEffect(() => {
    if (phase !== 'live') return
    let raf, last = -1
    const loop = () => {
      const v = vid.current, c = cv.current
      if (v && c && v.videoWidth) {
        if (c.width !== v.videoWidth) { c.width = v.videoWidth; c.height = v.videoHeight }
        if (lm.current && v.currentTime !== last) {
          last = v.currentTime
          try { const r = lm.current.detectForVideo(v, performance.now()); face.current = r.faceLandmarks?.[0] || null } catch { lm.current = null }
        }
        paint(c, v, true, face.current, guide.current)
      }
      raf = requestAnimationFrame(loop)
    }
    loop(); return () => cancelAnimationFrame(raf)
  }, [phase])

  function shoot() {
    let n = 3; setCount(n)
    const id = setInterval(() => {
      n -= 1; setCount(n)
      if (n <= 0) {
        clearInterval(id); guide.current = false
        setTimeout(() => { setOut(cv.current.toDataURL('image/jpeg', 0.92)); stop(); setPhase('shot') }, 120)
      }
    }, 1000)
  }

  function upload(e) { // fallback: uploaded selfie with the crown on a fixed oval
    const f = e.target.files?.[0]; if (!f) return
    const img = new Image(); img.onload = () => {
      const s = Math.min(1, 1080 / Math.max(img.width, img.height)), c = document.createElement('canvas')
      c.width = img.width * s; c.height = img.height * s; paint(c, img, false, null, false)
      setOut(c.toDataURL('image/jpeg', 0.92)); setPhase('shot')
    }; img.src = URL.createObjectURL(f)
  }

  const Upload = <><input ref={file} type="file" accept="image/*" hidden onChange={upload} /><button className="btn" onClick={() => file.current.click()}>Tap to place the crown on your photo</button></>
  return (
    <div className="modal"><div className="card">
      <video ref={vid} playsInline muted style={{ display: 'none' }} />
      <span className="lbl">Crown yourself</span>
      {phase === 'ask' && <><p className="cap">Let the palace see you, Your Highness. Your camera stays on your device.</p><button className="btn" onClick={start}>Allow camera</button>{Upload}</>}
      {phase === 'denied' && <><p className="cap">The camera is not available, so upload a selfie instead.</p>{Upload}</>}
      {phase === 'live' && <div className="rel"><canvas ref={cv} />{count > 0 && <div className="cd">{count}</div>}{!count && <div style={{ marginTop: 12, textAlign: 'center' }}><button className="btn" onClick={shoot}>Take the photo</button></div>}</div>}
      {phase === 'shot' && <><img src={out} alt="Crowned" /><a className="btn" style={{ display: 'flex', alignItems: 'center' }} href={out} download="crowned-photo.jpg">Save your crowned photo</a></>}
      <button className="btn" onClick={onClose}>{phase === 'shot' ? 'Done' : 'Close'}</button>
    </div></div>
  )
}
