# arrive-carnage

The project structure:

```
arrive-carnage/
├── public/assets/          ← drop pixel art images here
├── src/
│   ├── components/
│   │   └── GameCanvas.tsx  ← React wrapper mounting the PIXI canvas
│   ├── game/
│   │   ├── Game.ts         ← PIXI Application + game loop
│   │   └── scenes/         ← future game scenes
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css           ← image-rendering: pixelated for crisp sprites
├── index.html
├── vite.config.ts
└── package.json
```

## Stack versions

- **Node.js 22 LTS** (current active LTS)
- **React 19** (latest stable)
- **PIXI.js 8** (latest — uses async `await app.init(...)` API, WebGL/WebGPU renderer)
- **Vite 6** as bundler

## Development

Run `npm run dev` to start the dev server. Currently shows an "ARRIVE CARNAGE" title screen with a blinking prompt and a retro CRT scanline overlay. Once you have pixel art assets, drop them in `public/assets/` and load them via `Assets.load()` in `Game.ts`.

## Sources

- [Node.js Releases](https://nodejs.org/en/about/previous-releases)
- [React Versions](https://react.dev/versions)
- [PixiJS v8 Launch](https://pixijs.com/blog/pixi-v8-launches)
