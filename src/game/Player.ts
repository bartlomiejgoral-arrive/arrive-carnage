import { Container } from 'pixi.js'
import type { Container as ContainerType } from 'pixi.js'
import { colorRect, PlaceholderColors } from './AssetLoader'
import { CANVAS_HEIGHT, TILE_SIZE, ROAD_X, COLUMN_COUNT, PLAYER_START_COLUMN } from './constants'
import type { InputManager } from './InputManager'

const CAR_WIDTH = Math.round(TILE_SIZE * 0.6)
const CAR_HEIGHT = Math.round(TILE_SIZE * 0.8)
const CAR_X_OFFSET = Math.round((TILE_SIZE - CAR_WIDTH) / 2)
const PLAYER_Y = CANVAS_HEIGHT - CAR_HEIGHT - 20

export class Player {
  private readonly container = new Container()
  private column = PLAYER_START_COLUMN

  constructor(private readonly input: InputManager) {}

  get currentColumn(): number {
    return this.column
  }

  get top(): number {
    return PLAYER_Y
  }

  get bottom(): number {
    return PLAYER_Y + CAR_HEIGHT
  }

  init(stage: ContainerType): void {
    const car = colorRect(CAR_WIDTH, CAR_HEIGHT, PlaceholderColors.playerCar)
    car.x = CAR_X_OFFSET
    this.container.addChild(car)
    this.syncPosition()
    stage.addChild(this.container)

    this.input.on('left', this.onLeft)
    this.input.on('right', this.onRight)
  }

  destroy(): void {
    this.input.off('left', this.onLeft)
    this.input.off('right', this.onRight)
    this.container.destroy({ children: true })
  }

  private readonly onLeft = (): void => {
    if (this.column > 0) {
      this.column--
      this.syncPosition()
    }
  }

  private readonly onRight = (): void => {
    if (this.column < COLUMN_COUNT - 1) {
      this.column++
      this.syncPosition()
    }
  }

  private syncPosition(): void {
    this.container.x = ROAD_X + this.column * TILE_SIZE
    this.container.y = PLAYER_Y
  }
}
