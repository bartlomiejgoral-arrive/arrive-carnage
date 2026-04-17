import { TILE_SIZE } from './constants'
import type { GameObjectType } from './types'

export interface CollidableObject {
  column: number
  y: number
  type: GameObjectType
}

export function detectCollision(
  playerColumn: number,
  playerTop: number,
  playerBottom: number,
  objects: readonly CollidableObject[],
): CollidableObject | null {
  for (const obj of objects) {
    if (obj.column !== playerColumn) continue
    if (obj.y < playerBottom && obj.y + TILE_SIZE > playerTop) {
      return obj
    }
  }
  return null
}
