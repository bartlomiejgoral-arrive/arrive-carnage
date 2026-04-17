import type { Container } from 'pixi.js'
import { COLUMN_COUNT, INITIAL_SCROLL_SPEED, SPAWN_INTERVAL } from './constants'
import type { GameObject } from './objects/GameObject'
import { Car } from './objects/Car'
import { StreetLamp } from './objects/StreetLamp'
import { Parkmeter } from './objects/Parkmeter'

export class Spawner {
  private readonly objects: GameObject[] = []
  private timer = 0
  private speed = INITIAL_SCROLL_SPEED
  private stage!: Container

  init(stage: Container): void {
    this.stage = stage
  }

  setSpeed(speed: number): void {
    this.speed = speed
  }

  update(delta: number): void {
    this.timer += delta
    if (this.timer >= SPAWN_INTERVAL) {
      this.timer -= SPAWN_INTERVAL
      this.spawnRandom()
    }

    const step = this.speed * delta
    for (const obj of this.objects) {
      obj.update(step)
    }

    for (let i = this.objects.length - 1; i >= 0; i--) {
      if (this.objects[i].isOffScreen()) {
        this.objects[i].destroy()
        this.objects.splice(i, 1)
      }
    }
  }

  getObjects(): readonly GameObject[] {
    return this.objects
  }

  destroy(): void {
    for (const obj of this.objects) {
      obj.destroy()
    }
    this.objects.length = 0
  }

  private spawnRandom(): void {
    const column = Math.floor(Math.random() * COLUMN_COUNT)
    const isSidewalk = column === 0 || column === COLUMN_COUNT - 1
    const obj = isSidewalk
      ? (Math.random() < 0.5 ? new StreetLamp(column) : new Parkmeter(column))
      : new Car(column)
    obj.init(this.stage)
    this.objects.push(obj)
  }
}
