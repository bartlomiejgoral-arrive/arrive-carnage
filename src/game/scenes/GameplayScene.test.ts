import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GameplayScene } from './GameplayScene'
import { ScrollingBackground } from '../ScrollingBackground'
import type { Container } from 'pixi.js'

vi.mock('../ScrollingBackground', () => ({
  ScrollingBackground: vi.fn(() => ({
    init: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    setSpeed: vi.fn(),
  })),
}))

const mockStage = { addChild: vi.fn() } as unknown as Container

beforeEach(() => {
  vi.mocked(ScrollingBackground).mockClear()
})

describe('GameplayScene', () => {
  it('delegates init to ScrollingBackground', () => {
    const scene = new GameplayScene()
    scene.init(mockStage)
    const instance = vi.mocked(ScrollingBackground).mock.results[0].value
    expect(instance.init).toHaveBeenCalledWith(mockStage)
  })

  it('delegates update to ScrollingBackground', () => {
    const scene = new GameplayScene()
    scene.init(mockStage)
    scene.update(16)
    const instance = vi.mocked(ScrollingBackground).mock.results[0].value
    expect(instance.update).toHaveBeenCalledWith(16)
  })

  it('delegates destroy to ScrollingBackground', () => {
    const scene = new GameplayScene()
    scene.init(mockStage)
    scene.destroy()
    const instance = vi.mocked(ScrollingBackground).mock.results[0].value
    expect(instance.destroy).toHaveBeenCalled()
  })
})
