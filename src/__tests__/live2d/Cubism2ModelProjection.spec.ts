import { describe, expect, it, vi } from 'vitest'

import { configureCubism2ModelProjection } from '../../components/blog/live2d/runtime/cubism2ModelProjection'

describe('Cubism2 model projection', () => {
  it('applies the source L2D model and canvas projection matrix before drawing', () => {
    const setMatrix = vi.fn()

    configureCubism2ModelProjection(
      {
        getCanvasHeight: () => 2,
        getCanvasWidth: () => 4,
        setMatrix,
      },
      {
        height: 250,
        width: 280,
      },
      {
        center_x: 0,
        center_y: -0.05,
        width: 2,
      },
    )

    expect(setMatrix).toHaveBeenCalledOnce()
    const matrix = setMatrix.mock.calls[0]?.[0] as Float32Array
    expect(matrix).toBeInstanceOf(Float32Array)
    expect(matrix[0]).toBeCloseTo(0.5)
    expect(matrix[5]).toBeCloseTo(-0.56)
    expect(matrix[12]).toBeCloseTo(-1)
    expect(matrix[13]).toBeCloseTo(0.504)
    expect(matrix[10]).toBe(1)
    expect(matrix[15]).toBe(1)
  })

  it('rejects invalid model or canvas dimensions instead of drawing a transparent frame', () => {
    const model = {
      getCanvasHeight: () => 2,
      getCanvasWidth: () => 0,
      setMatrix: vi.fn(),
    }

    expect(() => configureCubism2ModelProjection(model, { height: 250, width: 280 })).toThrow(
      'Cubism2 model and canvas dimensions must be positive.',
    )
  })
})
