// 3-byte IOA upper bound per IEC 60870-5-101 §7.2.5.
export const IOA_MAX = 16_777_215

// Assumes xs is sorted ascending and unique.
export function compressRanges(xs: readonly number[]): string {
  if (xs.length === 0) return ''
  const fmt = (s: number, e: number) => (s === e ? String(s) : `${s}–${e}`)
  const parts: string[] = []
  let s = xs[0]
  let e = xs[0]
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] === e + 1) {
      e = xs[i]
      continue
    }
    parts.push(fmt(s, e))
    s = e = xs[i]
  }
  parts.push(fmt(s, e))
  return parts.join(', ')
}

// Index of first element ≥ target in a sorted array.
export function lowerBound(xs: readonly number[], target: number): number {
  let l = 0
  let r = xs.length
  while (l < r) {
    const m = (l + r) >>> 1
    if (xs[m] < target) l = m + 1
    else r = m
  }
  return l
}
