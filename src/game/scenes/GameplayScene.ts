import { Container, Text } from 'pixi.js'
import type { IScene } from '../IScene'
import { ScrollingBackground } from '../ScrollingBackground'
import { Player } from '../Player'
import { Spawner } from '../Spawner'
import { detectCollision } from '../collision'
import { formatFine } from '../formatFine'
import {
  CANVAS_WIDTH,
  FINE_PER_SECOND,
  INITIAL_SCROLL_SPEED,
  SPEED_ACCELERATION_INTERVAL,
  SPEED_INCREMENT,
} from '../constants'
import type { InputManager } from '../InputManager'

export class GameplayScene implements IScene {
  private readonly background = new ScrollingBackground(INITIAL_SCROLL_SPEED)
  private readonly player: Player
  private readonly spawner = new Spawner()
  private fineText!: Text

  private fine = 0
  private currentSpeed = INITIAL_SCROLL_SPEED
  private elapsedSeconds = 0
  private nextSpeedUpAt = SPEED_ACCELERATION_INTERVAL

  constructor(
    input: InputManager,
    private readonly onGameOver: (score: number) => void,
  ) {
    this.player = new Player(input)
  }

  init(stage: Container): void {
    this.background.init(stage)
    this.spawner.init(stage)
    this.player.init(stage)

    this.fineText = new Text({
      text: formatFine(0),
      style: { fontFamily: 'monospace', fontSize: 18, fill: 0xff4444, letterSpacing: 2 },
    })
    this.fineText.anchor.set(1, 0)
    this.fineText.x = CANVAS_WIDTH - 10
    this.fineText.y = 10
    stage.addChild(this.fineText)
  }

  update(delta: number): void {
    const dt = delta / 60

    this.elapsedSeconds += dt
    if (this.elapsedSeconds >= this.nextSpeedUpAt) {
      this.currentSpeed += SPEED_INCREMENT
      this.background.setSpeed(this.currentSpeed)
      this.spawner.setSpeed(this.currentSpeed)
      this.nextSpeedUpAt += SPEED_ACCELERATION_INTERVAL
    }

    this.background.update(delta)
    this.spawner.update(delta)

    this.fine += FINE_PER_SECOND * dt

    const hit = detectCollision(
      this.player.currentColumn,
      this.player.top,
      this.player.bottom,
      this.spawner.getObjects(),
    )

    if (hit) {
      if (hit.type === 'collectible') {
        this.fine += 50
        this.spawner.removeObject(hit)
      } else {
        this.onGameOver(Math.round(this.fine))
        return
      }
    }

    this.fineText.text = formatFine(this.fine)
  }

  destroy(): void {
    this.background.destroy()
    this.spawner.destroy()
    this.player.destroy()
    this.fineText?.destroy()
  }
}
