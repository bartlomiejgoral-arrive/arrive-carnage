import { Assets, Graphics, Sprite, TextureSource, type Container } from 'pixi.js'

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
    return sprite
  }

  createEnemyCar(): Container {
    if (!this.loaded) return this.placeholderCar(PlaceholderColors.enemyCar)
    const sprite = new Sprite(Assets.get(`car_${randInt(1, 23)}`))
    sprite.anchor.set(0.5)
    sprite.scale.set(0.32)
    return sprite
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
    return sprite
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
    return sprite
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
    return sprite
  }

  private placeholderCar(color: number): Container {
    const g = colorRect(60, 80, color)
    g.pivot.set(30, 40)
    return g
  }
}
