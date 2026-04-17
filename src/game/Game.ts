import { Application, Text, Graphics } from 'pixi.js'

const GAME_WIDTH = 800
const GAME_HEIGHT = 600

export async function createGame(container: HTMLElement): Promise<Application> {
  const app = new Application()

  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: 0x1a1a2e,
    antialias: false,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  })

  container.appendChild(app.canvas)

  // Scanline overlay for retro CRT feel
  const scanlines = new Graphics()
  for (let y = 0; y < GAME_HEIGHT; y += 2) {
    scanlines.rect(0, y, GAME_WIDTH, 1).fill({ color: 0x000000, alpha: 0.15 })
  }
  scanlines.zIndex = 9999

  // Placeholder title — replace with sprite once assets arrive
  const title = new Text({
    text: 'ARRIVE CARNAGE',
    style: {
      fontFamily: 'monospace',
      fontSize: 32,
      fill: 0xff6b35,
      letterSpacing: 4,
    },
  })
  title.anchor.set(0.5)
  title.x = GAME_WIDTH / 2
  title.y = GAME_HEIGHT / 2 - 20

  const subtitle = new Text({
    text: 'press any key to start',
    style: {
      fontFamily: 'monospace',
      fontSize: 14,
      fill: 0x8888cc,
      letterSpacing: 2,
    },
  })
  subtitle.anchor.set(0.5)
  subtitle.x = GAME_WIDTH / 2
  subtitle.y = GAME_HEIGHT / 2 + 30

  app.stage.addChild(title, subtitle, scanlines)

  // Blink the subtitle
  let elapsed = 0
  app.ticker.add((ticker) => {
    elapsed += ticker.deltaTime
    subtitle.visible = Math.floor(elapsed / 30) % 2 === 0
  })

  return app
}
