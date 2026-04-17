# Phase 7 — Asset integration

This phase replaces all placeholder graphics (introduced in Phase 3) with the real pixel art sprites.

- Drop finished sprite files into `public/assets/`
- Update `src/game/AssetLoader.ts` to load each sprite via `Assets.load()` and return the textures
- Replace placeholder `Graphics` rectangles with `Sprite` instances — no changes needed outside `AssetLoader.ts`
