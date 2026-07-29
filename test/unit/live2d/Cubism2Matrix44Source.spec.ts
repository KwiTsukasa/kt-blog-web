import { describe, expect, it, vi } from 'vitest'

import { createCubism2Matrix44 } from '../../../src/components/blog/live2d/vendor/cubism2Core/matrix44'

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

describe('Cubism2 Matrix44 immutable source behavior', () => {
  it('preserves reviewed matrix44.ts source behavior through semantic TypeScript', () => {
    const Cubism2Matrix44 = createCubism2Matrix44({
      Cubism2Math: { cos: Math.cos, sin: Math.sin },
    })
    const matrix = new Cubism2Matrix44()

    expect(Array.from(matrix.getBackingMatrixArray())).toEqual(IDENTITY)
    expect(matrix.getBackingMatrixArray()).toBe(matrix.elements)
    const snapshot = matrix.copyMatrixValues()
    expect(snapshot).not.toBe(matrix.elements)
    snapshot[0] = 99
    expect(matrix.elements[0]).toBe(1)

    matrix.copyFromSourceMatrix([1, 2])
    expect(Array.from(matrix.elements)).toEqual(IDENTITY)
    const source = Array.from({ length: 16 }, (_, index) => index + 1)
    matrix.copyFromSourceMatrix(source)
    expect(Array.from(matrix.elements)).toEqual(source)

    const right = new Cubism2Matrix44()
    expect(matrix.multiplyIntoTargetMatrix(right, null)).toBeNull()
    expect(matrix.multiplyIntoTargetMatrix(right, matrix)).toBe(matrix)
    expect(Array.from(matrix.elements)).toEqual(source)
  })

  it('preserves local transform mutation order and injected trigonometry', () => {
    const cos = vi.fn(() => 0)
    const sin = vi.fn(() => 1)
    const Cubism2Matrix44 = createCubism2Matrix44({ Cubism2Math: { cos, sin } })
    const matrix = new Cubism2Matrix44()

    matrix.applyLocalTranslation(2, 3, 4)
    expect(Array.from(matrix.elements.slice(12, 16))).toEqual([2, 3, 4, 1])
    matrix.applyLocalScale(2, 3, 4)
    expect([matrix.elements[0], matrix.elements[5], matrix.elements[10]]).toEqual([2, 3, 4])
    matrix.rotateAroundZAxis(0.25)
    expect(cos).toHaveBeenCalledWith(0.25)
    expect(sin).toHaveBeenCalledWith(0.25)
    expect([matrix.elements[0], matrix.elements[4], matrix.elements[1], matrix.elements[5]]).toEqual([
      0,
      -2,
      3,
      0,
    ])

    matrix.resetToIdentity()
    const output = new Array<number>(16).fill(-1)
    matrix.multiplyRawMatrixValues(matrix.elements, matrix.elements, output, true)
    expect(output).toEqual(IDENTITY)
  })
})
