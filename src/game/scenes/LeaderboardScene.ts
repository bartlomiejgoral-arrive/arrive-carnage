import { Container, Graphics, Text } from 'pixi.js'
import type { IScene } from '../IScene'
import type { InputManager } from '../InputManager'
import type { SoundManager } from '../SoundManager'
import type { ScoreStore } from '../ScoreStore'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants'

export class LeaderboardScene implements IScene {
  private readonly container = new Container()

  constructor(
    private readonly input: InputManager,
    private readonly sound: SoundManager,
    private readonly scoreStore: ScoreStore,
    private readonly onExit: () => void,
  ) {}

  private readonly handleEnter = () => { this.sound.play('menuConfirm'); this.onExit() }

  init(stage: Container): void {
    const bg = new Graphics().rect(-2000, -2000, 6000, 6000).fill(0x1a1a2e)
    this.container.addChild(bg)

    const title = new Text({
      text: 'TOP 5',
      style: { fontFamily: 'monospace', fontSize: 36, fill: 0xff6b35, letterSpacing: 4 },
    })
    title.anchor.set(0.5, 0)
    title.x = CANVAS_WIDTH / 2
    title.y = CANVAS_HEIGHT * 0.1

    this.container.addChild(title)

    const scores = this.scoreStore.getTopScores()
    if (scores.length === 0) {
      const empty = new Text({
        text: 'No scores yet.',
        style: { fontFamily: 'monospace', fontSize: 18, fill: 0x888888 },
      })
      empty.anchor.set(0.5, 0)
      empty.x = CANVAS_WIDTH / 2
      empty.y = CANVAS_HEIGHT * 0.3
      this.container.addChild(empty)
    } else {
      scores.forEach((entry, i) => {
        const row = new Text({
          text: `${i + 1}.   ${String(entry.score).padStart(7, ' ')}`,
          style: { fontFamily: 'monospace', fontSize: 22, fill: 0xffffff },
        })
        row.anchor.set(0.5, 0)
        row.x = CANVAS_WIDTH / 2
        row.y = CANVAS_HEIGHT * 0.25 + i * 52
        this.container.addChild(row)
      })
    }

    const exitLabel = new Text({
      text: '> EXIT',
      style: { fontFamily: 'monospace', fontSize: 20, fill: 0xff6b35, letterSpacing: 2 },
    })
    exitLabel.anchor.set(0.5, 0)
    exitLabel.x = CANVAS_WIDTH / 2
    exitLabel.y = CANVAS_HEIGHT - 90

    const hint = new Text({
      text: 'Press Enter to return',
      style: { fontFamily: 'monospace', fontSize: 12, fill: 0x555577 },
    })
    hint.anchor.set(0.5, 0)
    hint.x = CANVAS_WIDTH / 2
    hint.y = CANVAS_HEIGHT - 55

    this.container.addChild(exitLabel, hint)
    stage.addChild(this.container)

    this.input.on('enter', this.handleEnter)
  }

  update(_delta: number): void {}

  destroy(): void {
    this.input.off('enter', this.handleEnter)
    this.container.destroy({ children: true })
  }
}
