import { describe, it, expect, vi } from 'vitest'
import { GameObject } from './GameObject'
import type { Container } from 'pixi.js'
import { CANVAS_HEIGHT, ROAD_X, TILE_SIZE } from '../constants'

vi.mock('pixi.js', () => ({
  Container: vi.fn(() => ({ addChild: vi.fn(), destroy: vi.fn(), x: 0, y: 0 })),
}))

vi.mock('../AssetLoader', () => ({
  PlaceholderColors: {},
  colorRect: vi.fn(() => ({ x: 0, y: 0 })),
}))

class TestObject extends GameObject {
  readonly type = 'deadly' as const
}

const mockStage = { addChild: vi.fn() } as unknown as Container

describe('GameObject', () => {
  it('exposes the column passed to the constructor', () => {
    const obj = new TestObject(2, 0)
    expect(obj.column).toBe(2)
  })

  it('exposes y via getter', () => {
    const obj = new TestObject(1, 50)
    expect(obj.y).toBe(50)
  })

  it('update advances y by step', () => {
    const obj = new TestObject(0, 100)
    obj.init(mockStage)
    obj.update(15)
    expect(obj.y).toBe(115)
  })

  it('isOffScreen returns false when y is within canvas', () => {
    const obj = new TestObject(0, 0)
    expect(obj.isOffScreen()).toBe(false)
  })

  it('isOffScreen returns true when y exceeds canvas height', () => {
    const obj = new TestObject(0, CANVAS_HEIGHT + 1)
    expect(obj.isOffScreen()).toBe(true)
  })

  it('isOffScreen returns false exactly at canvas height', () => {
    const obj = new TestObject(0, CANVAS_HEIGHT)
    expect(obj.isOffScreen()).toBe(false)
  })

  it('init places the container at the correct x for the column', async () => {
    const { Container } = await import('pixi.js')
    vi.mocked(Container).mockClear()
    const obj = new TestObject(3, 0)
    obj.init(mockStage)
    const instance = vi.mocked(Container).mock.results[0].value
    expect(instance.x).toBe(ROAD_X + 3 * TILE_SIZE)
  })

  it('init adds the container to the stage', () => {
    const stage = { addChild: vi.fn() } as unknown as Container
    const obj = new TestObject(0, 0)
    obj.init(stage)
    expect(stage.addChild).toHaveBeenCalledOnce()
  })
})
