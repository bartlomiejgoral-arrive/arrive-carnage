import { Container, Text } from 'pixi.js'
import type { IScene } from '../IScene'
import type { InputManager } from '../InputManager'
import type { AssetLoader } from '../AssetLoader'
import type { SoundManager } from '../SoundManager'
import { ScrollingBackground } from '../ScrollingBackground'
import { Spawner } from '../Spawner'
import { Car } from '../objects/Car'
import { StreetLamp } from '../objects/StreetLamp'
import { Parkmeter } from '../objects/Parkmeter'
import {
  INITIAL_SCROLL_SPEED, SPEED_INCREMENT, SPEED_ACCELERATION_INTERVAL,
  PLAYER_START_COLUMN, PLAYER_Y, PLAYER_SPEED,
  SCORE_RATE, PARKMETER_BONUS,
  columnX, COLUMN_COUNT,
} from '../constants'

import type { Hitbox } from '../objects/GameObject'

// Player car hitbox — same shrink as enemy cars (55% width, 85% height)
function playerHitbox(player: Container): Hitbox {
  const b = player.getBounds()
  const trimX = b.width * 0.225   // (1 - 0.55) / 2
  const trimY = b.height * 0.075  // (1 - 0.85) / 2
  return { x: b.x + trimX, y: b.y + trimY, width: b.width * 0.55, height: b.height * 0.85 }
}

function rectsOverlap(a: Hitbox, b: Hitbox): boolean {
  return a.x < b.x + b.width
      && a.x + a.width > b.x
      && a.y < b.y + b.height
      && a.y + a.height > b.y
}

function formatScore(score: number): string {
  const floored = Math.floor(score)
  const formatted = floored.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `-$${formatted}`
}

const MIN_X = columnX(1)
const MAX_X = columnX(COLUMN_COUNT)
const LATERAL_ACCEL = 1200     // px/s² — how fast car picks up speed
const LATERAL_FRICTION = 4     // damping when coasting (no input)
const MAX_TILT = 0.15          // radians (~8.5°)
const TILT_LERP = 8            // how fast visual tilt follows velocity

export class GameplayScene implements IScene {
  private readonly container = new Container()
  private readonly background: ScrollingBackground
  private readonly player: Container
  private readonly hud: Text
  private spawner!: Spawner
  private elapsedTime = 0
  private score = 0
  private alive = true
  private leftHeld = false
  private rightHeld = false
  private lateralVelocity = 0  // px/s
  private currentTilt = 0

  private readonly onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') this.leftHeld = true
    else if (e.key === 'ArrowRight') this.rightHeld = true
  }

  private readonly onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') this.leftHeld = false
    else if (e.key === 'ArrowRight') this.rightHeld = false
  }

  constructor(
    private readonly input: InputManager,
    private readonly assetLoader: AssetLoader,
    private readonly sound: SoundManager,
    private readonly onGameOver: (score: number) => void,
  ) {
    this.background = new ScrollingBackground(INITIAL_SCROLL_SPEED, this.assetLoader)
    this.player = this.assetLoader.createPlayerCar()
    this.hud = new Text({
      text: formatScore(0),
      style: { fontFamily: 'monospace', fontSize: 18, fill: 0xffffff },
    })
  }

  init(stage: Container): void {
    this.background.init(this.container)
    this.spawner = new Spawner(this.assetLoader, this.container)

    this.player.x = columnX(PLAYER_START_COLUMN)
    this.player.y = PLAYER_Y
    this.container.addChild(this.player)

    this.hud.x = 10
    this.hud.y = 10
    this.hud.zIndex = 100
    this.container.sortableChildren = true
    this.container.addChild(this.hud)

    stage.addChild(this.container)

    this.sound.startMusic()
    this.sound.startEngine()

    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  update(delta: number): void {
    if (!this.alive) return

    // Player movement — velocity based with momentum
    const dir = (this.rightHeld ? 1 : 0) - (this.leftHeld ? 1 : 0)
    if (dir !== 0) {
      this.lateralVelocity += dir * LATERAL_ACCEL * delta
      this.lateralVelocity = Math.max(-PLAYER_SPEED, Math.min(PLAYER_SPEED, this.lateralVelocity))
    } else {
      this.lateralVelocity -= this.lateralVelocity * LATERAL_FRICTION * delta
      if (Math.abs(this.lateralVelocity) < 1) this.lateralVelocity = 0
    }
    this.player.x += this.lateralVelocity * delta
    this.player.x = Math.max(MIN_X, Math.min(MAX_X, this.player.x))

    // Tilt derived from lateral velocity — naturally synced with movement
    const targetTilt = (this.lateralVelocity / PLAYER_SPEED) * MAX_TILT
    this.currentTilt += (targetTilt - this.currentTilt) * Math.min(1, TILT_LERP * delta)
    this.player.rotation = this.currentTilt

    this.elapsedTime += delta
    const speed = INITIAL_SCROLL_SPEED
      + Math.floor(this.elapsedTime / SPEED_ACCELERATION_INTERVAL) * SPEED_INCREMENT

    this.background.setSpeed(speed)
    this.background.update(delta)
    this.sound.setEnginePitch(speed / INITIAL_SCROLL_SPEED)

    this.spawner.update(speed, delta)

    const ph = playerHitbox(this.player)
    for (let i = this.spawner.objects.length - 1; i >= 0; i--) {
      const obj = this.spawner.objects[i]
      if (!rectsOverlap(ph, obj.getHitbox())) continue

      if (obj instanceof Parkmeter) {
        this.sound.play('pickup')
        this.score += PARKMETER_BONUS
        obj.destroy()
        this.spawner.objects.splice(i, 1)
      } else if (obj instanceof Car || obj instanceof StreetLamp) {
        this.sound.play('crash')
        this.alive = false
        this.onGameOver(Math.floor(this.score))
        return
      }
    }

    this.score += SCORE_RATE * delta
    this.hud.text = formatScore(this.score)
  }

  destroy(): void {
    this.sound.stopMusic()
    this.sound.stopEngine()
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    this.spawner.destroy()
    this.container.destroy({ children: true })
  }
}
