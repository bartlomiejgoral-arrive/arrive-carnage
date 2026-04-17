import { Container } from 'pixi.js'
import type { Container as ContainerType } from 'pixi.js'
import { CANVAS_HEIGHT, TILE_SIZE, ROAD_X } from '../constants'
import type { GameObjectType } from '../types'

export type { GameObjectType }

export abstract class GameObject {
  protected readonly container = new Container()

  constructor(
    readonly column: number,
    protected _y: number,
  ) {}

  abstract readonly type: GameObjectType

  get y(): number {
    return this._y
  }

  init(stage: ContainerType): void {
    this.container.x = ROAD_X + this.column * TILE_SIZE
    this.container.y = this._y
    stage.addChild(this.container)
  }

  update(step: number): void {
    this._y += step
    this.container.y = this._y
  }

  isOffScreen(): boolean {
    return this._y > CANVAS_HEIGHT
  }

  destroy(): void {
    this.container.destroy({ children: true })
  }
}
