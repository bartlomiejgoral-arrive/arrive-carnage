import { describe, it, expect, vi } from 'vitest'
import { Car } from './Car'
import { StreetLamp } from './StreetLamp'
import { Parkmeter } from './Parkmeter'
import { TILE_SIZE } from '../constants'

vi.mock('pixi.js', () => ({
  Container: vi.fn(() => ({ addChild: vi.fn(), destroy: vi.fn(), x: 0, y: 0 })),
}))

vi.mock('../AssetLoader', () => ({
  createEnemyCar:  vi.fn(() => ({ x: 0, y: 0 })),
  createStreetLamp: vi.fn(() => ({ x: 0, y: 0 })),
  createParkmeter: vi.fn(() => ({ x: 0, y: 0 })),
}))

describe('Car', () => {
  it('has type deadly', () => {
    expect(new Car(1).type).toBe('deadly')
  })

  it('starts above the canvas', () => {
    expect(new Car(1).y).toBe(-TILE_SIZE)
  })
})

describe('StreetLamp', () => {
  it('has type deadly', () => {
    expect(new StreetLamp(0).type).toBe('deadly')
  })

  it('starts above the canvas', () => {
    expect(new StreetLamp(0).y).toBe(-TILE_SIZE)
  })
})

describe('Parkmeter', () => {
  it('has type collectible', () => {
    expect(new Parkmeter(5).type).toBe('collectible')
  })

  it('starts above the canvas', () => {
    expect(new Parkmeter(5).y).toBe(-TILE_SIZE)
  })
})
