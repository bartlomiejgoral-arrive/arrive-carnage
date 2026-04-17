import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GameplayScene } from './GameplayScene'
import { ScrollingBackground } from '../ScrollingBackground'
import { Player } from '../Player'
import { Spawner } from '../Spawner'
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

vi.mock('../Spawner', () => ({
  Spawner: vi.fn(() => ({
    init: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    setSpeed: vi.fn(),
    getObjects: vi.fn(() => []),
  })),
}))

const mockInput = {} as InputManager
const mockStage = { addChild: vi.fn() } as unknown as Container

beforeEach(() => {
  vi.mocked(ScrollingBackground).mockClear()
  vi.mocked(Player).mockClear()
  vi.mocked(Spawner).mockClear()
})

describe('GameplayScene', () => {
  it('inits background, spawner and player', () => {
    const scene = new GameplayScene(mockInput)
    scene.init(mockStage)
    expect(vi.mocked(ScrollingBackground).mock.results[0].value.init).toHaveBeenCalledWith(mockStage)
    expect(vi.mocked(Spawner).mock.results[0].value.init).toHaveBeenCalledWith(mockStage)
    expect(vi.mocked(Player).mock.results[0].value.init).toHaveBeenCalledWith(mockStage)
  })

  it('updates background and spawner each tick', () => {
    const scene = new GameplayScene(mockInput)
    scene.init(mockStage)
    scene.update(16)
    expect(vi.mocked(ScrollingBackground).mock.results[0].value.update).toHaveBeenCalledWith(16)
    expect(vi.mocked(Spawner).mock.results[0].value.update).toHaveBeenCalledWith(16)
  })

  it('destroys background, spawner and player', () => {
    const scene = new GameplayScene(mockInput)
    scene.init(mockStage)
    scene.destroy()
    expect(vi.mocked(ScrollingBackground).mock.results[0].value.destroy).toHaveBeenCalled()
    expect(vi.mocked(Spawner).mock.results[0].value.destroy).toHaveBeenCalled()
    expect(vi.mocked(Player).mock.results[0].value.destroy).toHaveBeenCalled()
  })
})
