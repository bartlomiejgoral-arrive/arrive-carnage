## Textures

# Textures

Textures are one of the most essential components in the PixiJS rendering pipeline. They define the visual content used by Sprites, Meshes, and other renderable objects. This guide covers how textures are loaded, created, and used, along with the various types of data sources PixiJS supports.

## Texture Lifecycle

The texture system is built around two major classes:

- **`TextureSource`**: Represents a pixel source, such as an image, canvas, or video.
- **`Texture`**: Defines a view into a `TextureSource`, including sub-rectangles, trims, and transformations.

### Lifecycle Flow

```
Source File/Image -> TextureSource -> Texture -> Sprite (or other display object)
```

### Loading Textures

Textures can be loaded asynchronously using the `Assets` system:

```ts
const texture = await Assets.load('myTexture.png');

const sprite = new Sprite(texture);
```

### Preparing Textures

Even after you've loaded your textures, the images still need to be pushed to the GPU and decoded. Doing this for a large number of source images can be slow and cause lag spikes when your project first loads. To solve this, you can use the [Prepare](https://pixijs.download/release/docs/rendering.PrepareSystem.html) plugin, which allows you to pre-load textures in a final step before displaying your project.

## Texture vs. TextureSource

The `TextureSource` handles the raw pixel data and GPU upload. A `Texture` is a lightweight view on that source, with metadata such as trimming, frame rectangle, UV mapping, etc. Multiple `Texture` instances can share a single `TextureSource`, such as in a sprite sheet.

```ts
const sheet = await Assets.load('spritesheet.json');
const heroTexture = sheet.textures['hero.png'];
```

## Texture Creation

You can manually create textures using the constructor:

```ts
const mySource = new TextureSource({ resource: myImage });
const texture = new Texture({ source: mySource });
```

Set `dynamic: true` in the `Texture` options if you plan to modify its `frame`, `trim`, or `source` at runtime.

## Destroying Textures

Once you're done with a Texture, you may wish to free up the memory (both WebGL-managed buffers and browser-based) that it uses. To do so, you should call `Assets.unload('texture.png')`, or `texture.destroy()` if you have created the texture outside of Assets.

This is a particularly good idea for short-lived imagery like cut-scenes that are large and will only be used once. If a texture is destroyed that was loaded via `Assets` then the assets class will automatically remove it from the cache for you.

## Unload Texture from GPU

If you want to unload a texture from the GPU but keep it in memory, you can call `texture.source.unload()`. This will remove the texture from the GPU but keep the source in memory.

```ts
// Load the texture
const texture = await Assets.load('myTexture.png');

// ... Use the texture

// Unload the texture from the GPU
texture.source.unload();
```

## Texture Types

PixiJS supports multiple `TextureSource` types, depending on the kind of input data:

| Texture Type          | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| **ImageSource**       | HTMLImageElement, ImageBitmap, SVG's, VideoFrame, etc.            |
| **CanvasSource**      | HTMLCanvasElement or OffscreenCanvas                              |
| **VideoSource**       | HTMLVideoElement with optional auto-play and update FPS           |
| **BufferImageSource** | TypedArray or ArrayBuffer with explicit width, height, and format |
| **CompressedSource**  | Array of compressed mipmaps (Uint8Array\[])                       |

## Common Texture Properties

Here are some important properties of the `Texture` class:

- `frame`: Rectangle defining the visible portion within the source.
- `orig`: Original untrimmed dimensions.
- `trim`: Defines trimmed regions to exclude transparent space.
- `uvs`: UV coordinates generated from `frame` and `rotate`.
- `rotate`: GroupD8 rotation value for atlas compatibility.
- `defaultAnchor`: Default anchor when used in Sprites.
- `defaultBorders`: Used for 9-slice scaling.
- `source`: The `TextureSource` instance.

## Common TextureSource Properties

Here are some important properties of the `TextureSource` class:

- `resolution`: Affects render size relative to actual pixel size.
- `format`: Texture format (e.g., `rgba8unorm`, `bgra8unorm`, etc.)
- `alphaMode`: Controls how alpha is interpreted on upload.
- `wrapMode` / `scaleMode`: Controls how texture is sampled outside of bounds or when scaled.
- `autoGenerateMipmaps`: Whether to generate mipmaps on upload.

You can set these properties when creating a `TextureSource`:

```ts
texture.source.scaleMode = 'linear';
texture.source.wrapMode = 'repeat';
```

---

## API Reference

- [Texture](https://pixijs.download/release/docs/rendering.Texture.html)
- [TextureSource](https://pixijs.download/release/docs/rendering.TextureSource.html)
- [TextureStyle](https://pixijs.download/release/docs/rendering.TextureStyle.html)
- [RenderTexture](https://pixijs.download/release/docs/rendering.RenderTexture.html)

---

## Cache As Texture

# Cache As Texture

### Using `cacheAsTexture` in PixiJS

The `cacheAsTexture` function in PixiJS is a powerful tool for optimizing rendering in your applications. By rendering a container and its children to a texture, `cacheAsTexture` can significantly improve performance for static or infrequently updated containers. Let's explore how to use it effectively, along with its benefits and considerations.

:::info[Note]
`cacheAsTexture` is PixiJS v8's equivalent of the previous `cacheAsBitmap` functionality. If you're migrating from v7 or earlier, simply replace `cacheAsBitmap` with `cacheAsTexture` in your code.
:::

---

### What Is `cacheAsTexture`?

When you set `container.cacheAsTexture()`, the container is rendered to a texture. Subsequent renders reuse this texture instead of rendering all the individual children of the container. This approach is particularly useful for containers with many static elements, as it reduces the rendering workload.

To update the texture after making changes to the container, call:

```javascript
container.updateCacheTexture();
```

and to turn it off, call:

```javascript
container.cacheAsTexture(false);
```

---

### Basic Usage

Here's an example that demonstrates how to use `cacheAsTexture`:

```javascript
import * as PIXI from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // load sprite sheet..
  await Assets.load('https://pixijs.com/assets/spritesheet/monsters.json');

  // holder to store aliens
  const aliens = [];
  const alienFrames = [
    'eggHead.png',
    'flowerTop.png',
    'helmlok.png',
    'skully.png',
  ];

  let count = 0;

  // create an empty container
  const alienContainer = new Container();

  alienContainer.x = 400;
  alienContainer.y = 300;

  app.stage.addChild(alienContainer);

  // add a bunch of aliens with textures from image paths
  for (let i = 0; i < 100; i++) {
    const frameName = alienFrames[i % 4];

    // create an alien using the frame name..
    const alien = Sprite.from(frameName);

    alien.tint = Math.random() * 0xffffff;

    alien.x = Math.random() * 800 - 400;
    alien.y = Math.random() * 600 - 300;
    alien.anchor.x = 0.5;
    alien.anchor.y = 0.5;
    aliens.push(alien);
    alienContainer.addChild(alien);
  }

  // this will cache the container and its children as a single texture
  // so instead of drawing 100 sprites, it will draw a single texture!
  alienContainer.cacheAsTexture();
})();
```

In this example, the `container` and its children are rendered to a single texture, reducing the rendering overhead when the scene is drawn.

### Advanced Usage

Instead of enabling cacheAsTexture with true, you can pass a configuration object which is very similar to texture source options.

```typescript
container.cacheAsTexture({
  resolution: 2,
  antialias: true,
});
```

- `resolution` is the resolution of the texture. By default this is the same as you renderer or application.
- `antialias` is the antialias mode to use for the texture. Much like the resolution this defaults to the renderer or application antialias mode.

---

### Benefits of `cacheAsTexture`

- **Performance Boost**: Rendering a complex container as a single texture avoids the need to process each child element individually during each frame.
- **Optimized for Static Content**: Ideal for containers with static or rarely updated children.

---

### Advanced Details

- **Memory Tradeoff**: Each cached texture requires GPU memory. Using `cacheAsTexture` trades rendering speed for increased memory usage.
- **GPU Limitations**: If your container is too large (e.g., over 4096x4096 pixels), the texture may fail to cache, depending on GPU limitations.

---

### How It Works Internally

Under the hood, `cacheAsTexture` converts the container into a render group and renders it to a texture. It uses the same texture cache mechanism as filters:

```javascript
container.enableRenderGroup();
container.renderGroup.cacheAsTexture = true;
```

Once the texture is cached, updating it via `updateCacheTexture()` is efficient and incurs minimal overhead. Its as fast as rendering the container normally.

---

### Best Practices

#### **DO**:

- **Use for Static Content**: Apply `cacheAsTexture` to containers with elements that don't change frequently, such as a UI panel with static decorations.
- **Leverage for Performance**: Use `cacheAsTexture` to render complex containers as a single texture, reducing the overhead of processing each child element individually every frame. This is especially useful for containers that contain expensive effects eg filters.
- **Switch of Antialiasing**: setting antialiasing to false can give a small performance boost, but the texture may look a bit more pixelated around its children's edges.
- **Resolution**: Do adjust the resolution based on your situation, if something is scaled down, you can use a lower resolution.If something is scaled up, you may want to use a higher resolution. But be aware that the higher the resolution the larger the texture and memory footprint.

#### **DON'T**:

- **Apply to Very Large Containers**: Avoid using `cacheAsTexture` on containers that are too large (e.g., over 4096x4096 pixels), as they may fail to cache due to GPU limitations. Instead, split them into smaller containers.
- **Overuse for Dynamic Content**: Flick `cacheAsTexture` on / off frequently on containers, as this results in constant re-caching, negating its benefits. Its better to Cache as texture when you once, and then use `updateCacheTexture` to update it.
- **Apply to Sparse Content**: Do not use `cacheAsTexture` for containers with very few elements or sparse content, as the performance improvement will be negligible.
- **Ignore Memory Impact**: Be cautious of GPU memory usage. Each cached texture consumes memory, so overusing `cacheAsTexture` can lead to resource constraints.

---

### Gotchas

- **Rendering Depends on Scene Visibility**: The cache updates only when the containing scene is rendered. Modifying the layout after setting `cacheAsTexture` but before rendering your scene will be reflected in the cache.

- **Containers are rendered with no transform**: Cached items are rendered at their actual size, ignoring transforms like scaling. For instance, an item scaled down by 50%, its texture will be cached at 100% size and then scaled down by the scene.

- **Caching and Filters**: Filters may not behave as expected with `cacheAsTexture`. To cache the filter effect, wrap the item in a parent container and apply `cacheAsTexture` to the parent.

- **Reusing the texture**: If you want to create a new texture based on the container, its better to use `const texture = renderer.generateTexture(container)` and share that amongst you objects!

By understanding and applying `cacheAsTexture` strategically, you can significantly enhance the rendering performance of your PixiJS projects. Happy coding!

---

