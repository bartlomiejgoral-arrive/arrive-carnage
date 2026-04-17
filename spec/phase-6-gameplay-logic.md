# Phase 6 — Gameplay: logic

Ties everything together inside `GameplayScene`.

---

## Collision detection

Every frame, check the **player** against every active object in `spawner.objects`:

```ts
function checkCollision(a: Container, b: Container): boolean {
  const ab = a.getBounds();
  const bb = b.getBounds();
  return ab.x < bb.x + bb.width
      && ab.x + ab.width > bb.x
      && ab.y < bb.y + bb.height
      && ab.y + ab.height > bb.y;
}
```

- Uses PIXI axis-aligned bounding box (`getBounds()`).
- Collision with **Car** or **StreetLamp** → game over.
- Collision with **Parkmeter** → add `PARKMETER_BONUS` ($50) to the score, destroy the parkmeter, remove it from the spawner's active list.

---

## Scoring

- **Time-based fine**: increases by `SCORE_RATE` ($2) per second of survival. Accumulated as a float, displayed as a floored integer.
- **Parkmeter bonus**: +$50 per parkmeter collected.
- Score is always displayed as a **negative fine**: `"-$1 340"` (with thousand separators, no decimals).

### HUD

- The score text is rendered as a PIXI `Text` in the **top-left corner** of the gameplay scene (e.g. `x: 10, y: 10`).
- Font: `monospace`, size ~18 px, colour `0xffffff` (white).
- Updated every frame.
- The HUD container has a high `zIndex` so it renders above the background and all game objects.

---

## Speed acceleration

- Track `elapsedTime` (seconds since gameplay started).
- Current speed = `INITIAL_SCROLL_SPEED + Math.floor(elapsedTime / SPEED_INTERVAL) * SPEED_INCREMENT`
  - Starts at **120 px/s**.
  - After 10 s → 145 px/s, after 20 s → 170 px/s, etc.
  - **No cap** — the game gets arbitrarily fast.
- The same `speed` value is passed to:
  - The background tile scroller
  - `spawner.update(speed, delta)`

---

## Game over trigger

When a collision with `Car` or `StreetLamp` is detected:

1. Stop processing input (unsubscribe movement handlers).
2. Transition: `SceneManager.switch(new GameOverScene(finalScore))`.

The `GameOverScene` handles score saving and displaying the result.

---

## `GameplayScene.update(delta)` — full frame order

```
1. elapsedTime += delta
2. Calculate current speed
3. Scroll background tiles
4. spawner.update(speed, delta)
5. Check collisions
   → Parkmeter hit? Add bonus, destroy parkmeter
   → Car / StreetLamp hit? Trigger game over, return early
6. Update score (time-based)
7. Update HUD text
```

All time values (`delta`, `elapsedTime`, spawn timers) are in **seconds**. Convert from the PIXI ticker: `delta = ticker.deltaTime / 60` (at default 60 fps target) or use `ticker.elapsedMS / 1000`.
