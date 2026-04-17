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

//TODO: Update the user interface description

The game renders inside a fixed 800×600 PIXI.js canvas mounted by the `GameCanvas` React component. The canvas uses `image-rendering: pixelated` to keep pixel art crisp at any display resolution. A CRT-style scanline overlay is applied on top of the stage for a retro feel. Pixel art assets should be placed in `public/assets/` and loaded via `Assets.load()` from PIXI.js. The React layer outside the canvas is reserved for UI overlays such as menus, HUD elements, and settings panels.
