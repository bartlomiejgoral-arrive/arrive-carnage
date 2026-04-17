import type { AssetLoader } from '../AssetLoader'
import {
  columnX, CANVAS_HEIGHT, COLUMN_COUNT,
  ENEMY_CAR_SPEED_FAST, ENEMY_CAR_SPEED_SLOW,
  LANE_CHANGE_DURATION,
} from '../constants'
import { GameObject, type Hitbox } from './GameObject'

// Fixed hitbox matching the actual car body within the 248px sprite at 0.32 scale
const CAR_HITBOX_W = 248 * 0.32 * 0.60  // ~48px
const CAR_HITBOX_H = 248 * 0.32 * 0.85  // ~67px

/** Left lane = fast, right lane = slow. Lerp between the two extremes. */
export function laneSpeed(column: number): number {
  const minCol = 2
  const maxCol = COLUMN_COUNT - 1
  const t = (column - minCol) / (maxCol - minCol)
  return ENEMY_CAR_SPEED_FAST + t * (ENEMY_CAR_SPEED_SLOW - ENEMY_CAR_SPEED_FAST)
}

/** Quintic smootherstep — flatter at both ends than basic smoothstep */
function smootherstep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

const LANE_CHANGE_TILT = 0.12  // max rotation in radians (~7°)

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
    this.currentSpeed = laneSpeed(column)
  }

  override getHitbox(): Hitbox {
    return {
      x: this.container.x - CAR_HITBOX_W / 2,
      y: this.container.y - CAR_HITBOX_H / 2,
      width: CAR_HITBOX_W,
      height: CAR_HITBOX_H,
    }
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
        this.container.rotation = 0
        this.currentSpeed = this.targetSpeed
        this._changingLane = false
      } else {
        const t = smootherstep(this.laneProgress)
        this.container.x = this.startX + (this.targetX - this.startX) * t
        this.currentSpeed = this.startSpeed + (this.targetSpeed - this.startSpeed) * t

        // Tilt toward the direction of movement — peaks at midpoint, eases out
        const tiltAmount = Math.sin(this.laneProgress * Math.PI)
        const dir = this.targetX > this.startX ? 1 : -1
        this.container.rotation = dir * LANE_CHANGE_TILT * tiltAmount
      }
    }

    this.container.y += (scrollSpeed - this.currentSpeed) * delta
  }

  override isOffScreen(): boolean {
    return this.container.y > CANVAS_HEIGHT + 50
  }
}
