import { TILE_SIZE } from '../constants'
import { colorRect, PlaceholderColors } from '../AssetLoader'
import { GameObject } from './GameObject'

const W = Math.round(TILE_SIZE * 0.6)
const H = Math.round(TILE_SIZE * 0.8)

export class Car extends GameObject {
  readonly type = 'deadly' as const

  constructor(column: number) {
    super(column, -TILE_SIZE)
    const rect = colorRect(W, H, PlaceholderColors.enemyCar)
    rect.x = Math.round((TILE_SIZE - W) / 2)
    this.container.addChild(rect)
  }
}
