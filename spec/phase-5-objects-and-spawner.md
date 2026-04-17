# Phase 5 — Gameplay: objects & spawner

Added to `GameplayScene`.

---

## `src/game/objects/GameObject.ts` — Base class

All spawnable objects extend this.

```ts
import { Container } from 'pixi.js';

export abstract class GameObject {
  readonly container: Container;
  column: number;          // 1-based column

  /** Move the object downward. `speed` is the current scroll speed in px/s, `delta` is seconds since last frame. */
  update(speed: number, delta: number): void {
    this.container.y += speed * delta;
  }

  /** Returns true when the object has scrolled off the bottom of the screen. */
  isOffScreen(): boolean {
    return this.container.y > GAME_HEIGHT + 50;
  }

  /** Remove PIXI resources. */
  destroy(): void {
    this.container.destroy({ children: true });
  }
}
```

All movement is **delta-based**: `px/s × delta` where `delta` is seconds (not frames). This decouples gameplay from frame rate.

### Enemy car movement — lane-based speed

Enemy cars do **not** scroll with the road. They drive in the same direction as the player but at a **constant speed that is always slower** than the player's current scroll speed. This makes them appear as slower traffic that the player overtakes.

Each lane has a different speed, interpolated linearly between two constants:

| Constant | Value | Meaning |
|---|---|---|
| `ENEMY_CAR_SPEED_FAST` | 180 px/s | Leftmost car lane (column 2) — fast lane |
| `ENEMY_CAR_SPEED_SLOW` | 80 px/s | Rightmost car lane (column 5) — slow lane |

The per-lane speed is: `FAST + (column - 2) / (maxCol - 2) × (SLOW - FAST)`

| Column | Lane speed | Drift at 180 scroll | Drift at 255 scroll |
|---|---|---|---|
| 2 (left) | 180 px/s | 0 px/s | 75 px/s |
| 3 | ~147 px/s | 33 px/s | 108 px/s |
| 4 | ~113 px/s | 67 px/s | 142 px/s |
| 5 (right) | 80 px/s | 100 px/s | 175 px/s |

On screen, car `y` moves at `(scrollSpeed - laneSpeed) × delta`. As the player accelerates, the gap widens and all cars approach faster — but left-lane cars are always the hardest to catch.

---

## Object types

| File | Extends | Spawns in | Collision effect |
|---|---|---|---|
| `src/game/objects/Car.ts` | `GameObject` | Road columns (2–5) | Game over |
| `src/game/objects/StreetLamp.ts` | `GameObject` | Sidewalk columns (1, 6) | Game over |
| `src/game/objects/Parkmeter.ts` | `GameObject` | Sidewalk columns (1, 6) | +$50, object is consumed (destroyed) |

Each constructor:
1. Receives a `column` number and the `AssetLoader` (or the relevant create method).
2. Creates its visual via `AssetLoader.createEnemyCar()` / `createStreetLamp(side)` / `createParkmeter()`.
3. Sets `container.x = columnX(column)` and `container.y` to a spawn position above the screen (e.g. `-100`).
4. Sets anchor to `(0.5, 0.5)`.

### Street lamp side logic

- Column 1 (left sidewalk) → `createStreetLamp('left')`
- Column 6 (right sidewalk) → `createStreetLamp('right')`

---

## `src/game/Spawner.ts`

Manages the lifecycle of all active `GameObject` instances.

### Spawn rules

- A **spawn timer** counts down. When it fires, the spawner picks **one random column** (1–6) and spawns an appropriate object:
  - Columns 2–5 (road) → `Car`
  - Columns 1, 6 (sidewalk) → randomly `StreetLamp` or `Parkmeter` (50/50 chance)
- After spawning, the timer resets to a random value between `SPAWN_INTERVAL_MIN` and `SPAWN_INTERVAL_MAX` (0.8–2.0 s).
- **Vertical gap enforcement**: before spawning, check that no existing object in the same column is within `MIN_VERTICAL_GAP` (150 px) of the spawn point (y ≈ -50). If too close, skip this spawn and wait for the next timer tick.

### Per-frame update

```ts
update(speed: number, delta: number): void {
  // 1. Decrement spawn timer by delta; if ≤ 0 → attempt spawn
  // 2. Update all active objects: obj.update(speed, delta)
  // 3. Remove off-screen objects: if obj.isOffScreen() → obj.destroy(), remove from list
}
```

### Interface

```ts
class Spawner {
  readonly objects: GameObject[];       // currently active objects

  update(speed: number, delta: number): void;
  destroy(): void;                      // destroy all active objects
}
```

`GameplayScene` adds each newly spawned object's `container` to its own container, and calls `spawner.update()` every frame.
