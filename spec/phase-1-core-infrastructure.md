# Phase 1 — Core infrastructure

These are shared utilities all scenes depend on. Build first.

---

## Screen scaling

The game fills the **entire browser window**. Internally all game logic operates on a fixed **800 × 600** virtual resolution.

### How it works (container-based scaling)

This is the standard PixiJS approach used by most browser games:

1. **PIXI Application** initialises at full window size using `resizeTo: window` and `autoDensity: true`.
2. **Game container**: a single root `Container` holds all game content. Scenes add their visuals as children of this container. All game logic positions things within the 800 × 600 virtual coordinate space.
3. **Fit to screen**: on init and on every window resize, calculate a uniform scale factor to fit 800 × 600 into the current window size while maintaining aspect ratio, then centre the container:

```ts
function fitToScreen(stage: Container, screenWidth: number, screenHeight: number): void {
  const scale = Math.min(screenWidth / GAME_WIDTH, screenHeight / GAME_HEIGHT);
  stage.scale.set(scale);
  stage.position.set(
    (screenWidth - GAME_WIDTH * scale) / 2,
    (screenHeight - GAME_HEIGHT * scale) / 2,
  );
}
```

4. **Letterboxing**: if the window aspect ratio differs from 4:3, black bars appear on the sides or top/bottom (the app `backgroundColor` fills the unused area).
5. **Pixel art**: set `TextureSource.defaultOptions.scaleMode = 'nearest'` before loading assets and `roundPixels: true` on the app. This keeps sprites blocky and crisp at any scale.

### Constants

```ts
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
```

These remain the coordinate space for all game logic. Scenes, objects, and the HUD all position themselves within 800 × 600. The scaling is transparent to game code.

---

## `src/game/constants.ts`

All magic numbers live here. Nothing else in the codebase should hard-code layout or gameplay values.

```ts
// Canvas
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Road layout
export const COLUMN_COUNT = 6;
export const TILE_WIDTH = 100;            // each column is 100 px wide
export const ROAD_WIDTH = COLUMN_COUNT * TILE_WIDTH; // 600 px
export const ROAD_X = (GAME_WIDTH - ROAD_WIDTH) / 2; // 100 px left edge
export const GREENERY_WIDTH = ROAD_X;     // 100 px each side

// Tile scrolling
export const TILE_HEIGHT = 100;           // square tiles for the background

// Player
export const PLAYER_START_COLUMN = 3;     // 1-based, columns 1–6
export const PLAYER_Y = 500;              // 100 px from the bottom

// Scrolling & speed
export const INITIAL_SCROLL_SPEED = 120;  // px per second
export const SPEED_INCREMENT = 25;        // added every SPEED_INTERVAL
export const SPEED_INTERVAL = 10;         // seconds between speed bumps

// Spawner
export const SPAWN_INTERVAL_MIN = 0.8;    // seconds — fastest spawn gap
export const SPAWN_INTERVAL_MAX = 2.0;    // seconds — slowest spawn gap
export const MIN_VERTICAL_GAP = 150;      // px — minimum distance between objects in the same column

// Scoring
export const SCORE_RATE = 2;              // dollars per second of survival
export const PARKMETER_BONUS = 50;        // dollars added per parkmeter hit
```

### Helper: column → x position

```ts
/** Returns the centre-x of the given 1-based column. */
export function columnX(column: number): number {
  return ROAD_X + (column - 0.5) * TILE_WIDTH;
}
```

---

## `src/game/Scene.ts` — Scene interface

Every scene implements this contract. `SceneManager` calls these methods.

```ts
import { Container } from 'pixi.js';

export interface Scene {
  /** The PIXI container that holds all visuals for this scene. Added to / removed from the stage by SceneManager. */
  readonly container: Container;

  /** Called every frame. `delta` is seconds since last frame (ticker.deltaTime / 60 at 60 fps — use ticker.elapsedMS or deltaTime consistently). */
  update(delta: number): void;

  /** Tear down: remove listeners, destroy PIXI objects, release references. Called by SceneManager before switching away. */
  destroy(): void;
}
```

---

## `src/game/SceneManager.ts`

Owns the active scene and handles transitions.

| Method | Behaviour |
|---|---|
| `constructor(stage: Container)` | Stores a reference to the PIXI stage. |
| `switch(next: Scene): void` | If there is a current scene: calls `destroy()` on it and removes its container from the stage. Then sets the new scene, adds its `container` to the stage. |
| `update(delta: number): void` | Forwards `delta` to the active scene's `update()`. Called from the app ticker. |

---

## `src/game/InputManager.ts`

Single `keydown` listener on `window`. Scenes register callbacks; the manager dispatches.

```ts
type KeyHandler = () => void;

class InputManager {
  /** Subscribe to a specific key (e.g. "ArrowLeft", "Enter"). Returns an unsubscribe function. */
  on(key: string, handler: KeyHandler): () => void;

  /** Subscribe to ANY key press. Returns an unsubscribe function. */
  onAnyKey(handler: KeyHandler): () => void;

  /** Remove the global keydown listener. Called once when the game shuts down. */
  destroy(): void;
}
```

Scenes **must** unsubscribe in their `destroy()` method to avoid stale handlers.

---

## `src/game/ScoreStore.ts`

Persists the top 5 scores in `localStorage` under key `"arrive-carnage-scores"`.

| Method | Behaviour |
|---|---|
| `getScores(): number[]` | Returns up to 5 scores, sorted descending. Returns `[]` if none saved. |
| `saveScore(score: number): void` | Inserts the score, keeps only the top 5, writes back to `localStorage`. |
