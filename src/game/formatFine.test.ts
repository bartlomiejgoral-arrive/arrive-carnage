import { describe, it, expect } from 'vitest'
import { formatFine } from './formatFine'

describe('formatFine', () => {
  it('formats zero', () => {
    expect(formatFine(0)).toBe('-$0')
  })

  it('formats hundreds', () => {
    expect(formatFine(120)).toBe('-$120')
  })

  it('formats thousands with space separator', () => {
    expect(formatFine(1340)).toBe('-$1 340')
  })

  it('formats ten thousands', () => {
    expect(formatFine(12340)).toBe('-$12 340')
  })

  it('floors fractional amounts', () => {
    expect(formatFine(99.9)).toBe('-$99')
  })
})
