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

All visuals are pixel-based. The game renders inside a PIXI.js canvas mounted by the `GameCanvas` React component, with `image-rendering: pixelated` to keep pixel art crisp at any display resolution.

### Main menu

On launch the player sees the game title **"Arrive Carnage"** and two options:

- **START** — begins a new game
- **TOP 5** — opens the leaderboard screen

### Leaderboard (TOP 5)

Displays the top 5 all-time scores stored in local storage. An **EXIT** option returns the player to the main menu.

### Gameboard

The play area is **6 tiles wide** and fills the full canvas height, laid out as:

```
[ greenery ] [ sidewalk | lane | lane | lane | lane | sidewalk ] [ greenery ]
```

- The **6-tile-wide road** sits in the centre of the canvas, composed of a 4-lane street flanked by one sidewalk tile on each side.
- **Greenery** fills the remaining canvas width on both sides and scrolls in sync with the road, extending the sense of movement beyond the play area.

The board is an **infinite scroller** — tiles scroll continuously downward and the scroll speed increases gradually over time. The player's car starts at the bottom centre (tile 3) and can move **left or right** using the arrow keys to avoid obstacles (see the Game engine section).

### Game over screen

When the run ends, the player's **total score** is displayed and automatically saved to local storage. The saved results are reflected in the TOP 5 leaderboard.

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
| Parkmeter   | Sidewalk    | **+$50 fine** (survives, keeps going) |

- All objects are same-direction (moving the same way as the player — slower cars/props being overtaken).
- Objects spawn randomly per column at the top of the screen and scroll downward.
- Multiple objects can be present in the same column simultaneously.

### Scoring

- Score is displayed as a **fine to pay** — a negative dollar value that grows as the player breaks the law (e.g. `-$0`, `-$120`, `-$1 340`).
- **Base fine**: continuously increases with distance/time survived.
- **Parkmeter**: hitting one **adds $50 to the fine** (e.g. `-$200` → `-$250`).

### Screens & flow

```
Title screen  →  [any key]  →  Gameplay  →  [collision]  →  Game Over screen  →  [any key]  →  Title screen
```

- Screens are kept as simple as possible (minimal text, no complex transitions).

### Input

- Keyboard only: `←` / `→` arrow keys to move, any key to advance screens.
