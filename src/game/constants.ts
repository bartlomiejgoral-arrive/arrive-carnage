export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 1000

export const COLUMN_COUNT = 6
export const TILE_SIZE = 80

export const ROAD_WIDTH = COLUMN_COUNT * TILE_SIZE        // 480
export const ROAD_X = (CANVAS_WIDTH - ROAD_WIDTH) / 2    // 160 — left edge of road
export const GREENERY_WIDTH = ROAD_X                     // 160 — same on each side

export const INITIAL_SCROLL_SPEED = 180    // pixels per second
export const SPEED_INCREMENT = 25          // px/s added every interval
export const SPEED_ACCELERATION_INTERVAL = 10 // seconds

export const MAX_SCORES = 5

export const PLAYER_START_COLUMN = 3 // 1-indexed column
export const PLAYER_Y = 850

export const SPAWN_INTERVAL_MIN = 0.8  // seconds
export const SPAWN_INTERVAL_MAX = 2.0  // seconds
export const MIN_VERTICAL_GAP = 150    // pixels

export const PLAYER_SPEED = 400        // pixels per second (horizontal)
export const ENEMY_CAR_SPEED_FAST = 180  // px/s — leftmost car lane (column 2)
export const ENEMY_CAR_SPEED_SLOW = 80   // px/s — rightmost car lane (column 5)

export const SCORE_RATE = 2            // dollars per second
export const PARKMETER_BONUS = 50      // dollars

/** Convert 1-based column number to centre X position */
export function columnX(column: number): number {
  return ROAD_X + (column - 1) * TILE_SIZE + TILE_SIZE / 2
}
