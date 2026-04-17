## Extensions

PixiJS v8 is built entirely around the concept of extensions. Every system in PixiJS is implemented as a modular extension. This allows PixiJS to remain lightweight, flexible, and easy to extend.

:::info
In most cases, you won’t need to interact with the extension system directly unless you are developing a third-party library or contributing to the PixiJS ecosystem itself.
:::

## Extension Types

PixiJS supports a wide range of extension types, each serving a unique role in the architecture:

### Assets

- `ExtensionType.Asset`: Groups together loaders, resolvers, cache and detection extensions into one convenient object instead of having to register each one separately.
- `ExtensionType.LoadParser`: Loads resources like images, JSON, videos.
- `ExtensionType.ResolveParser`: Converts asset URLs into a format that can be used by the loader.
- `ExtensionType.CacheParser`: Determines caching behavior for a particular asset.
- `ExtensionType.DetectionParser`: Identifies asset format support on the current platform.

### Renderer (WebGL, WebGPU, Canvas)

- `ExtensionType.WebGLSystem`, `ExtensionType.WebGPUSystem`, `ExtensionType.CanvasSystem`: Add systems to their respective renderers. These systems can vary widely in functionality, from managing textures to accessibility features.
- `ExtensionType.WebGLPipes`, `ExtensionType.WebGPUPipes`, `ExtensionType.CanvasPipes`: Add a new rendering pipe. RenderPipes are specifically used to render Renderables like a Mesh
- `ExtensionType.WebGLPipesAdaptor`, `ExtensionType.WebGPUPipesAdaptor`, `ExtensionType.CanvasPipesAdaptor`: Adapt rendering pipes for the respective renderers.

### Application

- `ExtensionType.Application`: Used for plugins that extend the `Application` lifecycle.
  For example the `TickerPlugin` and `ResizePlugin` are both application extensions.

### Environment

- `ExtensionType.Environment`: Used to detect and configure platform-specific behavior. This can be useful for configuring PixiJS to work in environments like Node.js, Web Workers, or the browser.

### Other (Primarily Internal Use)

These extension types are mainly used internally and are typically not required in most user-facing applications:

- `ExtensionType.MaskEffect`: Used by MaskEffectManager for custom masking behaviors.
- `ExtensionType.BlendMode`: A type of extension for creating a new advanced blend mode.
- `ExtensionType.TextureSource`: A type of extension that will be used to auto detect a resource type E.g `VideoSource`
- `ExtensionType.ShapeBuilder`: A type of extension for building and triangulating custom shapes used in graphics.
- `ExtensionType.Batcher`: A type of extension for creating custom batchers used in rendering.

## Creating Extensions

The `extensions` object in PixiJS is a global registry for managing extensions. Extensions must declare an `extension` field with metadata, and are registered via `extensions.add(...)`.

```ts
import { extensions, ExtensionType } from 'pixi.js';

const myLoader = {
  extension: {
    type: ExtensionType.LoadParser,
    name: 'my-loader',
  },
  test(url) {
    /* logic */
  },
  load(url) {
    /* logic */
  },
};

extensions.add(myLoader);
```

---

## Environments

# Using PixiJS in Different Environments

PixiJS is a highly adaptable library that can run in a variety of environments, including browsers, Web Workers, and custom execution contexts like Node.js. This guide explains how PixiJS handles different environments and how you can configure it to suit your application's needs.

## Running PixiJS in the Browser

For browser environments, PixiJS uses the `BrowserAdapter` by default, you should not need to configure anything

### Example:

```typescript
import { Application } from 'pixi.js';

const app = new Application();

await app.init({
  width: 800,
  height: 600,
});

document.body.appendChild(app.canvas);
```

## Running PixiJS in Web Workers

Web Workers provide a parallel execution environment, ideal for offloading rendering tasks. PixiJS supports Web Workers using the `WebWorkerAdapter`:

### Example:

```typescript
import { DOMAdapter, WebWorkerAdapter } from 'pixi.js';

// Must be set before creating anything in PixiJS
DOMAdapter.set(WebWorkerAdapter);

const app = new Application();

await app.init({
  width: 800,
  height: 600,
});

app.canvas; // OffscreenCanvas
```

## Custom Environments

For non-standard environments, you can create a custom adapter by implementing the `Adapter` interface. This allows PixiJS to function in environments like Node.js or headless testing setups.

### Example Custom Adapter:

```typescript
import { DOMAdapter } from 'pixi.js';

const CustomAdapter = {
  createCanvas: (width, height) => {
    /* custom implementation */
  },
  getCanvasRenderingContext2D: () => {
    /* custom implementation */
  },
  getWebGLRenderingContext: () => {
    /* custom implementation */
  },
  getNavigator: () => ({ userAgent: 'Custom', gpu: null }),
  getBaseUrl: () => 'custom://',
  fetch: async (url, options) => {
    /* custom fetch */
  },
  parseXML: (xml) => {
    /* custom XML parser */
  },
};

DOMAdapter.set(CustomAdapter);
```

---
## Culler Plugin

# Culler Plugin

The `CullerPlugin` automatically skips rendering for offscreen objects in your scene. It does this by using the renderer's screen bounds to determine whether containers (and optionally their children) intersect the view. If they don't, they are **culled**, reducing rendering and update overhead.

PixiJS does not enable this plugin by default. You must manually register it using the `extensions` system.

## When Should You Use It?

Culling is ideal for:

- Large scenes with many offscreen elements
- Scrollable or camera-driven environments (e.g. tilemaps, world views)
- Optimizing render performance without restructuring your scene graph

## Usage

```ts
const app = new Application();

await app.init({
  width: 800,
  height: 600,
  backgroundColor: 0x222222,
});

extensions.add(CullerPlugin);

const world = new Container();
world.cullable = true;
world.cullableChildren = true;

const sprite = new Sprite.from('path/to/image.png');
sprite.cullable = true; // Enable culling for this sprite
world.addChild(sprite);

app.stage.addChild(world);
```

### Enabling the Culler Plugin

To enable automatic culling in your application:

```ts
import { extensions, CullerPlugin } from 'pixi.js';

extensions.add(CullerPlugin);
```

This will override the default `render()` method on your `Application` instance to call `Culler.shared.cull()` before rendering:

```ts
// Internally replaces:
app.renderer.render({ container: app.stage });
// With:
Culler.shared.cull(app.stage, app.renderer.screen);
app.renderer.render({ container: app.stage });
```

### Configuring Containers for Culling

By default, containers are **not culled**. To enable culling for a container, set the following properties:

```ts
container.cullable = true; // Enables culling for this container
container.cullableChildren = true; // Enables recursive culling for children
```

### Optional: Define a Custom Cull Area

You can define a `cullArea` to override the default bounds check (which uses global bounds):

```ts
container.cullArea = new Rectangle(0, 0, 100, 100);
```

This is useful for containers with many children where bounding box calculations are expensive or inaccurate.

---

## Manual Culling with `Culler`

If you’re not using the plugin but want to manually cull before rendering:

```ts
import { Culler } from 'pixi.js';

const stage = new Container();
// Configure stage and children...

Culler.shared.cull(stage, { x: 0, y: 0, width: 800, height: 600 });
renderer.render({ container: stage });
```

---

## API Reference

- [CullerPlugin](https://pixijs.download/release/docs/app.CullerPlugin.html)

---

