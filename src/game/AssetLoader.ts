import { Graphics } from 'pixi.js'

export const PlaceholderColors = {
  greenery:   0x3a7d44,
  sidewalk:   0x888877,
  road:       0x222233,
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
