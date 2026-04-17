import type { Container } from 'pixi.js'

export interface IScene {
  init(stage: Container): void
  update(delta: number): void
  destroy(): void
}
