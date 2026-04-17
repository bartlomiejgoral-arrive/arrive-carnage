export type InputAction = 'left' | 'right' | 'enter' | 'any'
export type InputHandler = () => void

export class InputManager {
  private readonly handlers = new Map<InputAction, Set<InputHandler>>()
  private readonly onKeyDown: (e: KeyboardEvent) => void

  constructor() {
    this.onKeyDown = (e: KeyboardEvent) => this.handleKey(e)
    window.addEventListener('keydown', this.onKeyDown)
  }

  on(action: InputAction, handler: InputHandler): void {
    if (!this.handlers.has(action)) {
      this.handlers.set(action, new Set())
    }
    this.handlers.get(action)!.add(handler)
  }

  off(action: InputAction, handler: InputHandler): void {
    this.handlers.get(action)?.delete(handler)
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    this.handlers.clear()
  }

  private handleKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft') this.dispatch('left')
    else if (e.key === 'ArrowRight') this.dispatch('right')
    else if (e.key === 'Enter' || e.key === ' ') this.dispatch('enter')
    this.dispatch('any')
  }

  private dispatch(action: InputAction): void {
    this.handlers.get(action)?.forEach(h => h())
  }
}
