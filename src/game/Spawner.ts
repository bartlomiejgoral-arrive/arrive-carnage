import type { Container } from 'pixi.js'
import type { AssetLoader } from './AssetLoader'
import { GameObject } from './objects/GameObject'
import { Car } from './objects/Car'
import { StreetLamp } from './objects/StreetLamp'
import { Parkmeter } from './objects/Parkmeter'
import {
  COLUMN_COUNT, SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX, MIN_VERTICAL_GAP,
} from './constants'

function randomTimer(): number {
  return SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN)
}

export class Spawner {
  readonly objects: GameObject[] = []
  private spawnTimer = randomTimer()

  constructor(
    private readonly assetLoader: AssetLoader,
    private readonly sceneContainer: Container,
  ) {}

  update(speed: number, delta: number): void {
    this.spawnTimer -= delta
    if (this.spawnTimer <= 0) {
      this.attemptSpawn()
      this.spawnTimer = randomTimer()
    }

    for (const obj of this.objects) {
      obj.update(speed, delta)
    }

    for (let i = this.objects.length - 1; i >= 0; i--) {
      if (this.objects[i].isOffScreen()) {
        this.objects[i].destroy()
        this.objects.splice(i, 1)
      }
    }
  }

  destroy(): void {
    for (const obj of this.objects) {
      obj.destroy()
    }
    this.objects.length = 0
  }

  private attemptSpawn(): void {
    const column = 1 + Math.floor(Math.random() * COLUMN_COUNT)
    const spawnY = -50

    const tooClose = this.objects.some(
      (o) => o.column === column && o.container.y < spawnY + MIN_VERTICAL_GAP,
    )
    if (tooClose) return

    let obj: GameObject
    if (column >= 2 && column <= COLUMN_COUNT - 1) {
      obj = new Car(column, this.assetLoader)
    } else if (Math.random() < 0.5) {
      obj = new StreetLamp(column, this.assetLoader)
    } else {
      obj = new Parkmeter(column, this.assetLoader)
    }

    this.sceneContainer.addChild(obj.container)
    this.objects.push(obj)
  }
}
