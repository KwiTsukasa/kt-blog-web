import { describe, expect, it, vi } from 'vitest'

import { createCubism2Interpolation } from '../../../src/components/blog/live2d/vendor/cubism2Core/interpolation'

describe('Cubism2 interpolation immutable source behavior', () => {
  it('preserves reviewed interpolation.ts source behavior through semantic TypeScript', () => {
    const copyArraySegmentForward = vi.fn(
      (
        source: ArrayLike<number>,
        sourceOffset: number,
        target: ArrayLike<number> & { [index: number]: number },
        targetOffset: number,
        length: number,
      ) => {
        for (let index = 0; index < length; index += 1) {
          target[targetOffset + index] = source[sourceOffset + index]!
        }
      },
    )
    const { Cubism2Interpolation } = createCubism2Interpolation({
      UtSystem: { copyArraySegmentForward },
    })
    const cornerIndexes = [0, 1, 2, 3]
    const cornerWeights = [0.25, 0.5]
    const operations: string[] = []
    const modelContext = {
      getScratchIndexBuffer: () => {
        operations.push('indexes')
        return cornerIndexes
      },
      getScratchWeightBuffer: () => {
        operations.push('weights')
        return cornerWeights
      },
    }
    const bindingSet = {
      resolveInterpolationWeights: () => {
        operations.push('resolve')
        return 2
      },
      buildInterpolationCorners: () => {
        operations.push('corners')
      },
    }
    const dirty = [false]

    expect(
      Cubism2Interpolation.interpolateFloat(modelContext, bindingSet, dirty, [0, 4, 8, 12]),
    ).toBe(5)
    expect(operations).toEqual(['resolve', 'indexes', 'weights', 'corners'])
    operations.length = 0
    expect(
      Cubism2Interpolation.interpolateInteger(modelContext, bindingSet, dirty, [0, 5, 9, 13]),
    ).toBe(5)
    expect(operations).toEqual(['resolve', 'indexes', 'weights', 'corners'])

    const directBindingSet = {
      resolveInterpolationWeights: () => 0,
      buildInterpolationCorners: () => undefined,
    }
    const output = new Float32Array(4)
    Cubism2Interpolation.interpolatePoints(
      modelContext,
      directBindingSet,
      dirty,
      2,
      [[1, 2, 3, 4]],
      output,
      0,
      2,
    )
    expect(Array.from(output)).toEqual([1, 2, 3, 4])
    expect(copyArraySegmentForward).toHaveBeenCalledWith([1, 2, 3, 4], 0, output, 0, 4)
  })

  it('preserves one-dimensional integer truncation and strided point writes', () => {
    const { Cubism2Interpolation } = createCubism2Interpolation({
      UtSystem: { copyArraySegmentForward: vi.fn() },
    })
    const indexes = [0, 1]
    const weights = [0.5]
    const modelContext = {
      getScratchIndexBuffer: () => indexes,
      getScratchWeightBuffer: () => weights,
    }
    const bindingSet = {
      resolveInterpolationWeights: () => 1,
      buildInterpolationCorners: () => undefined,
    }
    const dirty = [false]

    expect(Cubism2Interpolation.interpolateInteger(modelContext, bindingSet, dirty, [0, 5])).toBe(2)
    expect(Cubism2Interpolation.interpolateFloat(modelContext, bindingSet, dirty, [0, 5])).toBe(2.5)
    const output = new Float32Array(8).fill(-1)
    Cubism2Interpolation.interpolatePoints(
      modelContext,
      bindingSet,
      dirty,
      2,
      [
        [0, 2, 4, 6],
        [2, 4, 6, 8],
      ],
      output,
      1,
      3,
    )
    expect(Array.from(output)).toEqual([-1, 1, 3, -1, 5, 7, -1, -1])
  })
})
