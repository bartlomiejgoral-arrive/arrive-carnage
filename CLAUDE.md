# arrive-carnage

A retro-styled pixel art vertical infinite scroller built with React and PixiJS.

## Project structure

```
arrive-carnage/
├── assets/                 ← source pixel art assets (cars, meters, lights)
│   ├── cars/               ← car_1.png … car_23.png (248×248 px each)
│   └── meters/             ← parking-meeter.png, street-light.png, street-light-right.png, light-3.png, light-3-right.png
├── public/assets/          ← production assets served by Vite (copy from assets/)
├── spec/                   ← 7-phase implementation specs (the source of truth for game design)
├── src/
│   ├── components/
│   │   └── GameCanvas.tsx  ← React wrapper mounting the PIXI canvas
│   ├── game/
│   │   ├── Game.ts         ← PIXI Application + game loop
│   │   ├── constants.ts    ← all magic numbers (canvas size, speeds, scoring)
│   │   ├── SceneManager.ts ← active scene lifecycle
│   │   ├── InputManager.ts ← keyboard input dispatch
│   │   ├── ScoreStore.ts   ← localStorage top-5 persistence
│   │   ├── AssetLoader.ts  ← creates game object visuals (placeholders → sprites)
│   │   ├── Spawner.ts      ← random object spawning + active object management
│   │   ├── Scene.ts        ← Scene interface
│   │   ├── scenes/
│   │   │   ├── TitleScene.ts
│   │   │   ├── LeaderboardScene.ts
│   │   │   ├── GameOverScene.ts
│   │   │   └── GameplayScene.ts
│   │   └── objects/
│   │       ├── GameObject.ts  ← base class
│   │       ├── Car.ts
│   │       ├── StreetLamp.ts
│   │       └── Parkmeter.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css           ← image-rendering: pixelated for crisp sprites
├── index.html
├── vite.config.ts
└── package.json
```

## Stack versions

- **Node.js 22 LTS**
- **React 19**
- **PixiJS 8** (v8 — async init, WebGL/WebGPU, new Graphics/Text API)
- **Vite 6** as bundler
- **TypeScript** (strict mode)

## Development

```bash
npm install
npm run dev
```

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

## Specs

Implementation is defined in `spec/phase-1-core-infrastructure.md` through `spec/phase-7-asset-integration.md`. These are the **source of truth** for game design and behaviour. Read them before implementing.

## PixiJS agent

A dedicated `pixijs` agent is available at `.claude/agents/pixijs.md` with full PixiJS v8 documentation split by topic in `.claude/agents/pixijs-docs/`. Use it (or consult those docs) for any PixiJS implementation work.

---

## PixiJS v8 — Key patterns and gotchas

This section captures the critical PixiJS v8 API patterns that **differ from v7** and are essential for correct implementation. Always follow these — do not use v7 patterns.

### Application init (async required)

```ts
import { Application } from 'pixi.js';

const app = new Application();
await app.init({
  width: 800,
  height: 600,
  backgroundColor: 0x1a1a2e,
  antialias: false,
  roundPixels: true,        // essential for pixel art
  resolution: 1,
});
document.body.appendChild(app.canvas);  // .canvas, NOT .view
```

- `new Application()` then `await app.init(options)` — **not** constructor options.
- Access the canvas via `app.canvas`, not `app.view`.
- For pixel art: set `roundPixels: true`, `antialias: false`, `resolution: 1`.

### Imports — single package

```ts
// v8: everything from 'pixi.js'
import { Application, Sprite, Graphics, Text, Assets, Container, TextureSource } from 'pixi.js';

// NOT the old sub-packages like '@pixi/sprite'
```

### Asset loading

```ts
// Load a single asset
const texture = await Assets.load('path/to/image.png');

// Load multiple assets with aliases
await Assets.load([
  { alias: 'hero', src: '/assets/hero.png' },
  { alias: 'enemy', src: '/assets/enemy.png' },
]);

// Retrieve a loaded asset (sync, must be loaded first)
const tex = Assets.get('hero');
```

- `Assets.load()` replaces the old `Loader`. There is no `loader.add().load()` pattern.
- `Assets.get()` returns a cached texture synchronously — only works after loading.
- Unload with `Assets.unload('alias')` to free memory.

### Pixel art scale mode

Set **before** loading any assets:

```ts
import { TextureSource } from 'pixi.js';
TextureSource.defaultOptions.scaleMode = 'nearest';  // no smoothing
```

Combined with `roundPixels: true` on the app and `image-rendering: pixelated` in CSS.

### Sprites

```ts
const texture = await Assets.load('image.png');
const sprite = new Sprite(texture);

sprite.anchor.set(0.5);           // centre anchor
sprite.position.set(100, 200);
sprite.scale.set(0.5);            // uniform scale
```

- `new Sprite(texture)` — texture must be loaded first.
- Anchor `(0.5, 0.5)` for centre-based positioning.
- Use `sprite.scale.set(n)` for uniform scaling, or `sprite.width`/`sprite.height` which auto-adjust scale.

### Graphics (v8 — shape first, then fill)

```ts
// v8: build shape THEN fill/stroke — NOT beginFill/endFill
const g = new Graphics()
  .rect(0, 0, 100, 50)          // shape first
  .fill(0xff0000)                // then fill
  .circle(200, 200, 30)
  .fill({ color: 0x00ff00, alpha: 0.5 })
  .stroke({ width: 2, color: 0xffffff });
```

**v8 shape method names** (shortened from v7):

| v7 | v8 |
|---|---|
| `drawRect` | `rect` |
| `drawCircle` | `circle` |
| `drawEllipse` | `ellipse` |
| `drawPolygon` | `poly` |
| `drawRoundedRect` | `roundRect` |

- `beginFill()` / `endFill()` are **deprecated**. Use `.rect().fill()` chain.
- `lineStyle()` is replaced by `.stroke({ width, color })`.
- `GraphicsGeometry` is replaced by `GraphicsContext`.

### Text

```ts
const text = new Text({
  text: 'Hello World',
  style: {
    fontFamily: 'monospace',
    fontSize: 24,
    fill: 0xffffff,
    letterSpacing: 2,
  },
});
text.anchor.set(0.5);
```

- v8 `Text` constructor takes an **options object**, not positional arguments.
- `new Text({ text, style })` — not `new Text('Hello', style)`.

### Containers and scene graph

```ts
const container = new Container();
container.addChild(sprite1, sprite2);
container.position.set(100, 100);

// Remove
container.removeChild(sprite1);

// Destroy (recursive)
container.destroy({ children: true });
```

- `sortableChildren` + `zIndex` for render ordering.
- Every scene should have its own root `Container` added to/removed from `app.stage`.

### Ticker / game loop

```ts
app.ticker.add((ticker) => {
  // ticker.deltaTime — frame delta scaled to ~1.0 at 60fps
  // ticker.elapsedMS  — raw milliseconds since last frame
  const deltaSec = ticker.deltaTime / 60;  // convert to seconds
  sprite.x += speed * deltaSec;
});
```

- Callback receives the `Ticker` instance, not just delta.
- `ticker.deltaTime` is ~1.0 at 60fps (frame-scaled). To get seconds: divide by 60 or use `ticker.elapsedMS / 1000`.
- Use `app.ticker.add()` for the main loop.
- Priority: `app.ticker.add(fn, context, UPDATE_PRIORITY.HIGH)` for ordering.

### Resource cleanup / garbage collection

```ts
// Destroy a display object and its children
sprite.destroy({ children: true });

// Unload a texture from GPU (keep in memory)
texture.source.unload();

// Fully unload an asset (free memory + GPU)
await Assets.unload('alias');

// Destroy a texture not loaded via Assets
texture.destroy(true);  // true = also destroy source
```

- Always `destroy()` objects when removing them from the scene.
- `container.destroy({ children: true })` recursively destroys all children.
- `BaseTexture` no longer exists in v8 — use `TextureSource` instead.

### Events / interaction

```ts
sprite.eventMode = 'static';   // enable interaction (replaces interactive = true)
sprite.cursor = 'pointer';

sprite.on('pointerdown', (event) => {
  console.log('clicked', event.global);
});
```

- `eventMode: 'static'` replaces `interactive: true`.
- `eventMode: 'dynamic'` for objects that need hit testing even when not rendered.
- Event types: `pointerdown`, `pointerup`, `pointermove`, `pointerover`, `pointerout`, etc.

### Filters

```ts
import { BlurFilter } from 'pixi.js';

sprite.filters = [new BlurFilter({ strength: 4 })];
```

- Filters take an options object in v8, not positional args.
- Apply via `displayObject.filters = [...]`.

### Common mistakes to avoid

1. **Synchronous Application init** — `new Application(options)` does NOT work in v8. Must use `await app.init()`.
2. **Old Graphics API** — `beginFill()` / `drawRect()` / `endFill()` is deprecated. Use `rect().fill()`.
3. **Old Text constructor** — `new Text('string', style)` is deprecated. Use `new Text({ text, style })`.
4. **`app.view`** — replaced by `app.canvas` in v8.
5. **BaseTexture** — no longer exists. Use `TextureSource`.
6. **`interactive = true`** — replaced by `eventMode = 'static'`.
7. **Sub-package imports** — `@pixi/sprite` etc. are gone. Import everything from `'pixi.js'`.
8. **Loader** — `PIXI.Loader` is gone. Use `Assets.load()`.
