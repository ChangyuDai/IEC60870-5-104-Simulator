import { describe, it, expect } from 'vitest'
import { compressRanges, lowerBound } from '../../src/components/batchAdd/ioaRanges'

describe('compressRanges', () => {
  it('returns empty string for []', () => {
    expect(compressRanges([])).toBe('')
  })

  it('handles single value', () => {
    expect(compressRanges([5])).toBe('5')
  })

  it('compresses one contiguous run', () => {
    expect(compressRanges([0, 1, 2, 3])).toBe('0–3')
  })

  it('compresses multiple runs with gaps', () => {
    expect(compressRanges([0, 1, 2, 5, 7, 8])).toBe('0–2, 5, 7–8')
  })

  it('keeps singletons as singletons', () => {
    expect(compressRanges([1, 3, 5])).toBe('1, 3, 5')
  })
})

describe('lowerBound', () => {
  it('returns 0 when target ≤ first element', () => {
    expect(lowerBound([10, 20, 30], 5)).toBe(0)
    expect(lowerBound([10, 20, 30], 10)).toBe(0)
  })

  it('returns length when target > last element', () => {
    expect(lowerBound([10, 20, 30], 100)).toBe(3)
  })

  it('returns index of first element ≥ target', () => {
    expect(lowerBound([10, 20, 30], 20)).toBe(1)
    expect(lowerBound([10, 20, 30], 25)).toBe(2)
  })

  it('handles empty input', () => {
    expect(lowerBound([], 5)).toBe(0)
  })
})
