import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Container } from 'pixi.js'
import { LeaderboardScene } from './LeaderboardScene'
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

describe('LeaderboardScene', () => {
  let onExit: ReturnType<typeof vi.fn>
  let scoreStore: ScoreStore

  beforeEach(() => {
    onExit = vi.fn()
    scoreStore = { getTopScores: vi.fn().mockReturnValue([]), addScore: vi.fn() } as unknown as ScoreStore
  })

  it('calls onExit when Enter is pressed', () => {
    const { input, trigger } = makeMockInput()
    const scene = new LeaderboardScene(input, scoreStore, onExit)
    scene.init(mockStage)
    trigger('enter')
    expect(onExit).toHaveBeenCalledOnce()
    scene.destroy()
  })

  it('reads scores from scoreStore on init', () => {
    const { input } = makeMockInput()
    const scene = new LeaderboardScene(input, scoreStore, onExit)
    scene.init(mockStage)
    expect(scoreStore.getTopScores).toHaveBeenCalled()
    scene.destroy()
  })

  it('unregisters enter listener on destroy', () => {
    const { input } = makeMockInput()
    const scene = new LeaderboardScene(input, scoreStore, onExit)
    scene.init(mockStage)
    scene.destroy()
    expect(input.off).toHaveBeenCalledWith('enter', expect.any(Function))
  })

  it('does not call onExit before any key is pressed', () => {
    const { input } = makeMockInput()
    const scene = new LeaderboardScene(input, scoreStore, onExit)
    scene.init(mockStage)
    expect(onExit).not.toHaveBeenCalled()
    scene.destroy()
  })
})
