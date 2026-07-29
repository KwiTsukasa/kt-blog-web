import { describe, expect, it, vi } from 'vitest'

import { createCubism2ModelContext } from '../../../src/components/blog/live2d/vendor/cubism2Core/modelContext'

/** Minimal clipping manager used to satisfy the model-context constructor boundary. */
class TestClippingManager {
  /** Accepts the source constructor arguments without retaining runtime state. */
  constructor(_drawParam: unknown) {}

  /** Provides the unused clipping initialization hook. */
  init(_modelContext: unknown, _drawDataList: unknown[], _drawContextList: unknown[]): void {}

  /** Provides the unused clipping setup hook. */
  setupClip(_modelContext: unknown, _drawParam: unknown): void {}
}

/** Nominal draw-data ID constructor required by the compatibility factory. */
class TestDrawDataId {}

describe('Cubism2 ModelContext immutable source behavior', () => {
  it('preserves reviewed modelContext.ts source behavior through semantic TypeScript', () => {
    const { ModelContext } = createCubism2ModelContext({
      BaseDataID: { getDefaultBaseDataID: vi.fn() },
      Cubism2ClippingManager: TestClippingManager,
      Cubism2DrawDataBase: {
        getMaxDrawOrder: vi.fn().mockReturnValue(0),
        getMinDrawOrder: vi.fn().mockReturnValue(0),
      },
      Cubism2RuntimeConstants: {
        maxInterpolationCornerCount: 4,
        maxTransformParameterDimensionCount: 4,
      },
      DrawDataID: TestDrawDataId,
      Live2D: { L2D_ERROR_MODEL_UPDATE: 1, setErrorCode: vi.fn() },
      UtDebug: {
        dump: vi.fn(),
        logException: vi.fn(),
        logWithLegacyPrefix: vi.fn(),
        start: vi.fn(),
      },
      UtSystem: { copyArraySegmentForward: vi.fn() },
      isBootstrapping: vi.fn().mockReturnValue(false),
    })
    const getPartsID = vi.fn().mockReturnValue('public-slot-value')
    const getPartsIDForModelLookup = vi.fn().mockReturnValue('lookup-slot-value')

    const partsIndex = ModelContext.prototype.getPartsDataIndex.call(
      {
        partsDataList: [{ getPartsID, getPartsIDForModelLookup }],
      },
      'lookup-slot-value',
    )

    expect(partsIndex).toBe(0)
    expect(getPartsIDForModelLookup).toHaveBeenCalledOnce()
    expect(getPartsID).not.toHaveBeenCalled()
  })
})
