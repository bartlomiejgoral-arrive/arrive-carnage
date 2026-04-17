import { Application, Container } from 'pixi.js'
import { SceneManager } from './SceneManager'
import { InputManager } from './InputManager'
import { ScoreStore } from './ScoreStore'
import { AssetLoader } from './AssetLoader'
import { SoundManager } from './SoundManager'
import { TitleScene } from './scenes/TitleScene'
import { LeaderboardScene } from './scenes/LeaderboardScene'
import { GameOverScene } from './scenes/GameOverScene'
import { GameplayScene } from './scenes/GameplayScene'
import { VhsFilter } from './VhsFilter'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants'

export async function createGame(container: HTMLElement): Promise<Application> {
  const app = new Application()

  await app.init({
    resizeTo: window,
    backgroundColor: 0x1a1a2e,
    antialias: false,
    roundPixels: true,
    resolution: 1,
  })

  container.appendChild(app.canvas)

  // Game content renders at fixed virtual resolution, scaled to fit window
  const gameContainer = new Container()
  app.stage.addChild(gameContainer)

  const fitToScreen = () => {
    const scale = app.screen.height / CANVAS_HEIGHT
    gameContainer.scale.set(scale)
    gameContainer.x = (app.screen.width - CANVAS_WIDTH * scale) / 2
    gameContainer.y = 0
  }

  fitToScreen()
  window.addEventListener('resize', fitToScreen)

  // Scenes render into this container
  const sceneContainer = new Container()
  gameContainer.addChild(sceneContainer)

  // VHS post-processing filter over the entire game
  const vhsFilter = new VhsFilter()
  gameContainer.filters = [vhsFilter]

  const input = new InputManager()
  const scoreStore = new ScoreStore()
  const assetLoader = new AssetLoader()
  const sound = new SoundManager()
  await assetLoader.loadAll()
  const scenes = new SceneManager(sceneContainer)

  const goToTitle = () =>
    scenes.transition(new TitleScene(input, sound, goToGame, goToLeaderboard))

  const goToLeaderboard = () =>
    scenes.transition(new LeaderboardScene(input, sound, scoreStore, goToTitle))

  const goToGameOver = (score: number) =>
    scenes.transition(new GameOverScene(input, sound, scoreStore, score, goToTitle))

  const goToGame = () =>
    scenes.transition(new GameplayScene(input, assetLoader, sound, goToGameOver))

  goToTitle()

  app.ticker.add((ticker) => {
    const dt = ticker.deltaTime / 60
    scenes.update(dt)
    vhsFilter.update(dt)
  })

  return app
}
