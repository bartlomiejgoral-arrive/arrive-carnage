## Scene Graph

# Scene Graph

Every frame, PixiJS is updating and then rendering the scene graph. Let's talk about what's in the scene graph, and how it impacts how you develop your project. If you've built games before, this should all sound very familiar, but if you're coming from HTML and the DOM, it's worth understanding before we get into specific types of objects you can render.

## The Scene Graph Is a Tree

The scene graph's root node is a container maintained by the application, and referenced with `app.stage`. When you add a sprite or other renderable object as a child to the stage, it's added to the scene graph and will be rendered and interactable. PixiJS `Containers` can also have children, and so as you build more complex scenes, you will end up with a tree of parent-child relationships, rooted at the app's stage.

(A helpful tool for exploring your project is the [Pixi.js devtools plugin](https://chrome.google.com/webstore/detail/pixijs-devtools/aamddddknhcagpehecnhphigffljadon) for Chrome, which allows you to view and manipulate the scene graph in real time as it's running!)

## Parents and Children

When a parent moves, its children move as well. When a parent is rotated, its children are rotated too. Hide a parent, and the children will also be hidden. If you have a game object that's made up of multiple sprites, you can collect them under a container to treat them as a single object in the world, moving and rotating as one.

Each frame, PixiJS runs through the scene graph from the root down through all the children to the leaves to calculate each object's final position, rotation, visibility, transparency, etc. If a parent's alpha is set to 0.5 (making it 50% transparent), all its children will start at 50% transparent as well. If a child is then set to 0.5 alpha, it won't be 50% transparent, it will be 0.5 x 0.5 = 0.25 alpha, or 75% transparent. Similarly, an object's position is relative to its parent, so if a parent is set to an x position of 50 pixels, and the child is set to an x position of 100 pixels, it will be drawn at a screen offset of 150 pixels, or 50 + 100.

Here's an example. We'll create three sprites, each a child of the last, and animate their position, rotation, scale and alpha. Even though each sprite's properties are set to the same values, the parent-child chain amplifies each change:

```ts
import { Application, Assets, Container, Sprite } from 'pixi.js';

(async () => {
  // Create the application helper and add its render target to the page
  const app = new Application();

  await app.init({ resizeTo: window });
  document.body.appendChild(app.canvas);

  // Add a container to center our sprite stack on the page
  const container = new Container({
    x: app.screen.width / 2,
    y: app.screen.height / 2,
  });

  app.stage.addChild(container);

  // load the texture
  const tex = await Assets.load('https://pixijs.com/assets/bunny.png');

  // Create the 3 sprites, each a child of the last
  const sprites = [];
  let parent = container;

  for (let i = 0; i < 3; i++) {
    const wrapper = new Container();
    const sprite = Sprite.from(tex);

    sprite.anchor.set(0.5);
    wrapper.addChild(sprite);
    parent.addChild(wrapper);
    sprites.push(wrapper);
    parent = wrapper;
  }

  // Set all sprite's properties to the same value, animated over time
  let elapsed = 0.0;

  app.ticker.add((delta) => {
    elapsed += delta.deltaTime / 60;
    const amount = Math.sin(elapsed);
    const scale = 1.0 + 0.25 * amount;
    const alpha = 0.75 + 0.25 * amount;
    const angle = 40 * amount;
    const x = 75 * amount;

    for (let i = 0; i < sprites.length; i++) {
      const sprite = sprites[i];

      sprite.scale.set(scale);
      sprite.alpha = alpha;
      sprite.angle = angle;
      sprite.x = x;
    }
  });
})();
```

The cumulative translation, rotation, scale and skew of any given node in the scene graph is stored in the object's
`worldTransform` property. Similarly, the cumulative alpha value is stored in the `worldAlpha` property.

## Render Order

So we have a tree of things to draw. Who gets drawn first?

PixiJS renders the tree from the root down. At each level, the current object is rendered, then each child is rendered in order of insertion. So the second child is rendered on top of the first child, and the third over the second.

Check out this example, with two parent objects A & D, and two children B & C under A:

```ts
import { Application, Container, Sprite, Text, Texture } from 'pixi.js';

(async () => {
  // Create the application helper and add its render target to the page
  const app = new Application();

  await app.init({ resizeTo: window });
  document.body.appendChild(app.canvas);

  // Label showing scene graph hierarchy
  const label = new Text({
    text: 'Scene Graph:\n\napp.stage\n  ┗ A\n     ┗ B\n     ┗ C\n  ┗ D',
    style: { fill: '#ffffff' },
    position: { x: 300, y: 100 },
  });

  app.stage.addChild(label);

  // Helper function to create a block of color with a letter
  const letters = [];

  function addLetter(letter, parent, color, pos) {
    const bg = new Sprite(Texture.WHITE);

    bg.width = 100;
    bg.height = 100;
    bg.tint = color;

    const text = new Text({
      text: letter,
      style: { fill: '#ffffff' },
    });

    text.anchor.set(0.5);
    text.position = { x: 50, y: 50 };

    const container = new Container();

    container.position = pos;
    container.visible = false;
    container.addChild(bg, text);
    parent.addChild(container);

    letters.push(container);

    return container;
  }

  // Define 4 letters
  const a = addLetter('A', app.stage, 0xff0000, { x: 100, y: 100 });
  const b = addLetter('B', a, 0x00ff00, { x: 20, y: 20 });
  const c = addLetter('C', a, 0x0000ff, { x: 20, y: 40 });
  const d = addLetter('D', app.stage, 0xff8800, { x: 140, y: 100 });

  // Display them over time, in order
  let elapsed = 0.0;

  app.ticker.add((ticker) => {
    elapsed += ticker.deltaTime / 60.0;
    if (elapsed >= letters.length) {
      elapsed = 0.0;
    }
    for (let i = 0; i < letters.length; i++) {
      letters[i].visible = elapsed >= i;
    }
  });
})();
```

If you'd like to re-order a child object, you can use `setChildIndex()`. To add a child at a given point in a parent's list, use `addChildAt()`. Finally, you can enable automatic sorting of an object's children using the `sortableChildren` option combined with setting the `zIndex` property on each child.

## RenderGroups

As you delve deeper into PixiJS, you'll encounter a powerful feature known as Render Groups. Think of Render Groups as specialized containers within your scene graph that act like mini scene graphs themselves. Here's what you need to know to effectively use Render Groups in your projects. For more info check out the [RenderGroups overview](./render-groups.md)

## Culling

If you're building a project where a large proportion of your scene objects are off-screen (say, a side-scrolling game), you will want to _cull_ those objects. Culling is the process of evaluating if an object (or its children!) is on the screen, and if not, turning off rendering for it. If you don't cull off-screen objects, the renderer will still draw them, even though none of their pixels end up on the screen.

PixiJS provides built-in support for viewport culling. To enable culling, set `cullable = true` on your objects. You can also set `cullableChildren` to `false` to allow PixiJS to bypass the recursive culling function, which can improve performance. Additionally, you can set `cullArea` to further optimize performance by defining the area to be culled.

## Local vs Global Coordinates

If you add a sprite to the stage, by default it will show up in the top left corner of the screen. That's the origin of the global coordinate space used by PixiJS. If all your objects were children of the stage, that's the only coordinates you'd need to worry about. But once you introduce containers and children, things get more complicated. A child object at [50, 100] is 50 pixels right and 100 pixels down _from its parent_.

We call these two coordinate systems "global" and "local" coordinates. When you use `position.set(x, y)` on an object, you're always working in local coordinates, relative to the object's parent.

The problem is, there are many times when you want to know the global position of an object. For example, if you want to cull offscreen objects to save render time, you need to know if a given child is outside the view rectangle.

To convert from local to global coordinates, you use the `toGlobal()` function. Here's a sample usage:

```javascript
// Get the global position of an object, relative to the top-left of the screen
let globalPos = obj.toGlobal(new Point(0, 0));
```

This snippet will set `globalPos` to be the global coordinates for the child object, relative to [0, 0] in the global coordinate system.

## Global vs Screen Coordinates

When your project is working with the host operating system or browser, there is a third coordinate system that comes into play - "screen" coordinates (aka "viewport" coordinates). Screen coordinates represent position relative to the top-left of the canvas element that PixiJS is rendering into. Things like the DOM and native mouse click events work in screen space.

Now, in many cases, screen space is equivalent to world space. This is the case if the size of the canvas is the same as the size of the render view specified when you create you `Application`. By default, this will be the case - you'll create for example an 800x600 application window and add it to your HTML page, and it will stay that size. 100 pixels in world coordinates will equal 100 pixels in screen space. BUT! It is common to stretch the rendered view to have it fill the screen, or to render at a lower resolution and up-scale for speed. In that case, the screen size of the canvas element will change (e.g. via CSS), but the underlying render view will _not_, resulting in a mis-match between world coordinates and screen coordinates.

---

## Container

# Container

The `Container` class is the foundation of PixiJS's scene graph system. Containers act as groups of scene objects, allowing you to build complex hierarchies, organize rendering layers, and apply transforms or effects to groups of objects.

## What Is a Container?

A `Container` is a general-purpose node that can hold other display objects, **including other containers**. It is used to structure your scene, apply transformations, and manage rendering and interaction.

Containers are **not** rendered directly. Instead, they delegate rendering to their children.

```ts
import { Container, Sprite } from 'pixi.js';

const group = new Container();
const sprite = Sprite.from('bunny.png');

group.addChild(sprite);
```

## Managing Children

PixiJS provides a robust API for adding, removing, reordering, and swapping children in a container:

```ts
const container = new Container();
const child1 = new Container();
const child2 = new Container();

container.addChild(child1, child2);
container.removeChild(child1);
container.addChildAt(child1, 0);
container.swapChildren(child1, child2);
```

You can also remove a child by index or remove all children within a range:

```ts
container.removeChildAt(0);
container.removeChildren(0, 2);
```

To keep a child’s world transform while moving it to another container, use `reparentChild` or `reparentChildAt`:

```ts
otherContainer.reparentChild(child);
```

### Events

Containers emit events when children are added or removed:

```ts
group.on('childAdded', (child, parent, index) => { ... });
group.on('childRemoved', (child, parent, index) => { ... });
```

### Finding Children

Containers support searching children by `label` using helper methods:

```ts
const child = new Container({ label: 'enemy' });
container.addChild(child);
container.getChildByLabel('enemy');
container.getChildrenByLabel(/^enemy/); // all children whose label starts with "enemy"
```

Set `deep = true` to search recursively through all descendants.

```ts
container.getChildByLabel('ui', true);
```

### Sorting Children

Use `zIndex` and `sortableChildren` to control render order within a container:

```ts
child1.zIndex = 1;
child2.zIndex = 10;
container.sortableChildren = true;
```

Call `sortChildren()` to manually re-sort if needed:

```ts
container.sortChildren();
```

:::info
Use this feature sparingly, as sorting can be expensive for large numbers of children.
:::

## Optimizing with Render Groups

Containers can be promoted to **render groups** by setting `isRenderGroup = true` or calling `enableRenderGroup()`.

Use render groups for UI layers, particle systems, or large moving subtrees.
See the [Render Groups guide](../../../concepts/render-groups.md) for more details.

```ts
const uiLayer = new Container({ isRenderGroup: true });
```

## Cache as Texture

The `cacheAsTexture` function in PixiJS is a powerful tool for optimizing rendering in your applications. By rendering a container and its children to a texture, `cacheAsTexture` can significantly improve performance for static or infrequently updated containers.

When you set `container.cacheAsTexture()`, the container is rendered to a texture. Subsequent renders reuse this texture instead of rendering all the individual children of the container. This approach is particularly useful for containers with many static elements, as it reduces the rendering workload.

:::info[Note]
`cacheAsTexture` is PixiJS v8's equivalent of the previous `cacheAsBitmap` functionality. If you're migrating from v7 or earlier, simply replace `cacheAsBitmap` with `cacheAsTexture` in your code.
:::

```ts
const container = new Container();
const sprite = Sprite.from('bunny.png');
container.addChild(sprite);

// enable cache as texture
container.cacheAsTexture();

// update the texture if the container changes
container.updateCacheTexture();

// disable cache as texture
container.cacheAsTexture(false);
```

For more advanced usage, including setting cache options and handling dynamic content, refer to the [Cache as Texture guide](./cache-as-texture.md).

---

## API Reference

- [Container](https://pixijs.download/release/docs/scene.Container.html)
- [ContainerOptions](https://pixijs.download/release/docs/scene.ContainerOptions.html)
- [RenderContainer](https://pixijs.download/release/docs/scene.RenderContainer.html)

---

## Scene Objects

# Scene Objects

In PixiJS, scene objects are the building blocks of your application’s display hierarchy. They include **containers**, **sprites**, **text**, **graphics**, and other drawable entities that make up the **scene graph**—the tree-like structure that determines what gets rendered, how, and in what order.

## Containers vs. Leaf Nodes

Scene objects in PixiJS can be divided into **containers** and **leaf nodes**:

### Containers

`Container` is the **base class** for all scene objects in v8 (replacing the old `DisplayObject`).

- Can have children.
- Commonly used to group objects and apply transformations (position, scale, rotation) to the group.
- Examples: `Application.stage`, user-defined groups.

```ts
const group = new Container();
group.addChild(spriteA);
group.addChild(spriteB);
```

### Leaf Nodes

Leaf nodes are renderable objects that should not have children. In v8, **only containers should have children**.

Examples of leaf nodes include:

- `Sprite`
- `Text`
- `Graphics`
- `Mesh`
- `TilingSprite`
- `HTMLText`

Attempting to add children to a leaf node will not result in a runtime error, however, you may run into unexpected rendering behavior. Therefore, If nesting is required, wrap leaf nodes in a `Container`.

**Before v8 (invalid in v8):**

```ts
const sprite = new Sprite();
sprite.addChild(anotherSprite); // ❌ Invalid in v8
```

**v8 approach:**

```ts
const group = new Container();
group.addChild(sprite);
group.addChild(anotherSprite); // ✅ Valid
```

## Transforms

All scene objects in PixiJS have several properties that control their position, rotation, scale, and alpha. These properties are inherited by child objects, allowing you to apply transformations to groups of objects easily.

You will often use these properties to position and animate objects in your scene.

| Property     | Description                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **position** | X- and Y-position are given in pixels and change the position of the object relative to its parent, also available directly as `object.x` / `object.y`  |
| **rotation** | Rotation is specified in radians, and turns an object clockwise (0.0 - 2 \* Math.PI)                                                                    |
| **angle**    | Angle is an alias for rotation that is specified in degrees instead of radians (0.0 - 360.0)                                                            |
| **pivot**    | Point the object rotates around, in pixels - also sets origin for child objects                                                                         |
| **alpha**    | Opacity from 0.0 (fully transparent) to 1.0 (fully opaque), inherited by children                                                                       |
| **scale**    | Scale is specified as a percent with 1.0 being 100% or actual-size, and can be set independently for the x and y axis                                   |
| **skew**     | Skew transforms the object in x and y similar to the CSS skew() function, and is specified in radians                                                   |
| **anchor?**  | Anchor is a percentage-based offset for the sprite's position and rotation. This is different from the `pivot` property, which is a pixel-based offset. |

### **Anchor vs Pivot**

Some leaf nodes have an additional property called `anchor`, which is a percentage-based offset for the nodes position and rotation. This is different from the `pivot` property, which is a pixel-based offset. Understanding the difference between anchor and pivot is critical when positioning or rotating a node.

:::info
Setting either pivot or anchor visually moves the node. This differs from CSS where changing `transform-origin` does not affect the element's position.
:::

#### **Anchor**

- Available only on `Sprite`
- Defined in normalized values `(0.0 to 1.0)`
- `(0, 0)` is the top-left, `(0.5, 0.5)` is the center
- Changes both position and rotation origin

```ts
sprite.anchor.set(0.5); // center
sprite.rotation = Math.PI / 4; // Rotate 45 degrees around the center
```

#### **Pivot**

- Available on all `Container`s
- Defined in **pixels**, not normalized

```ts
const sprite = new Sprite(texture);
sprite.width = 100;
sprite.height = 100;
sprite.pivot.set(50, 50); // Center of the container
container.rotation = Math.PI / 4; // Rotate 45 degrees around the pivot
```

## Measuring Bounds

There are two types of bounds in PixiJS:

- **Local bounds** represent the object’s dimensions in its own coordinate space. Use `getLocalBounds()`.
- **Global bounds** represent the object's bounding box in world coordinates. Use `getBounds()`.

```ts
const local = container.getLocalBounds();
const global = container.getBounds();
```

If performance is critical you can also provide a custom `boundsArea` to avoid per-child measurement entirely.

### Changing size

To change the size of a container, you can use the `width` and `height` properties. This will scale the container to fit the specified dimensions:

```ts
const container = new Container();
container.width = 100;
container.height = 200;
```

Setting the `width` and `height` individually can be an expensive operation, as it requires recalculating the bounds of the container and its children. To avoid this, you can use `setSize()` to set both properties at once:

```ts
const container = new Container();
container.setSize(100, 200);
const size = container.getSize(); // { width: 100, height: 200 }
```

This method is more efficient than setting `width` and `height` separately, as it only requires one bounds calculation.

## Masking Scene Objects

PixiJS supports **masking**, allowing you to restrict the visible area of a scene object based on another object's shape.
This is useful for creating effects like cropping, revealing, or hiding parts of your scene.

### Types of Masks

- **Graphics-based masks**: Use a `Graphics` object to define the shape.
- **Sprite-based masks**: Use a `Sprite` or other renderable object.

```ts
const shape = new Graphics().circle(100, 100, 50).fill(0x000000);

const maskedSprite = new Sprite(texture);
maskedSprite.mask = shape;

stage.addChild(shape);
stage.addChild(maskedSprite);
```

### Inverse Masks

To create an inverse mask, you can use the `setMask` property and set its `inverse` option to `true`. This will render everything outside the mask.

```ts
const inverseMask = new Graphics().rect(0, 0, 200, 200).fill(0x000000);
const maskedContainer = new Container();
maskedContainer.setMask({ mask: inverseMask, inverse: true });
maskedContainer.addChild(sprite);
stage.addChild(inverseMask);
stage.addChild(maskedContainer);
```

### Notes on Masking

- The mask is **not rendered**; it's used only to define the visible area. However, it must be added to the display list.
- Only one mask can be assigned per object.
- For advanced blending, use **alpha masks** or **filters** (covered in later guides).

## Filters

Another common use for Container objects is as hosts for filtered content. Filters are an advanced, WebGL/WebGPU-only feature that allows PixiJS to perform per-pixel effects like blurring and displacements. By setting a filter on a Container, the area of the screen the Container encompasses will be processed by the filter after the Container's contents have been rendered.

```ts
const container = new Container();
const sprite = new Sprite(texture);
const filter = new BlurFilter({ strength: 8, quality: 4, kernelSize: 5 });
container.filters = [filter];
container.addChild(sprite);
```

:::info
Filters should be used somewhat sparingly. They can slow performance and increase memory usage if used too often in a scene.
:::

Below are list of filters available by default in PixiJS. There is, however, a community repository with [many more filters](https://github.com/pixijs/filters).

| Filter             | Description                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| AlphaFilter        | Similar to setting `alpha` property, but flattens the Container instead of applying to children individually. |
| BlurFilter         | Apply a blur effect                                                                                           |
| ColorMatrixFilter  | A color matrix is a flexible way to apply more complex tints or color transforms (e.g., sepia tone).          |
| DisplacementFilter | Displacement maps create visual offset pixels, for instance creating a wavy water effect.                     |
| NoiseFilter        | Create random noise (e.g., grain effect).                                                                     |

Under the hood, each Filter we offer out of the box is written in both glsl (for WebGL) and wgsl (for WebGPU). This means all filters should work on both renderers.

## Tinting

You can tint any scene object by setting the `tint` property. It modifies the color of the rendered pixels, similar to multiplying a tint color over the object.

```ts
const sprite = new Sprite(texture);
sprite.tint = 0xff0000; // Red tint
sprite.tint = 'red'; // Red tint
```

The `tint` is inherited by child objects unless they specify their own. If only part of your scene should be tinted, place it in a separate container.

A value of `0xFFFFFF` disables tinting.

```ts
const sprite = new Sprite(texture);
sprite.tint = 0x00ff00; // Green tint
sprite.tint = 0xffffff; // No tint
```

PixiJS supports a variety of color formats and you can find more information from the [Color documentation](../color.md).

## Blend Modes

Blend modes determine how colors of overlapping objects are combined. PixiJS supports a variety of blend modes, including:

- `normal`: Default blend mode.
- `add`: Adds the colors of the source and destination pixels.
- `multiply`: Multiplies the colors of the source and destination pixels.
- `screen`: Inverts the colors, multiplies them, and inverts again.

We also support may more advanced blend modes, such as `subtract`, `difference`, and `overlay`. You can find the full list of blend modes in the [Blend Modes documentation](../filters.md#advanced-blend-modes).

```ts
const sprite = new Sprite(texture);
sprite.blendMode = 'multiply'; // Multiply blend mode
```

## Interaction

PixiJS provides a powerful interaction system that allows you to handle user input events like clicks/hovers. To enable interaction on a scene object, can be as simple as setting its `interactive` property to `true`.

```ts
const sprite = new Sprite(texture);
sprite.interactive = true;
sprite.on('click', (event) => {
  console.log('Sprite clicked!', event);
});
```

We have a detailed guide on [Interaction](../events.md) that covers how to set up and manage interactions, including hit testing, pointer events, and more. We highly recommend checking it out.

## Using `onRender`

The `onRender` callback allows you to run logic every frame when a scene object is rendered. This is useful for lightweight animation and update logic:

```ts
const container = new Container();
container.onRender = () => {
  container.rotation += 0.01;
};
```

Note: In PixiJS v8, this replaces the common v7 pattern of overriding `updateTransform`, which no longer runs every frame. The `onRender` function is registered with the render group the container belongs to.

To remove the callback:

```ts
container.onRender = null;
```

---

## API Reference

- [Overview](https://pixijs.download/release/docs/scene.html)
- [Container](https://pixijs.download/release/docs/scene.Container.html)
- [ParticleContainer](https://pixijs.download/release/docs/scene.ParticleContainer.html)
- [Sprite](https://pixijs.download/release/docs/scene.Sprite.html)
- [TilingSprite](https://pixijs.download/release/docs/scene.TilingSprite.html)
- [NineSliceSprite](https://pixijs.download/release/docs/scene.NineSliceSprite.html)
- [Graphics](https://pixijs.download/release/docs/scene.Graphics.html)
- [Mesh](https://pixijs.download/release/docs/scene.Mesh.html)
- [Text](https://pixijs.download/release/docs/scene.Text.html)
- [Bitmap Text](https://pixijs.download/release/docs/scene.BitmapText.html)
- [HTMLText](https://pixijs.download/release/docs/scene.HTMLText.html)

---

