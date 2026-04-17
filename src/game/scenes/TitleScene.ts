import { Container, Graphics, Text } from 'pixi.js'
import type { IScene } from '../IScene'
import type { InputManager } from '../InputManager'
import type { SoundManager } from '../SoundManager'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants'

const MENU_Y = CANVAS_HEIGHT * 0.45
const MENU_SPACING = 160

export class TitleScene implements IScene {
  private readonly container = new Container()
  private menuTexts: Text[] = []
  private cursor!: Text
  private selectedIndex = 0
  private blinkTimer = 0

  constructor(
    private readonly input: InputManager,
    private readonly sound: SoundManager,
    private readonly onStart: () => void,
    private readonly onLeaderboard: () => void,
  ) {}

  private readonly handleLeft = () => {
    this.selectedIndex = 0
    this.updateCursor()
    this.sound.play('menuBlip')
  }

  private readonly handleRight = () => {
    this.selectedIndex = 1
    this.updateCursor()
    this.sound.play('menuBlip')
  }

  private readonly handleEnter = () => {
    this.sound.play('menuConfirm')
    if (this.selectedIndex === 0) this.onStart()
    else this.onLeaderboard()
  }

  init(stage: Container): void {
    // Full-bleed background covering any window size
    const bg = new Graphics().rect(-2000, -2000, 6000, 6000).fill(0x1a1a2e)
    this.container.addChild(bg)

    const title = new Text({
      text: 'ARRIVE CARNAGE',
      style: { fontFamily: 'monospace', fontSize: 40, fill: 0xff6b35, letterSpacing: 6 },
    })
    title.anchor.set(0.5, 0.5)
    title.x = CANVAS_WIDTH / 2
    title.y = CANVAS_HEIGHT * 0.22

    const labels = ['START', 'TOP 5']
    labels.forEach((label, i) => {
      const text = new Text({
        text: label,
        style: { fontFamily: 'monospace', fontSize: 24, fill: 0xffffff, letterSpacing: 2 },
      })
      text.anchor.set(0.5, 0.5)
      text.x = CANVAS_WIDTH / 2 - MENU_SPACING / 2 + i * MENU_SPACING
      text.y = MENU_Y
      this.menuTexts.push(text)
      this.container.addChild(text)
    })

    this.cursor = new Text({
      text: '>',
      style: { fontFamily: 'monospace', fontSize: 24, fill: 0xff6b35 },
    })
    this.cursor.anchor.set(0.5, 0.5)
    this.cursor.y = MENU_Y

    const hint = new Text({
      text: '\u2190 \u2192  select     Enter  confirm',
      style: { fontFamily: 'monospace', fontSize: 12, fill: 0x555577, letterSpacing: 1 },
    })
    hint.anchor.set(0.5, 0.5)
    hint.x = CANVAS_WIDTH / 2
    hint.y = CANVAS_HEIGHT - 50

    this.container.addChild(title, this.cursor, hint)
    this.updateCursor()
    stage.addChild(this.container)

    this.input.on('left', this.handleLeft)
    this.input.on('right', this.handleRight)
    this.input.on('enter', this.handleEnter)
  }

  update(delta: number): void {
    this.blinkTimer += delta
    this.cursor.visible = Math.floor(this.blinkTimer / 30) % 2 === 0
  }

  destroy(): void {
    this.input.off('left', this.handleLeft)
    this.input.off('right', this.handleRight)
    this.input.off('enter', this.handleEnter)
    this.container.destroy({ children: true })
    this.menuTexts = []
  }

  private updateCursor(): void {
    const selected = this.menuTexts[this.selectedIndex]
    if (selected) {
      this.cursor.x = selected.x - selected.width / 2 - 20
    }
  }
}
