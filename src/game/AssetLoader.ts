import { Graphics, Sprite, Assets } from 'pixi.js'
import type { Texture, DisplayObject } from 'pixi.js'
import { TILE_SIZE, COLUMN_COUNT } from './constants'

export const PlaceholderColors = {
  greenery:   0x3a7d44,
  sidewalk:   0x888877,
  road:       0x222233,
  playerCar:  0x4488ff,
  enemyCar:   0xff3333,
  parkmeter:  0xffdd00,
  streetLamp: 0x999999,
} as const

export function colorRect(width: number, height: number, color: number): Graphics {
  const g = new Graphics()
  g.rect(0, 0, width, height).fill(color)
  return g
}

// ─── sprite dimensions ────────────────────────────────────────────────────────

const CAR_SIZE  = Math.round(TILE_SIZE * 0.8)   // 64 px — cars are square
const LAMP_SIZE = Math.round(TILE_SIZE * 0.8)   // 64 px
const METER_SIZE = Math.round(TILE_SIZE * 0.6)  // 48 px

const CAR_OFFSET   = Math.round((TILE_SIZE - CAR_SIZE) / 2)
const LAMP_OFFSET  = Math.round((TILE_SIZE - LAMP_SIZE) / 2)
const METER_OFFSET = Math.round((TILE_SIZE - METER_SIZE) / 2)

const CAR_COUNT = 23

// ─── texture store ────────────────────────────────────────────────────────────

const textures = new Map<string, Texture>()

function carPath(n: number) { return `/cars/car_${n}.png` }
const LAMP_PATHS = [
  '/lights/street-light-1-left.png',
  '/lights/street-light-1-right.png',
  '/lights/street-light-2-left.png',
  '/lights/street-light-2-right.png',
]
const METER_PATH = '/meters/parking-meeter.png'

export function _clearTexturesForTesting(): void {
  textures.clear()
}

export async function loadGameAssets(): Promise<void> {
  const paths = [
    ...Array.from({ length: CAR_COUNT }, (_, i) => carPath(i + 1)),
    ...LAMP_PATHS,
    METER_PATH,
  ]
  const loaded = await Assets.load(paths) as Record<string, Texture>
  for (const [key, tex] of Object.entries(loaded)) {
    textures.set(key, tex)
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function sprite(path: string, size: number, offset: number): Sprite {
  const tex = textures.get(path)!
  const s = new Sprite(tex)
  s.width = size
  s.height = size
  s.x = offset
  return s
}

function fallback(size: number, offset: number, color: number): Graphics {
  const g = colorRect(size, size, color)
  g.x = offset
  return g
}

function hasTexture(path: string) { return textures.has(path) }

// ─── public factories ─────────────────────────────────────────────────────────

export function createPlayerCar(): DisplayObject {
  const path = carPath(1)
  if (!hasTexture(path)) return fallback(CAR_SIZE, CAR_OFFSET, PlaceholderColors.playerCar)
  const s = sprite(path, CAR_SIZE, CAR_OFFSET)
  s.tint = 0x4488ff
  return s
}

export function createEnemyCar(): DisplayObject {
  const n = Math.floor(Math.random() * CAR_COUNT) + 1
  const path = carPath(n)
  if (!hasTexture(path)) return fallback(CAR_SIZE, CAR_OFFSET, PlaceholderColors.enemyCar)
  return sprite(path, CAR_SIZE, CAR_OFFSET)
}

export function createStreetLamp(column: number): DisplayObject {
  const side = column === 0 ? 'left' : 'right'
  const variant = Math.random() < 0.5 ? 1 : 2
  const path = `/lights/street-light-${variant}-${side}.png`
  if (!hasTexture(path)) return fallback(LAMP_SIZE, LAMP_OFFSET, PlaceholderColors.streetLamp)
  return sprite(path, LAMP_SIZE, LAMP_OFFSET)
}

export function createParkmeter(): DisplayObject {
  if (!hasTexture(METER_PATH)) return fallback(METER_SIZE, METER_OFFSET, PlaceholderColors.parkmeter)
  return sprite(METER_PATH, METER_SIZE, METER_OFFSET)
}
