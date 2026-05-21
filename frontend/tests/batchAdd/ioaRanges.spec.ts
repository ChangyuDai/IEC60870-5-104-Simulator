import { describe, it, expect } from 'vitest'
import { compressRanges, lowerBound, findNextFreeGap, IOA_MAX } from '../../src/components/batchAdd/ioaRanges'

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

describe('findNextFreeGap', () => {
  it('returns 0 when there are no existing points', () => {
    expect(findNextFreeGap([], 10)).toBe(0)
  })

  it('returns the gap before the first range when it fits', () => {
    // existing 50..59, want 20 — fits at 0..19
    expect(findNextFreeGap([50, 51, 52, 53, 54, 55, 56, 57, 58, 59], 20)).toBe(0)
  })

  it('skips past first range when count would overlap it', () => {
    // existing 0..9, want 5 — 0..4 overlaps, so jump to 10
    expect(findNextFreeGap([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 5)).toBe(10)
  })

  it('finds the inner gap when first slot too small', () => {
    // existing 0..9 and 50..59, want 20 — gap 10..49 fits → 10
    const xs = [...Array(10).keys(), ...Array.from({ length: 10 }, (_, i) => 50 + i)]
    expect(findNextFreeGap(xs, 20)).toBe(10)
  })

  it('jumps past both ranges when no inner gap fits', () => {
    // existing 0..9 and 50..59, want 60 — 10..49 too small, jump to 60
    const xs = [...Array(10).keys(), ...Array.from({ length: 10 }, (_, i) => 50 + i)]
    expect(findNextFreeGap(xs, 60)).toBe(60)
  })

  it('returns null when no fitting gap exists below IOA_MAX', () => {
    // existing [0, 1], want IOA_MAX points — s pushed to 2, end = IOA_MAX+1 > IOA_MAX
    expect(findNextFreeGap([0, 1], IOA_MAX)).toBeNull()
  })

  it('returns 0 with count = 1 and existing [5]', () => {
    expect(findNextFreeGap([5], 1)).toBe(0)
  })
})
