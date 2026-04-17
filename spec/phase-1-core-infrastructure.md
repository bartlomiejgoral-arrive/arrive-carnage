# Phase 1 — Core infrastructure

These are shared utilities all scenes depend on. Build first.

| File | Responsibility |
|---|---|
| `src/game/constants.ts` | Canvas size, column count, tile width, initial scroll speed |
| `src/game/SceneManager.ts` | Owns the active scene, handles transitions (destroy old → init new) |
| `src/game/InputManager.ts` | Single keyboard listener; scenes subscribe to arrow keys / any key |
| `src/game/ScoreStore.ts` | Read/write top 5 scores to `localStorage` |
