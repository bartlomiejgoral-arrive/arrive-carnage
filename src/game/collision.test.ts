import { describe, it, expect } from 'vitest'
import { detectCollision } from './collision'
import { TILE_SIZE, CANVAS_HEIGHT } from './constants'

const PLAYER_COL = 2
const PLAYER_TOP = CANVAS_HEIGHT - 84
const PLAYER_BOTTOM = CANVAS_HEIGHT - 20

describe('detectCollision', () => {
  it('returns null when there are no objects', () => {
    expect(detectCollision(PLAYER_COL, PLAYER_TOP, PLAYER_BOTTOM, [])).toBeNull()
  })

  it('returns null when object is in a different column', () => {
    const obj = { column: 3, y: PLAYER_TOP, type: 'deadly' as const }
    expect(detectCollision(PLAYER_COL, PLAYER_TOP, PLAYER_BOTTOM, [obj])).toBeNull()
  })

  it('returns null when object is fully above the player (obj bottom <= player top)', () => {
    const obj = { column: PLAYER_COL, y: PLAYER_TOP - TILE_SIZE, type: 'deadly' as const }
    expect(detectCollision(PLAYER_COL, PLAYER_TOP, PLAYER_BOTTOM, [obj])).toBeNull()
  })

  it('returns null when object is fully below the player (obj top >= player bottom)', () => {
    const obj = { column: PLAYER_COL, y: PLAYER_BOTTOM, type: 'deadly' as const }
    expect(detectCollision(PLAYER_COL, PLAYER_TOP, PLAYER_BOTTOM, [obj])).toBeNull()
  })

  it('detects a deadly object overlapping from above', () => {
    const obj = { column: PLAYER_COL, y: PLAYER_TOP - TILE_SIZE / 2, type: 'deadly' as const }
    expect(detectCollision(PLAYER_COL, PLAYER_TOP, PLAYER_BOTTOM, [obj])).toBe(obj)
  })

  it('detects a deadly object fully inside the player bounds', () => {
    const obj = { column: PLAYER_COL, y: PLAYER_TOP + 5, type: 'deadly' as const }
    expect(detectCollision(PLAYER_COL, PLAYER_TOP, PLAYER_BOTTOM, [obj])).toBe(obj)
  })

  it('detects a collectible object in the same column', () => {
    const obj = { column: PLAYER_COL, y: PLAYER_TOP + 5, type: 'collectible' as const }
    expect(detectCollision(PLAYER_COL, PLAYER_TOP, PLAYER_BOTTOM, [obj])).toBe(obj)
  })

  it('returns the first matching object when multiple overlap', () => {
    const first = { column: PLAYER_COL, y: PLAYER_TOP + 5, type: 'deadly' as const }
    const second = { column: PLAYER_COL, y: PLAYER_TOP + 10, type: 'collectible' as const }
    expect(detectCollision(PLAYER_COL, PLAYER_TOP, PLAYER_BOTTOM, [first, second])).toBe(first)
  })
})
