import { Application, Container, Graphics } from 'pixi.js'
import { SceneManager } from './SceneManager'
import { InputManager } from './InputManager'
import { ScoreStore } from './ScoreStore'
import { TitleScene } from './scenes/TitleScene'
import { LeaderboardScene } from './scenes/LeaderboardScene'
import { GameOverScene } from './scenes/GameOverScene'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants'

export async function createGame(container: HTMLElement): Promise<Application> {
  const app = new Application()

  await app.init({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: 0x1a1a2e,
    antialias: false,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  })

  container.appendChild(app.canvas)

  // Scenes render into this container; scanlines sit above everything
  const sceneContainer = new Container()
  app.stage.addChild(sceneContainer)

  const scanlines = new Graphics()
  for (let y = 0; y < CANVAS_HEIGHT; y += 2) {
    scanlines.rect(0, y, CANVAS_WIDTH, 1).fill({ color: 0x000000, alpha: 0.15 })
  }
  app.stage.addChild(scanlines)

  const input = new InputManager()
  const scoreStore = new ScoreStore()
  const scenes = new SceneManager(sceneContainer)

  const goToTitle = () =>
    scenes.transition(new TitleScene(input, goToGame, goToLeaderboard))

  const goToLeaderboard = () =>
    scenes.transition(new LeaderboardScene(input, scoreStore, goToTitle))

  // GameplayScene (Phase 3+) will replace this stub
  const goToGame = () =>
    scenes.transition(new GameOverScene(input, scoreStore, 0, goToTitle))

  goToTitle()

  app.ticker.add((ticker) => scenes.update(ticker.deltaTime))

  return app
}
