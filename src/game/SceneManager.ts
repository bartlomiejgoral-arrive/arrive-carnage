import type { Container } from 'pixi.js'
import type { IScene } from './IScene'

export class SceneManager {
  private current: IScene | null = null

  constructor(private readonly stage: Container) {}

  transition(next: IScene): void {
    this.current?.destroy()
    this.current = next
    next.init(this.stage)
  }

  update(delta: number): void {
    this.current?.update(delta)
  }
}
