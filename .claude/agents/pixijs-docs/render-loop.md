## Render Loop

# Render Loop

At the core of PixiJS lies its **render loop**, a repeating cycle that updates and redraws your scene every frame. Unlike traditional web development where rendering is event-based (e.g. on user input), PixiJS uses a continuous animation loop that provides full control over real-time rendering.

This guide provides a deep dive into how PixiJS structures this loop internally, from the moment a frame begins to when it is rendered to the screen. Understanding this will help you write more performant, well-structured applications.

## Overview

Each frame, PixiJS performs the following sequence:

1. **Tickers are executed** (user logic)
2. **Scene graph is updated** (transforms and culling)
3. **Rendering occurs** (GPU draw calls)

This cycle repeats as long as your application is running and its ticker is active.

## Step 1: Running Ticker Callbacks

The render loop is driven by the `Ticker` class, which uses `requestAnimationFrame` to schedule work. Each tick:

- Measures elapsed time since the previous frame
- Caps it based on `minFPS` and `maxFPS`
- Calls every listener registered with `ticker.add()` or `app.ticker.add()`

### Example

```ts
app.ticker.add((ticker) => {
  bunny.rotation += ticker.deltaTime * 0.1;
});
```

Every callback receives the current `Ticker` instance. You can access `ticker.deltaTime` (scaled frame delta) and `ticker.elapsedMS` (unscaled delta in ms) to time animations.

## Step 2: Updating the Scene Graph

PixiJS uses a hierarchical **scene graph** to represent all visual objects. Before rendering, the graph needs to be traversed to:

- Recalculate transforms (world matrix updates)
- Apply custom logic via `onRender` handlers
- Apply culling if enabled

## Step 3: Rendering the Scene

Once the scene graph is ready, the renderer walks the display list starting at `app.stage`:

1. Applies global and local transformations
2. Batches draw calls when possible
3. Uploads geometry, textures, and uniforms
4. Issues GPU commands

All rendering is **retained mode**: objects persist across frames unless explicitly removed.

Rendering is done via either WebGL or WebGPU, depending on your environment. The renderer abstracts away the differences behind a common API.

## Full Frame Lifecycle Diagram

```plaintext
requestAnimationFrame
        │
    [Ticker._tick()]
        │
    ├─ Compute elapsed time
    ├─ Call user listeners
    │   └─ sprite.onRender
    ├─ Cull display objects (if enabled)
    ├─ Update world transforms
    └─ Render stage
            ├─ Traverse display list
            ├─ Upload data to GPU
            └─ Draw
```

---

## Ticker

# Ticker

The `Ticker` class in PixiJS provides a powerful and flexible mechanism for executing callbacks on every animation frame. It's useful for managing game loops, animations, and any time-based updates.

```ts
import { Ticker } from 'pixi.js';

const ticker = new Ticker();

ticker.add((ticker) => {
  console.log(`Delta Time: ${ticker.deltaTime}`);
});

// Start the ticker
ticker.start();
```

## Adding and Removing Listeners

The `Ticker` class allows you to add multiple listeners that will be called on every frame. You can also specify a context for the callback, which is useful for maintaining the correct `this` reference.

```ts
ticker.add(myFunction, myContext);
ticker.addOnce(myFunction, myContext);
ticker.remove(myFunction, myContext);
```

## Controlling the Ticker

```ts
ticker.start(); // Begin calling listeners every frame
ticker.stop(); // Pause the ticker and cancel the animation frame
```

To automatically start the ticker when a listener is added, enable `autoStart`:

```ts
ticker.autoStart = true;
```

## Prioritizing Listeners

Listeners can be assigned a priority. Higher values run earlier.

```ts
import { UPDATE_PRIORITY } from 'pixi.js';

ticker.add(fnA, null, UPDATE_PRIORITY.HIGH); // runs before...
ticker.add(fnB, null, UPDATE_PRIORITY.NORMAL); // ...this
```

Available constants include:

- `UPDATE_PRIORITY.HIGH = 50`
- `UPDATE_PRIORITY.NORMAL = 0`
- `UPDATE_PRIORITY.LOW = -50`

## Configuring FPS

Tickers allows FPS limits to control the update rate.

### `minFPS`

Caps how _slow_ frames are allowed to be. Used to clamp `deltaTime`:

```ts
ticker.minFPS = 30; // deltaTime will never act as if below 30 FPS
```

### `maxFPS`

Limits how _fast_ the ticker runs. Useful for conserving CPU/GPU:

```ts
ticker.maxFPS = 60; // will not tick faster than 60fps
```

Set to `0` to allow unlimited framerate:

```ts
ticker.maxFPS = 0;
```

---

## API Reference

- [Ticker](https://pixijs.download/release/docs/ticker.Ticker.html)
- [Application](https://pixijs.download/release/docs/app.Application.html)

---

