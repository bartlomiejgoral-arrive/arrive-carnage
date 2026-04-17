import { describe, it, expect, vi } from 'vitest'
import { colorRect, PlaceholderColors } from './AssetLoader'

vi.mock('pixi.js', () => ({
  Graphics: vi.fn(() => ({
    rect: vi.fn().mockReturnThis(),
    fill: vi.fn().mockReturnThis(),
  })),
}))

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
