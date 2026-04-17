import type { Container } from 'pixi.js'
import type { AssetLoader } from './AssetLoader'
import { GameObject } from './objects/GameObject'
import { Car } from './objects/Car'
import { StreetLamp } from './objects/StreetLamp'
import { Parkmeter } from './objects/Parkmeter'
import {
  COLUMN_COUNT, SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX, MIN_VERTICAL_GAP,
  LANE_CHANGE_MIN_INTERVAL, LANE_CHANGE_MAX_INTERVAL,
} from './constants'

function randomSpawnTimer(): number {
  return SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN)
}

function randomLaneChangeTimer(): number {
  return LANE_CHANGE_MIN_INTERVAL + Math.random() * (LANE_CHANGE_MAX_INTERVAL - LANE_CHANGE_MIN_INTERVAL)
}

export class Spawner {
  readonly objects: GameObject[] = []
  private spawnTimer = randomSpawnTimer()
  private laneChangeTimer = randomLaneChangeTimer()

  constructor(
    private readonly assetLoader: AssetLoader,
    private readonly sceneContainer: Container,
  ) {}

  update(speed: number, delta: number): void {
    this.spawnTimer -= delta
    if (this.spawnTimer <= 0) {
      this.attemptSpawn()
      this.spawnTimer = randomSpawnTimer()
    }

    this.laneChangeTimer -= delta
    if (this.laneChangeTimer <= 0) {
      this.attemptLaneChange()
      this.laneChangeTimer = randomLaneChangeTimer()
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

  private attemptLaneChange(): void {
    const cars = this.objects.filter(
      (o): o is Car => o instanceof Car && !o.isChangingLane,
    )
    if (cars.length === 0) return

    // Pick a random car
    const car = cars[Math.floor(Math.random() * cars.length)]

    // Pick a random adjacent lane direction
    const dir = Math.random() < 0.5 ? -1 : 1
    const newCol = car.column + dir
    if (newCol < 2 || newCol > COLUMN_COUNT - 1) return

    // Check clearance in the target lane — no car within vertical gap
    const blocked = this.objects.some(
      (o) => o !== car
        && o instanceof Car
        && o.column === newCol
        && Math.abs(o.container.y - car.container.y) < MIN_VERTICAL_GAP,
    )
    if (blocked) return

    car.startLaneChange(newCol)
  }
}
