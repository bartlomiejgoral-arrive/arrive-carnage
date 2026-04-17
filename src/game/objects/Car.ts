import type { AssetLoader } from '../AssetLoader'
import {
  columnX, CANVAS_HEIGHT, COLUMN_COUNT,
  ENEMY_CAR_SPEED_FAST, ENEMY_CAR_SPEED_SLOW,
} from '../constants'
import { GameObject } from './GameObject'

/** Left lane = fast, right lane = slow. Lerp between the two extremes. */
function laneSpeed(column: number): number {
  const minCol = 2
  const maxCol = COLUMN_COUNT - 1
  const t = (column - minCol) / (maxCol - minCol) // 0 = leftmost, 1 = rightmost
  return ENEMY_CAR_SPEED_FAST + t * (ENEMY_CAR_SPEED_SLOW - ENEMY_CAR_SPEED_FAST)
}

export class Car extends GameObject {
  private readonly speed: number

  constructor(column: number, assetLoader: AssetLoader) {
    const visual = assetLoader.createEnemyCar()
    super(visual, column)
    this.container.x = columnX(column)
    this.container.y = -100
    this.hitboxWidth = 0.55
    this.hitboxHeight = 0.85
    this.speed = laneSpeed(column)
  }

  override update(scrollSpeed: number, delta: number): void {
    this.container.y += (scrollSpeed - this.speed) * delta
  }

  override isOffScreen(): boolean {
    return this.container.y > CANVAS_HEIGHT + 50
  }
}
