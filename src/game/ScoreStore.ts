import { MAX_SCORES } from './constants'

export interface ScoreEntry {
  score: number
  date: string
}

export class ScoreStore {
  private static readonly STORAGE_KEY = 'arrive-carnage-scores'

  getTopScores(): ScoreEntry[] {
    try {
      const raw = localStorage.getItem(ScoreStore.STORAGE_KEY)
      return raw ? (JSON.parse(raw) as ScoreEntry[]) : []
    } catch {
      return []
    }
  }

  addScore(score: number): void {
    const entries = this.getTopScores()
    entries.push({ score, date: new Date().toISOString() })
    entries.sort((a, b) => b.score - a.score)
    localStorage.setItem(
      ScoreStore.STORAGE_KEY,
      JSON.stringify(entries.slice(0, MAX_SCORES)),
    )
  }
}
