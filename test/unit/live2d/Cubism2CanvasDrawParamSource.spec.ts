import { describe, expect, it, vi } from 'vitest'

import {
  createCubism2CanvasDrawParam,
  type Cubism2DrawParamBaseConstructor,
} from '../../../src/components/blog/live2d/vendor/cubism2Core/canvasDrawParam'

/**
 * Supplies the callable base constructor shape used by the legacy Canvas draw-param factory.
 */
function DrawParamBase(this: unknown): void {}

describe('Cubism2 Canvas draw-param immutable source behavior', () => {
  it('preserves reviewed canvasDrawParam.ts source behavior through semantic TypeScript', () => {
    const CanvasDrawParam = createCubism2CanvasDrawParam({
      Cubism2DrawParamBase: DrawParamBase as unknown as Cubism2DrawParamBaseConstructor,
      Live2D: { polygonExpansionWidth: 1.2 },
      UtSystem: { copyArraySegmentForward: vi.fn() },
      isBootstrapping: () => false,
    })

    const floatBuffer = CanvasDrawParam.createFloatBuffer(4)
    const indexBuffer = CanvasDrawParam.createIndexBuffer(3)

    expect(floatBuffer).toBeInstanceOf(Float32Array)
    expect(indexBuffer).toBeInstanceOf(Int16Array)
    expect(floatBuffer).toHaveLength(4)
    expect(indexBuffer).toHaveLength(3)
    expect('put' in floatBuffer).toBe(false)
    expect('clear' in indexBuffer).toBe(false)
    expect(Object.keys(floatBuffer)).toEqual(['0', '1', '2', '3'])
    expect(Object.keys(indexBuffer)).toEqual(['0', '1', '2'])

    const grownFloatBuffer = CanvasDrawParam.updateFloatBuffer(null, [1.5, -2])
    const reusedFloatBuffer = CanvasDrawParam.updateFloatBuffer(grownFloatBuffer, [7, 8, 9])
    expect(grownFloatBuffer).toHaveLength(4)
    expect(reusedFloatBuffer).toBe(grownFloatBuffer)
    expect(Array.from(reusedFloatBuffer)).toEqual([7, 8, 9, 0])
    expect('setWritePosition' in reusedFloatBuffer).toBe(false)

    const grownIndexBuffer = CanvasDrawParam.updateIndexBuffer(null, [3, 1, 2])
    const reusedIndexBuffer = CanvasDrawParam.updateIndexBuffer(grownIndexBuffer, [9, 8])
    expect(grownIndexBuffer).toHaveLength(6)
    expect(reusedIndexBuffer).toBe(grownIndexBuffer)
    expect(Array.from(reusedIndexBuffer)).toEqual([9, 8, 2, 0, 0, 0])
    expect('getCapacity' in reusedIndexBuffer).toBe(false)

    const drawParam = new CanvasDrawParam()
    expect(() => drawParam.getTextureCount()).toThrowError(
      'Canvas draw parameters do not expose a texture count',
    )
    expect(() => drawParam.setDrawParam(Symbol('ignored payload'))).toThrowError(
      'Canvas draw parameters cannot be reassigned',
    )
    expect(drawParam.setDrawParam.length).toBe(1)
  })
})
