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
