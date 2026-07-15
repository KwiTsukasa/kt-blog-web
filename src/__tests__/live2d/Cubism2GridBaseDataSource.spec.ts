import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import type {
  Cubism2BaseContextConstructor,
  Cubism2BaseContextInstance,
} from '../../components/blog/live2d/vendor/cubism2Core/baseContext'
import { createCubism2BaseData } from '../../components/blog/live2d/vendor/cubism2Core/baseData'
import { createCubism2GridBaseData } from '../../components/blog/live2d/vendor/cubism2Core/gridBaseData'
import type { Cubism2GridBaseDataConstructor } from '../../components/blog/live2d/vendor/cubism2Core/gridBaseData'
import type {
  Cubism2ParamBindingSetConstructor,
  Cubism2ParamBindingSetInstance,
} from '../../components/blog/live2d/vendor/cubism2Core/paramBinding'

/** Minimal base-context constructor needed only for grid prototype setup. */
function TestBaseContext(this: Cubism2BaseContextInstance): void {
  void this
}

/** Minimal binding-set constructor needed only for the grid factory boundary. */
function TestParamBindingSet(this: Cubism2ParamBindingSetInstance): void {
  void this
}

/** Creates the grid constructor with deterministic compatibility dependencies. */
function createTestGridBaseData(): Cubism2GridBaseDataConstructor {
  const Cubism2BaseData = createCubism2BaseData({
    BaseDataID: { getDefaultBaseDataID: vi.fn().mockReturnValue(null) },
    Cubism2MocVersion: { LIVE2D_FORMAT_VERSION_V2_10_SDK2: 10 },
    interpolator: { interpolateFloat: vi.fn().mockReturnValue(1) },
    isBootstrapping: vi.fn().mockReturnValue(false),
  })
  const { Cubism2GridBaseData } = createCubism2GridBaseData({
    Cubism2BaseContext: TestBaseContext as unknown as Cubism2BaseContextConstructor,
    Cubism2BaseData,
    Cubism2Interpolation: { interpolatePoints: vi.fn() },
    Cubism2ParamBindingSet: TestParamBindingSet as unknown as Cubism2ParamBindingSetConstructor,
    Live2D: {
      isVerboseLoggingEnabled: vi.fn().mockReturnValue(false),
      shouldClampSdk1GridPointsToUnitRange: false,
    },
    System: { err: { printf: vi.fn() } },
    UtDebug: { logWithLegacyPrefix: vi.fn() },
    isBootstrapping: vi.fn().mockReturnValue(false),
  })
  return Cubism2GridBaseData
}

describe('Cubism2 grid base-data immutable source behavior', () => {
  it('retains the completed grid payload prefix when the point-table read throws', () => {
    const GridBaseData = createTestGridBaseData()
    const gridBaseData = new GridBaseData()
    const paramBindingSet = { binding: true }
    const expectedError = new Error('grid point table read failed')
    const readObject = vi
      .fn()
      .mockReturnValueOnce('base-id')
      .mockReturnValueOnce('target-id')
      .mockReturnValueOnce(paramBindingSet)
      .mockImplementationOnce(() => {
        throw expectedError
      })
    const readInt32 = vi.fn().mockReturnValueOnce(2).mockReturnValueOnce(3)

    expect(() =>
      gridBaseData.readGridBaseData({
        getFormatVersion: vi.fn(),
        readFloat32Array: vi.fn(),
        readInt32,
        readObject,
      }),
    ).toThrow(expectedError)
    expect(gridBaseData).toMatchObject({
      baseDataId: 'base-id',
      gridColumnCount: 3,
      gridPointValues: null,
      gridRowCount: 2,
      paramBindingSet,
      targetBaseDataId: 'target-id',
    })
  })

  it('does not suppress a missing target-context failure', () => {
    const GridBaseData = createTestGridBaseData()
    const gridBaseData = new GridBaseData()
    gridBaseData.targetBaseDataId = 'target-id'
    const setActive = vi.fn()
    const gridContext = {
      getInterpolatedOpacity: vi.fn().mockReturnValue(1),
      setActive,
      targetBaseDataIndex: 0,
    }
    const modelContext = {
      getBaseContext: vi.fn().mockReturnValue(null),
      getBaseData: vi.fn().mockReturnValue({ transformPoints: vi.fn() }),
      getBaseDataIndex: vi.fn(),
    }

    expect(() => gridBaseData.applyRuntimeContext(modelContext, gridContext)).toThrow(TypeError)
    expect(setActive).toHaveBeenCalledWith(true)
  })

  it('preserves reviewed gridBaseData.ts source behavior through semantic TypeScript', () => {
    const GridBaseData = createTestGridBaseData()
    const outputPoints = [-1, -1]
    const accesses: PropertyKey[] = []
    const expectedError = new Error('first y-coordinate read failed')
    const gridPoints = new Proxy([0, 0, 2, 0, 0, 2, 2, 2], {
      get(target, property, receiver) {
        accesses.push(property)
        if (property === '1') {
          throw expectedError
        }
        return Reflect.get(target, property, receiver)
      },
    })

    expect(() =>
      GridBaseData.transformPointsSdk2([0.25, 0.25], outputPoints, 1, 0, 2, gridPoints, 1, 1),
    ).toThrow(expectedError)
    expect(accesses).toEqual(['0', '2', '4', '1'])
    expect(outputPoints).toEqual([0.5, -1])
  })

  it('preserves direct extrapolation-basis getter order without helper caching', () => {
    const GridBaseData = createTestGridBaseData()
    const accesses: PropertyKey[] = []
    const gridPoints = new Proxy([0, 0, 2, 0, 0, 2, 2, 2], {
      get(target, property, receiver) {
        accesses.push(property)
        return Reflect.get(target, property, receiver)
      },
    })

    GridBaseData.transformPointsSdk2([4, 4], [0, 0], 1, 0, 2, gridPoints, 1, 1)

    expect(accesses).toEqual([
      '0',
      '2',
      '4',
      '6',
      '1',
      '3',
      '5',
      '7',
      '6',
      '0',
      '7',
      '1',
      '2',
      '4',
      '3',
      '5',
    ])
  })

  it('keeps every interior and extrapolation branch on the authored identity grid', () => {
    const GridBaseData = createTestGridBaseData()
    const sourcePoints = [
      -1, -1, -1, 2, -1, 0.5, 2, -1, 2, 2, 2, 0.5, 0.5, -1, 0.5, 2, -3, -3, 4, 4, 0.25, 0.25, 0.75,
      0.75,
    ]
    const outputPoints = new Array<number>(sourcePoints.length).fill(Number.NaN)

    GridBaseData.transformPointsSdk2(
      sourcePoints,
      outputPoints,
      sourcePoints.length / 2,
      0,
      2,
      [0, 0, 1, 0, 0, 1, 1, 1],
      1,
      1,
    )

    outputPoints.forEach((outputValue, valueIndex) => {
      expect(outputValue).toBeCloseTo(sourcePoints[valueIndex]!)
    })
  })

  it('keeps SDK2 point mapping free of point/basis payload helpers', () => {
    const moduleSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/gridBaseData.ts',
      ),
      'utf8',
    )

    expect(moduleSource).not.toMatch(
      /GridPoint2D|GridExtrapolationBasis|readGridPoint|createGridExtrapolationBasis|writeSplitQuadPoint/,
    )
    expect(moduleSource).not.toMatch(
      /Cubism2GridBaseDataPayload|readCubism2GridBaseDataPayload|applyCubism2GridBaseDataPayload/,
    )
  })
})
