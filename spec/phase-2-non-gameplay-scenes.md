# Phase 2 — Non-gameplay scenes

All three are simple screens with no moving game objects — good for establishing the scene API before the complex gameplay scene. All text uses PIXI `Text` with `fontFamily: 'monospace'` for the retro look (no custom bitmap font needed).

---

## `src/game/scenes/TitleScene.ts`

Implements `Scene`.

### Visuals

- **Title**: `"ARRIVE CARNAGE"` centred horizontally, upper third of the screen.
- **Menu items** (vertically stacked, centred):
  - `"> START"` — begins a new game
  - `"> TOP 5"` — opens the leaderboard
- A **cursor indicator** (`>`) highlights the currently selected item. Only one item is highlighted at a time.
- The subtitle or a decorative element blinks (toggle visibility every ~0.5 s).

### Input

| Key | Action |
|---|---|
| `ArrowUp` / `ArrowDown` | Move cursor between START and TOP 5 |
| `Enter` | Confirm selection → `SceneManager.switch()` to the chosen scene |

### On transition out

- Unsubscribe all `InputManager` handlers in `destroy()`.

---

## `src/game/scenes/LeaderboardScene.ts`

Implements `Scene`.

### Visuals

- **Heading**: `"TOP 5"` centred, near the top.
- **Score list**: reads `ScoreStore.getScores()`, renders up to 5 entries as `1. -$1 340`, `2. -$500`, etc. If fewer than 5 scores exist, show `"---"` for empty slots.
- **Footer**: `"PRESS ANY KEY TO EXIT"` at the bottom, blinking.

### Input

| Key | Action |
|---|---|
| Any key | `SceneManager.switch()` back to `TitleScene` |

---

## `src/game/scenes/GameOverScene.ts`

Implements `Scene`. Receives the final score as a constructor argument.

### Visuals

- **Heading**: `"GAME OVER"` centred.
- **Score display**: `"FINE: -$1 340"` (formatted with thousand separators).
- **Footer**: `"PRESS ANY KEY"` at the bottom, blinking.

### Behaviour

- On construction, calls `ScoreStore.saveScore(score)` to persist the result.
- Does **not** re-read scores — the leaderboard scene handles display.

### Input

| Key | Action |
|---|---|
| Any key | `SceneManager.switch()` back to `TitleScene` |
