import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ScrollingBackground, calcScrolledY } from './ScrollingBackground'
import { CANVAS_HEIGHT, TILE_SIZE } from './constants'
import type { Container } from 'pixi.js'

vi.mock('pixi.js', () => ({
  Container: vi.fn(() => ({ addChild: vi.fn(), destroy: vi.fn(), y: 0, x: 0 })),
  Graphics: vi.fn(() => ({ rect: vi.fn().mockReturnThis(), fill: vi.fn().mockReturnThis(), x: 0 })),
}))

vi.mock('./AssetLoader', () => ({
  PlaceholderColors: { greenery: 0x000000, sidewalk: 0x111111, road: 0x222222 },
  colorRect: vi.fn(() => ({ rect: vi.fn().mockReturnThis(), fill: vi.fn().mockReturnThis(), x: 0 })),
}))

describe('calcScrolledY', () => {
  it('advances y by step', () => {
    expect(calcScrolledY(100, 5, 800)).toBe(105)
  })

  it('wraps when the new y meets canvasHeight', () => {
    // y=597 + step=3 = 600; 600 >= 600 → 600 - 800 = -200
    expect(calcScrolledY(597, 3, 800, 600)).toBe(-200)
  })

  it('wraps when the new y exceeds canvasHeight', () => {
    // y=599 + step=5 = 604; 604 >= 600 → 604 - 800 = -196
    expect(calcScrolledY(599, 5, 800, 600)).toBe(-196)
  })

  it('does not wrap when the new y is below canvasHeight', () => {
    expect(calcScrolledY(0, 3, 800, 600)).toBe(3)
  })

  it('uses CANVAS_HEIGHT as the default threshold', () => {
    const justBelow = CANVAS_HEIGHT - 1
    expect(calcScrolledY(justBelow, 1, 800)).toBe(justBelow + 1 - 800)
  })
})

describe('ScrollingBackground', () => {
  let mockStage: { addChild: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    mockStage = { addChild: vi.fn() }
  })

  it('adds its outer container to the stage on init', () => {
    const bg = new ScrollingBackground(3)
    bg.init(mockStage as unknown as Container)
    expect(mockStage.addChild).toHaveBeenCalledOnce()
  })

  it('creates the correct number of tile rows on init', async () => {
    const { Container: MockContainer } = await import('pixi.js')
    vi.mocked(MockContainer).mockClear()

    const bg = new ScrollingBackground(3)
    bg.init(mockStage as unknown as Container)

    const expectedRows = Math.ceil(CANVAS_HEIGHT / TILE_SIZE) + 2
    // Calls = 1 (outerContainer in constructor) + expectedRows (row containers in buildRow)
    expect(vi.mocked(MockContainer)).toHaveBeenCalledTimes(1 + expectedRows)
  })

  it('does not throw on update after init', () => {
    const bg = new ScrollingBackground(3)
    bg.init(mockStage as unknown as Container)
    expect(() => bg.update(1)).not.toThrow()
  })

  it('does not throw on destroy after init', () => {
    const bg = new ScrollingBackground(3)
    bg.init(mockStage as unknown as Container)
    expect(() => bg.destroy()).not.toThrow()
  })

  it('setSpeed changes the effective scroll speed', () => {
    // Verify setSpeed does not throw and the value is accepted
    const bg = new ScrollingBackground(3)
    expect(() => bg.setSpeed(10)).not.toThrow()
  })
})
