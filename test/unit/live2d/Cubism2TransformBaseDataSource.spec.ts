import { describe, expect, it, vi } from 'vitest'

import { createCubism2BaseContext } from '../../../src/components/blog/live2d/vendor/cubism2Core/baseContext'
import { createCubism2BaseData } from '../../../src/components/blog/live2d/vendor/cubism2Core/baseData'
import { createCubism2Math } from '../../../src/components/blog/live2d/vendor/cubism2Core/math'
import { createCubism2ParamBindings } from '../../../src/components/blog/live2d/vendor/cubism2Core/paramBinding'
import {
  createCubism2TransformBaseData,
  type Cubism2TransformBaseDataInstance,
  type Cubism2TransformModelContextLike,
} from '../../../src/components/blog/live2d/vendor/cubism2Core/transformBaseData'
import {
  createCubism2TransformValue,
  type Cubism2TransformValueLike,
} from '../../../src/components/blog/live2d/vendor/cubism2Core/transformValue'
import type { Cubism2ParamBindingSetInstance } from '../../../src/components/blog/live2d/vendor/cubism2Core/paramBinding'

type TransformScalarField =
  | 'translationX'
  | 'translationY'
  | 'scaleX'
  | 'scaleY'
  | 'rotationDegrees'

/** Creates real low-level constructors around the transform module under test. */
function createTransformBaseDataHarness() {
  const isBootstrapping = () => false
  const Cubism2BaseContext = createCubism2BaseContext({ isBootstrapping })
  const Cubism2BaseData = createCubism2BaseData({
    BaseDataID: { getDefaultBaseDataID: () => Symbol.for('default-base-data') },
    Cubism2MocVersion: { LIVE2D_FORMAT_VERSION_V2_10_SDK2: 2 },
    interpolator: { interpolateFloat: () => 1 },
    isBootstrapping,
  })
  const Cubism2Math = createCubism2Math()
  const { Cubism2ParamBindingSet } = createCubism2ParamBindings({
    Cubism2RuntimeConstants: {
      PARAM_VALUE_EPSILON: 0.0001,
      maxInterpolationCornerCount: 65,
    },
    Live2D: { shouldThrowOnInvalidInterpolationCorner: false },
    isBootstrapping,
  })
  const Cubism2TransformValue = createCubism2TransformValue({
    Cubism2MocVersion: { LIVE2D_FORMAT_VERSION_V2_10_SDK2: 2 },
    isBootstrapping,
  })

  return {
    Cubism2BaseData,
    ...createCubism2TransformBaseData({
      Cubism2BaseContext,
      Cubism2BaseData,
      Cubism2Math,
      Cubism2ParamBindingSet,
      Cubism2TransformValue,
      Live2D: { isVerboseLoggingEnabled: () => false },
      UtDebug: { logWithLegacyPrefix: vi.fn() },
      isBootstrapping,
    }),
  }
}

/**
 * Creates one observed transform sample for high-dimensional access-order and failure tests.
 * @param sampleIndex Corner sample index included in read diagnostics.
 * @param reads Destination list receiving scalar property reads.
 * @param failingRead Optional sample/field pair that throws while accumulating.
 * @returns Transform sample with source-compatible scalar/reflection fields.
 */
function createObservedTransformSample(
  sampleIndex: number,
  reads: string[],
  failingRead?: { field: TransformScalarField; sampleIndex: number },
): Cubism2TransformValueLike {
  const sample: Cubism2TransformValueLike = {
    reflectX: true,
    reflectY: false,
    rotationDegrees: 6,
    scaleX: 4,
    scaleY: 5,
    translationX: 2,
    translationY: 3,
  }
  return new Proxy(sample, {
    get(target, property, receiver) {
      if (
        property === 'translationX' ||
        property === 'translationY' ||
        property === 'scaleX' ||
        property === 'scaleY' ||
        property === 'rotationDegrees'
      ) {
        reads.push(`${sampleIndex}:${property}`)
        if (failingRead?.sampleIndex === sampleIndex && failingRead.field === property) {
          throw new Error('sample accumulation failed')
        }
      }
      return Reflect.get(target, property, receiver)
    },
  })
}

/**
 * Attaches a five-axis binding and scratch buffers to one transform data object.
 * @param transformBaseData Transform data receiving the test binding and samples.
 * @param samples Thirty-two corner samples for the five-dimensional interpolation cube.
 * @returns Minimal model context exposing source-ordered scratch buffers.
 */
function configureFiveDimensionalUpdate(
  transformBaseData: Cubism2TransformBaseDataInstance,
  samples: ArrayLike<Cubism2TransformValueLike>,
): Cubism2TransformModelContextLike {
  const cornerIndexes = new Array<number>(32)
  const cornerWeights = new Float32Array(5)
  transformBaseData.paramBindingSet = {
    hasChangedParams: () => true,
    resolveInterpolationWeights: (_modelContext, dirtyFlagRef) => {
      dirtyFlagRef[0] = false
      return 5
    },
    buildInterpolationCorners: (targetIndexes, targetWeights) => {
      for (let cornerIndex = 0; cornerIndex < 32; cornerIndex++) {
        targetIndexes[cornerIndex] = cornerIndex
      }
      for (let axisIndex = 0; axisIndex < 5; axisIndex++) {
        targetWeights[axisIndex] = 0.5
      }
    },
  } as unknown as Cubism2ParamBindingSetInstance
  transformBaseData.transformValues = samples
  return {
    getBaseContext: () => null,
    getBaseData: () => null,
    getBaseDataIndex: () => -1,
    getScratchIndexBuffer: () => cornerIndexes,
    getScratchWeightBuffer: () => cornerWeights,
  }
}

describe('Cubism2 transform base data immutable source behavior', () => {
  it('preserves reviewed transformBaseData.ts source behavior through semantic TypeScript', () => {
    const { Cubism2TransformBaseData } = createTransformBaseDataHarness()
    const transformBaseData = new Cubism2TransformBaseData()
    const reads: string[] = []
    const samples = Array.from({ length: 32 }, (_, sampleIndex) =>
      createObservedTransformSample(sampleIndex, reads),
    )
    const modelContext = configureFiveDimensionalUpdate(transformBaseData, samples)
    const runtimeContext = transformBaseData.createRuntimeContext(modelContext)

    transformBaseData.updateRuntimeContext(modelContext, runtimeContext)

    expect(runtimeContext.interpolatedTransform).toMatchObject({
      reflectX: true,
      reflectY: false,
      rotationDegrees: 6,
      scaleX: 4,
      scaleY: 5,
      translationX: 2,
      translationY: 3,
    })
    expect(reads.slice(0, 10)).toEqual([
      '0:translationX',
      '0:translationY',
      '0:scaleX',
      '0:scaleY',
      '0:rotationDegrees',
      '1:translationX',
      '1:translationY',
      '1:scaleX',
      '1:scaleY',
      '1:rotationDegrees',
    ])
  })

  it('commits no scalar transform fields when high-dimensional accumulation fails', () => {
    const { Cubism2TransformBaseData } = createTransformBaseDataHarness()
    const transformBaseData = new Cubism2TransformBaseData()
    const reads: string[] = []
    const samples = Array.from({ length: 32 }, (_, sampleIndex) =>
      createObservedTransformSample(sampleIndex, reads, {
        field: 'scaleY',
        sampleIndex: 1,
      }),
    )
    const modelContext = configureFiveDimensionalUpdate(transformBaseData, samples)
    const runtimeContext = transformBaseData.createRuntimeContext(modelContext)
    Object.assign(runtimeContext.interpolatedTransform!, {
      rotationDegrees: 95,
      scaleX: 93,
      scaleY: 94,
      translationX: 91,
      translationY: 92,
    })

    expect(() => transformBaseData.updateRuntimeContext(modelContext, runtimeContext)).toThrow(
      'sample accumulation failed',
    )
    expect(runtimeContext.interpolatedTransform).toMatchObject({
      rotationDegrees: 95,
      scaleX: 93,
      scaleY: 94,
      translationX: 91,
      translationY: 92,
    })
  })

  it('dereferences a missing target base context instead of silently deactivating', () => {
    const { Cubism2BaseData, Cubism2TransformBaseData } = createTransformBaseDataHarness()
    const transformBaseData = new Cubism2TransformBaseData()
    transformBaseData.setTargetBaseDataID('target-base')
    const modelContext: Cubism2TransformModelContextLike = {
      getBaseContext: () => null,
      getBaseData: () => ({ transformPoints: vi.fn() }),
      getBaseDataIndex: () => 0,
      getScratchIndexBuffer: () => [],
      getScratchWeightBuffer: () => [],
    }
    const runtimeContext = transformBaseData.createRuntimeContext(modelContext)
    expect(runtimeContext.targetBaseDataIndex).toBe(Cubism2BaseData.UNRESOLVED_BASE_DATA_INDEX)
    const setActive = vi.spyOn(runtimeContext, 'setActive')

    expect(() => transformBaseData.applyRuntimeContext(modelContext, runtimeContext)).toThrow(
      TypeError,
    )
    expect(setActive).toHaveBeenCalledTimes(1)
    expect(setActive).toHaveBeenCalledWith(true)
  })
})
