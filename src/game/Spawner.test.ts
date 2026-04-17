import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Spawner } from './Spawner'
import { Car } from './objects/Car'
import { StreetLamp } from './objects/StreetLamp'
import { Parkmeter } from './objects/Parkmeter'
import { SPAWN_INTERVAL, COLUMN_COUNT } from './constants'
import type { Container } from 'pixi.js'

function makeMockObject() {
  return { init: vi.fn(), update: vi.fn(), destroy: vi.fn(), isOffScreen: vi.fn(() => false), type: 'deadly' }
}

vi.mock('./objects/Car', () => ({ Car: vi.fn(() => makeMockObject()) }))
vi.mock('./objects/StreetLamp', () => ({ StreetLamp: vi.fn(() => makeMockObject()) }))
vi.mock('./objects/Parkmeter', () => ({ Parkmeter: vi.fn(() => makeMockObject()) }))

const mockStage = { addChild: vi.fn() } as unknown as Container

beforeEach(() => {
  vi.mocked(Car).mockClear()
  vi.mocked(StreetLamp).mockClear()
  vi.mocked(Parkmeter).mockClear()
  vi.spyOn(Math, 'random').mockRestore()
})

describe('Spawner', () => {
  it('starts with no active objects', () => {
    const spawner = new Spawner()
    spawner.init(mockStage)
    expect(spawner.getObjects()).toHaveLength(0)
  })

  it('spawns one object after SPAWN_INTERVAL delta has accumulated', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3) // road column
    const spawner = new Spawner()
    spawner.init(mockStage)
    spawner.update(SPAWN_INTERVAL)
    expect(spawner.getObjects()).toHaveLength(1)
  })

  it('spawns a Car when a road column is selected', () => {
    // random=0.3 → column = floor(0.3 * 6) = 1 (road)
    vi.spyOn(Math, 'random').mockReturnValue(0.3)
    const spawner = new Spawner()
    spawner.init(mockStage)
    spawner.update(SPAWN_INTERVAL)
    expect(Car).toHaveBeenCalledOnce()
  })

  it('spawns a StreetLamp on a sidewalk column when random < 0.5', () => {
    // first call: column = floor(0 * 6) = 0 (sidewalk); second call: < 0.5 → StreetLamp
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.4)
    const spawner = new Spawner()
    spawner.init(mockStage)
    spawner.update(SPAWN_INTERVAL)
    expect(StreetLamp).toHaveBeenCalledOnce()
  })

  it('spawns a Parkmeter on a sidewalk column when random >= 0.5', () => {
    // first call: column 0 (sidewalk); second call: >= 0.5 → Parkmeter
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.7)
    const spawner = new Spawner()
    spawner.init(mockStage)
    spawner.update(SPAWN_INTERVAL)
    expect(Parkmeter).toHaveBeenCalledOnce()
  })

  it('calls update on each active object with speed * delta', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3)
    const spawner = new Spawner()
    spawner.init(mockStage)
    spawner.update(SPAWN_INTERVAL) // spawns one object
    const obj = spawner.getObjects()[0] as any
    obj.update.mockClear()
    spawner.update(10)
    expect(obj.update).toHaveBeenCalledOnce()
  })

  it('removes objects that report isOffScreen', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3)
    const spawner = new Spawner()
    spawner.init(mockStage)
    spawner.update(SPAWN_INTERVAL)
    expect(spawner.getObjects()).toHaveLength(1)

    const obj = spawner.getObjects()[0] as any
    obj.isOffScreen.mockReturnValue(true)
    spawner.update(1)

    expect(spawner.getObjects()).toHaveLength(0)
    expect(obj.destroy).toHaveBeenCalled()
  })

  it('destroy clears all active objects', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3)
    const spawner = new Spawner()
    spawner.init(mockStage)
    spawner.update(SPAWN_INTERVAL)
    const obj = spawner.getObjects()[0] as any
    spawner.destroy()
    expect(spawner.getObjects()).toHaveLength(0)
    expect(obj.destroy).toHaveBeenCalled()
  })

  it('removeObject destroys and removes the object from the list', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3)
    const spawner = new Spawner()
    spawner.init(mockStage)
    spawner.update(SPAWN_INTERVAL)
    const obj = spawner.getObjects()[0]
    spawner.removeObject(obj)
    expect(spawner.getObjects()).toHaveLength(0)
    expect((obj as any).destroy).toHaveBeenCalled()
  })

  it('respects setSpeed when computing object movement', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3)
    const spawner = new Spawner()
    spawner.init(mockStage)
    spawner.update(SPAWN_INTERVAL)
    const obj = spawner.getObjects()[0] as any
    obj.update.mockClear()

    spawner.setSpeed(10)
    spawner.update(2)
    expect(obj.update).toHaveBeenCalledWith(20) // 10 * 2
  })

  it('spawns a sidewalk object on the last column', () => {
    // random=0.99 → column = floor(0.99 * 6) = 5 (sidewalk)
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.99).mockReturnValue(0)
    const spawner = new Spawner()
    spawner.init(mockStage)
    spawner.update(SPAWN_INTERVAL)
    const sidewalkSpawned = vi.mocked(StreetLamp).mock.calls.length + vi.mocked(Parkmeter).mock.calls.length
    expect(sidewalkSpawned).toBe(1)
  })
})
