import { Container } from 'pixi.js'
import type { Container as ContainerType } from 'pixi.js'
import { colorRect, PlaceholderColors } from './AssetLoader'
import type { AssetLoader } from './AssetLoader'
import {
  CANVAS_HEIGHT, CANVAS_WIDTH, TILE_SIZE,
  ROAD_X, ROAD_WIDTH, COLUMN_COUNT,
} from './constants'
import { AsphaltCrackFilter } from './AsphaltCrackFilter'
import { SidewalkFilter } from './SidewalkFilter'
import { GrassFilter } from './GrassFilter'

// Extend greenery far beyond the canvas so it fills any screen aspect ratio
const GREENERY_OVERFLOW = 1200

const NUM_ROWS = Math.ceil(CANVAS_HEIGHT / TILE_SIZE) + 2

// Tree placement: one roll per TREE_SPACING px across each green strip
const TREE_SPACING = 120
const TREE_CHANCE = 0.25
const TREE_MARGIN = 60  // keep trees away from sidewalk edges

const GRASS_SPACING = 20
const GRASS_CHANCE = 0.4

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
  private leftSidewalkOverlay: ContainerType | null = null
  private rightSidewalkOverlay: ContainerType | null = null
  private sidewalkFilter: SidewalkFilter | null = null
  private leftGrassOverlay: ContainerType | null = null
  private rightGrassOverlay: ContainerType | null = null
  private grassFilter: GrassFilter | null = null

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
    // Grass overlays (behind everything)
    const grassWidth = ROAD_X + GREENERY_OVERFLOW
    this.grassFilter = new GrassFilter(grassWidth)
    this.leftGrassOverlay = colorRect(grassWidth, CANVAS_HEIGHT, PlaceholderColors.greenery)
    this.leftGrassOverlay.x = -GREENERY_OVERFLOW
    this.leftGrassOverlay.filters = [this.grassFilter]
    stage.addChild(this.leftGrassOverlay)

    this.rightGrassOverlay = colorRect(grassWidth, CANVAS_HEIGHT, PlaceholderColors.greenery)
    this.rightGrassOverlay.x = ROAD_X + ROAD_WIDTH
    this.rightGrassOverlay.filters = [this.grassFilter]
    stage.addChild(this.rightGrassOverlay)

    // Sidewalk overlays
    this.sidewalkFilter = new SidewalkFilter()
    this.leftSidewalkOverlay = colorRect(TILE_SIZE, CANVAS_HEIGHT, PlaceholderColors.sidewalk)
    this.leftSidewalkOverlay.x = ROAD_X
    this.leftSidewalkOverlay.filters = [this.sidewalkFilter]
    stage.addChild(this.leftSidewalkOverlay)

    this.rightSidewalkOverlay = colorRect(TILE_SIZE, CANVAS_HEIGHT, PlaceholderColors.sidewalk)
    this.rightSidewalkOverlay.x = ROAD_X + ROAD_WIDTH - TILE_SIZE
    this.rightSidewalkOverlay.filters = [this.sidewalkFilter]
    stage.addChild(this.rightSidewalkOverlay)

    // Road crack overlay
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
    this.sidewalkFilter?.update(step)
    this.grassFilter?.update(step)
  }

  setSpeed(speed: number): void {
    this.speed = speed
  }

  destroy(): void {
    this.outerContainer.destroy({ children: true })
    this.roadOverlay?.destroy({ children: true })
    this.leftSidewalkOverlay?.destroy({ children: true })
    this.rightSidewalkOverlay?.destroy({ children: true })
    this.leftGrassOverlay?.destroy({ children: true })
    this.rightGrassOverlay?.destroy({ children: true })
    this.roadOverlay = null
    this.leftSidewalkOverlay = null
    this.rightSidewalkOverlay = null
    this.leftGrassOverlay = null
    this.rightGrassOverlay = null
    this.crackFilter = null
    this.sidewalkFilter = null
    this.grassFilter = null
    this.rows.length = 0
  }

  private buildRow(): ContainerType {
    const row = new Container()

    // Greenery and sidewalk backgrounds are handled by full-height filtered overlays.
    // Rows contain scrolling elements: grass tufts and trees.

    if (this.assetLoader) {
      const leftStart = -GREENERY_OVERFLOW
      const leftEnd = ROAD_X - 4  // stop before sidewalk curb
      const rightStart = ROAD_X + ROAD_WIDTH + 4
      const rightEnd = CANVAS_WIDTH + GREENERY_OVERFLOW

      // Scatter grass tufts densely
      for (let x = leftStart; x < leftEnd; x += GRASS_SPACING) {
        if (Math.random() < GRASS_CHANCE) {
          const tuft = this.assetLoader.createGrassTuft()
          tuft.x = x + Math.random() * GRASS_SPACING
          tuft.y = Math.random() * TILE_SIZE
          row.addChild(tuft)
        }
      }
      for (let x = rightStart; x < rightEnd; x += GRASS_SPACING) {
        if (Math.random() < GRASS_CHANCE) {
          const tuft = this.assetLoader.createGrassTuft()
          tuft.x = x + Math.random() * GRASS_SPACING
          tuft.y = Math.random() * TILE_SIZE
          row.addChild(tuft)
        }
      }

      // Trees (sparser, on top of grass)
      const treeLeftEnd = ROAD_X - TREE_MARGIN
      const treeRightStart = ROAD_X + ROAD_WIDTH + TREE_MARGIN
      for (let x = leftStart; x < treeLeftEnd; x += TREE_SPACING) {
        if (Math.random() < TREE_CHANCE) {
          const tree = this.assetLoader.createTree()
          tree.x = x + Math.random() * TREE_SPACING
          tree.y = TILE_SIZE / 2
          row.addChild(tree)
        }
      }
      for (let x = treeRightStart; x < rightEnd; x += TREE_SPACING) {
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
