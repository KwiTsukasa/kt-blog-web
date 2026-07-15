import { describe, expect, it, vi } from 'vitest'

import {
  createCubism2ModelBase,
  type CreateCubism2ModelBaseOptions,
} from '../../components/blog/live2d/vendor/cubism2Core/modelBase'

const DIRECT_MODEL_METHODS = [
  'setModelImpl',
  'getModelImpl',
  'getCanvasWidth',
  'getCanvasHeight',
  'getParamFloat',
  'setParamFloat',
  'addToParamFloat',
  'multParamFloat',
  'getParamIndex',
  'loadParam',
  'saveParam',
  'init',
  'update',
  'getTextureCount',
  'setDrawParam',
  'releaseRendererTextures',
  'draw',
  'getModelContext',
  'getLoadErrorFlags',
  'updateParamDrivenPartsOpacity',
  'setPartsOpacity',
  'getPartsDataIndex',
  'getPartsOpacity',
  'getDrawParam',
  'getDrawDataIndex',
  'getDrawData',
  'getTransformedPoints',
  'getIndexArray',
] as const

/** Builds one direct semantic model-base runtime with observable context state. */
function createModelBaseFixture() {
  const lifecycle: string[] = []
  const paramValues = new Map<number, number>([[3, 10]])
  const partValues = new Map<number, number>()

  /** Minimal model context populated with semantic operations used by the facade. */
  function ModelContext(this: Record<string, unknown>): void {
    Object.assign(this, {
      drawDataList: [],
      getDrawContext: () => null,
      getDrawData: (index: number) => ({ index }),
      getDrawDataIndex: () => 8,
      getParamFloat: (index: number) => paramValues.get(index) ?? 0,
      getParamIndex: () => 3,
      getPartsDataIndex: () => 4,
      getPartsOpacity: (index: number) => partValues.get(index) ?? 0,
      init: () => lifecycle.push('init'),
      loadParam: () => lifecycle.push('load'),
      saveParam: () => lifecycle.push('save'),
      setDrawParam: vi.fn(),
      setParamFloat: (index: number, value: number) => paramValues.set(index, value),
      setPartsOpacity: (index: number, value: number) => partValues.set(index, value),
      update: () => lifecycle.push('update'),
    })
  }

  /** Minimal fallback implementation used by lazy model creation. */
  function ModelImpl(this: Record<string, unknown>): void {
    Object.assign(this, {
      getCanvasHeight: () => 240,
      getCanvasWidth: () => 320,
      initializeModelContainers: vi.fn(),
    })
  }

  /** Runtime-checkable semantic parts identifier. */
  class PartsDataID {
    /** Returns an ID wrapper accepted by the fake context. */
    static getID(value: unknown): PartsDataID {
      return new PartsDataID(value)
    }

    /** Stores the raw identifier solely for test observability. */
    constructor(readonly value: unknown) {}
  }

  class MeshDrawContext {
    /** Returns the source mesh type code. */
    getType(): number {
      return 70
    }

    /** Returns representative transformed points. */
    getTransformedPoints(): number[] {
      return [1, 2]
    }
  }

  class MeshDrawData {
    /** Returns the source mesh type code. */
    getType(): number {
      return 70
    }

    /** Returns representative triangle indexes. */
    getIndexArray(): number[] {
      return [0, 1, 2]
    }
  }

  class CoreError extends Error {}
  class BinaryReader {}
  const options = {
    Cubism2BinaryReader: BinaryReader,
    Cubism2CoreError: CoreError,
    Cubism2DrawDataBase: { TYPE_MESH: 70 },
    Cubism2MeshDrawContext: MeshDrawContext,
    Cubism2MeshDrawData: MeshDrawData,
    Cubism2MocVersion: {
      LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER: 8,
      MAX_SUPPORTED_FORMAT_VERSION: 11,
    },
    Cubism2ModelImpl: ModelImpl,
    DrawDataID: { getID: (value: unknown) => value },
    ModelContext,
    ParamID: { getID: (value: unknown) => value },
    PartsDataID,
    UtDebug: { logException: vi.fn(), logWithLegacyPrefix: vi.fn() },
    isBootstrapping: () => false,
  } as unknown as CreateCubism2ModelBaseOptions
  return {
    lifecycle,
    ModelBase: createCubism2ModelBase(options),
    paramValues,
    partValues,
  }
}

describe('Cubism2 model-base immutable source behavior', () => {
  it('preserves reviewed modelBase.ts source behavior through semantic TypeScript', () => {
    const { lifecycle, ModelBase, paramValues, partValues } = createModelBaseFixture()

    expect(Object.hasOwn(ModelBase, 'loadMocDataIntoModel')).toBe(true)
    for (const methodName of DIRECT_MODEL_METHODS) {
      expect(Object.hasOwn(ModelBase.prototype, methodName), methodName).toBe(true)
      expect(typeof ModelBase.prototype[methodName]).toBe('function')
    }

    const model = new ModelBase()
    expect(model.getCanvasWidth()).toBe(0)
    expect(model.getCanvasHeight()).toBe(0)
    const implementation = model.getModelImpl()
    expect(implementation.getCanvasWidth()).toBe(320)
    expect(implementation.getCanvasHeight()).toBe(240)

    expect(model.getParamFloat('PARAM_ANGLE_X')).toBe(10)
    model.setParamFloat('PARAM_ANGLE_X', 20, 0.25)
    expect(paramValues.get(3)).toBe(12.5)
    model.addToParamFloat('PARAM_ANGLE_X', 2)
    expect(paramValues.get(3)).toBe(14.5)
    model.multParamFloat('PARAM_ANGLE_X', 2, 0.5)
    expect(paramValues.get(3)).toBe(21.75)

    model.setPartsOpacity('PARTS_01', 0.75)
    expect(partValues.get(4)).toBe(0.75)
    expect(model.getPartsOpacity('PARTS_01')).toBe(0.75)
    expect(model.getPartsDataIndex('PARTS_01')).toBe(4)
    expect(model.getDrawDataIndex('DRAW_01')).toBe(8)
    expect(model.getDrawData(2)).toEqual({ index: 2 })

    model.loadParam()
    model.saveParam()
    model.init()
    model.update()
    expect(lifecycle).toEqual(['load', 'save', 'init', 'update'])
    expect(model.getModelContext()).toBeTruthy()
    expect(model.getLoadErrorFlags()).toBe(0)
  })
})
