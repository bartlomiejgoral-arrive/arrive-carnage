import { zzfx, ZZFX } from 'zzfx'
import { ZZFXM } from '@zzfx-studio/zzfxm'

// Sound parameters crafted with the ZzFX designer
// https://killedbyapixel.github.io/ZzFX/
//
// zzfx params: volume, randomness, frequency, attack, sustain, release,
//   shape, shapeCurve, slide, deltaSlide, pitchJump, pitchJumpTime,
//   repeatTime, noise, modulation, bitCrush, delay, sustainVolume,
//   decay, tremolo

const SOUNDS = {
  // Short blip for menu navigation
  menuBlip:    [.3,,800,,.02,.01,1,,,,,,,,,,,,,.1] as const,
  // Confirm / start game beep
  menuConfirm: [.4,,500,.01,.04,.08,1,1.5,,,200,.04,,,,,,,.5] as const,
  // Coin-style pickup for parkmeter
  pickup:      [.5,,1200,.01,.03,.08,1,2,,,400,.06,,,,,,,.5] as const,
  // Crash / collision — noise burst
  crash:       [.6,,200,.01,.04,.2,4,2,-2,,,,.1,2,,,.04,.8,.02] as const,
  // Game over — descending tone
  gameOver:    [.4,,400,.02,.15,.3,1,1,-10,,,,,,,,,.5,.05] as const,
} as const

type SoundName = keyof typeof SOUNDS

// ── Background music (ZzFXM song data) ──────────────────────────────
// 4-channel chiptune driving track
// Notes: MIDI-style where 12 = instrument root pitch

const SONG_INSTRUMENTS = [
  // 0: Bass — square, punchy
  [.6, 0, 140, 0, .08, .15, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, .6, .02, 0],
  // 1: Lead — triangle, bright
  [.35, 0, 440, .01, .04, .12, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, .4, .01, 0],
  // 2: Kick — noise burst, pitch slide down
  [.8, 0, 200, 0, .02, .08, 4, 1, -20, 0, 0, 0, 0, 1, 0, 0, 0, .4, .04, 0],
  // 3: Hi-hat — short noise
  [.2, 0, 2000, 0, .008, .015, 4, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
]

// A-minor pentatonic: A=12, C=15, D=17, E=19, G=22, A'=24
const SONG_PATTERNS = [
  // Pattern 0 — verse
  [
    [0, 0,  12,12, 0,12, 15, 0,17, 0, 12,12, 0,12, 19, 0,17, 0],  // bass
    [1, 0,   0, 0, 0,24,  0, 0,27, 0,  0, 0, 0,24,  0, 0,22, 0],  // lead
    [2, 0,  12, 0, 0, 0, 12, 0, 0, 0, 12, 0, 0, 0, 12, 0, 0, 0],  // kick
    [3, 0,   0,12, 0,12,  0,12, 0,12,  0,12, 0,12,  0,12, 0,12],  // hat
  ],
  // Pattern 1 — chorus (busier)
  [
    [0, 0,  12, 0,12, 0, 17, 0,17, 0, 19, 0,19, 0, 17,17,15,15],  // bass
    [1, 0,  24, 0,27, 0, 29, 0,27, 0, 24, 0,22, 0, 24, 0, 0, 0],  // lead
    [2, 0,  12, 0,12, 0, 12, 0,12, 0, 12, 0,12, 0, 12,12,12, 0],  // kick
    [3, 0,  12,12,12,12, 12,12,12,12, 12,12,12,12, 12,12,12,12],  // hat
  ],
]

const SONG_SEQUENCE = [0, 0, 1, 0, 0, 1, 1, 0]
const SONG_BPM = 140

// ── Engine drone (looping sample) ───────────────────────────────────
// Low sawtooth with modulation — sounds like an engine idle
const ENGINE_PARAMS = [.4, 0, 55, .1, 1, 0, 2, 1, 0, 0, 0, 0, .02, 0, 3, 0, 0, .9, 0, .1]

export class SoundManager {
  private muted = false
  private musicSource: AudioBufferSourceNode | null = null
  private musicGain: GainNode | null = null
  private engineSource: AudioBufferSourceNode | null = null
  private engineGain: GainNode | null = null
  private engineSamples: number[] | null = null

  play(name: SoundName): void {
    if (this.muted) return
    zzfx(...(SOUNDS[name] as unknown as number[]))
  }

  startMusic(): void {
    this.stopMusic()
    if (this.muted) return

    const [left, right] = ZZFXM.build(
      SONG_INSTRUMENTS, SONG_PATTERNS, SONG_SEQUENCE, SONG_BPM,
    )
    const ctx = ZZFX.audioContext
    const buffer = ctx.createBuffer(2, left.length, ZZFX.sampleRate)
    buffer.getChannelData(0).set(new Float32Array(left))
    buffer.getChannelData(1).set(new Float32Array(right))

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const gain = ctx.createGain()
    gain.gain.value = 0.25
    source.connect(gain).connect(ctx.destination)
    source.start()

    this.musicSource = source
    this.musicGain = gain
  }

  stopMusic(): void {
    if (this.musicSource) {
      this.musicSource.stop()
      this.musicSource.disconnect()
      this.musicSource = null
    }
    if (this.musicGain) {
      this.musicGain.disconnect()
      this.musicGain = null
    }
  }

  startEngine(): void {
    this.stopEngine()
    if (this.muted) return

    if (!this.engineSamples) {
      this.engineSamples = ZZFX.buildSamples(...ENGINE_PARAMS)
    }

    const ctx = ZZFX.audioContext
    const buffer = ctx.createBuffer(1, this.engineSamples.length, ZZFX.sampleRate)
    buffer.getChannelData(0).set(new Float32Array(this.engineSamples))

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const gain = ctx.createGain()
    gain.gain.value = 0.15
    source.connect(gain).connect(ctx.destination)
    source.start()

    this.engineSource = source
    this.engineGain = gain
  }

  /** Adjust engine pitch based on game speed (1.0 = normal) */
  setEnginePitch(rate: number): void {
    if (this.engineSource) {
      this.engineSource.playbackRate.value = Math.max(0.5, Math.min(2.5, rate))
    }
  }

  stopEngine(): void {
    if (this.engineSource) {
      this.engineSource.stop()
      this.engineSource.disconnect()
      this.engineSource = null
    }
    if (this.engineGain) {
      this.engineGain.disconnect()
      this.engineGain = null
    }
  }

  mute(): void { this.muted = true; this.stopMusic(); this.stopEngine() }
  unmute(): void { this.muted = false }
  toggleMute(): boolean {
    if (this.muted) { this.muted = false } else { this.mute() }
    return this.muted
  }
}
