import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GameplayScene } from './GameplayScene'
import { ScrollingBackground } from '../ScrollingBackground'
import { Player } from '../Player'
import type { Container } from 'pixi.js'
import type { InputManager } from '../InputManager'

vi.mock('../ScrollingBackground', () => ({
  ScrollingBackground: vi.fn(() => ({
    init: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    setSpeed: vi.fn(),
  })),
}))

vi.mock('../Player', () => ({
  Player: vi.fn(() => ({
    init: vi.fn(),
    destroy: vi.fn(),
  })),
}))

const mockInput = {} as InputManager
const mockStage = { addChild: vi.fn() } as unknown as Container

beforeEach(() => {
  vi.mocked(ScrollingBackground).mockClear()
  vi.mocked(Player).mockClear()
})

describe('GameplayScene', () => {
  it('delegates init to ScrollingBackground and Player', () => {
    const scene = new GameplayScene(mockInput)
    scene.init(mockStage)
    const bg = vi.mocked(ScrollingBackground).mock.results[0].value
    const player = vi.mocked(Player).mock.results[0].value
    expect(bg.init).toHaveBeenCalledWith(mockStage)
    expect(player.init).toHaveBeenCalledWith(mockStage)
  })

  it('delegates update to ScrollingBackground', () => {
    const scene = new GameplayScene(mockInput)
    scene.init(mockStage)
    scene.update(16)
    const bg = vi.mocked(ScrollingBackground).mock.results[0].value
    expect(bg.update).toHaveBeenCalledWith(16)
  })

  it('delegates destroy to ScrollingBackground and Player', () => {
    const scene = new GameplayScene(mockInput)
    scene.init(mockStage)
    scene.destroy()
    const bg = vi.mocked(ScrollingBackground).mock.results[0].value
    const player = vi.mocked(Player).mock.results[0].value
    expect(bg.destroy).toHaveBeenCalled()
    expect(player.destroy).toHaveBeenCalled()
  })
})
