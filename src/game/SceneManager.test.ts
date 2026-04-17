import { describe, it, expect, vi } from 'vitest'
import { SceneManager } from './SceneManager'
import type { IScene } from './IScene'
import type { Container } from 'pixi.js'

const mockStage = {} as Container

function makeScene(): IScene {
  return {
    init: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  }
}

describe('SceneManager', () => {
  it('calls init with the stage when a scene is set', () => {
    const manager = new SceneManager(mockStage)
    const scene = makeScene()
    manager.transition(scene)
    expect(scene.init).toHaveBeenCalledWith(mockStage)
  })

  it('destroys the previous scene before initialising the next', () => {
    const manager = new SceneManager(mockStage)
    const first = makeScene()
    const second = makeScene()
    manager.transition(first)
    manager.transition(second)
    expect(first.destroy).toHaveBeenCalled()
    expect(second.init).toHaveBeenCalledWith(mockStage)
  })

  it('does not call destroy when there is no previous scene', () => {
    const manager = new SceneManager(mockStage)
    const scene = makeScene()
    expect(() => manager.transition(scene)).not.toThrow()
  })

  it('delegates update to the active scene', () => {
    const manager = new SceneManager(mockStage)
    const scene = makeScene()
    manager.transition(scene)
    manager.update(16)
    expect(scene.update).toHaveBeenCalledWith(16)
  })

  it('does nothing on update when no scene is active', () => {
    const manager = new SceneManager(mockStage)
    expect(() => manager.update(16)).not.toThrow()
  })
})
