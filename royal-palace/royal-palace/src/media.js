import * as THREE from 'three'
// Photos are resized to max 1600px on a canvas before becoming textures.
export const media = {}
const MAX = 1600
function loadImg(src) {
  return new Promise((res) => {
    const i = new Image()
    i.onload = () => {
      const s = Math.min(1, MAX / Math.max(i.width, i.height))
      const c = document.createElement('canvas')
      c.width = (i.width * s) | 0; c.height = (i.height * s) | 0
      c.getContext('2d').drawImage(i, 0, 0, c.width, c.height)
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
      res(t)
    }
    i.onerror = () => res(null)
    i.src = src
  })
}
export async function preload(memories, onProgress) {
  const photos = memories.filter((m) => m.type === 'photo')
  let done = 0
  const total = photos.length + 1
  const tick = () => onProgress(++done / total)
  await Promise.all([
    ...photos.map((m) => loadImg(m.src).then((t) => { media[m.src] = t; tick() })),
    new Promise((r) => setTimeout(r, 1800)).then(tick), // minimum display time
  ])
}
