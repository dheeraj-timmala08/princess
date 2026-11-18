import { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import cfg from './config'
import { media } from './media'

export const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const V = (a) => new THREE.Vector3(...a)

const Gold = (p) => <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.35} {...p} />
const Glow = ({ c = '#ffd98a' }) => <meshBasicMaterial color={c} />

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat) }
  return t
}
const parquet = (r) => canvasTex(256, 256, (g, w, h) => {
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    g.fillStyle = (i + j) % 2 ? '#6b4423' : '#7d5230'; g.fillRect(i * 32, j * 32, 32, 32)
    g.strokeStyle = '#3d2412'; g.strokeRect(i * 32, j * 32, 32, 32)
    g.beginPath(); for (let k = 0; k < 32; k += 6) { g.moveTo(i * 32 + ((i + j) % 2 ? k : 0), j * 32 + ((i + j) % 2 ? 0 : k)); g.lineTo(i * 32 + ((i + j) % 2 ? k : 32), j * 32 + ((i + j) % 2 ? 32 : k)) } g.strokeStyle = 'rgba(0,0,0,.18)'; g.stroke()
  }
}, r)

// Slow dreamy camera move from -> to over `dur` seconds (starts when go=true).
export function Rig({ from, to, look, dur = 10, go = true, sway = 0, follow = true }) {
  const { camera } = useThree()
  const t = useRef(0)
  const [a, b, l] = useMemo(() => [V(from), V(to), V(look)], [])
  useFrame(({ clock }, dt) => {
    if (go) t.current = Math.min(1, t.current + dt / (reduced ? 0.6 : dur))
    const e = t.current < 1 ? 1 - Math.pow(1 - t.current, 2.2) : 1
    camera.position.lerpVectors(a, b, e)
    if (!reduced) camera.position.y += Math.sin(clock.elapsedTime * 0.8) * 0.03
    camera.lookAt(l.x + (reduced ? 0 : Math.sin(clock.elapsedTime * 0.35) * sway), l.y, l.z + (follow ? (b.z - a.z) * e : 0))
  })
  return null
}

function Chandelier({ position, s = 1 }) {
  return (
    <group position={position} scale={s}>
      <mesh><cylinderGeometry args={[0.03, 0.03, 1.2]} /><Gold /></mesh>
      {[0.6, 0.95].map((r, k) => <mesh key={k} position={[0, -0.7 - k * 0.3, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[r, 0.04, 8, 32]} /><Gold /></mesh>)}
      {Array.from({ length: 12 }).map((_, i) => { const a = (i / 12) * 6.28; return <mesh key={i} position={[Math.cos(a) * 0.95, -0.85, Math.sin(a) * 0.95]}><sphereGeometry args={[0.07, 8, 8]} /><Glow /></mesh> })}
      <mesh position={[0, -0.9, 0]}><sphereGeometry args={[0.28, 12, 12]} /><meshBasicMaterial color="#fff3c4" transparent opacity={0.8} /></mesh>
    </group>
  )
}

/* ───────── 1. ENTRANCE ───────── */
export function Entrance({ open, onOpen }) {
  const L = useRef(), R = useRef()
  useFrame((_, dt) => {
    const k = open ? 1.55 : 0
    L.current.rotation.y += (k - L.current.rotation.y) * Math.min(1, dt * 1.4)
    R.current.rotation.y += (-k - R.current.rotation.y) * Math.min(1, dt * 1.4)
  })
  const Leaf = ({ g, x, dir }) => (
    <group ref={g} position={[x, 0, 0]}>
      <mesh position={[dir * 0.7, 2.2, 0]} onClick={onOpen}><boxGeometry args={[1.4, 4.4, 0.15]} /><Gold color="#c9a227" /></mesh>
      {[0, 1].map((i) => <mesh key={i} position={[dir * 0.7, 1.2 + i * 2, 0.09]}><boxGeometry args={[1, 1.5, 0.04]} /><Gold color="#8f6d12" /></mesh>)}
      <mesh position={[dir * 1.2, 2.2, 0.15]}><sphereGeometry args={[0.1]} /><Gold /></mesh>
    </group>
  )
  const wall = <meshStandardMaterial color="#3b0a14" roughness={0.8} />
  return (
    <>
      <color attach="background" args={['#0a0506']} /><fog attach="fog" args={['#0a0506', 8, 30]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 3, 5]} intensity={25} color="#ffcf7a" />
      <pointLight position={[0, 2.5, -3]} intensity={open ? 40 : 6} color="#ffe2a0" />
      {[-4.2, 4.2].map((x) => <group key={x} position={[x, 3.6, 0.3]}><mesh><boxGeometry args={[0.15, 0.5, 0.15]} /><Gold /></mesh><mesh position={[0, 0.45, 0.1]}><sphereGeometry args={[0.18, 12, 12]} /><Glow /></mesh><pointLight position={[0, 0.5, 0.5]} intensity={8} color="#ffbf5a" distance={9} /></group>)}
      <mesh position={[-4.2, 2.2, 0]}><boxGeometry args={[5.6, 4.4, 0.6]} />{wall}</mesh>
      <mesh position={[4.2, 2.2, 0]}><boxGeometry args={[5.6, 4.4, 0.6]} />{wall}</mesh>
      <mesh position={[0, 6.2, 0]}><boxGeometry args={[14, 3.6, 0.6]} />{wall}</mesh>
      {[-1.45, 1.45].map((x) => <mesh key={x} position={[x, 2.2, 0.05]}><boxGeometry args={[0.18, 4.6, 0.7]} /><Gold /></mesh>)}
      <mesh position={[0, 4.5, 0.05]}><boxGeometry args={[3.1, 0.2, 0.7]} /><Gold /></mesh>
      <group position={[0, 0, 0.1]}><Leaf g={L} x={-1.4} dir={1} /><Leaf g={R} x={1.4} dir={-1} /></group>
      <mesh position={[0, 2.2, -4]}><planeGeometry args={[3, 4.4]} /><Glow c="#ffe9b0" /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -2]}><planeGeometry args={[14, 20]} /><meshStandardMaterial color="#2a1a14" /></mesh>
      {[0, 1, 2, 3].map((i) => <mesh key={i} position={[0, 0.1 + i * 0.0, 1.2 + i * 1.1]} scale={[1, 1, 1]}><boxGeometry args={[7 - i * 0.2, 0.2 - i * 0.04, 1.1]} /><meshStandardMaterial color="#efe6d6" roughness={0.3} /></mesh>)}
      <Sparkles count={30} scale={[8, 4, 6]} size={3} color="#ffd98a" position={[0, 2, 3]} />
      <Rig from={[0, 1.7, 9]} to={[0, 1.8, -3]} look={[0, 2, -4]} dur={5} go={open} />
    </>
  )
}

/* ───────── 2. GALLERY ───────── */
function Frame({ i, pos, rot, onPick }) {
  const m = cfg.memories[i], tex = media[m.src]
  const mat = useRef()
  const [w, h] = useMemo(() => { if (!tex) return [1.5, 2]; const a = tex.image.width / tex.image.height; return a > 1 ? [1.5, 1.5 / a] : [2 * a, 2] }, [tex])
  useFrame(({ clock }) => { if (mat.current && !tex) mat.current.color.setHSL(0.12, 0.6, 0.35 + Math.sin(clock.elapsedTime * 2 + i) * 0.12) })
  return (
    <group position={pos} rotation-y={rot} onClick={(e) => { e.stopPropagation(); onPick(i) }}>
      <mesh><boxGeometry args={[1.5 + 0.5, 2 + 0.5, 0.14]} /><Gold /></mesh>
      <mesh position={[0, 0, 0.08]}><planeGeometry args={[w, h]} />{tex ? <meshBasicMaterial map={tex} /> : <meshBasicMaterial ref={mat} />}</mesh>
      <pointLight position={[0, 1.6, 0.8]} intensity={3} distance={4} color="#ffd98a" />
    </group>
  )
}
export function Gallery({ onPick }) {
  const floor = useMemo(() => parquet([4, 16]), [])
  const wallM = <meshStandardMaterial color="#5a0f1e" roughness={0.9} />
  return (
    <>
      <color attach="background" args={['#120508']} /><fog attach="fog" args={['#120508', 6, 28]} />
      <ambientLight intensity={0.7} /><hemisphereLight args={['#ffe2b0', '#3a1010', 0.8]} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -10]}><planeGeometry args={[8, 40]} /><meshStandardMaterial map={floor} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, -10]}><planeGeometry args={[2.6, 40]} /><meshStandardMaterial color="#8a0f1f" /></mesh>
      {[-1.35, 1.35].map((x) => <mesh key={x} rotation-x={-Math.PI / 2} position={[x, 0.03, -10]}><planeGeometry args={[0.1, 40]} /><Gold /></mesh>)}
      {[-4, 4].map((x) => <mesh key={x} position={[x, 3, -10]} rotation-y={x < 0 ? Math.PI / 2 : -Math.PI / 2}><planeGeometry args={[40, 6]} />{wallM}</mesh>)}
      <mesh position={[0, 6, -10]} rotation-x={Math.PI / 2}><planeGeometry args={[8, 40]} /><meshStandardMaterial color="#2a0a10" /></mesh>
      {[8, 0, -8, -16, -24].map((z) => (
        <group key={z}>
          {[-3.7, 3.7].map((x) => <mesh key={x} position={[x, 3, z + 4]}><cylinderGeometry args={[0.22, 0.26, 6, 12]} /><meshStandardMaterial color="#efe6d6" /></mesh>)}
          <mesh position={[0, 2, z + 4]}><torusGeometry args={[3.9, 0.12, 6, 32, Math.PI]} /><Gold /></mesh>
          <Chandelier position={[0, 5.6, z]} />
        </group>
      ))}
      {[0, 1, 2, 3].map((k) => [0, 1].map((side) => (
        <Frame key={k * 2 + side} i={k * 2 + side} pos={[side ? 3.85 : -3.85, 2.7, 2 - k * 7]} rot={side ? -Math.PI / 2 : Math.PI / 2} onPick={onPick} />
      )))}
      <Sparkles count={40} scale={[6, 5, 30]} position={[0, 3, -12]} size={3} color="#ffd98a" />
      <Rig from={[0, 1.7, 9]} to={[0, 1.7, -22]} look={[0, 2.4, -6]} dur={70} sway={2.6} />
    </>
  )
}

/* ───────── 3. BALLROOM ───────── */
export function Ballroom({ onNext }) {
  const floor = useMemo(() => parquet([6, 6]), [])
  const sign = useMemo(() => canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#f6ecd9'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b8932a'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20)
    g.fillStyle = '#5a0f1e'; g.font = 'italic 42px "Cormorant Garamond", Georgia, serif'; g.textAlign = 'center'
    const words = (cfg.ballroomSignText || '').split(' '); let line = '', y = 90
    words.forEach((wd) => { if (g.measureText(line + wd).width > 400) { g.fillText(line, w / 2, y); y += 52; line = '' } line += wd + ' ' }); g.fillText(line, w / 2, y)
  }), [])
  const vase = (x, z) => (
    <group key={x + '' + z} position={[x, 0, z]}>
      <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.3, 0.2, 1.2, 14]} /><Gold /></mesh>
      <mesh position={[0, 1.5, 0]}><sphereGeometry args={[0.5, 10, 10]} /><meshStandardMaterial color="#1f5a2a" /></mesh>
      {Array.from({ length: 9 }).map((_, i) => <mesh key={i} position={[Math.cos(i * 2.4) * 0.42, 1.5 + Math.sin(i * 1.7) * 0.3, Math.sin(i * 2.4) * 0.42]}><sphereGeometry args={[0.16, 8, 8]} /><meshStandardMaterial color="#c4122f" /></mesh>)}
    </group>
  )
  return (
    <>
      <color attach="background" args={['#0d0507']} /><fog attach="fog" args={['#0d0507', 10, 40]} />
      <ambientLight intensity={0.8} /><hemisphereLight args={['#ffe2b0', '#3a1010', 0.8]} />
      <pointLight position={[0, 6, 0]} intensity={90} color="#ffd9a0" />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -2]}><planeGeometry args={[24, 30]} /><meshStandardMaterial map={floor} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, -2]}><ringGeometry args={[3.1, 3.7, 64]} /><Gold /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.015, -2]}><circleGeometry args={[3.1, 48]} /><meshStandardMaterial color="#4a0b17" /></mesh>
      {[-12, 12].map((x) => <mesh key={x} position={[x, 4, -2]} rotation-y={x < 0 ? Math.PI / 2 : -Math.PI / 2}><planeGeometry args={[30, 8]} /><meshStandardMaterial color="#5a0f1e" /></mesh>)}
      <mesh position={[0, 4, -15]}><planeGeometry args={[24, 8]} /><meshStandardMaterial color="#4a0b17" /></mesh>
      <mesh position={[0, 8, -2]} rotation-x={Math.PI / 2}><planeGeometry args={[24, 30]} /><meshStandardMaterial color="#2a0a10" /></mesh>
      <Chandelier position={[0, 7.6, -2]} s={2.3} />
      {[-8, 8].flatMap((x) => [4, -8].map((z) => vase(x, z)))}
      {vase(-3.5, -7)}{vase(3.5, -7)}
      <group position={[0, 0, -1]}>
        <mesh position={[0, 1.9, 0]}><planeGeometry args={[3.2, 1.6]} /><meshBasicMaterial map={sign} /></mesh>
        <mesh position={[0, 1.9, -0.04]}><boxGeometry args={[3.4, 1.8, 0.06]} /><Gold /></mesh>
        {[-1.2, 1.2].map((x) => <mesh key={x} position={[x, 0.55, -0.05]}><cylinderGeometry args={[0.05, 0.05, 1.2]} /><Gold /></mesh>)}
      </group>
      <group position={[0, 0, -14.8]} onClick={onNext}>
        <mesh position={[0, 2.4, 0]}><planeGeometry args={[3, 4.8]} /><meshBasicMaterial color="#ffb978" /></mesh>
        <mesh position={[0, 4.8, 0]}><torusGeometry args={[1.5, 0.12, 8, 24, Math.PI]} /><Gold /></mesh>
        {[-1.6, 1.6].map((x) => <mesh key={x} position={[x, 2.4, 0.05]}><boxGeometry args={[0.2, 4.8, 0.2]} /><Gold /></mesh>)}
      </group>
      <Sparkles count={50} scale={[14, 6, 20]} position={[0, 3, -4]} size={3} color="#ffd98a" />
      <Rig from={[0, 1.7, 12]} to={[0, 1.9, -4]} look={[0, 2, -14]} dur={14} sway={1.5} />
    </>
  )
}

/* ───────── 4. GARDEN ───────── */
function Petals({ count = 80, color = '#e0245e', fast, size = 0.14 }) {
  const ref = useRef(), o = useMemo(() => new THREE.Object3D(), [])
  const d = useMemo(() => Array.from({ length: count }, () => ({ x: (Math.random() - 0.5) * 24, y: Math.random() * 12, z: -24 + Math.random() * 34, s: 0.5 + Math.random() * 0.8, r: Math.random() * 6, v: 0.4 + Math.random() * 0.7 })), [count])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    d.forEach((p, i) => {
      p.y -= p.v * dt * (fast ? 1.8 : 1); if (p.y < 0) p.y = 12
      o.position.set(p.x + Math.sin(t * p.v + p.r) * 0.8, p.y, p.z); o.rotation.set(t * p.v + p.r, t * 0.7 + p.r, 0)
      o.scale.setScalar(size * p.s); o.updateMatrix(); ref.current.setMatrixAt(i, o.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[null, null, count]} frustumCulled={false}><planeGeometry /><meshBasicMaterial color={color} side={THREE.DoubleSide} /></instancedMesh>
}
function Rose({ p }) {
  return (
    <group position={p}>
      <mesh position={[0, 0.4, 0]}><sphereGeometry args={[0.55, 8, 8]} /><meshStandardMaterial color="#1f5a2a" /></mesh>
      {Array.from({ length: 6 }).map((_, i) => <mesh key={i} position={[Math.cos(i * 1.9) * 0.4, 0.55 + Math.sin(i * 2.3) * 0.2, Math.sin(i * 1.9) * 0.4]}><sphereGeometry args={[0.13, 8, 8]} /><meshStandardMaterial color="#d3163a" /></mesh>)}
    </group>
  )
}
export function Garden({ finale, onEnvelope, onCrown }) {
  const sky = useMemo(() => canvasTex(8, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3b2a6b'); gr.addColorStop(0.45, '#e0709a'); gr.addColorStop(0.75, '#ff9d5c'); gr.addColorStop(1, '#ffd08a'); g.fillStyle = gr; g.fillRect(0, 0, w, h) }), [])
  const white = <meshStandardMaterial color="#f6f1e8" roughness={0.4} />
  return (
    <>
      <fog attach="fog" args={['#f7a57e', 30, 95]} />
      <mesh><sphereGeometry args={[110, 16, 16]} /><meshBasicMaterial map={sky} side={THREE.BackSide} fog={false} /></mesh>
      <ambientLight intensity={0.9} color="#ffd2b0" /><directionalLight position={[-10, 8, -30]} intensity={1.6} color="#ffb06a" />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -20]}><planeGeometry args={[120, 120]} /><meshStandardMaterial color="#3f7a3a" /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, -20]}><planeGeometry args={[3, 60]} /><meshStandardMaterial color="#e9d9b8" /></mesh>
      <group position={[0, 0, -3]}>
        <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[2.2, 2.4, 0.4, 24]} />{white}</mesh>
        <mesh position={[0, 0.9, 0]}><cylinderGeometry args={[0.25, 0.35, 1.2, 12]} />{white}</mesh>
        <mesh position={[0, 1.6, 0]}><cylinderGeometry args={[1, 0.7, 0.2, 20]} />{white}</mesh>
        <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[2, 2, 0.1, 24]} /><meshStandardMaterial color="#8ed0ea" transparent opacity={0.8} /></mesh>
        <Sparkles count={25} scale={[2, 2.5, 2]} position={[0, 1.8, 0]} size={4} color="#ffffff" />
      </group>
      {[-1, 1].flatMap((s) => [2, -4, -10, -16].map((z) => <mesh key={s + '' + z} position={[s * 3.2, 0.6, z]}><boxGeometry args={[1.1, 1.2, 4.5]} /><meshStandardMaterial color="#1d4a24" /></mesh>))}
      {[-1, 1].flatMap((s) => [5, 0, -7, -13].map((z) => <Rose key={s + '' + z} p={[s * 5, 0, z]} />))}
      {[-1, 1].flatMap((s) => [-9, -5].map((z) => <Rose key={'b' + s + z} p={[s * 8, 0, z]} />))}
      <group position={[0, 0, -62]}>
        <mesh position={[0, 5, 0]}><boxGeometry args={[18, 10, 5]} /><meshStandardMaterial color="#f1dcc2" /></mesh>
        {[-11, 11].map((x) => <group key={x}><mesh position={[x, 7, 0]}><boxGeometry args={[4, 14, 4]} /><meshStandardMaterial color="#f1dcc2" /></mesh><mesh position={[x, 16, 0]}><coneGeometry args={[3, 5, 8]} /><Gold /></mesh></group>)}
        <mesh position={[0, 12, 0]}><coneGeometry args={[5, 5, 8]} /><Gold /></mesh>
        {Array.from({ length: 9 }).map((_, i) => <mesh key={i} position={[-8 + i * 2, 5, 2.55]}><planeGeometry args={[0.8, 2]} /><meshBasicMaterial color="#ffd27a" /></mesh>)}
      </group>
      <group position={[0, 0, -20]}>
        <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[3.4, 3.4, 0.2, 8]} />{white}</mesh>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * 6.283 + 0.39; return <mesh key={i} position={[Math.cos(a) * 3.1, 2, Math.sin(a) * 3.1]}><cylinderGeometry args={[0.12, 0.12, 4, 8]} />{white}</mesh> })}
        <mesh position={[0, 4.9, 0]}><coneGeometry args={[4.2, 1.8, 8]} />{white}</mesh>
        <mesh position={[0, 6, 0]}><sphereGeometry args={[0.15]} /><Gold /></mesh>
        <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[1.3, 1.3, 0.1, 20]} /><meshStandardMaterial color="#7a1530" /></mesh>
        <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.15, 0.15, 0.6]} />{white}</mesh>
        <group position={[-0.65, 0.8, 0.1]} rotation-y={0.3} onClick={onEnvelope}>
          <mesh><boxGeometry args={[0.6, 0.04, 0.4]} /><meshStandardMaterial color="#fffaf0" /></mesh>
          <mesh position={[0, 0.03, 0]}><sphereGeometry args={[0.06]} /><meshStandardMaterial color="#b3122b" /></mesh>
          <mesh visible={false}><sphereGeometry args={[0.6]} /></mesh>
        </group>
        <group position={[0.65, 0.8, 0.1]} onClick={onCrown}>
          <mesh scale={[1, 0.55, 1]}><cylinderGeometry args={[0.38, 0.42, 0.3, 16]} /><meshStandardMaterial color="#5a0f1e" /></mesh>
          <mesh position={[0, 0.3, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[0.26, 0.025, 8, 24]} /><Gold /></mesh>
          {[-2, -1, 0, 1, 2].map((k) => <mesh key={k} position={[0, 0.3 + 0.1 * (1 - Math.abs(k) / 3), 0]}><octahedronGeometry args={[0.05]} /><meshBasicMaterial color="#ffffff" /></mesh>).map((m, i) => <group key={i} position={[(i - 2) * 0.12, 0, -0.22 + Math.abs(i - 2) * 0.05]}>{m}</group>)}
          <pointLight position={[0, 0.7, 0.4]} intensity={3} distance={3} color="#fff" />
          <mesh visible={false}><sphereGeometry args={[0.7]} /></mesh>
        </group>
        <Sparkles count={30} scale={[2.5, 1.5, 2.5]} position={[0.65, 1.2, 0.1]} size={5} color="#ffffff" />
      </group>
      <Petals count={finale ? 110 : 40} fast={finale} />
      {finale && <Petals count={70} color="#f5d27a" fast size={0.09} />}
      {finale && <Sparkles count={80} scale={[20, 8, 30]} position={[0, 4, -12]} size={6} color="#ffe9a8" />}
      <Rig from={[0, 2.1, 12]} to={[0, 1.7, -15.5]} look={[0, 1.2, -20]} dur={16} sway={0.6} follow={false} />
    </>
  )
}
