import type { AssetLoader } from '../AssetLoader'
import {
  columnX, CANVAS_HEIGHT, COLUMN_COUNT,
  ENEMY_CAR_SPEED_FAST, ENEMY_CAR_SPEED_SLOW,
  LANE_CHANGE_DURATION,
} from '../constants'
import { GameObject } from './GameObject'

/** Left lane = fast, right lane = slow. Lerp between the two extremes. */
export function laneSpeed(column: number): number {
  const minCol = 2
  const maxCol = COLUMN_COUNT - 1
  const t = (column - minCol) / (maxCol - minCol)
  return ENEMY_CAR_SPEED_FAST + t * (ENEMY_CAR_SPEED_SLOW - ENEMY_CAR_SPEED_FAST)
}

/** Smooth-step easing: accelerate then decelerate */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

export class Car extends GameObject {
  private currentSpeed: number

  // Lane-change state
  private startX = 0
  private targetX = 0
  private startSpeed = 0
  private targetSpeed = 0
  private laneProgress = 0
  private _changingLane = false

  constructor(column: number, assetLoader: AssetLoader) {
    const visual = assetLoader.createEnemyCar()
    super(visual, column)
    this.container.x = columnX(column)
    this.container.y = -100
    this.hitboxWidth = 0.55
    this.hitboxHeight = 0.85
    this.currentSpeed = laneSpeed(column)
  }

  get isChangingLane(): boolean {
    return this._changingLane
  }

  startLaneChange(newColumn: number): void {
    this.startX = this.container.x
    this.targetX = columnX(newColumn)
    this.startSpeed = this.currentSpeed
    this.targetSpeed = laneSpeed(newColumn)
    this.laneProgress = 0
    this._changingLane = true
    this.column = newColumn
  }

  override update(scrollSpeed: number, delta: number): void {
    if (this._changingLane) {
      this.laneProgress += delta / LANE_CHANGE_DURATION
      if (this.laneProgress >= 1) {
        this.container.x = this.targetX
        this.currentSpeed = this.targetSpeed
        this._changingLane = false
      } else {
        const t = smoothstep(this.laneProgress)
        this.container.x = this.startX + (this.targetX - this.startX) * t
        this.currentSpeed = this.startSpeed + (this.targetSpeed - this.startSpeed) * t
      }
    }

    this.container.y += (scrollSpeed - this.currentSpeed) * delta
  }

  override isOffScreen(): boolean {
    return this.container.y > CANVAS_HEIGHT + 50
  }
}
