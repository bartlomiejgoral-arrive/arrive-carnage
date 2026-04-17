import type { AssetLoader } from '../AssetLoader'
import { columnX } from '../constants'
import { GameObject } from './GameObject'

export class Parkmeter extends GameObject {
  constructor(column: number, assetLoader: AssetLoader) {
    const visual = assetLoader.createParkmeter()
    super(visual, column)
    this.container.x = columnX(column)
    this.container.y = -100
    this.hitboxWidth = 0.35   // thin pole
    this.hitboxHeight = 0.85
  }
}
