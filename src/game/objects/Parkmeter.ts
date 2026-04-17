import { TILE_SIZE } from '../constants'
import { colorRect, PlaceholderColors } from '../AssetLoader'
import { GameObject } from './GameObject'

const W = Math.round(TILE_SIZE * 0.15)
const H = Math.round(TILE_SIZE * 0.6)

export class Parkmeter extends GameObject {
  readonly type = 'collectible' as const

  constructor(column: number) {
    super(column, -TILE_SIZE)
    const rect = colorRect(W, H, PlaceholderColors.parkmeter)
    rect.x = Math.round((TILE_SIZE - W) / 2)
    this.container.addChild(rect)
  }
}
