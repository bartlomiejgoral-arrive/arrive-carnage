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

## Development guidelines

### Unit tests
- Testing framework: **Vitest** with jsdom environment
- Every class or module must have a co-located `*.test.ts` file
- Run tests with `npm test` (watch mode) or `npm run test:run` (single pass)
- Tests must not import PIXI classes directly — use `import type` for types and plain object mocks for PIXI instances

### SOLID principles
- **S — Single responsibility**: each class does one thing; scenes, managers, and stores are separate
- **O — Open/closed**: extend behaviour via new classes or by adding scene implementations, not by modifying existing ones
- **L — Liskov substitution**: all scenes implement `IScene`; any scene must be swappable without breaking `SceneManager`
- **I — Interface segregation**: keep interfaces small and focused (e.g. `IScene` only exposes `init`, `update`, `destroy`)
- **D — Dependency inversion**: depend on interfaces (`IScene`), not concrete classes

## Sources

- [Node.js Releases](https://nodejs.org/en/about/previous-releases)
- [React Versions](https://react.dev/versions)
- [PixiJS v8 Launch](https://pixijs.com/blog/pixi-v8-launches)
