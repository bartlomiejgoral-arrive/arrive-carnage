# Arrive Carnage

A retro-styled pixel art browser game built with React and PixiJS.

## Tech stack

- **Node.js 22 LTS**
- **React 19**
- **PIXI.js 8** — WebGL/WebGPU game renderer
- **Vite 6** — build tool and dev server
- **TypeScript** (strict mode)

## Project structure

```
arrive-carnage/
├── public/assets/          ← pixel art images
├── src/
│   ├── components/
│   │   └── GameCanvas.tsx  ← React wrapper mounting the PIXI canvas
│   ├── game/
│   │   ├── Game.ts         ← PIXI Application + game loop
│   │   └── scenes/         ← game scenes
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
└── package.json
```

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

To create a production build:

```bash
npm run build
```

## User interface

The game renders inside a fixed 800×600 PIXI.js canvas mounted by the `GameCanvas` React component. The canvas uses `image-rendering: pixelated` to keep pixel art crisp at any display resolution. A CRT-style scanline overlay is applied on top of the stage for a retro feel. Pixel art assets should be placed in `public/assets/` and loaded via `Assets.load()` from PIXI.js. The React layer outside the canvas is reserved for UI overlays such as menus, HUD elements, and settings panels.

---

## Game specification

### Concept

A 2D vertical infinite scroller. The world scrolls from bottom to top — the player's car is always near the bottom of the screen while the road rushes toward them. Difficulty increases over time via scroll speed acceleration.

### Canvas & layout

- Fixed canvas: **800 × 600 px**.
- Playfield divided into **6 equal-width columns** (800 / 6 ≈ 133 px each).

| Column | Type     | Spawn pool                   |
|--------|----------|------------------------------|
| 1      | Sidewalk | StreetLamp, Parkmeter        |
| 2      | Road     | Car                          |
| 3      | Road     | Car                          |
| 4      | Road     | Car                          |
| 5      | Road     | Car                          |
| 6      | Sidewalk | StreetLamp, Parkmeter        |

### Player

- Starts in **column 3**.
- Moves **left** or **right** one column per `←` / `→` key press (discrete, instant snap).
- Can enter Sidewalk columns (1 and 6) — risky but rewarded by Parkmeters.

### Scrolling & speed

- Scroll direction: **bottom → top** (world moves downward toward the player).
- Speed **accelerates every 10 seconds**, indefinitely — no cap.

### Objects

| Object      | Column type | Effect on collision        |
|-------------|-------------|----------------------------|
| StreetLamp  | Sidewalk    | Game over                  |
| Car         | Road        | Game over                  |
| Parkmeter   | Sidewalk    | **+50 points** (collected) |

- All objects are same-direction (moving the same way as the player — slower cars/props being overtaken).
- Objects spawn randomly per column at the top of the screen and scroll downward.
- Multiple objects can be present in the same column simultaneously.

### Scoring

- **Base score**: continuously increases with distance/time survived.
- **Bonus**: +50 points for each Parkmeter collected.

### Screens & flow

```
Title screen  →  [any key]  →  Gameplay  →  [collision]  →  Game Over screen  →  [any key]  →  Title screen
```

- Screens are kept as simple as possible (minimal text, no complex transitions).

### Input

- Keyboard only: `←` / `→` arrow keys to move, any key to advance screens.
