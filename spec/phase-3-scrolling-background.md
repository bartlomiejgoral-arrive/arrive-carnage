# Phase 3 — Gameplay: scrolling background & sprite placeholders

> **All visuals in phases 1–6 use placeholder graphics only** (solid-colour rectangles drawn with PIXI `Graphics`). No real sprite assets are loaded until Phase 7.

All placeholders are defined in `src/game/AssetLoader.ts`. Phase 7 swaps texture sources there without touching any game logic.

### Background tiles (solid colour blocks)

- Greenery panels (left + right) — scrolling downward
- Road section: 4 lane tiles + 2 sidewalk tiles, also scrolling
- Tile recycling: when a tile row scrolls off the bottom, it wraps to the top

### Game object placeholders

| Asset | Placeholder colour | Used in |
|---|---|---|
| Player car | Bright blue rectangle | Phase 4 |
| Enemy car | Red rectangle | Phase 5 — `Car` object |
| Parkmeter | Yellow rectangle | Phase 5 — `Parkmeter` object |
| Street lantern | Grey rectangle | Phase 5 — `StreetLamp` object |
