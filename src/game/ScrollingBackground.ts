import { Container } from 'pixi.js'
import type { Container as ContainerType } from 'pixi.js'
import { colorRect, PlaceholderColors } from './AssetLoader'
import {
  CANVAS_HEIGHT, TILE_SIZE,
  ROAD_X, ROAD_WIDTH, GREENERY_WIDTH, COLUMN_COUNT,
} from './constants'

const NUM_ROWS = Math.ceil(CANVAS_HEIGHT / TILE_SIZE) + 2

// Pure function — tested independently of PIXI
export function calcScrolledY(
  y: number,
  step: number,
  totalHeight: number,
  canvasHeight = CANVAS_HEIGHT,
): number {
  const next = y + step
  return next >= canvasHeight ? next - totalHeight : next
}

export class ScrollingBackground {
  private readonly outerContainer = new Container()
  private readonly rows: ContainerType[] = []
  private totalHeight = 0
  private speed: number

  constructor(speed: number) {
    this.speed = speed
  }

  init(stage: ContainerType): void {
    for (let i = 0; i < NUM_ROWS; i++) {
      const row = this.buildRow()
      row.y = i * TILE_SIZE
      this.rows.push(row)
      this.outerContainer.addChild(row)
    }
    this.totalHeight = this.rows.length * TILE_SIZE
    stage.addChild(this.outerContainer)
  }

  update(delta: number): void {
    const step = this.speed * delta
    for (const row of this.rows) {
      row.y = calcScrolledY(row.y, step, this.totalHeight)
    }
  }

  setSpeed(speed: number): void {
    this.speed = speed
  }

  destroy(): void {
    this.outerContainer.destroy({ children: true })
    this.rows.length = 0
  }

  private buildRow(): ContainerType {
    const row = new Container()

    const leftGreenery = colorRect(ROAD_X, TILE_SIZE, PlaceholderColors.greenery)
    row.addChild(leftGreenery)

    for (let col = 0; col < COLUMN_COUNT; col++) {
      const isSidewalk = col === 0 || col === COLUMN_COUNT - 1
      const tile = colorRect(
        TILE_SIZE,
        TILE_SIZE,
        isSidewalk ? PlaceholderColors.sidewalk : PlaceholderColors.road,
      )
      tile.x = ROAD_X + col * TILE_SIZE
      row.addChild(tile)
    }

    const rightGreenery = colorRect(GREENERY_WIDTH, TILE_SIZE, PlaceholderColors.greenery)
    rightGreenery.x = ROAD_X + ROAD_WIDTH
    row.addChild(rightGreenery)

    return row
  }
}
