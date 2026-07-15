import { describe, expect, it, vi } from 'vitest'

import { createCubism2BaseData } from '../../components/blog/live2d/vendor/cubism2Core/baseData'
import type { Cubism2BaseDataReader } from '../../components/blog/live2d/vendor/cubism2Core/baseData'

/** Creates the shared base-data constructor with deterministic test dependencies. */
function createTestBaseData() {
  return createCubism2BaseData({
    BaseDataID: { getDefaultBaseDataID: vi.fn() },
    Cubism2MocVersion: { LIVE2D_FORMAT_VERSION_V2_10_SDK2: 10 },
    interpolator: { interpolateFloat: vi.fn().mockReturnValue(1) },
    isBootstrapping: vi.fn().mockReturnValue(false),
  })
}

describe('Cubism2 base-data immutable source behavior', () => {
  it('preserves reviewed baseData.ts source behavior through semantic TypeScript', () => {
    const BaseData = createTestBaseData()
    const baseData = new BaseData()

    expect(Object.keys(baseData)).toEqual([
      'baseDataId',
      'targetBaseDataId',
      'opacityValues',
    ])
  })

  it('retains the first base ID when the second source read throws', () => {
    const BaseData = createTestBaseData()
    const baseData = new BaseData()
    const expectedError = new Error('target base ID read failed')
    baseData.targetBaseDataId = 'old-target'
    const readObject = vi
      .fn()
      .mockReturnValueOnce('new-base')
      .mockImplementationOnce(() => {
        throw expectedError
      })

    expect(() =>
      baseData.readBaseData({
        getFormatVersion: vi.fn(),
        readFloat32Array: vi.fn(),
        readObject,
      }),
    ).toThrow(expectedError)
    expect(baseData.baseDataId).toBe('new-base')
    expect(baseData.targetBaseDataId).toBe('old-target')
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
  ] as const)('assigns a gated %s opacity payload verbatim', (_label, opacityValues) => {
    const BaseData = createTestBaseData()
    const baseData = new BaseData()
    baseData.opacityValues = [0.25]
    const reader: Cubism2BaseDataReader = {
      getFormatVersion: vi.fn().mockReturnValue(10),
      readFloat32Array: vi.fn().mockReturnValue(opacityValues),
      readObject: vi.fn(),
    }

    baseData.readV2Opacity(reader)

    expect(baseData.opacityValues).toBe(opacityValues)
  })
})
