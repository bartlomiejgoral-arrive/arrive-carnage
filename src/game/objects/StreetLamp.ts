import type { AssetLoader } from '../AssetLoader'
import { columnX } from '../constants'
import { GameObject } from './GameObject'

export class StreetLamp extends GameObject {
  constructor(column: number, assetLoader: AssetLoader) {
    const side = column === 1 ? 'right' : 'left' as const
    const visual = assetLoader.createStreetLamp(side)
    super(visual, column)
    this.container.x = columnX(column)
    this.container.y = -100
    this.hitboxWidth = 0.2    // just the pole, not the lamp head
    this.hitboxHeight = 0.9
  }
}
