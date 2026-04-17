import { TILE_SIZE } from '../constants'
import { createParkmeter } from '../AssetLoader'
import { GameObject } from './GameObject'

export class Parkmeter extends GameObject {
  readonly type = 'collectible' as const

  constructor(column: number) {
    super(column, -TILE_SIZE)
    this.container.addChild(createParkmeter())
  }
}
