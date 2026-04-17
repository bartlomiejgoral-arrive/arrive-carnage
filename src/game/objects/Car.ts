import type { AssetLoader } from '../AssetLoader'
import { columnX, CANVAS_HEIGHT, ENEMY_CAR_SPEED } from '../constants'
import { GameObject } from './GameObject'

export class Car extends GameObject {
  constructor(column: number, assetLoader: AssetLoader) {
    const visual = assetLoader.createEnemyCar()
    super(visual, column)
    this.container.x = columnX(column)
    this.container.y = -100
    this.hitboxWidth = 0.55
    this.hitboxHeight = 0.85
  }

  /** Moves at the difference between player speed and car's own constant speed */
  override update(speed: number, delta: number): void {
    this.container.y += (speed - ENEMY_CAR_SPEED) * delta
  }

  override isOffScreen(): boolean {
    return this.container.y > CANVAS_HEIGHT + 50
  }
}
