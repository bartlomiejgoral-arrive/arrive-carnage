import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { InputManager } from './InputManager'

describe('InputManager', () => {
  let manager: InputManager

  beforeEach(() => {
    manager = new InputManager()
  })

  afterEach(() => {
    manager.destroy()
  })

  it('dispatches left on ArrowLeft', () => {
    const handler = vi.fn()
    manager.on('left', handler)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('dispatches right on ArrowRight', () => {
    const handler = vi.fn()
    manager.on('right', handler)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('dispatches enter on Enter key', () => {
    const handler = vi.fn()
    manager.on('enter', handler)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('dispatches enter on Space key', () => {
    const handler = vi.fn()
    manager.on('enter', handler)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('dispatches any on every keydown', () => {
    const handler = vi.fn()
    manager.on('any', handler)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('does not dispatch left on non-arrow keys', () => {
    const handler = vi.fn()
    manager.on('left', handler)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    expect(handler).not.toHaveBeenCalled()
  })

  it('stops dispatching after off()', () => {
    const handler = vi.fn()
    manager.on('left', handler)
    manager.off('left', handler)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(handler).not.toHaveBeenCalled()
  })

  it('stops all dispatching after destroy()', () => {
    const handler = vi.fn()
    manager.on('any', handler)
    manager.destroy()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    expect(handler).not.toHaveBeenCalled()
  })

  it('supports multiple handlers for the same action', () => {
    const a = vi.fn()
    const b = vi.fn()
    manager.on('right', a)
    manager.on('right', b)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(a).toHaveBeenCalledOnce()
    expect(b).toHaveBeenCalledOnce()
  })
})
