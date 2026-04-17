import type { Container } from 'pixi.js'
import type { IScene } from '../IScene'
import { ScrollingBackground } from '../ScrollingBackground'
import { Player } from '../Player'
import { Spawner } from '../Spawner'
import { INITIAL_SCROLL_SPEED } from '../constants'
import type { InputManager } from '../InputManager'

export class GameplayScene implements IScene {
  private readonly background = new ScrollingBackground(INITIAL_SCROLL_SPEED)
  private readonly player: Player
  private readonly spawner = new Spawner()

  constructor(input: InputManager) {
    this.player = new Player(input)
  }

  init(stage: Container): void {
    this.background.init(stage)
    this.spawner.init(stage)
    this.player.init(stage)
  }

  update(delta: number): void {
    this.background.update(delta)
    this.spawner.update(delta)
  }

  destroy(): void {
    this.background.destroy()
    this.spawner.destroy()
    this.player.destroy()
  }
}
