## Math

# Math

PixiJS includes a several math utilities for 2D transformations, geometry, and shape manipulation. This guide introduces the most important classes and their use cases, including optional advanced methods enabled via `math-extras`.

## Matrix

The `Matrix` class represents a 2D affine transformation matrix. It is used extensively for transformations such as scaling, translation, and rotation.

```ts
import { Matrix, Point } from 'pixi.js';

const matrix = new Matrix();
matrix.translate(10, 20).scale(2, 2);

const point = new Point(5, 5);
const result = matrix.apply(point); // result is (20, 30)
```

---

## Point and ObservablePoint

### `Point`

The Point object represents a location in a two-dimensional coordinate system, where `x` represents the position on the horizontal axis and `y` represents the position on the vertical axis. Many Pixi functions accept the `PointData` type as an alternative to `Point`, which only requires `x` and `y` properties.

```ts
import { Point } from 'pixi.js';
const point = new Point(5, 10);

point.set(20, 30); // set x and y
```

### `ObservablePoint`

Extends `Point` and triggers a callback when its values change. Used internally for reactive systems like position and scale updates.

```ts
import { Point, ObservablePoint } from 'pixi.js';

const observer = {
  _onUpdate: (point) => {
    console.log(`Point updated to: (${point.x}, ${point.y})`);
  },
};
const reactive = new ObservablePoint(observer, 1, 2);
reactive.set(3, 4); // triggers call to _onUpdate
```

---

## Shapes

PixiJS includes several 2D shapes, used for hit testing, rendering, and geometry computations.

### `Rectangle`

Axis-aligned rectangle defined by `x`, `y`, `width`, and `height`.

```ts
import { Rectangle } from 'pixi.js';

const rect = new Rectangle(10, 10, 100, 50);
rect.contains(20, 20); // true
```

### `Circle`

Defined by `x`, `y` (center) and `radius`.

```ts
import { Circle } from 'pixi.js';

const circle = new Circle(50, 50, 25);
circle.contains(50, 75); // true
```

### `Ellipse`

Similar to `Circle`, but supports different width and height (radii).

```ts
import { Ellipse } from 'pixi.js';

const ellipse = new Ellipse(0, 0, 20, 10);
ellipse.contains(5, 0); // true
```

### `Polygon`

Defined by a list of points. Used for complex shapes and hit testing.

```ts
import { Polygon } from 'pixi.js';

const polygon = new Polygon([0, 0, 100, 0, 100, 100, 0, 100]);
polygon.contains(50, 50); // true
```

### `RoundedRectangle`

Rectangle with rounded corners, defined by a radius.

```ts
import { RoundedRectangle } from 'pixi.js';

const roundRect = new RoundedRectangle(0, 0, 100, 100, 10);
roundRect.contains(10, 10); // true
```

### `Triangle`

A convenience wrapper for defining triangles with three points.

```ts
import { Triangle } from 'pixi.js';

const triangle = new Triangle(0, 0, 100, 0, 50, 100);
triangle.contains(50, 50); // true
```

---

## Optional: `math-extras`

Importing `pixi.js/math-extras` extends `Point` and `Rectangle` with additional vector and geometry utilities.

### To enable:

```ts
import 'pixi.js/math-extras';
```

### Enhanced `Point` Methods

| Method                          | Description                                                  |
| ------------------------------- | ------------------------------------------------------------ |
| `add(other[, out])`             | Adds another point to this one.                              |
| `subtract(other[, out])`        | Subtracts another point from this one.                       |
| `multiply(other[, out])`        | Multiplies this point with another point component-wise.     |
| `multiplyScalar(scalar[, out])` | Multiplies the point by a scalar.                            |
| `dot(other)`                    | Computes the dot product of two vectors.                     |
| `cross(other)`                  | Computes the scalar z-component of the 3D cross product.     |
| `normalize([out])`              | Returns a normalized (unit-length) vector.                   |
| `magnitude()`                   | Returns the Euclidean length.                                |
| `magnitudeSquared()`            | Returns the squared length (more efficient for comparisons). |
| `project(onto[, out])`          | Projects this point onto another vector.                     |
| `reflect(normal[, out])`        | Reflects the point across a given normal.                    |

### Enhanced `Rectangle` Methods

| Method                       | Description                                           |
| ---------------------------- | ----------------------------------------------------- |
| `containsRect(other)`        | Returns true if this rectangle contains the other.    |
| `equals(other)`              | Checks if all properties are equal.                   |
| `intersection(other[, out])` | Returns a new rectangle representing the overlap.     |
| `union(other[, out])`        | Returns a rectangle that encompasses both rectangles. |

---

## API Reference

- [Overview](https://pixijs.download/release/docs/maths.html)
- [Matrix](https://pixijs.download/release/docs/maths.Matrix.html)
- [Point](https://pixijs.download/release/docs/maths.Point.html)
- [ObservablePoint](https://pixijs.download/release/docs/maths.ObservablePoint.html)
- [Rectangle](https://pixijs.download/release/docs/maths.Rectangle.html)
- [Circle](https://pixijs.download/release/docs/maths.Circle.html)
- [Ellipse](https://pixijs.download/release/docs/maths.Ellipse.html)
- [Polygon](https://pixijs.download/release/docs/maths.Polygon.html)
- [RoundedRectangle](https://pixijs.download/release/docs/maths.RoundedRectangle.html)
- [Triangle](https://pixijs.download/release/docs/maths.Triangle.html)

---

## Color

# Color

The `Color` class in PixiJS is a flexible utility for representing colors. It is used throughout the rendering pipeline for things like tints, fills, strokes, gradients, and more.

```ts
import { Color, Sprite, Texture, Graphics } from 'pixi.js';

const red = new Color('red'); // Named color
const green = new Color(0x00ff00); // Hex
const blue = new Color('#0000ff'); // Hex string
const rgba = new Color({ r: 255, g: 0, b: 0, a: 0.5 }); // RGBA object

console.log(red.toArray()); // [1, 0, 0, 1]
console.log(green.toHex()); // "#00ff00"

const sprite = new Sprite(Texture.WHITE);
sprite.tint = red; // Works directly with a Color instance
```

## Using `Color` and `ColorSource`

PixiJS supports many color formats through the `ColorSource` type:

- Color names: `'red'`, `'white'`, `'blue'`, etc.
- Hex integers: `0xffcc00`
- Hex strings: `'ffcc00'`, `'#f00'`, `'0xffcc00ff'`
- RGB(A) objects: `{ r: 255, g: 0, b: 0 }`, `{ r: 255, g: 0, b: 0, a: 0.5 }`
- RGB(A) strings: `'rgb(255,0,0)'`, `'rgba(255,0,0,0.5)'`
- RGB(A) arrays: `[1, 0, 0]`, `[1, 0, 0, 0.5]`
- Typed arrays: `Uint8Array`, `Float32Array`
- HSL/HSV objects and strings
- `Color` instances

Whenever you see a color-related property (e.g., `fill`, `tint`, `stroke`), you can use any of these formats. The library will automatically convert them to the appropriate format internally.

```ts
import { Graphics, Sprite, Texture } from 'pixi.js';

const sprite = new Sprite(Texture.WHITE);
sprite.tint = 'red'; // converted internally

const graphics = new Graphics();
graphics.fill({ color: '#00ff00' }); // Also converted internally
```

---

## API Reference

- [Color](https://pixijs.download/release/docs/color.Color.html)

---

