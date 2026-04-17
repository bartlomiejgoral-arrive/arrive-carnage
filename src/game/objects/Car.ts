import { TILE_SIZE } from '../constants'
import { createEnemyCar } from '../AssetLoader'
import { GameObject } from './GameObject'

export class Car extends GameObject {
  readonly type = 'deadly' as const

  constructor(column: number) {
    super(column, -TILE_SIZE)
    this.container.addChild(createEnemyCar())
  }
}
