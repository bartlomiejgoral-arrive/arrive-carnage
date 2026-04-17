export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 600

export const COLUMN_COUNT = 6
export const TILE_SIZE = 80

export const ROAD_WIDTH = COLUMN_COUNT * TILE_SIZE        // 480
export const ROAD_X = (CANVAS_WIDTH - ROAD_WIDTH) / 2    // 160 — left edge of road
export const GREENERY_WIDTH = ROAD_X                     // 160 — same on each side

export const INITIAL_SCROLL_SPEED = 3      // pixels per frame
export const SPEED_INCREMENT = 0.5         // pixels per frame added every interval
export const SPEED_ACCELERATION_INTERVAL = 10 // seconds

export const MAX_SCORES = 5

export const PLAYER_START_COLUMN = 2 // 0-indexed; column 3 in 1-indexed spec
