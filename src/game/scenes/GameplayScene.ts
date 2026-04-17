import type { Container } from 'pixi.js'
import type { IScene } from '../IScene'
import { ScrollingBackground } from '../ScrollingBackground'
import { Player } from '../Player'
import { INITIAL_SCROLL_SPEED } from '../constants'
import type { InputManager } from '../InputManager'

export class GameplayScene implements IScene {
  private readonly background = new ScrollingBackground(INITIAL_SCROLL_SPEED)
  private readonly player: Player

  constructor(input: InputManager) {
    this.player = new Player(input)
  }

  init(stage: Container): void {
    this.background.init(stage)
    this.player.init(stage)
  }

  update(delta: number): void {
    this.background.update(delta)
  }

  destroy(): void {
    this.background.destroy()
    this.player.destroy()
  }
}
