# Phase 3 — Gameplay: scrolling background & sprite placeholders

> **All visuals in phases 3–6 use placeholder graphics only** (solid-colour rectangles drawn with PIXI `Graphics`). Phase 7 swaps in real sprite assets without touching game logic.

---

## `src/game/scenes/GameplayScene.ts`

This is the main gameplay scene. Implements `Scene`. Phases 3–6 all build into this single scene.

Phase 3 focuses on the scrolling background and defining placeholder visuals. Later phases add the player (4), spawner/objects (5), and scoring/collision (6).

---

## Background layout

Canvas is **800 × 600**. The 6-column road (600 px) is centred, with 100 px greenery on each side.

```
x:  0       100                           700       800
    |       |                             |         |
    | green | SW | lane | lane | lane | lane | SW | green |
    |  ery  | col1 | col2 | col3 | col4 | col5 | col6 | ery  |
```

Each column is **100 px** wide (`TILE_WIDTH`).

### Tile grid

- **Tile dimensions**: 100 × 100 px (square).
- **Rows needed**: `Math.ceil(GAME_HEIGHT / TILE_HEIGHT) + 1` = **7 rows** (6 to fill the screen + 1 buffer for seamless scrolling).
- **Columns**: 8 total (1 greenery left + 6 road + 1 greenery right). The greenery column width matches `GREENERY_WIDTH` (100 px).

### Tile colours (placeholders)

| Tile type | Colour | Where |
|---|---|---|
| Greenery | `0x2d5a1e` (dark green) | Columns 0 and 7 (outside the road) |
| Sidewalk | `0x888888` (grey) | Columns 1 and 6 |
| Road lane | `0x333333` (dark grey) | Columns 2–5 |

### Scrolling behaviour

- All tile rows scroll **downward** at the current scroll speed (px/s × delta).
- When a tile row's top edge passes `GAME_HEIGHT`, it wraps to `y = -TILE_HEIGHT` (recycled to the top).
- The scroll creates the illusion of the world moving toward the player.

---

## Game object placeholders

Defined in `src/game/AssetLoader.ts`. Each returns a `Container` (wrapping a `Graphics` rectangle during phases 3–6, swapped to a `Sprite` in phase 7).

| Asset | Placeholder | Size (px) | Colour |
|---|---|---|---|
| Player car | Rectangle | 60 × 80 | `0x3399ff` (bright blue) |
| Enemy car | Rectangle | 60 × 80 | `0xff3333` (red) |
| Parkmeter | Rectangle | 30 × 50 | `0xffcc00` (yellow) |
| Street lamp | Rectangle | 30 × 70 | `0x999999` (grey) |

### `src/game/AssetLoader.ts`

```ts
export interface GameAssets {
  createPlayerCar(): Container;
  createEnemyCar(): Container;
  createParkmeter(): Container;
  createStreetLamp(side: 'left' | 'right'): Container;
}
```

During phases 3–6 this returns `Graphics` rectangles. Phase 7 replaces the implementation to return `Sprite` instances.

The `side` parameter on `createStreetLamp` determines which sprite variant to use (left-facing for column 1, right-facing for column 6). During placeholder phase it has no visual effect.
