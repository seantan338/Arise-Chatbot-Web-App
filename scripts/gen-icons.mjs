#!/usr/bin/env node
// Generates the app icons (PNG) from scratch — no image libraries needed.
// Draws the Arise "sun over horizon" mark and PNG-encodes it with Node's zlib.
// Run: node scripts/gen-icons.mjs   (outputs to public/)
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

const OUT = new URL('../public/', import.meta.url)
mkdirSync(OUT, { recursive: true })

// ── colours (RGB) ──
const BG = [9, 81, 85] // teal-dark #095155
const SUN_A = [232, 168, 56] // gold #E8A838
const SUN_B = [20, 160, 133] // accent #14A085
const HORIZON = [192, 232, 234] // teal-mid #C0E8EA

const lerp = (a, b, t) => Math.round(a + (b - a) * t)

function draw(size) {
  const W = size
  const H = size
  const buf = Buffer.alloc(W * H * 4)
  const cx = W / 2
  const cy = H * 0.56
  const sunR = W * 0.2
  const horY0 = H * 0.66
  const horY1 = H * 0.695

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let r = BG[0],
        g = BG[1],
        b = BG[2]

      // sun (radial gradient gold→accent)
      const d = Math.hypot(x - cx, y - cy)
      if (d <= sunR) {
        const t = Math.min(1, d / sunR)
        r = lerp(SUN_A[0], SUN_B[0], t)
        g = lerp(SUN_A[1], SUN_B[1], t)
        b = lerp(SUN_A[2], SUN_B[2], t)
      }

      // horizon bar (within centre 64% width)
      if (y >= horY0 && y <= horY1 && x > W * 0.18 && x < W * 0.82) {
        r = HORIZON[0]
        g = HORIZON[1]
        b = HORIZON[2]
      }

      const i = (y * W + x) * 4
      buf[i] = r
      buf[i + 1] = g
      buf[i + 2] = b
      buf[i + 3] = 255
    }
  }
  return encodePNG(buf, W, H)
}

// ── minimal PNG encoder ──
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}
function encodePNG(rgba, W, H) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(W, 0)
  ihdr.writeUInt32BE(H, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type RGBA
  // rows with filter byte 0
  const raw = Buffer.alloc((W * 4 + 1) * H)
  for (let y = 0; y < H; y++) {
    raw[y * (W * 4 + 1)] = 0
    rgba.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4)
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  writeFileSync(new URL(name, OUT), draw(size))
  console.log('wrote public/' + name)
}
