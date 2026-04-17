# Phase 5 — Gameplay: objects & spawner

| File | Responsibility |
|---|---|
| `src/game/objects/GameObject.ts` | Base class: column, y position, `update(speed)`, `destroy()` |
| `src/game/objects/Car.ts` | Road object → game over on collision |
| `src/game/objects/StreetLamp.ts` | Sidewalk object → game over on collision |
| `src/game/objects/Parkmeter.ts` | Sidewalk object → +50 pts on collection |
| `src/game/Spawner.ts` | Random spawn per column at top of screen; manages active object list |
