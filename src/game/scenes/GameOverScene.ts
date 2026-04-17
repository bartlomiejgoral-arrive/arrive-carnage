import { Container, Text } from 'pixi.js'
import type { IScene } from '../IScene'
import type { InputManager } from '../InputManager'
import type { ScoreStore } from '../ScoreStore'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants'
import { formatFine } from '../formatFine'

export class GameOverScene implements IScene {
  private readonly container = new Container()

  constructor(
    private readonly input: InputManager,
    private readonly scoreStore: ScoreStore,
    private readonly score: number,
    private readonly onExit: () => void,
  ) {}

  private readonly handleAny = () => {
    this.input.off('any', this.handleAny)
    this.onExit()
  }

  init(stage: Container): void {
    this.scoreStore.addScore(this.score)

    const title = new Text({
      text: 'GAME OVER',
      style: { fontFamily: 'monospace', fontSize: 40, fill: 0xff2244, letterSpacing: 6 },
    })
    title.anchor.set(0.5, 0.5)
    title.x = CANVAS_WIDTH / 2
    title.y = 200

    const scoreLabel = new Text({
      text: `FINE: ${formatFine(this.score)}`,
      style: { fontFamily: 'monospace', fontSize: 28, fill: 0xff4444, letterSpacing: 2 },
    })
    scoreLabel.anchor.set(0.5, 0.5)
    scoreLabel.x = CANVAS_WIDTH / 2
    scoreLabel.y = 300

    const prompt = new Text({
      text: 'press any key to continue',
      style: { fontFamily: 'monospace', fontSize: 14, fill: 0x8888cc, letterSpacing: 2 },
    })
    prompt.anchor.set(0.5, 0.5)
    prompt.x = CANVAS_WIDTH / 2
    prompt.y = CANVAS_HEIGHT - 80

    this.container.addChild(title, scoreLabel, prompt)
    stage.addChild(this.container)

    this.input.on('any', this.handleAny)
  }

  update(_delta: number): void {}

  destroy(): void {
    this.input.off('any', this.handleAny)
    this.container.destroy({ children: true })
  }
}
