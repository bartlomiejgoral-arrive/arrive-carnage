# Phase 2 — Non-gameplay scenes

All three are simple and have no moving parts — good for establishing the scene API before the complex gameplay scene.

| File | Content |
|---|---|
| `src/game/scenes/TitleScene.ts` | "ARRIVE CARNAGE" title, START / TOP 5 menu, keyboard selection |
| `src/game/scenes/LeaderboardScene.ts` | Reads `ScoreStore`, renders top 5 list, EXIT returns to title |
| `src/game/scenes/GameOverScene.ts` | Receives final score, saves via `ScoreStore`, any key → title |
