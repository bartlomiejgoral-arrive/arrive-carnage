import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Container } from 'pixi.js'
import { GameOverScene } from './GameOverScene'
import type { InputManager } from '../InputManager'
import type { ScoreStore } from '../ScoreStore'

vi.mock('pixi.js', () => {
  const Container = vi.fn(() => ({ addChild: vi.fn(), destroy: vi.fn() }))
  const Text = vi.fn(() => ({ anchor: { set: vi.fn() }, x: 0, y: 0 }))
  return { Container, Text }
})

function makeMockInput() {
  const listeners = new Map<string, Set<() => void>>()
  const input = {
    on: vi.fn((action: string, handler: () => void) => {
      if (!listeners.has(action)) listeners.set(action, new Set())
      listeners.get(action)!.add(handler)
    }),
    off: vi.fn((action: string, handler: () => void) => {
      listeners.get(action)?.delete(handler)
    }),
  } as unknown as InputManager
  const trigger = (action: string) => listeners.get(action)?.forEach(h => h())
  return { input, trigger }
}

const mockStage = { addChild: vi.fn() } as unknown as Container

describe('GameOverScene', () => {
  let onExit: ReturnType<typeof vi.fn>
  let scoreStore: ScoreStore

  beforeEach(() => {
    onExit = vi.fn()
    scoreStore = { addScore: vi.fn(), getTopScores: vi.fn().mockReturnValue([]) } as unknown as ScoreStore
  })

  it('saves the score to scoreStore on init', () => {
    const { input } = makeMockInput()
    const scene = new GameOverScene(input, scoreStore, 1234, onExit)
    scene.init(mockStage)
    expect(scoreStore.addScore).toHaveBeenCalledWith(1234)
    scene.destroy()
  })

  it('calls onExit when any key is pressed', () => {
    const { input, trigger } = makeMockInput()
    const scene = new GameOverScene(input, scoreStore, 0, onExit)
    scene.init(mockStage)
    trigger('any')
    expect(onExit).toHaveBeenCalledOnce()
    scene.destroy()
  })

  it('calls onExit only once even if multiple keys are pressed', () => {
    const { input, trigger } = makeMockInput()
    const scene = new GameOverScene(input, scoreStore, 0, onExit)
    scene.init(mockStage)
    trigger('any')
    trigger('any')
    expect(onExit).toHaveBeenCalledOnce()
    scene.destroy()
  })

  it('unregisters any listener on destroy', () => {
    const { input } = makeMockInput()
    const scene = new GameOverScene(input, scoreStore, 0, onExit)
    scene.init(mockStage)
    scene.destroy()
    expect(input.off).toHaveBeenCalledWith('any', expect.any(Function))
  })
})
