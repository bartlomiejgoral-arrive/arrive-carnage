import type { Container } from 'pixi.js'
import type { IScene } from '../IScene'
import { ScrollingBackground } from '../ScrollingBackground'
import { INITIAL_SCROLL_SPEED } from '../constants'

export class GameplayScene implements IScene {
  private readonly background = new ScrollingBackground(INITIAL_SCROLL_SPEED)

  init(stage: Container): void {
    this.background.init(stage)
  }

  update(delta: number): void {
    this.background.update(delta)
  }

  destroy(): void {
    this.background.destroy()
  }
}
