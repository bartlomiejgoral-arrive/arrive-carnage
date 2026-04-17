# Phase 7 — Asset integration

This phase replaces all placeholder `Graphics` rectangles with real pixel art sprites. **No game logic changes** — only `AssetLoader.ts` is modified.

---

## Available assets

Assets are located at **`assets/`** (project root). They must be copied or moved to **`public/assets/`** so Vite serves them statically, or imported directly. The recommended approach is to reference them from `public/assets/` so they load via `Assets.load('/assets/...')`.

### Cars

23 car sprites in `assets/cars/`:

| Files | Dimensions | Notes |
|---|---|---|
| `car_1.png` – `car_23.png` | 248 × 248 px | Top-down pixel art, transparent background |

- **All 23 cars** are used for both the player and enemies. On game start, a random car is assigned to the player. Enemy cars are also picked at random from the full pool (may repeat the player's car — that's fine).

### Sidewalk objects

All in `assets/meters/`:

| File | Dimensions | Usage |
|---|---|---|
| `parking-meeter.png` | 150 × 150 px | Parkmeter collectible |
| `street-light.png` | 300 × 300 px | Street lamp — **left sidewalk** (column 1) |
| `street-light-right.png` | 300 × 300 px | Street lamp — **right sidewalk** (column 6) |
| `light-3.png` | 300 × 300 px | Street lamp variant 2 — **left sidewalk** |
| `light-3-right.png` | 300 × 300 px | Street lamp variant 2 — **right sidewalk** |

Street lamps have **two visual variants** (`street-light` and `light-3`). When spawning, pick one at random for variety. Always use the `-right` version for column 6 and the regular version for column 1.

---

## Scaling

Sprites are larger than the 100 px column. Scale them down to fit within `TILE_WIDTH`:

| Object | Target width | Scale factor |
|---|---|---|
| Car (player & enemy) | ~70 px | `0.28` (248 × 0.28 ≈ 70) |
| Street lamp | ~50 px | `0.17` (300 × 0.17 ≈ 50) |
| Parkmeter | ~40 px | `0.27` (150 × 0.27 ≈ 40) |

Set scale on the sprite: `sprite.scale.set(factor)`. Exact values can be tweaked visually.

---

## Loading

Use PIXI v8 `Assets.load()` in `AssetLoader.ts`:

```ts
await Assets.load([
  { alias: 'car_1', src: '/assets/cars/car_1.png' },
  { alias: 'car_2', src: '/assets/cars/car_2.png' },
  // ... all 23 cars
  { alias: 'parkmeter', src: '/assets/meters/parking-meeter.png' },
  { alias: 'lamp_left', src: '/assets/meters/street-light.png' },
  { alias: 'lamp_right', src: '/assets/meters/street-light-right.png' },
  { alias: 'lamp2_left', src: '/assets/meters/light-3.png' },
  { alias: 'lamp2_right', src: '/assets/meters/light-3-right.png' },
]);
```

### Pixel art rendering

All sprites must render crisp without smoothing:

```ts
import { TextureSource } from 'pixi.js';
TextureSource.defaultOptions.scaleMode = 'nearest';
```

Set this **before** loading any assets. Combined with `roundPixels: true` on the Application and `image-rendering: pixelated` in CSS, this keeps pixel art sharp.

---

## Updated `AssetLoader.ts`

The `GameAssets` interface stays the same — only the implementation changes:

```ts
createPlayerCar(): Container    → new Sprite(Assets.get(`car_${randomInt(1,23)}`))
createEnemyCar(): Container     → new Sprite(Assets.get(`car_${randomInt(1,23)}`))
createParkmeter(): Container    → new Sprite(Assets.get('parkmeter'))
createStreetLamp('left'): Container  → new Sprite(Assets.get(randomPick('lamp_left', 'lamp2_left')))
createStreetLamp('right'): Container → new Sprite(Assets.get(randomPick('lamp_right', 'lamp2_right')))
```

Each returned sprite has its anchor set to `(0.5, 0.5)` and scale applied per the table above.
