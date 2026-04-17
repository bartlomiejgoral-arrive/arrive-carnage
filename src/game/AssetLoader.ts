import { Assets, Container, Graphics, Sprite, TextureSource } from 'pixi.js'

export const PlaceholderColors = {
  greenery:   0x3a7d44,
  sidewalk:   0x888877,
  road:       0x555560,
  playerCar:  0x4488ff,
  enemyCar:   0xff3333,
  parkmeter:  0xffdd00,
  streetLamp: 0x999999,
} as const

export function colorRect(width: number, height: number, color: number): Graphics {
  const g = new Graphics()
  g.rect(0, 0, width, height).fill(color)
  return g
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

export class AssetLoader {
  private loaded = false

  async loadAll(): Promise<void> {
    TextureSource.defaultOptions.scaleMode = 'nearest'

    const manifest: { alias: string; src: string }[] = []
    for (let i = 1; i <= 23; i++) {
      manifest.push({ alias: `car_${i}`, src: `/assets/cars/car_${i}.png` })
    }
    manifest.push(
      { alias: 'parkmeter', src: '/assets/meters/parking-meeter.png' },
      { alias: 'lamp_left_1', src: '/assets/lights/street-light-1-left.png' },
      { alias: 'lamp_right_1', src: '/assets/lights/street-light-1-right.png' },
      { alias: 'lamp_left_2', src: '/assets/lights/street-light-2-left.png' },
      { alias: 'lamp_right_2', src: '/assets/lights/street-light-2-right.png' },
      { alias: 'tree_1', src: '/assets/trees/tree_1.png' },
      { alias: 'tree_2', src: '/assets/trees/tree_2.png' },
    )
    await Assets.load(manifest)
    this.loaded = true
  }

  createPlayerCar(): Container {
    if (!this.loaded) return this.placeholderCar(PlaceholderColors.playerCar)
    const sprite = new Sprite(Assets.get(`car_${randInt(1, 23)}`))
    sprite.anchor.set(0.5)
    sprite.scale.set(0.32)
    return this.withShadow(sprite, 5, 5, 0.45)
  }

  createEnemyCar(): Container {
    if (!this.loaded) return this.placeholderCar(PlaceholderColors.enemyCar)
    const sprite = new Sprite(Assets.get(`car_${randInt(1, 23)}`))
    sprite.anchor.set(0.5)
    sprite.scale.set(0.32)
    return this.withShadow(sprite, 5, 5, 0.45)
  }

  createParkmeter(): Container {
    if (!this.loaded) {
      const g = colorRect(30, 50, PlaceholderColors.parkmeter)
      g.pivot.set(15, 25)
      return g
    }
    const sprite = new Sprite(Assets.get('parkmeter'))
    sprite.anchor.set(0.5)
    sprite.scale.set(0.32)
    return this.withShadow(sprite, 4, 4, 0.4)
  }

  createStreetLamp(side: 'left' | 'right'): Container {
    if (!this.loaded) {
      const g = colorRect(30, 70, PlaceholderColors.streetLamp)
      g.pivot.set(15, 35)
      return g
    }
    const variant = Math.random() < 0.5 ? 1 : 2
    const sprite = new Sprite(Assets.get(`lamp_${side}_${variant}`))
    sprite.anchor.set(0.5)
    sprite.scale.set(0.35)
    return this.withShadow(sprite, 4, 4, 0.4)
  }

  createTree(): Container {
    if (!this.loaded) {
      const g = colorRect(40, 40, 0x2d6b30)
      g.pivot.set(20, 20)
      return g
    }
    const variant = Math.random() < 0.5 ? 1 : 2
    const sprite = new Sprite(Assets.get(`tree_${variant}`))
    sprite.anchor.set(0.5)
    const s = 0.2 + Math.random() * 0.15  // random size variation
    sprite.scale.set(s)
    return this.withShadow(sprite, 4, 4, 0.35)
  }

  createGrassTuft(): Container {
    const g = new Graphics()
    // Small pixel-art grass blades — 2-4 blades per tuft
    const blades = 2 + Math.floor(Math.random() * 3)
    const shade = 0x2a6e2f + Math.floor(Math.random() * 0x1a) * 0x000100 // slight green variation
    for (let i = 0; i < blades; i++) {
      const x = (i - (blades - 1) / 2) * 3
      const h = 4 + Math.floor(Math.random() * 5)
      g.rect(x, -h, 2, h).fill(shade)
    }
    g.pivot?.set(0, 0)
    return g
  }

  /** Wrap a sprite in a container with a drop-shadow clone underneath */
  private withShadow(sprite: Sprite, offsetX = 3, offsetY = 3, alpha = 0.3): Container {
    const shadow = new Sprite(sprite.texture)
    shadow.anchor.copyFrom(sprite.anchor)
    shadow.scale.copyFrom(sprite.scale)
    shadow.tint = 0x000000
    shadow.alpha = alpha
    shadow.position.set(offsetX, offsetY)

    const wrapper = new Container()
    wrapper.addChild(shadow, sprite)
    return wrapper
  }

  private placeholderCar(color: number): Container {
    const g = colorRect(60, 80, color)
    g.pivot.set(30, 40)
    return g
  }
}
