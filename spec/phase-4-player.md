# Phase 4 — Gameplay: player

Added to `GameplayScene`.

---

## Player car

- Rendered using `AssetLoader.createPlayerCar()`.
- **Position**: centred in column `PLAYER_START_COLUMN` (column 3), at `y = PLAYER_Y` (500 — which is 100 px from the bottom of the 600 px canvas).
- The sprite/placeholder anchor is set to `(0.5, 0.5)` so positioning uses centre coordinates.

## Movement

- `←` / `→` arrow keys move the car **one column** per key press (discrete snap, no animation).
- Column is clamped to **1–6** (cannot leave the road).
- The player **can** enter sidewalk columns (1 and 6) — this is risky but rewarded by parkmeters.
- X position is calculated via `columnX(column)` from `constants.ts`.

## Input wiring

- Subscribe to `ArrowLeft` and `ArrowRight` via `InputManager.on()` in `GameplayScene`.
- Unsubscribe in `GameplayScene.destroy()`.

## Delta time

- The player does not need `update(delta)` in this phase — position only changes on key press.
- The player container is a child of `GameplayScene.container` and renders automatically.
