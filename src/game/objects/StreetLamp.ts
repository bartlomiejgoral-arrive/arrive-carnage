import { TILE_SIZE } from '../constants'
import { createStreetLamp } from '../AssetLoader'
import { GameObject } from './GameObject'

export class StreetLamp extends GameObject {
  readonly type = 'deadly' as const

  constructor(column: number) {
    super(column, -TILE_SIZE)
    this.container.addChild(createStreetLamp(column))
  }
}
