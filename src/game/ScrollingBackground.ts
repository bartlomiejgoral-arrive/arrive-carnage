import { Container } from 'pixi.js'
import type { Container as ContainerType } from 'pixi.js'
import { colorRect, PlaceholderColors } from './AssetLoader'
import type { AssetLoader } from './AssetLoader'
import {
  CANVAS_HEIGHT, CANVAS_WIDTH, TILE_SIZE,
  ROAD_X, ROAD_WIDTH, COLUMN_COUNT,
} from './constants'
import { AsphaltCrackFilter } from './AsphaltCrackFilter'

// Extend greenery far beyond the canvas so it fills any screen aspect ratio
const GREENERY_OVERFLOW = 1200

const NUM_ROWS = Math.ceil(CANVAS_HEIGHT / TILE_SIZE) + 2

// Tree placement: one roll per TREE_SPACING px across each green strip
const TREE_SPACING = 120
const TREE_CHANCE = 0.25
const TREE_MARGIN = 60  // keep trees away from sidewalk edges

const LANE_X = ROAD_X + TILE_SIZE
const LANE_WIDTH = (COLUMN_COUNT - 2) * TILE_SIZE



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
  private readonly assetLoader: AssetLoader | null
  private roadOverlay: ContainerType | null = null
  private crackFilter: AsphaltCrackFilter | null = null

  constructor(speed: number, assetLoader?: AssetLoader) {
    this.speed = speed
    this.assetLoader = assetLoader ?? null
  }

  init(stage: ContainerType): void {
    for (let i = 0; i < NUM_ROWS; i++) {
      const row = this.buildRow()
      row.y = i * TILE_SIZE
      this.rows.push(row)
      this.outerContainer.addChild(row)
    }
    this.totalHeight = this.rows.length * TILE_SIZE
    // Road crack overlay renders below the scrolling rows so lane dashes sit on top
    this.roadOverlay = colorRect(LANE_WIDTH, CANVAS_HEIGHT, PlaceholderColors.road)
    this.roadOverlay.x = LANE_X
    this.crackFilter = new AsphaltCrackFilter()
    this.roadOverlay.filters = [this.crackFilter]
    stage.addChild(this.roadOverlay)

    stage.addChild(this.outerContainer)
  }

  update(delta: number): void {
    const step = this.speed * delta
    for (const row of this.rows) {
      row.y = calcScrolledY(row.y, step, this.totalHeight)
    }
    this.crackFilter?.update(step)
  }

  setSpeed(speed: number): void {
    this.speed = speed
  }

  destroy(): void {
    this.outerContainer.destroy({ children: true })
    this.roadOverlay?.destroy({ children: true })
    this.roadOverlay = null
    this.crackFilter = null
    this.rows.length = 0
  }

  private buildRow(): ContainerType {
    const row = new Container()

    const leftGreenery = colorRect(ROAD_X + GREENERY_OVERFLOW, TILE_SIZE, PlaceholderColors.greenery)
    leftGreenery.x = -GREENERY_OVERFLOW
    row.addChild(leftGreenery)

    for (let col = 0; col < COLUMN_COUNT; col++) {
      const isSidewalk = col === 0 || col === COLUMN_COUNT - 1
      if (!isSidewalk) continue
      const tile = colorRect(TILE_SIZE, TILE_SIZE, PlaceholderColors.sidewalk)
      tile.x = ROAD_X + col * TILE_SIZE
      row.addChild(tile)
    }


    const rightGreenery = colorRect(CANVAS_WIDTH - ROAD_X - ROAD_WIDTH + GREENERY_OVERFLOW, TILE_SIZE, PlaceholderColors.greenery)
    rightGreenery.x = ROAD_X + ROAD_WIDTH
    row.addChild(rightGreenery)

    // Scatter trees across the full green strips (including overflow)
    if (this.assetLoader) {
      const leftStart = -GREENERY_OVERFLOW
      const leftEnd = ROAD_X - TREE_MARGIN
      const rightStart = ROAD_X + ROAD_WIDTH + TREE_MARGIN
      const rightEnd = CANVAS_WIDTH + GREENERY_OVERFLOW

      for (let x = leftStart; x < leftEnd; x += TREE_SPACING) {
        if (Math.random() < TREE_CHANCE) {
          const tree = this.assetLoader.createTree()
          tree.x = x + Math.random() * TREE_SPACING
          tree.y = TILE_SIZE / 2
          row.addChild(tree)
        }
      }
      for (let x = rightStart; x < rightEnd; x += TREE_SPACING) {
        if (Math.random() < TREE_CHANCE) {
          const tree = this.assetLoader.createTree()
          tree.x = x + Math.random() * TREE_SPACING
          tree.y = TILE_SIZE / 2
          row.addChild(tree)
        }
      }
    }

    return row
  }
}
