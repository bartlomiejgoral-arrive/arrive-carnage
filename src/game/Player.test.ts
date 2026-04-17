import { describe, it, expect, vi } from 'vitest'
import { Player } from './Player'
import type { InputManager } from './InputManager'
import type { Container } from 'pixi.js'
import { CANVAS_HEIGHT, ROAD_X, TILE_SIZE, COLUMN_COUNT, PLAYER_START_COLUMN } from './constants'

vi.mock('pixi.js', () => ({
  Container: vi.fn(() => ({ addChild: vi.fn(), destroy: vi.fn(), x: 0, y: 0 })),
}))

vi.mock('./AssetLoader', () => ({
  createPlayerCar: vi.fn(() => ({ x: 0, y: 0 })),
}))

function makeInput() {
  const handlers: Record<string, () => void> = {}
  const input = {
    on: vi.fn((action: string, handler: () => void) => { handlers[action] = handler }),
    off: vi.fn(),
  } as unknown as InputManager
  return { input, handlers }
}

const mockStage = { addChild: vi.fn() } as unknown as Container

describe('Player', () => {
  it('starts at PLAYER_START_COLUMN', () => {
    const { input } = makeInput()
    expect(new Player(input).currentColumn).toBe(PLAYER_START_COLUMN)
  })

  it('moves left by one column', () => {
    const { input, handlers } = makeInput()
    const player = new Player(input)
    player.init(mockStage)
    handlers['left']()
    expect(player.currentColumn).toBe(PLAYER_START_COLUMN - 1)
  })

  it('moves right by one column', () => {
    const { input, handlers } = makeInput()
    const player = new Player(input)
    player.init(mockStage)
    handlers['right']()
    expect(player.currentColumn).toBe(PLAYER_START_COLUMN + 1)
  })

  it('clamps at left edge (column 0)', () => {
    const { input, handlers } = makeInput()
    const player = new Player(input)
    player.init(mockStage)
    for (let i = 0; i < COLUMN_COUNT; i++) handlers['left']()
    expect(player.currentColumn).toBe(0)
  })

  it('clamps at right edge (column COLUMN_COUNT - 1)', () => {
    const { input, handlers } = makeInput()
    const player = new Player(input)
    player.init(mockStage)
    for (let i = 0; i < COLUMN_COUNT; i++) handlers['right']()
    expect(player.currentColumn).toBe(COLUMN_COUNT - 1)
  })

  it('sets container x to the correct column position on init', async () => {
    const { Container } = await import('pixi.js')
    vi.mocked(Container).mockClear()
    const { input } = makeInput()
    const player = new Player(input)
    player.init(mockStage)
    const instance = vi.mocked(Container).mock.results[0].value
    expect(instance.x).toBe(ROAD_X + PLAYER_START_COLUMN * TILE_SIZE)
  })

  it('updates container x when moving right', async () => {
    const { Container } = await import('pixi.js')
    vi.mocked(Container).mockClear()
    const { input, handlers } = makeInput()
    const player = new Player(input)
    player.init(mockStage)
    handlers['right']()
    const instance = vi.mocked(Container).mock.results[0].value
    expect(instance.x).toBe(ROAD_X + (PLAYER_START_COLUMN + 1) * TILE_SIZE)
  })

  it('top is a positive number less than bottom', () => {
    const { input } = makeInput()
    const player = new Player(input)
    expect(player.top).toBeGreaterThan(0)
    expect(player.top).toBeLessThan(player.bottom)
  })

  it('bottom is within the canvas height', () => {
    const { input } = makeInput()
    const player = new Player(input)
    expect(player.bottom).toBeLessThanOrEqual(CANVAS_HEIGHT)
  })

  it('deregisters input handlers on destroy', () => {
    const { input } = makeInput()
    const player = new Player(input)
    player.init(mockStage)
    player.destroy()
    expect(input.off).toHaveBeenCalledWith('left', expect.any(Function))
    expect(input.off).toHaveBeenCalledWith('right', expect.any(Function))
  })
})
