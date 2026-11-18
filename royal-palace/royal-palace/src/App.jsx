import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence, motion } from 'framer-motion'
import cfg from './config'
import { preload } from './media'
import { Entrance, Gallery, Ballroom, Garden, reduced } from './scenes'
import Crown from './Crown'

const NAMES = ['', 'The Grand Entrance', 'The Royal Gallery', 'The Grand Ballroom', 'The Rose Garden']
const Nazar = () => <svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#1d4ed8" /><circle cx="12" cy="12" r="8" fill="#fff" /><circle cx="12" cy="12" r="5" fill="#38bdf8" /><circle cx="12" cy="12" r="2.4" fill="#0a0a23" /></svg>

function Type({ text, speed = 38 }) {
  const [n, setN] = useState(reduced ? text.length : 0)
  useEffect(() => { if (reduced) return; const id = setInterval(() => setN((x) => (x >= text.length ? (clearInterval(id), x) : x + 1)), speed); return () => clearInterval(id) }, [text])
  return <>{text.slice(0, n)}</>
}
const Pop = ({ children }) => <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{children}</motion.div>

export default function App() {
  const [ch, setCh] = useState(0), [prog, setProg] = useState(0), [veil, setVeil] = useState(false), [muted, setMuted] = useState(false)
  const [opened, setOpened] = useState(false), [mem, setMem] = useState(null), [seen, setSeen] = useState(new Set())
  const [letter, setLetter] = useState(false), [crown, setCrown] = useState(false), [finale, setFinale] = useState(false), [vm, setVm] = useState(true)
  const audio = useRef(null)

  useEffect(() => { preload(cfg.memories, setProg).then(() => go(1)) }, [])
  const go = (n) => { setVeil(true); setTimeout(() => { setCh(n); setVeil(false) }, reduced ? 0 : 900) }
  const startMusic = () => { if (!audio.current) { audio.current = new Audio(cfg.music); audio.current.loop = true; audio.current.volume = 0.6 } audio.current.muted = muted; audio.current.play().catch(() => {}) }
  const toggleMute = () => { setMuted(!muted); if (audio.current) audio.current.muted = !muted }
  const open = () => { if (opened) return; startMusic(); setOpened(true); setTimeout(() => go(2), 4200) }
  const pick = (i) => { setMem(i); setVm(true); setSeen((s) => new Set(s).add(i)) }
  const m = mem != null ? cfg.memories[mem] : null
  const all = seen.size >= cfg.memories.length

  return (
    <>
      {ch === 0 && <div className="load"><span className="lbl">{cfg.loadingLabel}</span><span className="poem" style={{ fontSize: 22 }}>Preparing your palace...</span><div className="line"><i style={{ width: prog * 100 + '%' }} /></div></div>}
      {ch > 0 && <div className="top">
        <div className="nazar">{Array.from({ length: 9 }).map((_, i) => <Nazar key={i} />)}</div>
        <div className="bar">
          <button className="ico" aria-label="Back" onClick={() => ch > 1 && go(ch - 1)} style={{ opacity: ch > 1 ? 1 : 0.3 }}>←</button>
          <span className="lbl">{NAMES[ch]} · {String(ch + 1).padStart(2, '0')} / 05</span>
          <button className="ico" aria-label="Toggle music" onClick={toggleMute}>{muted ? '🔇' : '♪'}</button>
        </div>
      </div>}

      {ch > 0 && <div className={'stage' + (veil ? ' veil' : '')}>
        <Canvas key={ch} dpr={[1, 2]} camera={{ fov: 62, near: 0.1, far: 220, position: [0, 1.7, 9] }}>
          {ch === 1 && <Entrance open={opened} onOpen={open} />}
          {ch === 2 && <Gallery onPick={pick} />}
          {ch === 3 && <Ballroom onNext={() => go(4)} />}
          {ch === 4 && <Garden finale={finale} onEnvelope={() => setLetter(true)} onCrown={() => setCrown(true)} />}
        </Canvas>
      </div>}

      {ch === 1 && !opened && <div className="dock"><p className="poem">The doors are waiting for you.</p><button className="btn" onClick={open}>Open the doors</button></div>}
      {ch === 2 && !m && <div className="dock">{!seen.size && <span className="lbl">Tap the golden frames</span>}{all && <button className="btn" onClick={() => go(3)}>Continue to the Ballroom</button>}</div>}
      {ch === 3 && <div className="dock"><span className="lbl">Tap the glowing doorway</span><button className="btn" onClick={() => go(4)}>Enter the garden</button></div>}
      {ch === 4 && !letter && !crown && !finale && <div className="dock"><button className="btn" onClick={() => setLetter(true)}>Open the envelope</button><button className="btn" onClick={() => setCrown(true)}>Crown yourself</button></div>}
      {ch === 4 && finale && !letter && !crown && <div className="fin">{cfg.finalLines.map((l, i) => <p key={i} className={'poem fade'} style={{ animationDelay: i * 2.6 + 's', fontSize: i ? 22 : 32 }}>{l}</p>)}<button className="btn fade" style={{ animationDelay: '6s', pointerEvents: 'auto' }} onClick={() => setCrown(true)}>Crown yourself</button></div>}

      <AnimatePresence>
        {m && <Pop key="mem"><div className="top" style={{ position: 'absolute' }}><div className="bar" style={{ justifyContent: 'flex-end' }}><button className="ico" onClick={() => setMem(null)}>✕</button></div></div>
          <div className="card">
            {m.type === 'video'
              ? <><video src={m.src} autoPlay loop playsInline muted={vm} /><button className="btn" onClick={() => setVm(!vm)}>{vm ? 'Tap to unmute' : 'Mute'}</button></>
              : <img src={m.src} loading="lazy" alt={m.title} onError={(e) => { e.currentTarget.replaceWith(Object.assign(document.createElement('div'), { className: 'ph' })) }} />}
            <span className="lbl">Memory {String(mem + 1).padStart(2, '0')}</span><h2>{m.title}</h2><p className="cap">{m.caption}</p>
            <div className="row"><button className="btn" onClick={() => pick((mem + cfg.memories.length - 1) % cfg.memories.length)}>Previous</button><span className="lbl">{mem + 1} / {cfg.memories.length}</span><button className="btn" onClick={() => pick((mem + 1) % cfg.memories.length)}>Next</button></div>
            {all && <button className="btn" onClick={() => { setMem(null); go(3) }}>Continue to the Ballroom</button>}
          </div></Pop>}
        {letter && <Pop key="let"><div className="card"><span className="lbl">A letter for you</span><div className="letter"><Type text={cfg.loveLetter} /></div><button className="btn" onClick={() => { setLetter(false); setFinale(true) }}>Close</button></div></Pop>}
      </AnimatePresence>
      {crown && <Crown onClose={() => { setCrown(false); setFinale(true) }} />}
    </>
  )
}
