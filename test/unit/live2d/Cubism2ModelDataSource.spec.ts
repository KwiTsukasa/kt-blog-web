import { describe, expect, it, vi } from 'vitest'

import { createCubism2ModelData } from '../../../src/components/blog/live2d/vendor/cubism2Core/modelData'

/** Minimal parameter-definition set used by fallback model initialization. */
class TestParamDefinitionSet {
  /** Provides the compatibility initialization hook. */
  initializeParamDefinitions(): void {}
}

describe('Cubism2 model-data immutable source behavior', () => {
  it('preserves reviewed modelData.ts source behavior through semantic TypeScript', () => {
    const { Cubism2ModelImpl } = createCubism2ModelData({
      Cubism2ParamDefinitionSet: TestParamDefinitionSet,
      isBootstrapping: vi.fn().mockReturnValue(false),
    })
    const modelData = new Cubism2ModelImpl()
    const paramDefinitionSet = { params: true }
    const partsDataList = [{ parts: true }]
    const expectedError = new Error('canvas height read failed')
    const readObject = vi
      .fn()
      .mockReturnValueOnce(paramDefinitionSet)
      .mockReturnValueOnce(partsDataList)
    const readInt32 = vi
      .fn()
      .mockReturnValueOnce(800)
      .mockImplementationOnce(() => {
        throw expectedError
      })

    expect(() => modelData.readModelData({ readInt32, readObject })).toThrow(expectedError)
    expect(modelData).toMatchObject({
      canvasHeight: 400,
      canvasWidth: 800,
      paramDefinitionSet,
      partsDataList,
    })
  })
})
