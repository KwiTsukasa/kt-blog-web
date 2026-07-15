import type { Cubism2BaseContextConstructor, Cubism2BaseContextInstance } from './baseContext'
import type {
  Cubism2BaseDataConstructor,
  Cubism2BaseDataInstance,
  Cubism2BaseDataReader,
} from './baseData'
import type {
  Cubism2InterpolationConstructor,
  Cubism2InterpolationModelContextLike,
  Cubism2InterpolationParamBindingSetLike,
} from './interpolation'
import type {
  Cubism2ParamBindingSetConstructor,
  Cubism2ParamBindingSetInstance,
} from './paramBinding'

type MutableNumberArray = ArrayLike<number> & {
  [index: number]: number
}

type GridPointTableList = ArrayLike<ArrayLike<number>>

export interface Cubism2GridBaseDataReader extends Cubism2BaseDataReader {
  readInt32: () => number
}

export interface Cubism2GridModelContextLike extends Cubism2InterpolationModelContextLike {
  getBaseContext: (baseDataIndex: number) => Cubism2BaseContextInstance | null
  getBaseData: (baseDataIndex: number) => Cubism2GridTargetBaseDataLike | null
  getBaseDataIndex: (targetBaseDataId: unknown) => number
}

export interface Cubism2GridTargetBaseDataLike {
  transformPoints: (
    modelContext: unknown,
    targetBaseContext: unknown,
    sourcePoints: MutableNumberArray,
    outputPoints: MutableNumberArray,
    pointCount: number,
    pointOffset: number,
    pointStride: number,
  ) => void
}

export interface Cubism2GridContextInstance extends Cubism2BaseContextInstance {
  localPoints: Float32Array | null
  targetBaseDataIndex: number
  targetSpacePoints: Float32Array | null
}

export interface Cubism2GridBaseDataInstance extends Cubism2BaseDataInstance {
  applyRuntimeContext: (modelContext: unknown, gridContext: unknown) => void
  createRuntimeContext: (modelContext: unknown) => Cubism2GridContextInstance
  getGridPointCount: () => number
  gridColumnCount: number
  gridPointValues: GridPointTableList | null
  gridRowCount: number
  initializeParamBindingSet: () => void
  paramBindingSet: Cubism2ParamBindingSetInstance | null
  readGridBaseData: (reader: Cubism2BaseDataReader) => void
  transformPoints: (
    modelContext: unknown,
    sourceContext: unknown,
    sourcePoints: unknown,
    outputPoints: unknown,
    pointCount: number,
    pointOffset: number,
    pointStride: number,
  ) => void
  transformPointsSdk1: (
    modelContext: unknown,
    sourceContext: unknown,
    sourcePoints: unknown,
    outputPoints: unknown,
    pointCount: number,
    pointOffset: number,
    pointStride: number,
  ) => void
  updateRuntimeContext: (modelContext: unknown, gridContext: unknown) => void
}

export interface Cubism2GridBaseDataConstructor {
  new (): Cubism2GridBaseDataInstance
  paramDirtyFlagScratch: boolean[]
  prototype: Cubism2GridBaseDataInstance
  transformPointsSdk2: (
    sourcePoints: ArrayLike<number>,
    outputPoints: MutableNumberArray,
    pointCount: number,
    pointOffset: number,
    pointStride: number,
    gridPoints: ArrayLike<number>,
    gridColumnCount: number,
    gridRowCount: number,
  ) => void
}

export interface Cubism2GridContextConstructor {
  new (baseData: Cubism2GridBaseDataInstance): Cubism2GridContextInstance
  prototype: Cubism2GridContextInstance
}

export interface Cubism2GridBaseDataConstructors {
  Cubism2GridBaseData: Cubism2GridBaseDataConstructor
  Cubism2GridContext: Cubism2GridContextConstructor
}

export interface CreateCubism2GridBaseDataOptions {
  Cubism2BaseContext: Cubism2BaseContextConstructor
  Cubism2BaseData: Cubism2BaseDataConstructor
  Cubism2Interpolation: Pick<Cubism2InterpolationConstructor, 'interpolatePoints'>
  Cubism2ParamBindingSet: Cubism2ParamBindingSetConstructor
  Live2D: {
    isVerboseLoggingEnabled: () => boolean
    shouldClampSdk1GridPointsToUnitRange: boolean
  }
  System: {
    err: {
      printf: (message: string, ...args: unknown[]) => void
    }
  }
  UtDebug: {
    logWithLegacyPrefix: (message: string, ...args: unknown[]) => void
  }
  isBootstrapping: () => boolean
}

/**
 * Creates Cubism2 type-65 grid base-data constructors bound to runtime Core dependencies.
 * @param options Runtime constructors, flags, and diagnostics required by legacy grid logic.
 * @returns Grid base-data and grid-context constructors.
 */
export function createCubism2GridBaseData(
  options: CreateCubism2GridBaseDataOptions,
): Cubism2GridBaseDataConstructors {
  const {
    Cubism2BaseContext,
    Cubism2BaseData,
    Cubism2Interpolation,
    Cubism2ParamBindingSet,
    Live2D,
    System,
    UtDebug,
    isBootstrapping,
  } = options

  /**
   * Stores one type-65 Cubism2 grid base-data record used to deform points from a param grid.
   * @returns Nothing; reader hooks populate grid dimensions, bindings, and authored grid values.
   */
  function Cubism2GridBaseData(this: Cubism2GridBaseDataInstance): void {
    if (isBootstrapping()) {
      return
    }
    Cubism2BaseData.prototype.constructor.call(this)
    this.gridColumnCount = 0
    this.gridRowCount = 0
    this.paramBindingSet = null
    this.gridPointValues = null
  }

  const GridBaseData = Cubism2GridBaseData as unknown as Cubism2GridBaseDataConstructor
  GridBaseData.prototype = new Cubism2BaseData() as unknown as Cubism2GridBaseDataInstance
  GridBaseData.paramDirtyFlagScratch = []

  /**
   * Allocates the parameter binding set before type-65 grid records append their axes.
   * @returns Nothing; the binding set is stored for later parameter interpolation.
   */
  GridBaseData.prototype.initializeParamBindingSet = function (): void {
    this.paramBindingSet = new Cubism2ParamBindingSet()
    this.paramBindingSet.initBindingList()
  }

  /**
   * Reads a type-65 grid base-data payload from the Cubism2 binary stream.
   * @param reader Cubism2 binary reader positioned at the grid payload.
   * @returns Nothing; shared base header, grid dimensions, bindings, points, and opacity are stored.
   */
  GridBaseData.prototype.readGridBaseData = function (reader: Cubism2BaseDataReader): void {
    const gridReader = reader as Cubism2GridBaseDataReader
    Cubism2BaseData.prototype.readBaseData.call(this, reader)
    this.gridRowCount = gridReader.readInt32()
    this.gridColumnCount = gridReader.readInt32()
    this.paramBindingSet = gridReader.readObject() as Cubism2ParamBindingSetInstance
    this.gridPointValues = gridReader.readObject() as GridPointTableList
    Cubism2BaseData.prototype.readV2Opacity.call(this, reader)
  }

  /**
   * Creates the runtime point buffers that hold interpolated grid points and optional target-space points.
   * @param modelContext Model context that owns the base context list; unused by this constructor path.
   * @returns Runtime grid context with local and optional target-space point buffers sized to the grid.
   */
  GridBaseData.prototype.createRuntimeContext = function (
    modelContext: unknown,
  ): Cubism2GridContextInstance {
    void modelContext
    const gridContext = new GridContext(this)
    const pointCount = this.getGridPointCount()
    if (gridContext.localPoints != null) {
      gridContext.localPoints = null
    }
    gridContext.localPoints = new Float32Array(pointCount * 2)
    if (gridContext.targetSpacePoints != null) {
      gridContext.targetSpacePoints = null
    }
    if (this.hasTargetBaseData()) {
      gridContext.targetSpacePoints = new Float32Array(pointCount * 2)
    } else {
      gridContext.targetSpacePoints = null
    }
    return gridContext
  }

  /**
   * Interpolates authored grid points for the current model parameters and updates opacity.
   * @param modelContext Runtime model context that supplies current parameter values and scratch buffers.
   * @param gridContext Runtime grid context whose local point buffer receives interpolated points.
   * @returns Nothing; dirty flags, local points, and interpolated opacity are mutated in place.
   */
  GridBaseData.prototype.updateRuntimeContext = function (
    modelContext: unknown,
    gridContext: unknown,
  ): void {
    const runtimeModelContext = modelContext as Cubism2GridModelContextLike
    const runtimeGridContext = gridContext as Cubism2GridContextInstance
    const paramBindingSet = this
      .paramBindingSet as unknown as Cubism2InterpolationParamBindingSetLike & {
      hasChangedParams: (modelContext: unknown) => boolean
    }
    if (!paramBindingSet.hasChangedParams(runtimeModelContext)) {
      return
    }
    const pointCount = this.getGridPointCount()
    const dirtyFlagRef = GridBaseData.paramDirtyFlagScratch
    dirtyFlagRef[0] = false
    Cubism2Interpolation.interpolatePoints(
      runtimeModelContext,
      paramBindingSet,
      dirtyFlagRef,
      pointCount,
      this.gridPointValues,
      runtimeGridContext.localPoints,
      0,
      2,
    )
    runtimeGridContext.setTransformFlag(dirtyFlagRef[0]!)
    this.interpolateOpacity(
      runtimeModelContext,
      this.paramBindingSet,
      runtimeGridContext,
      dirtyFlagRef,
    )
  }

  /**
   * Propagates the grid through its target base data when this grid depends on another base.
   * @param modelContext Runtime model context used to resolve target base data and context.
   * @param gridContext Runtime grid context whose total opacity/scale and target points are updated.
   * @returns Nothing; context activity and target-space buffers are updated in place.
   */
  GridBaseData.prototype.applyRuntimeContext = function (
    modelContext: unknown,
    gridContext: unknown,
  ): void {
    const runtimeModelContext = modelContext as Cubism2GridModelContextLike
    const runtimeGridContext = gridContext as Cubism2GridContextInstance
    runtimeGridContext.setActive(true)
    if (!this.hasTargetBaseData()) {
      runtimeGridContext.setTotalOpacity(runtimeGridContext.getInterpolatedOpacity())
    } else {
      const targetBaseDataId = this.getTargetBaseDataID()
      if (runtimeGridContext.targetBaseDataIndex == Cubism2BaseData.UNRESOLVED_BASE_DATA_INDEX) {
        runtimeGridContext.targetBaseDataIndex =
          runtimeModelContext.getBaseDataIndex(targetBaseDataId)
      }
      if (runtimeGridContext.targetBaseDataIndex < 0) {
        if (Live2D.isVerboseLoggingEnabled()) {
          UtDebug.logWithLegacyPrefix('Target base data was not found: %s', targetBaseDataId)
        }
        runtimeGridContext.setActive(false)
      } else {
        const targetBaseData = runtimeModelContext.getBaseData(
          runtimeGridContext.targetBaseDataIndex,
        )
        const targetBaseContext = runtimeModelContext.getBaseContext(
          runtimeGridContext.targetBaseDataIndex,
        )
        if (
          targetBaseData != null &&
          targetBaseContext!.isRenderable()
        ) {
          const totalScale = targetBaseContext!.getTotalScale()
          runtimeGridContext.setTotalScaleNotForClient(totalScale)
          const totalOpacity = targetBaseContext!.getTotalOpacity()
          runtimeGridContext.setTotalOpacity(
            totalOpacity * runtimeGridContext.getInterpolatedOpacity(),
          )
          targetBaseData.transformPoints(
            runtimeModelContext,
            targetBaseContext!,
            runtimeGridContext.localPoints!,
            runtimeGridContext.targetSpacePoints!,
            this.getGridPointCount(),
            0,
            2,
          )
          runtimeGridContext.setActive(true)
        } else {
          runtimeGridContext.setActive(false)
        }
      }
    }
  }

  /**
   * Applies this grid's point mapping to an arbitrary point buffer.
   * @param modelContext Runtime model context; retained for the legacy SDK1 branch signature.
   * @param sourceContext Base context whose local or target-space grid points drive the mapping.
   * @param sourcePoints Input points to transform.
   * @param outputPoints Output points receiving transformed coordinates.
   * @param pointCount Number of interleaved points to transform.
   * @param pointOffset First element offset in the interleaved point buffers.
   * @param pointStride Stride between points in the interleaved point buffers.
   * @returns Nothing; output points are mutated in place.
   */
  GridBaseData.prototype.transformPoints = function (
    modelContext: unknown,
    sourceContext: unknown,
    sourcePoints: unknown,
    outputPoints: unknown,
    pointCount: number,
    pointOffset: number,
    pointStride: number,
  ): void {
    const runtimeSourceContext = sourceContext as Cubism2GridContextInstance
    if (true) {
      const gridPoints =
        runtimeSourceContext.targetSpacePoints != null
          ? runtimeSourceContext.targetSpacePoints
          : runtimeSourceContext.localPoints
      GridBaseData.transformPointsSdk2(
        sourcePoints as ArrayLike<number>,
        outputPoints as MutableNumberArray,
        pointCount,
        pointOffset,
        pointStride,
        gridPoints!,
        this.gridColumnCount,
        this.gridRowCount,
      )
    } else {
      this.transformPointsSdk1(
        modelContext,
        sourceContext,
        sourcePoints,
        outputPoints,
        pointCount,
        pointOffset,
        pointStride,
      )
    }
  }

  /**
   * Maps normalized source points through the SDK2 grid interpolation/extrapolation algorithm.
   * @param sourcePoints Interleaved source point coordinates to map.
   * @param outputPoints Interleaved output point coordinates written by this method.
   * @param pointCount Number of points to transform.
   * @param pointOffset First element offset in the interleaved buffers.
   * @param pointStride Stride between points in the interleaved buffers.
   * @param gridPoints Interleaved grid control points produced by parameter interpolation.
   * @param gridColumnCount Number of horizontal grid cells.
   * @param gridRowCount Number of vertical grid cells.
   * @returns Nothing; the output buffer is mutated in place.
   */
  GridBaseData.transformPointsSdk2 = function (
    sourcePoints: ArrayLike<number>,
    outputPoints: MutableNumberArray,
    pointCount: number,
    pointOffset: number,
    pointStride: number,
    gridPoints: ArrayLike<number>,
    gridColumnCount: number,
    gridRowCount: number,
  ): void {
    const exclusivePointOffset = pointCount * pointStride
    let basisOriginX = 0
    let basisOriginY = 0
    let columnVectorX = 0
    let columnVectorY = 0
    let rowVectorX = 0
    let rowVectorY = 0
    let hasExtrapolationBasis = false

    for (
      let pointCursor = pointOffset;
      pointCursor < exclusivePointOffset;
      pointCursor += pointStride
    ) {
      const normalizedX = sourcePoints[pointCursor]!
      const normalizedY = sourcePoints[pointCursor + 1]!
      const gridX = normalizedX * gridColumnCount
      const gridY = normalizedY * gridRowCount

      if (gridX < 0 || gridY < 0 || gridColumnCount <= gridX || gridRowCount <= gridY) {
        const strideColumnCount = gridColumnCount + 1
        if (!hasExtrapolationBasis) {
          hasExtrapolationBasis = true
          const topLeftOffset = 0
          const topRightOffset = gridColumnCount * 2
          const bottomLeftOffset = gridRowCount * strideColumnCount * 2
          const bottomRightOffset =
            (gridColumnCount + gridRowCount * strideColumnCount) * 2
          basisOriginX =
            0.25 *
            (gridPoints[topLeftOffset]! +
              gridPoints[topRightOffset]! +
              gridPoints[bottomLeftOffset]! +
              gridPoints[bottomRightOffset]!)
          basisOriginY =
            0.25 *
            (gridPoints[topLeftOffset + 1]! +
              gridPoints[topRightOffset + 1]! +
              gridPoints[bottomLeftOffset + 1]! +
              gridPoints[bottomRightOffset + 1]!)
          const diagonalVectorX =
            gridPoints[bottomRightOffset]! - gridPoints[topLeftOffset]!
          const diagonalVectorY =
            gridPoints[bottomRightOffset + 1]! - gridPoints[topLeftOffset + 1]!
          const antiDiagonalVectorX =
            gridPoints[topRightOffset]! - gridPoints[bottomLeftOffset]!
          const antiDiagonalVectorY =
            gridPoints[topRightOffset + 1]! - gridPoints[bottomLeftOffset + 1]!
          columnVectorX = (diagonalVectorX + antiDiagonalVectorX) * 0.5
          columnVectorY = (diagonalVectorY + antiDiagonalVectorY) * 0.5
          rowVectorX = (diagonalVectorX - antiDiagonalVectorX) * 0.5
          rowVectorY = (diagonalVectorY - antiDiagonalVectorY) * 0.5
          if (columnVectorX == 0 && columnVectorY == 0) {
            // The immutable source deliberately leaves a zero column basis unchanged.
          }
          if (rowVectorX == 0 && rowVectorY == 0) {
            // The immutable source deliberately leaves a zero row basis unchanged.
          }
          basisOriginX -= 0.5 * (columnVectorX + rowVectorX)
          basisOriginY -= 0.5 * (columnVectorY + rowVectorY)
        }

        if (-2 < normalizedX && normalizedX < 3 && -2 < normalizedY && normalizedY < 3) {
          if (normalizedX <= 0) {
            if (normalizedY <= 0) {
              const diagonalX = gridPoints[0]!
              const diagonalY = gridPoints[1]!
              const verticalX = basisOriginX - 2 * columnVectorX
              const verticalY = basisOriginY - 2 * columnVectorY
              const horizontalX = basisOriginX - 2 * rowVectorX
              const horizontalY = basisOriginY - 2 * rowVectorY
              const originCornerX =
                basisOriginX - 2 * columnVectorX - 2 * rowVectorX
              const originCornerY =
                basisOriginY - 2 * columnVectorY - 2 * rowVectorY
              const localX = 0.5 * (normalizedX - -2)
              const localY = 0.5 * (normalizedY - -2)
              if (localX + localY <= 1) {
                outputPoints[pointCursor] =
                  originCornerX +
                  (horizontalX - originCornerX) * localX +
                  (verticalX - originCornerX) * localY
                outputPoints[pointCursor + 1] =
                  originCornerY +
                  (horizontalY - originCornerY) * localX +
                  (verticalY - originCornerY) * localY
              } else {
                outputPoints[pointCursor] =
                  diagonalX +
                  (verticalX - diagonalX) * (1 - localX) +
                  (horizontalX - diagonalX) * (1 - localY)
                outputPoints[pointCursor + 1] =
                  diagonalY +
                  (verticalY - diagonalY) * (1 - localX) +
                  (horizontalY - diagonalY) * (1 - localY)
              }
            } else if (normalizedY >= 1) {
              const leftBottomOffset = gridRowCount * strideColumnCount * 2
              const horizontalX = gridPoints[leftBottomOffset]!
              const horizontalY = gridPoints[leftBottomOffset + 1]!
              const originCornerX = basisOriginX - 2 * columnVectorX + rowVectorX
              const originCornerY = basisOriginY - 2 * columnVectorY + rowVectorY
              const diagonalX = basisOriginX + 3 * rowVectorX
              const diagonalY = basisOriginY + 3 * rowVectorY
              const verticalX = basisOriginX - 2 * columnVectorX + 3 * rowVectorX
              const verticalY = basisOriginY - 2 * columnVectorY + 3 * rowVectorY
              const localX = 0.5 * (normalizedX - -2)
              const localY = 0.5 * (normalizedY - 1)
              if (localX + localY <= 1) {
                outputPoints[pointCursor] =
                  originCornerX +
                  (horizontalX - originCornerX) * localX +
                  (verticalX - originCornerX) * localY
                outputPoints[pointCursor + 1] =
                  originCornerY +
                  (horizontalY - originCornerY) * localX +
                  (verticalY - originCornerY) * localY
              } else {
                outputPoints[pointCursor] =
                  diagonalX +
                  (verticalX - diagonalX) * (1 - localX) +
                  (horizontalX - diagonalX) * (1 - localY)
                outputPoints[pointCursor + 1] =
                  diagonalY +
                  (verticalY - diagonalY) * (1 - localX) +
                  (horizontalY - diagonalY) * (1 - localY)
              }
            } else {
              let rowIndex = gridY | 0
              if (rowIndex == gridRowCount) {
                rowIndex = gridRowCount - 1
              }
              const localX = 0.5 * (normalizedX - -2)
              const localY = gridY - rowIndex
              const rowRatio = rowIndex / gridRowCount
              const nextRowRatio = (rowIndex + 1) / gridRowCount
              const currentRowOffset = rowIndex * strideColumnCount * 2
              const nextRowOffset = (rowIndex + 1) * strideColumnCount * 2
              const horizontalX = gridPoints[currentRowOffset]!
              const horizontalY = gridPoints[currentRowOffset + 1]!
              const diagonalX = gridPoints[nextRowOffset]!
              const diagonalY = gridPoints[nextRowOffset + 1]!
              const originCornerX =
                basisOriginX - 2 * columnVectorX + rowRatio * rowVectorX
              const originCornerY =
                basisOriginY - 2 * columnVectorY + rowRatio * rowVectorY
              const verticalX =
                basisOriginX - 2 * columnVectorX + nextRowRatio * rowVectorX
              const verticalY =
                basisOriginY - 2 * columnVectorY + nextRowRatio * rowVectorY
              if (localX + localY <= 1) {
                outputPoints[pointCursor] =
                  originCornerX +
                  (horizontalX - originCornerX) * localX +
                  (verticalX - originCornerX) * localY
                outputPoints[pointCursor + 1] =
                  originCornerY +
                  (horizontalY - originCornerY) * localX +
                  (verticalY - originCornerY) * localY
              } else {
                outputPoints[pointCursor] =
                  diagonalX +
                  (verticalX - diagonalX) * (1 - localX) +
                  (horizontalX - diagonalX) * (1 - localY)
                outputPoints[pointCursor + 1] =
                  diagonalY +
                  (verticalY - diagonalY) * (1 - localX) +
                  (horizontalY - diagonalY) * (1 - localY)
              }
            }
          } else if (1 <= normalizedX) {
            if (normalizedY <= 0) {
              const rightTopOffset = gridColumnCount * 2
              const verticalX = gridPoints[rightTopOffset]!
              const verticalY = gridPoints[rightTopOffset + 1]!
              const diagonalX = basisOriginX + 3 * columnVectorX
              const diagonalY = basisOriginY + 3 * columnVectorY
              const originCornerX = basisOriginX + columnVectorX - 2 * rowVectorX
              const originCornerY = basisOriginY + columnVectorY - 2 * rowVectorY
              const horizontalX = basisOriginX + 3 * columnVectorX - 2 * rowVectorX
              const horizontalY = basisOriginY + 3 * columnVectorY - 2 * rowVectorY
              const localX = 0.5 * (normalizedX - 1)
              const localY = 0.5 * (normalizedY - -2)
              if (localX + localY <= 1) {
                outputPoints[pointCursor] =
                  originCornerX +
                  (horizontalX - originCornerX) * localX +
                  (verticalX - originCornerX) * localY
                outputPoints[pointCursor + 1] =
                  originCornerY +
                  (horizontalY - originCornerY) * localX +
                  (verticalY - originCornerY) * localY
              } else {
                outputPoints[pointCursor] =
                  diagonalX +
                  (verticalX - diagonalX) * (1 - localX) +
                  (horizontalX - diagonalX) * (1 - localY)
                outputPoints[pointCursor + 1] =
                  diagonalY +
                  (verticalY - diagonalY) * (1 - localX) +
                  (horizontalY - diagonalY) * (1 - localY)
              }
            } else if (normalizedY >= 1) {
              const rightBottomOffset =
                (gridColumnCount + gridRowCount * strideColumnCount) * 2
              const originCornerX = gridPoints[rightBottomOffset]!
              const originCornerY = gridPoints[rightBottomOffset + 1]!
              const horizontalX = basisOriginX + 3 * columnVectorX + rowVectorX
              const horizontalY = basisOriginY + 3 * columnVectorY + rowVectorY
              const verticalX = basisOriginX + columnVectorX + 3 * rowVectorX
              const verticalY = basisOriginY + columnVectorY + 3 * rowVectorY
              const diagonalX = basisOriginX + 3 * columnVectorX + 3 * rowVectorX
              const diagonalY = basisOriginY + 3 * columnVectorY + 3 * rowVectorY
              const localX = 0.5 * (normalizedX - 1)
              const localY = 0.5 * (normalizedY - 1)
              if (localX + localY <= 1) {
                outputPoints[pointCursor] =
                  originCornerX +
                  (horizontalX - originCornerX) * localX +
                  (verticalX - originCornerX) * localY
                outputPoints[pointCursor + 1] =
                  originCornerY +
                  (horizontalY - originCornerY) * localX +
                  (verticalY - originCornerY) * localY
              } else {
                outputPoints[pointCursor] =
                  diagonalX +
                  (verticalX - diagonalX) * (1 - localX) +
                  (horizontalX - diagonalX) * (1 - localY)
                outputPoints[pointCursor + 1] =
                  diagonalY +
                  (verticalY - diagonalY) * (1 - localX) +
                  (horizontalY - diagonalY) * (1 - localY)
              }
            } else {
              let rowIndex = gridY | 0
              if (rowIndex == gridRowCount) {
                rowIndex = gridRowCount - 1
              }
              const localX = 0.5 * (normalizedX - 1)
              const localY = gridY - rowIndex
              const rowRatio = rowIndex / gridRowCount
              const nextRowRatio = (rowIndex + 1) / gridRowCount
              const currentRowOffset =
                (gridColumnCount + rowIndex * strideColumnCount) * 2
              const nextRowOffset =
                (gridColumnCount + (rowIndex + 1) * strideColumnCount) * 2
              const originCornerX = gridPoints[currentRowOffset]!
              const originCornerY = gridPoints[currentRowOffset + 1]!
              const verticalX = gridPoints[nextRowOffset]!
              const verticalY = gridPoints[nextRowOffset + 1]!
              const horizontalX =
                basisOriginX + 3 * columnVectorX + rowRatio * rowVectorX
              const horizontalY =
                basisOriginY + 3 * columnVectorY + rowRatio * rowVectorY
              const diagonalX =
                basisOriginX + 3 * columnVectorX + nextRowRatio * rowVectorX
              const diagonalY =
                basisOriginY + 3 * columnVectorY + nextRowRatio * rowVectorY
              if (localX + localY <= 1) {
                outputPoints[pointCursor] =
                  originCornerX +
                  (horizontalX - originCornerX) * localX +
                  (verticalX - originCornerX) * localY
                outputPoints[pointCursor + 1] =
                  originCornerY +
                  (horizontalY - originCornerY) * localX +
                  (verticalY - originCornerY) * localY
              } else {
                outputPoints[pointCursor] =
                  diagonalX +
                  (verticalX - diagonalX) * (1 - localX) +
                  (horizontalX - diagonalX) * (1 - localY)
                outputPoints[pointCursor + 1] =
                  diagonalY +
                  (verticalY - diagonalY) * (1 - localX) +
                  (horizontalY - diagonalY) * (1 - localY)
              }
            }
          } else if (normalizedY <= 0) {
            let columnIndex = gridX | 0
            if (columnIndex == gridColumnCount) {
              columnIndex = gridColumnCount - 1
            }
            const localX = gridX - columnIndex
            const localY = 0.5 * (normalizedY - -2)
            const columnRatio = columnIndex / gridColumnCount
            const nextColumnRatio = (columnIndex + 1) / gridColumnCount
            const currentColumnOffset = columnIndex * 2
            const nextColumnOffset = (columnIndex + 1) * 2
            const verticalX = gridPoints[currentColumnOffset]!
            const verticalY = gridPoints[currentColumnOffset + 1]!
            const diagonalX = gridPoints[nextColumnOffset]!
            const diagonalY = gridPoints[nextColumnOffset + 1]!
            const originCornerX =
              basisOriginX + columnRatio * columnVectorX - 2 * rowVectorX
            const originCornerY =
              basisOriginY + columnRatio * columnVectorY - 2 * rowVectorY
            const horizontalX =
              basisOriginX + nextColumnRatio * columnVectorX - 2 * rowVectorX
            const horizontalY =
              basisOriginY + nextColumnRatio * columnVectorY - 2 * rowVectorY
            if (localX + localY <= 1) {
              outputPoints[pointCursor] =
                originCornerX +
                (horizontalX - originCornerX) * localX +
                (verticalX - originCornerX) * localY
              outputPoints[pointCursor + 1] =
                originCornerY +
                (horizontalY - originCornerY) * localX +
                (verticalY - originCornerY) * localY
            } else {
              outputPoints[pointCursor] =
                diagonalX +
                (verticalX - diagonalX) * (1 - localX) +
                (horizontalX - diagonalX) * (1 - localY)
              outputPoints[pointCursor + 1] =
                diagonalY +
                (verticalY - diagonalY) * (1 - localX) +
                (horizontalY - diagonalY) * (1 - localY)
            }
          } else if (normalizedY >= 1) {
            let columnIndex = gridX | 0
            if (columnIndex == gridColumnCount) {
              columnIndex = gridColumnCount - 1
            }
            const localX = gridX - columnIndex
            const localY = 0.5 * (normalizedY - 1)
            const columnRatio = columnIndex / gridColumnCount
            const nextColumnRatio = (columnIndex + 1) / gridColumnCount
            const currentColumnOffset =
              (columnIndex + gridRowCount * strideColumnCount) * 2
            const nextColumnOffset =
              (columnIndex + 1 + gridRowCount * strideColumnCount) * 2
            const originCornerX = gridPoints[currentColumnOffset]!
            const originCornerY = gridPoints[currentColumnOffset + 1]!
            const horizontalX = gridPoints[nextColumnOffset]!
            const horizontalY = gridPoints[nextColumnOffset + 1]!
            const verticalX =
              basisOriginX + columnRatio * columnVectorX + 3 * rowVectorX
            const verticalY =
              basisOriginY + columnRatio * columnVectorY + 3 * rowVectorY
            const diagonalX =
              basisOriginX + nextColumnRatio * columnVectorX + 3 * rowVectorX
            const diagonalY =
              basisOriginY + nextColumnRatio * columnVectorY + 3 * rowVectorY
            if (localX + localY <= 1) {
              outputPoints[pointCursor] =
                originCornerX +
                (horizontalX - originCornerX) * localX +
                (verticalX - originCornerX) * localY
              outputPoints[pointCursor + 1] =
                originCornerY +
                (horizontalY - originCornerY) * localX +
                (verticalY - originCornerY) * localY
            } else {
              outputPoints[pointCursor] =
                diagonalX +
                (verticalX - diagonalX) * (1 - localX) +
                (horizontalX - diagonalX) * (1 - localY)
              outputPoints[pointCursor + 1] =
                diagonalY +
                (verticalY - diagonalY) * (1 - localX) +
                (horizontalY - diagonalY) * (1 - localY)
            }
          } else {
            System.err.printf(
              'Unexpected grid extrapolation coordinates: %.4f, %.4f\n',
              normalizedX,
              normalizedY,
            )
          }
        } else {
          outputPoints[pointCursor] =
            basisOriginX + normalizedX * columnVectorX + normalizedY * rowVectorX
          outputPoints[pointCursor + 1] =
            basisOriginY + normalizedX * columnVectorY + normalizedY * rowVectorY
        }
      } else {
        const cellLocalX = gridX - (gridX | 0)
        const cellLocalY = gridY - (gridY | 0)
        const basePointOffset =
          2 * ((gridX | 0) + (gridY | 0) * (gridColumnCount + 1))
        if (cellLocalX + cellLocalY < 1) {
          outputPoints[pointCursor] =
            gridPoints[basePointOffset]! * (1 - cellLocalX - cellLocalY) +
            gridPoints[basePointOffset + 2]! * cellLocalX +
            gridPoints[basePointOffset + 2 * (gridColumnCount + 1)]! * cellLocalY
          outputPoints[pointCursor + 1] =
            gridPoints[basePointOffset + 1]! * (1 - cellLocalX - cellLocalY) +
            gridPoints[basePointOffset + 3]! * cellLocalX +
            gridPoints[basePointOffset + 2 * (gridColumnCount + 1) + 1]! * cellLocalY
        } else {
          outputPoints[pointCursor] =
            gridPoints[basePointOffset + 2 * (gridColumnCount + 1) + 2]! *
              (cellLocalX - 1 + cellLocalY) +
            gridPoints[basePointOffset + 2 * (gridColumnCount + 1)]! * (1 - cellLocalX) +
            gridPoints[basePointOffset + 2]! * (1 - cellLocalY)
          outputPoints[pointCursor + 1] =
            gridPoints[basePointOffset + 2 * (gridColumnCount + 1) + 3]! *
              (cellLocalX - 1 + cellLocalY) +
            gridPoints[basePointOffset + 2 * (gridColumnCount + 1) + 1]! *
              (1 - cellLocalX) +
            gridPoints[basePointOffset + 3]! * (1 - cellLocalY)
        }
      }
    }
  }

  /**
   * Applies the older SDK1 grid interpolation branch retained for compatibility with legacy flags.
   * @param modelContext Runtime model context retained for signature parity with SDK2 point transforms.
   * @param sourceContext Base context whose local or target-space points drive the mapping.
   * @param sourcePoints Input interleaved point buffer.
   * @param outputPoints Output interleaved point buffer.
   * @param pointCount Number of points to transform.
   * @param pointOffset First element offset in the interleaved point buffers.
   * @param pointStride Stride between points in the interleaved point buffers.
   * @returns Nothing; the output point buffer is mutated in place.
   */
  GridBaseData.prototype.transformPointsSdk1 = function (
    modelContext: unknown,
    sourceContext: unknown,
    sourcePoints: unknown,
    outputPoints: unknown,
    pointCount: number,
    pointOffset: number,
    pointStride: number,
  ): void {
    void modelContext
    var runtimeSourceContext = sourceContext as Cubism2GridContextInstance
    var inputPoints = sourcePoints as ArrayLike<number>
    var outputPointBuffer = outputPoints as MutableNumberArray
    var gridX, gridY
    var gridColumnCount = this.gridColumnCount
    var gridRowCount = this.gridRowCount
    var exclusivePointOffset = pointCount * pointStride
    var cellColumnIndex, cellRowIndex
    var basePointOffset
    var cellLocalX, cellLocalY
    var gridPoints =
      runtimeSourceContext.targetSpacePoints != null
        ? runtimeSourceContext.targetSpacePoints
        : runtimeSourceContext.localPoints!
    for (
      var pointCursor = pointOffset;
      pointCursor < exclusivePointOffset;
      pointCursor += pointStride
    ) {
      if (Live2D.shouldClampSdk1GridPointsToUnitRange) {
        gridX = inputPoints[pointCursor]!
        gridY = inputPoints[pointCursor + 1]!
        if (gridX < 0) {
          gridX = 0
        } else {
          if (gridX > 1) {
            gridX = 1
          }
        }
        if (gridY < 0) {
          gridY = 0
        } else {
          if (gridY > 1) {
            gridY = 1
          }
        }
        gridX *= gridColumnCount
        gridY *= gridRowCount
        cellColumnIndex = gridX | 0
        cellRowIndex = gridY | 0
        if (cellColumnIndex > gridColumnCount - 1) {
          cellColumnIndex = gridColumnCount - 1
        }
        if (cellRowIndex > gridRowCount - 1) {
          cellRowIndex = gridRowCount - 1
        }
        cellLocalX = gridX - cellColumnIndex
        cellLocalY = gridY - cellRowIndex
        basePointOffset = 2 * (cellColumnIndex + cellRowIndex * (gridColumnCount + 1))
      } else {
        gridX = inputPoints[pointCursor]! * gridColumnCount
        gridY = inputPoints[pointCursor + 1]! * gridRowCount
        cellLocalX = gridX - (gridX | 0)
        cellLocalY = gridY - (gridY | 0)
        basePointOffset = 2 * ((gridX | 0) + (gridY | 0) * (gridColumnCount + 1))
      }
      if (cellLocalX + cellLocalY < 1) {
        outputPointBuffer[pointCursor] =
          gridPoints[basePointOffset]! * (1 - cellLocalX - cellLocalY) +
          gridPoints[basePointOffset + 2]! * cellLocalX +
          gridPoints[basePointOffset + 2 * (gridColumnCount + 1)]! * cellLocalY
        outputPointBuffer[pointCursor + 1] =
          gridPoints[basePointOffset + 1]! * (1 - cellLocalX - cellLocalY) +
          gridPoints[basePointOffset + 3]! * cellLocalX +
          gridPoints[basePointOffset + 2 * (gridColumnCount + 1) + 1]! * cellLocalY
      } else {
        outputPointBuffer[pointCursor] =
          gridPoints[basePointOffset + 2 * (gridColumnCount + 1) + 2]! *
            (cellLocalX - 1 + cellLocalY) +
          gridPoints[basePointOffset + 2 * (gridColumnCount + 1)]! * (1 - cellLocalX) +
          gridPoints[basePointOffset + 2]! * (1 - cellLocalY)
        outputPointBuffer[pointCursor + 1] =
          gridPoints[basePointOffset + 2 * (gridColumnCount + 1) + 3]! *
            (cellLocalX - 1 + cellLocalY) +
          gridPoints[basePointOffset + 2 * (gridColumnCount + 1) + 1]! * (1 - cellLocalX) +
          gridPoints[basePointOffset + 3]! * (1 - cellLocalY)
      }
    }
  }

  /**
   * Counts all grid control points including the final row and column.
   * @returns Number of interleaved grid control points stored in the runtime buffers.
   */
  GridBaseData.prototype.getGridPointCount = function (): number {
    return (this.gridColumnCount + 1) * (this.gridRowCount + 1)
  }

  /**
   * Returns the Cubism2 base-data discriminator for type-65 grid records.
   * @returns Grid base-data type marker used by target-base dependency logic.
   */
  GridBaseData.prototype.getType = function (): number {
    return Cubism2BaseData.TYPE_GRID
  }

  /**
   * Initializes a grid base-data runtime context derived from the shared Cubism2 base context.
   * @param baseData Grid base-data definition that owns this runtime context.
   * @returns Nothing; the context stores target-base indexes and transformed point buffers.
   */
  function Cubism2GridContext(
    this: Cubism2GridContextInstance,
    baseData: Cubism2GridBaseDataInstance,
  ): void {
    Cubism2BaseContext.prototype.constructor.call(this, baseData)
    this.targetBaseDataIndex = Cubism2BaseData.UNRESOLVED_BASE_DATA_INDEX
    this.localPoints = null
    this.targetSpacePoints = null
  }

  const GridContext = Cubism2GridContext as unknown as Cubism2GridContextConstructor
  GridContext.prototype = new Cubism2BaseContext() as Cubism2GridContextInstance

  return {
    Cubism2GridBaseData: GridBaseData,
    Cubism2GridContext: GridContext,
  }
}
