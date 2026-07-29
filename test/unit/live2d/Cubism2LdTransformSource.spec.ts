import { describe, expect, it } from 'vitest'

import { createCubism2LDTransform } from '../../../src/components/blog/live2d/vendor/cubism2Core/ldTransform'

describe('Cubism2 LDTransform immutable source behavior', () => {
  it('preserves reviewed ldTransform.ts source behavior through semantic TypeScript', () => {
    const LDTransform = createCubism2LDTransform()
    const transform = new LDTransform()
    transform.translate(4, -3)
    const invertWithRuntimeTarget = transform.invertInto as unknown as (
      target?: unknown,
    ) => ReturnType<typeof transform.invertInto>

    for (const falsyTarget of [undefined, null, false, 0, '', Number.NaN]) {
      const inverse = invertWithRuntimeTarget.call(transform, falsyTarget)
      expect(inverse).toBeInstanceOf(LDTransform)
      expect(inverse!.transformPointForLDGL(4, -3, [0, 0])).toEqual([0, 0])
    }

    const reusableTarget = new LDTransform()
    expect(transform.invertInto(reusableTarget)).toBe(reusableTarget)

    const bigintSingularTransform = new LDTransform()
    bigintSingularTransform.matrix = new Array(9).fill(0n) as unknown as number[]
    expect(bigintSingularTransform.invertInto()).toBeNull()

    const leftTransform = new LDTransform()
    leftTransform.translate(5, 0)
    const rightTransform = new LDTransform()
    rightTransform.scale(2, 2)
    const globalRecord = globalThis as typeof globalThis & { m?: number[] }
    const previousGlobalMatrix = globalRecord.m
    const sentinelGlobalMatrix = new Array(9).fill(99)

    globalRecord.m = sentinelGlobalMatrix
    try {
      leftTransform.concatenate(rightTransform)
      expect(leftTransform.transformPointForLDGL(3, 4, [0, 0])).toEqual([11, 8])
      expect(globalRecord.m).toBe(sentinelGlobalMatrix)
      expect(globalRecord.m).toEqual(new Array(9).fill(99))
    } finally {
      if (previousGlobalMatrix === undefined) {
        delete globalRecord.m
      } else {
        globalRecord.m = previousGlobalMatrix
      }
    }
  })
})
