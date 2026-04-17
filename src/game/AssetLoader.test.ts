import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  colorRect, PlaceholderColors,
  loadGameAssets, _clearTexturesForTesting,
  createPlayerCar, createEnemyCar, createStreetLamp, createParkmeter,
} from './AssetLoader'

vi.mock('pixi.js', () => ({
  Graphics: vi.fn(() => ({
    rect: vi.fn().mockReturnThis(),
    fill: vi.fn().mockReturnThis(),
    x: 0,
  })),
  Sprite: vi.fn(() => ({ width: 0, height: 0, x: 0, tint: 0xffffff })),
  Assets: {
    load: vi.fn(async (paths: string[]) =>
      Object.fromEntries(paths.map((p: string) => [p, Symbol(p)])),
    ),
  },
}))

beforeEach(() => {
  _clearTexturesForTesting()
})

describe('colorRect', () => {
  it('calls rect with 0, 0 origin and the given dimensions', () => {
    const g = colorRect(120, 80, 0xff0000)
    expect(g.rect).toHaveBeenCalledWith(0, 0, 120, 80)
  })

  it('calls fill with the given color', () => {
    const g = colorRect(10, 10, 0x00ff00)
    expect(g.fill).toHaveBeenCalledWith(0x00ff00)
  })
})

describe('PlaceholderColors', () => {
  it('defines colours for all game objects', () => {
    const keys: (keyof typeof PlaceholderColors)[] = [
      'greenery', 'sidewalk', 'road',
      'playerCar', 'enemyCar', 'parkmeter', 'streetLamp',
    ]
    for (const key of keys) {
      expect(PlaceholderColors[key]).toBeTypeOf('number')
    }
  })
})

describe('factory functions — fallback (no textures loaded)', () => {
  it('createPlayerCar returns a Graphics fallback', () => {
    expect(createPlayerCar()).toHaveProperty('rect')
  })

  it('createEnemyCar returns a Graphics fallback', () => {
    expect(createEnemyCar()).toHaveProperty('rect')
  })

  it('createStreetLamp returns a Graphics fallback for left column', () => {
    expect(createStreetLamp(0)).toHaveProperty('rect')
  })

  it('createStreetLamp returns a Graphics fallback for right column', () => {
    expect(createStreetLamp(5)).toHaveProperty('rect')
  })

  it('createParkmeter returns a Graphics fallback', () => {
    expect(createParkmeter()).toHaveProperty('rect')
  })
})

describe('loadGameAssets', () => {
  it('calls Assets.load with car, lamp and meter paths', async () => {
    const { Assets } = await import('pixi.js')
    vi.mocked(Assets.load).mockClear()
    await loadGameAssets()
    expect(Assets.load).toHaveBeenCalledOnce()
    const paths = vi.mocked(Assets.load).mock.calls[0][0] as string[]
    expect(paths.some(p => p.includes('/cars/'))).toBe(true)
    expect(paths.some(p => p.includes('/lights/'))).toBe(true)
    expect(paths.some(p => p.includes('/meters/'))).toBe(true)
  })

  it('factory functions return Sprites after loading', async () => {
    await loadGameAssets()
    expect(createPlayerCar()).toHaveProperty('tint')
    expect(createEnemyCar()).toHaveProperty('width')
    expect(createStreetLamp(0)).toHaveProperty('width')
    expect(createParkmeter()).toHaveProperty('width')
  })
})
