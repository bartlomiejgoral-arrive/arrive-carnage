# Phase 6 — Gameplay: logic

- **Collision detection**: bounding-box check between player and each active object each tick
- **Scoring**: time-elapsed counter incrementing continuously + +50 per Parkmeter
- **Speed acceleration**: every 10 seconds increase scroll speed (no cap)
- **Game over trigger**: collision with Car or StreetLamp → transition to `GameOverScene` with final score
