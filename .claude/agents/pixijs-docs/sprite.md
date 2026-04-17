## Sprite

# Sprite

Sprites are the foundational visual elements in PixiJS. They represent a single image to be displayed on the screen. Each [Sprite](https://pixijs.download/release/docs/scene.Sprite.html) contains a [Texture](https://pixijs.download/release/docs/rendering.Texture.html) to be drawn, along with all the transformation and display state required to function in the scene graph.

```ts
import { Assets, Sprite } from 'pixi.js';

const texture = await Assets.load('path/to/image.png');
const sprite = new Sprite(texture);

sprite.anchor.set(0.5);
sprite.position.set(100, 100);
sprite.scale.set(2);
sprite.rotation = Math.PI / 4; // Rotate 45 degrees
```

## Updating the Texture

If you change the texture of a sprite, it will automatically:

- Rebind listeners for texture updates
- Recalculate width/height if set so that the visual size remains the same
- Trigger a visual update

```ts
const texture = Assets.get('path/to/image.png');
sprite.texture = texture;
```

## **Scale vs Width/Height**

Sprites inherit `scale` from `Container`, allowing for percentage-based resizing:

```ts
sprite.scale.set(2); // Double the size
```

Sprites also have `width` and `height` properties that act as _convenience setters_ for `scale`, based on the texture’s dimensions:

```ts
sprite.width = 100; // Automatically updates scale.x
// sets: sprite.scale.x = 100 / sprite.texture.orig.width;
```

---

## API Reference

- [Sprite](https://pixijs.download/release/docs/scene.Sprite.html)
- [Texture](https://pixijs.download/release/docs/rendering.Texture.html)
- [Assets](https://pixijs.download/release/docs/assets.Assets.html)

---

## NineSlice Sprite

# NineSlice Sprite

`NineSliceSprite` is a specialized type of `Sprite` that allows textures to be resized while preserving the corners and edges. It is particularly useful for building scalable UI elements like buttons, panels, or windows with rounded or decorated borders.

```ts
import { NineSliceSprite, Texture } from 'pixi.js';

const nineSlice = new NineSliceSprite({
  texture: Texture.from('button.png'),
  leftWidth: 15,
  topHeight: 15,
  rightWidth: 15,
  bottomHeight: 15,
  width: 200,
  height: 80,
});

app.stage.addChild(nineSlice);
```

You can also pass just a texture, and the slice values will fall back to defaults or be inferred from the texture’s `defaultBorders`.

## **How NineSlice Works**

Here’s how a nine-slice texture is divided:

```js
    A                          B
  +---+----------------------+---+
C | 1 |          2           | 3 |
  +---+----------------------+---+
  |   |                      |   |
  | 4 |          5           | 6 |
  |   |                      |   |
  +---+----------------------+---+
D | 7 |          8           | 9 |
  +---+----------------------+---+

Areas:
  - 1, 3, 7, 9: Corners (remain unscaled)
  - 2, 8: Top/Bottom center (stretched horizontally)
  - 4, 6: Left/Right center (stretched vertically)
  - 5: Center (stretched in both directions)
```

This ensures that decorative corners are preserved and the center content can scale as needed.

## **Width and Height Behavior**

Setting `.width` and `.height` on a `NineSliceSprite` updates the **geometry vertices**, not the texture UVs. This allows the texture to repeat or stretch correctly based on the slice regions. This also means that the `width` and `height` properties are not the same as the `scale` properties.

```ts
// The texture will stretch to fit the new dimensions
nineSlice.width = 300;
nineSlice.height = 100;

// The nine-slice will increase in size uniformly
nineSlice.scale.set(2); // Doubles the size
```

### **Original Width and Height**

If you need to know the original size of the nine-slice, you can access it through the `originalWidth` and `originalHeight` properties. These values are set when the `NineSliceSprite` is created and represent the dimensions of the texture before any scaling or resizing is applied.

```ts
console.log(nineSlice.originalWidth);
console.log(nineSlice.originalHeight);
```

## **Dynamic Updates**

You can change slice dimensions or size at runtime:

```ts
nineSlice.leftWidth = 20;
nineSlice.topHeight = 25;
```

Each setter triggers a geometry update to reflect the changes.

---

## **API Reference**

- [NineSliceSprite](https://pixijs.download/release/docs/scene.NineSliceSprite.html)

---

## Tiling Sprite

# Tiling Sprite

A `TilingSprite` is a high-performance way to render a repeating texture across a rectangular area. Instead of stretching the texture, it repeats (tiles) it to fill the given space, making it ideal for backgrounds, parallax effects, terrain, and UI panels.

```ts
import { TilingSprite, Texture } from 'pixi.js';

const tilingSprite = new TilingSprite({
  texture: Texture.from('assets/tile.png'),
  width: 400,
  height: 300,
});

app.stage.addChild(tilingSprite);
```

## What is a TilingSprite?

- It draws a texture repeatedly across a defined area.
- The texture is not scaled by default unless you adjust `tileScale`.
- The sprite's overall `width` and `height` determine how much area the tiles fill, independent of the texture's native size.
- The pattern's offset, scale, and rotation can be controlled independently of the object's transform.

## Key Properties

| Property               | Description                                                            |
| ---------------------- | ---------------------------------------------------------------------- |
| `texture`              | The texture being repeated                                             |
| `tilePosition`         | `ObservablePoint` controlling offset of the tiling pattern             |
| `tileScale`            | `ObservablePoint` controlling scaling of each tile                     |
| `tileRotation`         | Number controlling the rotation of the tile pattern                    |
| `width` / `height`     | The size of the area to be filled by tiles                             |
| `anchor`               | Adjusts origin point of the TilingSprite                               |
| `applyAnchorToTexture` | If `true`, the anchor affects the starting point of the tiling pattern |
| `clampMargin`          | Margin adjustment to avoid edge artifacts (default: `0.5`)             |

### Width & Height vs Scale

Unlike `Sprite`, setting `width` and `height` in a `TilingSprite` directly changes the visible tiling area. It **does not affect the scale** of the tiles.

```ts
// Makes the tiling area bigger
tilingSprite.width = 800;
tilingSprite.height = 600;

// Keeps tiles the same size, just tiles more of them
```

To scale the tile pattern itself, use `tileScale`:

```ts
// Makes each tile appear larger
tilingSprite.tileScale.set(2, 2);
```

### Anchor and applyAnchorToTexture

- `anchor` sets the pivot/origin point for positioning the TilingSprite.
- If `applyAnchorToTexture` is `true`, the anchor also affects where the tile pattern begins.
- By default, the tile pattern starts at (0, 0) in local space regardless of anchor.

---

## API Reference

- [TilingSprite](https://pixijs.download/release/docs/scene.TilingSprite.html)
- [Texture](https://pixijs.download/release/docs/rendering.Texture.html)


# Full API Reference

```typescript
