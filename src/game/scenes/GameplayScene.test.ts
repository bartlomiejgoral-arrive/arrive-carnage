import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GameplayScene } from './GameplayScene'
import { ScrollingBackground } from '../ScrollingBackground'
import { Player } from '../Player'
import { Spawner } from '../Spawner'
import { detectCollision } from '../collision'
import type { Container } from 'pixi.js'
import type { InputManager } from '../InputManager'
import { SPEED_ACCELERATION_INTERVAL, INITIAL_SCROLL_SPEED, SPEED_INCREMENT, FINE_PER_SECOND } from '../constants'

vi.mock('pixi.js', () => ({
  Text: vi.fn(() => ({ text: '', x: 0, y: 0, anchor: { set: vi.fn() }, destroy: vi.fn() })),
}))

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
    currentColumn: 2,
    top: 516,
    bottom: 580,
  })),
}))

vi.mock('../Spawner', () => ({
  Spawner: vi.fn(() => ({
    init: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    setSpeed: vi.fn(),
    getObjects: vi.fn(() => []),
    removeObject: vi.fn(),
  })),
}))

vi.mock('../collision', () => ({
  detectCollision: vi.fn(() => null),
}))

const mockInput = {} as InputManager
const mockStage = { addChild: vi.fn() } as unknown as Container

function makeScene(onGameOver = vi.fn()) {
  return { scene: new GameplayScene(mockInput, onGameOver), onGameOver }
}

beforeEach(() => {
  vi.mocked(ScrollingBackground).mockClear()
  vi.mocked(Player).mockClear()
  vi.mocked(Spawner).mockClear()
  vi.mocked(detectCollision).mockReturnValue(null)
})

describe('GameplayScene', () => {
  it('inits background, spawner and player', () => {
    const { scene } = makeScene()
    scene.init(mockStage)
    expect(vi.mocked(ScrollingBackground).mock.results[0].value.init).toHaveBeenCalledWith(mockStage)
    expect(vi.mocked(Spawner).mock.results[0].value.init).toHaveBeenCalledWith(mockStage)
    expect(vi.mocked(Player).mock.results[0].value.init).toHaveBeenCalledWith(mockStage)
  })

  it('updates background and spawner each tick', () => {
    const { scene } = makeScene()
    scene.init(mockStage)
    scene.update(1)
    expect(vi.mocked(ScrollingBackground).mock.results[0].value.update).toHaveBeenCalledWith(1)
    expect(vi.mocked(Spawner).mock.results[0].value.update).toHaveBeenCalledWith(1)
  })

  it('destroys background, spawner and player', () => {
    const { scene } = makeScene()
    scene.init(mockStage)
    scene.destroy()
    expect(vi.mocked(ScrollingBackground).mock.results[0].value.destroy).toHaveBeenCalled()
    expect(vi.mocked(Spawner).mock.results[0].value.destroy).toHaveBeenCalled()
    expect(vi.mocked(Player).mock.results[0].value.destroy).toHaveBeenCalled()
  })

  it('increments speed after SPEED_ACCELERATION_INTERVAL seconds', () => {
    const { scene } = makeScene()
    scene.init(mockStage)
    scene.update(SPEED_ACCELERATION_INTERVAL * 60) // simulate 10 seconds in one tick
    const bg = vi.mocked(ScrollingBackground).mock.results[0].value
    const sp = vi.mocked(Spawner).mock.results[0].value
    const expected = INITIAL_SCROLL_SPEED + SPEED_INCREMENT
    expect(bg.setSpeed).toHaveBeenCalledWith(expected)
    expect(sp.setSpeed).toHaveBeenCalledWith(expected)
  })

  it('calls onGameOver when a deadly object is hit', () => {
    vi.mocked(detectCollision).mockReturnValue({ column: 2, y: 520, type: 'deadly' })
    const { scene, onGameOver } = makeScene()
    scene.init(mockStage)
    scene.update(1)
    expect(onGameOver).toHaveBeenCalledOnce()
  })

  it('passes the accumulated fine to onGameOver', () => {
    vi.mocked(detectCollision).mockReturnValue({ column: 2, y: 520, type: 'deadly' })
    const { scene, onGameOver } = makeScene()
    scene.init(mockStage)
    scene.update(60) // 1 second → fine = FINE_PER_SECOND * 1
    expect(onGameOver).toHaveBeenCalledWith(FINE_PER_SECOND)
  })

  it('removes a collectible object and adds $50 fine on collision', () => {
    const parkmeter = { column: 2, y: 520, type: 'collectible' as const }
    vi.mocked(detectCollision).mockReturnValueOnce(parkmeter).mockReturnValue(null)
    const { scene } = makeScene()
    scene.init(mockStage)
    scene.update(60) // 1 second + parkmeter

    const spawner = vi.mocked(Spawner).mock.results[0].value
    expect(spawner.removeObject).toHaveBeenCalledWith(parkmeter)
  })

  it('does not call onGameOver when a collectible is hit', () => {
    vi.mocked(detectCollision).mockReturnValue({ column: 2, y: 520, type: 'collectible' })
    const { scene, onGameOver } = makeScene()
    scene.init(mockStage)
    scene.update(1)
    expect(onGameOver).not.toHaveBeenCalled()
  })
})
