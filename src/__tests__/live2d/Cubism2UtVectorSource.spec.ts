import { describe, expect, it, vi } from 'vitest'

import { createCubism2UtVector } from '../../components/blog/live2d/vendor/cubism2Core/utVector'

describe('Cubism2 UtVector immutable source behavior', () => {
  it('preserves reviewed utVector.ts source behavior through semantic TypeScript', () => {
    const UtVector = createCubism2UtVector()
    const output = [0, 0, 99]

    expect(UtVector.solveAffineCoordinates(14, 24, 10, 20, 2, 0, 0, 2)).toEqual([2, 2])
    expect(UtVector.solveAffineCoordinates(3, 4, 0, 0, 0, 2, 3, 0)).toEqual([2, 1])
    expect(UtVector.solveAffineCoordinates(1, 1, 0, 0, 1, 1, 2, 2)).toBeNull()
    expect(UtVector.solveAffineCoordinates(14, 24, 10, 20, 2, 0, 0, 2, output)).toBe(output)
    expect(output).toEqual([2, 2, 99])
  })

  it('preserves the source NaN retry and diagnostic branch', () => {
    const log = vi.fn()
    const UtVector = createCubism2UtVector({ logger: { log } })

    const result = UtVector.solveAffineCoordinates(1, 2, 0, 0, Number.NaN, 1, 1, 0)

    expect(result?.every(Number.isNaN)).toBe(true)
    expect(log.mock.calls).toEqual([
      ['a is NaN @UtVector#solveAffineCoordinates() '],
      ['v1x : NaN'],
      ['v1x != 0 ? true'],
    ])
  })
})
