import type { Container } from 'pixi.js'
import { CANVAS_HEIGHT } from '../constants'

export interface Hitbox {
  x: number
  y: number
  width: number
  height: number
}

export abstract class GameObject {
  readonly container: Container
  readonly column: number
  /** Fraction of the sprite bounds used for collision (0–1) */
  protected hitboxWidth = 1
  protected hitboxHeight = 1

  constructor(container: Container, column: number) {
    this.container = container
    this.column = column
  }

  getHitbox(): Hitbox {
    const b = this.container.getBounds()
    const trimX = b.width * (1 - this.hitboxWidth) / 2
    const trimY = b.height * (1 - this.hitboxHeight) / 2
    return {
      x: b.x + trimX,
      y: b.y + trimY,
      width: b.width * this.hitboxWidth,
      height: b.height * this.hitboxHeight,
    }
  }

  update(speed: number, delta: number): void {
    this.container.y += speed * delta
  }

  isOffScreen(): boolean {
    return this.container.y > CANVAS_HEIGHT + 50
  }

  destroy(): void {
    this.container.destroy({ children: true })
  }
}
