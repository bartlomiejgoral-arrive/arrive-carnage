import { describe, it, expect, beforeEach } from 'vitest'
import { ScoreStore } from './ScoreStore'
import { MAX_SCORES } from './constants'

describe('ScoreStore', () => {
  let store: ScoreStore

  beforeEach(() => {
    localStorage.clear()
    store = new ScoreStore()
  })

  it('returns an empty array when no scores have been saved', () => {
    expect(store.getTopScores()).toEqual([])
  })

  it('saves a score and retrieves it', () => {
    store.addScore(100)
    const scores = store.getTopScores()
    expect(scores).toHaveLength(1)
    expect(scores[0].score).toBe(100)
  })

  it('records the date of each score entry', () => {
    store.addScore(42)
    const [entry] = store.getTopScores()
    expect(entry.date).toBeTruthy()
    expect(new Date(entry.date).toString()).not.toBe('Invalid Date')
  })

  it('returns scores sorted highest first', () => {
    store.addScore(50)
    store.addScore(200)
    store.addScore(100)
    expect(store.getTopScores().map(e => e.score)).toEqual([200, 100, 50])
  })

  it(`keeps only the top ${MAX_SCORES} scores`, () => {
    [300, 100, 500, 200, 400, 150].forEach(s => store.addScore(s))
    const scores = store.getTopScores()
    expect(scores).toHaveLength(MAX_SCORES)
    expect(scores[0].score).toBe(500)
    expect(scores[MAX_SCORES - 1].score).toBe(150)
  })

  it('returns an empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem('arrive-carnage-scores', 'not-json')
    expect(store.getTopScores()).toEqual([])
  })
})
