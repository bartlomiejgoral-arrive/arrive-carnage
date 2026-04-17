import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Container } from 'pixi.js'
import { TitleScene } from './TitleScene'
import type { InputManager } from '../InputManager'

vi.mock('pixi.js', () => {
  const Container = vi.fn(() => ({
    addChild: vi.fn(),
    destroy: vi.fn(),
  }))
  const Text = vi.fn(() => ({
    anchor: { set: vi.fn() },
    x: 0,
    y: 0,
    width: 80,
    visible: true,
  }))
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

describe('TitleScene', () => {
  let onStart: ReturnType<typeof vi.fn>
  let onLeaderboard: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onStart = vi.fn()
    onLeaderboard = vi.fn()
  })

  it('calls onStart when Enter is pressed with START selected (default)', () => {
    const { input, trigger } = makeMockInput()
    const scene = new TitleScene(input, onStart, onLeaderboard)
    scene.init(mockStage)
    trigger('enter')
    expect(onStart).toHaveBeenCalledOnce()
    expect(onLeaderboard).not.toHaveBeenCalled()
    scene.destroy()
  })

  it('calls onLeaderboard when RIGHT then Enter is pressed', () => {
    const { input, trigger } = makeMockInput()
    const scene = new TitleScene(input, onStart, onLeaderboard)
    scene.init(mockStage)
    trigger('right')
    trigger('enter')
    expect(onLeaderboard).toHaveBeenCalledOnce()
    expect(onStart).not.toHaveBeenCalled()
    scene.destroy()
  })

  it('navigates back to START after LEFT', () => {
    const { input, trigger } = makeMockInput()
    const scene = new TitleScene(input, onStart, onLeaderboard)
    scene.init(mockStage)
    trigger('right')
    trigger('left')
    trigger('enter')
    expect(onStart).toHaveBeenCalledOnce()
    scene.destroy()
  })

  it('registers left, right, and enter listeners on init', () => {
    const { input } = makeMockInput()
    const scene = new TitleScene(input, onStart, onLeaderboard)
    scene.init(mockStage)
    expect(input.on).toHaveBeenCalledWith('left', expect.any(Function))
    expect(input.on).toHaveBeenCalledWith('right', expect.any(Function))
    expect(input.on).toHaveBeenCalledWith('enter', expect.any(Function))
    scene.destroy()
  })

  it('unregisters all listeners on destroy', () => {
    const { input } = makeMockInput()
    const scene = new TitleScene(input, onStart, onLeaderboard)
    scene.init(mockStage)
    scene.destroy()
    expect(input.off).toHaveBeenCalledWith('left', expect.any(Function))
    expect(input.off).toHaveBeenCalledWith('right', expect.any(Function))
    expect(input.off).toHaveBeenCalledWith('enter', expect.any(Function))
  })
})
