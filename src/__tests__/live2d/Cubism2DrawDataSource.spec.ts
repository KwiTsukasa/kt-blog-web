import { describe, expect, it, vi } from 'vitest'

import { createCubism2DrawContextBase } from '../../components/blog/live2d/vendor/cubism2Core/drawContextBase'
import { createCubism2DrawData } from '../../components/blog/live2d/vendor/cubism2Core/drawData'

/** Creates draw-data constructors with the same guarded prototype-bootstrap phase as min.js. */
function createTestDrawData() {
  let isBootstrapping = true
  const Cubism2DrawContextBase = createCubism2DrawContextBase({
    isBootstrapping: () => isBootstrapping,
  })
  const interpolateFloat = vi.fn(() => 0.75)
  const interpolateInteger = vi.fn(() => 7)
  const interpolatePoints = vi.fn()

  function ParamBindingSetStub(this: Record<string, unknown>): void {
    this.buildInterpolationCorners = vi.fn()
    this.hasChangedParams = vi.fn(() => true)
    this.initBindingList = vi.fn()
    this.resolveInterpolationWeights = vi.fn(() => 0)
  }

  const constructors = createCubism2DrawData({
    BaseDataID: { getDefaultBaseDataID: () => 'default-base' },
    Cubism2DrawContextBase,
    Cubism2MocVersion: {
      LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER: 2,
      MAX_SUPPORTED_FORMAT_VERSION: 2,
    },
    Cubism2ParamBindingSet: ParamBindingSetStub,
    Cubism2RuntimeConstants: {
      FLIP_MODEL_SPACE_UV_Y: false,
      MODEL_SPACE_COORDINATE_MODE: 0,
      POINT_TUPLE_SIZE: 5,
      POINT_X_OFFSET: 0,
      SDK2_COORDINATE_MODE: 1,
      activeCoordinateMode: 1,
    },
    Live2D: {
      isVerboseLoggingEnabled: () => false,
      shouldUpdateClippedDrawContextOpacity: false,
    },
    UtDebug: { logWithLegacyPrefix: vi.fn() },
    interpolator: { interpolateFloat, interpolateInteger, interpolatePoints },
    isBootstrapping: () => isBootstrapping,
  } as unknown as Parameters<typeof createCubism2DrawData>[0])
  isBootstrapping = false

  return {
    ...constructors,
    interpolateFloat,
    interpolateInteger,
    interpolatePoints,
  }
}

describe('Cubism2 draw-data immutable source behavior', () => {
  it('preserves reviewed drawData.ts source behavior through semantic TypeScript', () => {
    const { Cubism2DrawDataBase, Cubism2MeshDrawContext, Cubism2MeshDrawData } =
      createTestDrawData()
    const ownBaseMethods = [
      'applyDrawContext',
      'getClipIDList',
      'getDrawDataID',
      'getDrawOrder',
      'getOpacity',
      'getTargetBaseDataID',
      'getType',
      'hasTargetBaseData',
      'readDrawDataBase',
      'setDrawDataID',
      'setTargetBaseDataID',
      'updateDrawContext',
    ]

    expect(Object.hasOwn(Cubism2DrawDataBase, 'trackDrawOrderBounds')).toBe(true)
    expect(Object.hasOwn(Cubism2DrawDataBase, 'getMinDrawOrder')).toBe(true)
    expect(Object.hasOwn(Cubism2DrawDataBase, 'getMaxDrawOrder')).toBe(true)
    for (const methodName of ownBaseMethods) {
      expect(Object.hasOwn(Cubism2DrawDataBase.prototype, methodName)).toBe(true)
    }
    expect(Cubism2DrawDataBase.prototype.applyDrawContext).toHaveLength(1)
    expect(Cubism2MeshDrawData.prototype.createDrawContext).toHaveLength(1)
    expect(Object.hasOwn(Cubism2DrawDataBase.prototype, 'constructor')).toBe(false)
    expect(Object.hasOwn(Cubism2MeshDrawData.prototype, 'constructor')).toBe(false)
    expect(Object.hasOwn(Cubism2MeshDrawContext.prototype, 'constructor')).toBe(false)
    expect(Cubism2MeshDrawData.prototype.constructor).toBe(
      Cubism2DrawDataBase.prototype.constructor,
    )

    const base = new Cubism2DrawDataBase()
    expect(base.drawDataId).toBeNull()
    expect(base.clipIDList).toEqual([])
    expect(base.getType()).toBeUndefined()
    Cubism2DrawDataBase.trackDrawOrderBounds([-4, 712])
    expect(Cubism2DrawDataBase.getMinDrawOrder()).toBe(-4)
    expect(Cubism2DrawDataBase.getMaxDrawOrder()).toBe(712)

    const mesh = new Cubism2MeshDrawData()
    mesh.vertexCount = 1
    mesh.uvCoordinates = [0.25, 0.75]
    const drawContext = mesh.createDrawContext(undefined)
    expect(drawContext.getSourceDrawData()).toBe(mesh)
    expect(Array.from(drawContext.localPoints!)).toEqual([0.25, 0.75, 0, 0, 0])
    expect(drawContext.targetSpacePoints).toBeNull()

    const baseUpdate = vi.fn(function (_modelContext: unknown, context: typeof drawContext): void {
      context.clippedFlagRef[0] = false
    })
    Cubism2DrawDataBase.prototype.updateDrawContext = baseUpdate as never
    mesh.paramBindingSet = { hasChangedParams: () => true } as never
    mesh.vertexPointValues = []
    mesh.updateDrawContext({} as never, drawContext)
    expect(baseUpdate).toHaveBeenCalledWith({}, drawContext)

    const baseApply = vi.fn()
    Cubism2DrawDataBase.prototype.applyDrawContext = baseApply as never
    mesh.applyDrawContext({} as never, drawContext)
    expect(baseApply).toHaveBeenCalledOnce()
    expect(baseApply.mock.calls[0]).toHaveLength(1)

    const patchedPrototypeConstructor = vi.fn()
    ;(
      Cubism2DrawDataBase.prototype as unknown as {
        constructor: typeof patchedPrototypeConstructor
      }
    ).constructor = patchedPrototypeConstructor
    new Cubism2MeshDrawData()
    expect(patchedPrototypeConstructor).toHaveBeenCalledOnce()
  })

  it('passes the extended mesh flag directly to parseInt and preserves the failure prefix', () => {
    const { Cubism2MeshDrawData } = createTestDrawData()
    const mesh = new Cubism2MeshDrawData()
    const extendedFlag = Symbol('extended-flag')
    const objectValues: unknown[] = [
      'draw-id',
      'default-base',
      { hasChangedParams: () => true },
      null,
      [],
      [],
      [],
    ]
    const integerValues: unknown[] = [1, 0, 0, 0, 1, extendedFlag]

    expect(() =>
      mesh.readMeshDrawData({
        getFormatVersion: () => 2,
        readFloat32Array: () => [1],
        readInt32: () => integerValues.shift() as number,
        readInt32Array: () => [3],
        readObject: () => objectValues.shift(),
      }),
    ).toThrow(TypeError)
    expect(mesh.drawFlagBits).toBe(1)
    expect(mesh.drawFlagOptions).not.toBeNull()
    expect(Object.hasOwn(mesh.drawFlagOptions!, 'extendedFlagValue')).toBe(false)
  })
})
