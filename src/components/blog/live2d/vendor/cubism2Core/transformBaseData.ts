import type { Cubism2BaseContextConstructor, Cubism2BaseContextInstance } from './baseContext'
import type {
  Cubism2BaseDataConstructor,
  Cubism2BaseDataInstance,
  Cubism2BaseDataReader,
} from './baseData'
import type { Cubism2MathStatic } from './math'
import type {
  Cubism2ParamBindingSetConstructor,
  Cubism2ParamBindingSetInstance,
} from './paramBinding'
import type {
  Cubism2TransformValueConstructor,
  Cubism2TransformValueInstance,
  Cubism2TransformValueLike,
} from './transformValue'

type MutableNumberArray = ArrayLike<number> & {
  [index: number]: number
}

type TransformFieldName =
  | 'translationX'
  | 'translationY'
  | 'scaleX'
  | 'scaleY'
  | 'rotationDegrees'

export interface Cubism2TransformModelContextLike {
  getBaseContext: (baseDataIndex: number) => Cubism2BaseContextInstance | null
  getBaseData: (baseDataIndex: number) => Cubism2TransformTargetBaseDataLike | null
  getBaseDataIndex: (targetBaseDataId: unknown) => number
  getScratchIndexBuffer: () => MutableNumberArray
  getScratchWeightBuffer: () => MutableNumberArray
}

export interface Cubism2TransformTargetBaseDataLike {
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

interface Cubism2TransformTargetSourceDataLike {
  getType: () => unknown
}

export interface Cubism2TransformContextInstance extends Cubism2BaseContextInstance {
  interpolatedTransform: Cubism2TransformValueInstance | null
  targetBaseDataIndex: number
  targetSpaceTransform: Cubism2TransformValueInstance | null
}

export interface Cubism2TransformBaseDataInstance extends Cubism2BaseDataInstance {
  createRuntimeContext: (modelContext: unknown) => Cubism2TransformContextInstance
  estimateTransformedDirection: (
    modelContext: unknown,
    targetBaseData: Cubism2TransformTargetBaseDataLike,
    targetBaseContext: unknown,
    sourcePosition: MutableNumberArray,
    directionProbe: MutableNumberArray,
    transformedDirection: MutableNumberArray,
  ) => void
  initTransformStorage: () => void
  paramBindingSet: Cubism2ParamBindingSetInstance | null
  readTransformBaseData: (reader: Cubism2BaseDataReader) => void
  transformPoints: (
    modelContext: unknown,
    baseContext: unknown,
    sourcePoints: unknown,
    targetPoints: unknown,
    pointCount: number,
    sourceOffset: number,
    pointStride: number,
  ) => void
  transformValues: ArrayLike<Cubism2TransformValueLike> | null
}

export interface Cubism2TransformBaseDataPayload {
  paramBindingSet: Cubism2ParamBindingSetInstance
  transformValues: ArrayLike<Cubism2TransformValueLike>
}

export interface Cubism2TransformBaseDataConstructor {
  directionProbeInputPoint: MutableNumberArray
  directionProbeOutputPoint: MutableNumberArray
  directionProbeSourcePoint: MutableNumberArray
  new (): Cubism2TransformBaseDataInstance
  paramDirtyFlagScratch: boolean[]
  prototype: Cubism2TransformBaseDataInstance
  scratchPosition: MutableNumberArray
  targetDirectionProbe: MutableNumberArray
  transformedDirectionProbe: MutableNumberArray
}

export interface Cubism2TransformContextConstructor {
  new (baseData: Cubism2TransformBaseDataInstance): Cubism2TransformContextInstance
  prototype: Cubism2TransformContextInstance
}

export interface Cubism2TransformBaseDataConstructors {
  Cubism2TransformBaseData: Cubism2TransformBaseDataConstructor
  Cubism2TransformContext: Cubism2TransformContextConstructor
}

export interface CreateCubism2TransformBaseDataOptions {
  Cubism2BaseContext: Cubism2BaseContextConstructor
  Cubism2BaseData: Cubism2BaseDataConstructor
  Cubism2Math: Pick<
    Cubism2MathStatic,
    'DEGREES_TO_RADIANS' | 'RADIANS_TO_DEGREES' | 'angleBetweenVectors'
  >
  Cubism2ParamBindingSet: Cubism2ParamBindingSetConstructor
  Cubism2TransformValue: Cubism2TransformValueConstructor
  Live2D: {
    isVerboseLoggingEnabled: () => boolean
  }
  UtDebug: {
    logWithLegacyPrefix: (message: string, ...args: unknown[]) => void
  }
  isBootstrapping: () => boolean
}

const TRANSFORM_FIELDS: TransformFieldName[] = [
  'translationX',
  'translationY',
  'scaleX',
  'scaleY',
  'rotationDegrees',
]

/**
 * Reads one numeric transform field from a corner sample.
 * @param samples Authored transform samples selected by the interpolation corner table.
 * @param cornerIndexes Resolved source indexes for the active interpolation hypercube.
 * @param cornerOffset Offset inside `cornerIndexes` to read.
 * @param field Transform field being interpolated.
 * @returns Authored scalar value from the selected transform sample.
 */
function readTransformField(
  samples: ArrayLike<Cubism2TransformValueLike>,
  cornerIndexes: ArrayLike<number>,
  cornerOffset: number,
  field: TransformFieldName,
): number {
  return samples[cornerIndexes[cornerOffset]!]![field]
}

/**
 * Interpolates one transform scalar for the source's zero-through-four-dimensional branches.
 * @param samples Authored transform samples selected by the interpolation corner table.
 * @param cornerIndexes Resolved source indexes for the active interpolation hypercube.
 * @param cornerWeights Per-axis interpolation weights produced by the param binding set.
 * @param gridDimensionCount Number of active interpolation axes.
 * @param field Transform field being interpolated.
 * @returns Interpolated scalar for the requested transform field.
 * @throws RangeError When called for the separately handled high-dimensional branch.
 */
function interpolateTransformField(
  samples: ArrayLike<Cubism2TransformValueLike>,
  cornerIndexes: ArrayLike<number>,
  cornerWeights: ArrayLike<number>,
  gridDimensionCount: number,
  field: TransformFieldName,
): number {
  if (gridDimensionCount <= 0) {
    return readTransformField(samples, cornerIndexes, 0, field)
  }
  if (gridDimensionCount === 1) {
    const firstValue = readTransformField(samples, cornerIndexes, 0, field)
    const secondValue = readTransformField(samples, cornerIndexes, 1, field)
    const xWeight = cornerWeights[0]!
    return firstValue + (secondValue - firstValue) * xWeight
  }
  if (gridDimensionCount === 2) {
    const xWeight = cornerWeights[0]!
    const yWeight = cornerWeights[1]!
    const bottomLeft = readTransformField(samples, cornerIndexes, 0, field)
    const bottomRight = readTransformField(samples, cornerIndexes, 1, field)
    const topLeft = readTransformField(samples, cornerIndexes, 2, field)
    const topRight = readTransformField(samples, cornerIndexes, 3, field)
    const bottomValue = bottomLeft + (bottomRight - bottomLeft) * xWeight
    const topValue = topLeft + (topRight - topLeft) * xWeight
    return bottomValue + (topValue - bottomValue) * yWeight
  }
  if (gridDimensionCount === 3) {
    const xWeight = cornerWeights[0]!
    const yWeight = cornerWeights[1]!
    const zWeight = cornerWeights[2]!
    const x00 = readTransformField(samples, cornerIndexes, 0, field)
    const x10 = readTransformField(samples, cornerIndexes, 1, field)
    const x01 = readTransformField(samples, cornerIndexes, 2, field)
    const x11 = readTransformField(samples, cornerIndexes, 3, field)
    const y00 = readTransformField(samples, cornerIndexes, 4, field)
    const y10 = readTransformField(samples, cornerIndexes, 5, field)
    const y01 = readTransformField(samples, cornerIndexes, 6, field)
    const y11 = readTransformField(samples, cornerIndexes, 7, field)
    const bottomX = x00 + (x10 - x00) * xWeight
    const topX = x01 + (x11 - x01) * xWeight
    const bottomY = y00 + (y10 - y00) * xWeight
    const topY = y01 + (y11 - y01) * xWeight
    return (1 - zWeight) * (bottomX + (topX - bottomX) * yWeight) + zWeight * (bottomY + (topY - bottomY) * yWeight)
  }
  if (gridDimensionCount === 4) {
    const xWeight = cornerWeights[0]!
    const yWeight = cornerWeights[1]!
    const zWeight = cornerWeights[2]!
    const wWeight = cornerWeights[3]!
    const x000 = readTransformField(samples, cornerIndexes, 0, field)
    const x100 = readTransformField(samples, cornerIndexes, 1, field)
    const x010 = readTransformField(samples, cornerIndexes, 2, field)
    const x110 = readTransformField(samples, cornerIndexes, 3, field)
    const x001 = readTransformField(samples, cornerIndexes, 4, field)
    const x101 = readTransformField(samples, cornerIndexes, 5, field)
    const x011 = readTransformField(samples, cornerIndexes, 6, field)
    const x111 = readTransformField(samples, cornerIndexes, 7, field)
    const y000 = readTransformField(samples, cornerIndexes, 8, field)
    const y100 = readTransformField(samples, cornerIndexes, 9, field)
    const y010 = readTransformField(samples, cornerIndexes, 10, field)
    const y110 = readTransformField(samples, cornerIndexes, 11, field)
    const y001 = readTransformField(samples, cornerIndexes, 12, field)
    const y101 = readTransformField(samples, cornerIndexes, 13, field)
    const y011 = readTransformField(samples, cornerIndexes, 14, field)
    const y111 = readTransformField(samples, cornerIndexes, 15, field)
    const xBottom0 = x000 + (x100 - x000) * xWeight
    const xTop0 = x010 + (x110 - x010) * xWeight
    const xBottom1 = x001 + (x101 - x001) * xWeight
    const xTop1 = x011 + (x111 - x011) * xWeight
    const yBottom0 = y000 + (y100 - y000) * xWeight
    const yTop0 = y010 + (y110 - y010) * xWeight
    const yBottom1 = y001 + (y101 - y001) * xWeight
    const yTop1 = y011 + (y111 - y011) * xWeight
    return (
      (1 - wWeight) *
        ((1 - zWeight) * (xBottom0 + (xTop0 - xBottom0) * yWeight) +
          zWeight * (xBottom1 + (xTop1 - xBottom1) * yWeight)) +
      wWeight *
        ((1 - zWeight) * (yBottom0 + (yTop0 - yBottom0) * yWeight) +
          zWeight * (yBottom1 + (yTop1 - yBottom1) * yWeight))
    )
  }

  throw new RangeError('High-dimensional transforms use the atomic accumulation branch')
}

/**
 * Writes all transform scalar fields and reflection flags into the runtime slot.
 * @param targetTransform Runtime transform slot receiving interpolated values.
 * @param samples Authored transform samples selected by the interpolation corner table.
 * @param cornerIndexes Resolved source indexes for the active interpolation hypercube.
 * @param cornerWeights Per-axis interpolation weights produced by the param binding set.
 * @param gridDimensionCount Number of active interpolation axes.
 */
function writeInterpolatedTransform(
  targetTransform: Cubism2TransformValueInstance,
  samples: ArrayLike<Cubism2TransformValueLike>,
  cornerIndexes: ArrayLike<number>,
  cornerWeights: ArrayLike<number>,
  gridDimensionCount: number,
): void {
  if (gridDimensionCount > 4) {
    var cornerCount = Math.pow(2, gridDimensionCount) | 0
    var highDimensionalCornerWeights = new Float32Array(cornerCount)
    for (var cornerIndex = 0; cornerIndex < cornerCount; cornerIndex++) {
      var bitCursor = cornerIndex
      var combinedWeight = 1
      for (var axisIndex = 0; axisIndex < gridDimensionCount; axisIndex++) {
        combinedWeight *=
          bitCursor % 2 === 0
            ? 1 - cornerWeights[axisIndex]!
            : cornerWeights[axisIndex]!
        bitCursor /= 2
      }
      highDimensionalCornerWeights[cornerIndex] = combinedWeight
    }

    var highDimensionalSamples = new Array<Cubism2TransformValueLike>()
    for (var sampleIndex = 0; sampleIndex < cornerCount; sampleIndex++) {
      highDimensionalSamples[sampleIndex] = samples[cornerIndexes[sampleIndex]!]!
    }

    var translationX = 0
    var translationY = 0
    var scaleX = 0
    var scaleY = 0
    var rotationDegrees = 0
    for (var sampleIndex = 0; sampleIndex < cornerCount; sampleIndex++) {
      var sampleWeight = highDimensionalCornerWeights[sampleIndex]!
      var sample = highDimensionalSamples[sampleIndex]!
      translationX += sampleWeight * sample.translationX
      translationY += sampleWeight * sample.translationY
      scaleX += sampleWeight * sample.scaleX
      scaleY += sampleWeight * sample.scaleY
      rotationDegrees += sampleWeight * sample.rotationDegrees
    }

    targetTransform.translationX = translationX
    targetTransform.translationY = translationY
    targetTransform.scaleX = scaleX
    targetTransform.scaleY = scaleY
    targetTransform.rotationDegrees = rotationDegrees
  } else {
    for (const field of TRANSFORM_FIELDS) {
      targetTransform[field] = interpolateTransformField(
        samples,
        cornerIndexes,
        cornerWeights,
        gridDimensionCount,
        field,
      )
    }
  }

  const firstCornerTransform = samples[cornerIndexes[0]!]!
  targetTransform.reflectX = firstCornerTransform.reflectX
  targetTransform.reflectY = firstCornerTransform.reflectY
}

/**
 * Reads the type-68 transform payload after the shared base-data ID header.
 * @param reader Cubism2 binary reader positioned after the shared base-data payload.
 * @returns Param binding set and authored transform samples from the transform-data payload.
 */
function readCubism2TransformBaseDataPayload(
  reader: Cubism2BaseDataReader,
): Cubism2TransformBaseDataPayload {
  const paramBindingSet = reader.readObject() as Cubism2ParamBindingSetInstance
  const transformValues = reader.readObject() as ArrayLike<Cubism2TransformValueLike>

  return {
    paramBindingSet,
    transformValues,
  }
}

/**
 * Applies a decoded type-68 payload to a transform base-data object.
 * @param transformBaseData Target type-68 record that owns interpolation bindings.
 * @param payload Payload returned by `readCubism2TransformBaseDataPayload`.
 * @returns Nothing; mutates the transform base data in the same order as min.js fields.
 */
function applyCubism2TransformBaseDataPayload(
  transformBaseData: Cubism2TransformBaseDataInstance,
  payload: Cubism2TransformBaseDataPayload,
): void {
  transformBaseData.paramBindingSet = payload.paramBindingSet
  transformBaseData.transformValues = payload.transformValues
}

/**
 * Creates Cubism2 transform base-data constructors from the extracted min.js domain.
 * @param options Base-data, context, transform-value, math, and debug dependencies from the runtime Core composition.
 * @returns Transform base-data and runtime-context constructors.
 */
export function createCubism2TransformBaseData(
  options: CreateCubism2TransformBaseDataOptions,
): Cubism2TransformBaseDataConstructors {
  const {
    Cubism2BaseContext,
    Cubism2BaseData,
    Cubism2Math,
    Cubism2ParamBindingSet,
    Cubism2TransformValue,
    Live2D,
    UtDebug,
    isBootstrapping,
  } = options

  /**
   * Holds type-68 transform base data: param bindings plus authored type-69 transform samples.
   * @returns Nothing; MOC reader payload fills `paramBindingSet` and `transformValues`.
   */
  function Cubism2TransformBaseData(this: Cubism2TransformBaseDataInstance): void {
    if (isBootstrapping()) {
      return
    }
    Cubism2BaseData.prototype.constructor.call(this)
    this.paramBindingSet = null
    this.transformValues = null
  }

  const TransformBaseData =
    Cubism2TransformBaseData as unknown as Cubism2TransformBaseDataConstructor
  TransformBaseData.prototype = new Cubism2BaseData() as Cubism2TransformBaseDataInstance
  TransformBaseData.scratchPosition = new Float32Array(2)
  TransformBaseData.targetDirectionProbe = new Float32Array(2)
  TransformBaseData.transformedDirectionProbe = new Float32Array(2)
  TransformBaseData.directionProbeSourcePoint = new Float32Array(2)
  TransformBaseData.directionProbeOutputPoint = new Float32Array(2)
  TransformBaseData.directionProbeInputPoint = new Float32Array(2)
  TransformBaseData.paramDirtyFlagScratch = []

  /**
   * Initializes an empty transform grid before legacy reader payloads are attached.
   * @returns Nothing; allocates the param binding set and authored transform-value list.
   */
  TransformBaseData.prototype.initTransformStorage = function (): void {
    this.paramBindingSet = new Cubism2ParamBindingSet()
    this.paramBindingSet.initBindingList()
    this.transformValues = []
  }

  /**
   * Returns the Cubism2 base-data type handled by this object.
   * @returns Transform base-data discriminator used by linked target-base logic.
   */
  TransformBaseData.prototype.getType = function (): number {
    return Cubism2BaseData.TYPE_TRANSFORM
  }

  /**
   * Reads a type-68 transform base-data record from the MOC stream.
   * @param reader Cubism2 binary reader positioned at the transform base-data payload.
   * @returns Nothing; shared base header and optional v2 opacity values are read in order.
   */
  TransformBaseData.prototype.readTransformBaseData = function (
    reader: Cubism2BaseDataReader,
  ): void {
    Cubism2BaseData.prototype.readBaseData.call(this, reader)
    applyCubism2TransformBaseDataPayload(this, readCubism2TransformBaseDataPayload(reader))
    Cubism2BaseData.prototype.readV2Opacity.call(this, reader)
  }

  /**
   * Creates the runtime context that stores the current interpolated transform.
   * @param modelContext Model context passed by the shared base-data initializer; unused here.
   * @returns Runtime context for this transform base data.
   */
  TransformBaseData.prototype.createRuntimeContext = function (
    modelContext: unknown,
  ): Cubism2TransformContextInstance {
    void modelContext
    const transformContext = new TransformContext(this)
    transformContext.interpolatedTransform = new Cubism2TransformValue()
    if (this.hasTargetBaseData()) {
      transformContext.targetSpaceTransform = new Cubism2TransformValue()
    }
    return transformContext
  }

  /**
   * Updates opacity and transform values from the current parameter grid position.
   * @param modelContext Runtime model context that exposes parameter values and scratch buffers.
   * @param transformContext Runtime context receiving interpolated transform and opacity state.
   * @returns Nothing; no-op when the bound parameters have not changed.
   */
  TransformBaseData.prototype.updateRuntimeContext = function (
    modelContext: unknown,
    transformContext: unknown,
  ): void {
    const runtimeModelContext = modelContext as Cubism2TransformModelContextLike
    const runtimeContext = transformContext as Cubism2TransformContextInstance
    if (!(this === runtimeContext.getSourceData())) {
      console.log('### assert!! ### ')
    }
    if (!this.paramBindingSet!.hasChangedParams(runtimeModelContext as never)) {
      return
    }

    const paramChangedScratch = TransformBaseData.paramDirtyFlagScratch
    paramChangedScratch[0] = false
    const gridDimensionCount = this.paramBindingSet!.resolveInterpolationWeights(
      runtimeModelContext as never,
      paramChangedScratch,
    )
    runtimeContext.setTransformFlag(paramChangedScratch[0]!)
    this.interpolateOpacity(
      runtimeModelContext,
      this.paramBindingSet!,
      runtimeContext,
      paramChangedScratch,
    )

    const cornerIndexes = runtimeModelContext.getScratchIndexBuffer()
    const cornerWeights = runtimeModelContext.getScratchWeightBuffer()
    this.paramBindingSet!.buildInterpolationCorners(
      cornerIndexes,
      cornerWeights,
      gridDimensionCount,
    )
    writeInterpolatedTransform(
      runtimeContext.interpolatedTransform!,
      this.transformValues!,
      cornerIndexes,
      cornerWeights,
      gridDimensionCount,
    )
  }

  /**
   * Applies this transform context to its target base data or directly to total scale/opacity.
   * @param modelContext Runtime model context used to resolve target base-data indexes.
   * @param transformContext Runtime context produced by `createRuntimeContext`.
   * @returns Nothing; writes target-space transform, total scale, total opacity, and active flag.
   */
  TransformBaseData.prototype.applyRuntimeContext = function (
    modelContext: unknown,
    transformContext: unknown,
  ): void {
    const runtimeModelContext = modelContext as Cubism2TransformModelContextLike
    const runtimeContext = transformContext as Cubism2TransformContextInstance
    if (!(this === runtimeContext.getSourceData())) {
      console.log('### assert!! ### ')
    }
    runtimeContext.setActive(true)
    if (!this.hasTargetBaseData()) {
      runtimeContext.setTotalScaleNotForClient(runtimeContext.interpolatedTransform!.scaleX)
      runtimeContext.setTotalOpacity(runtimeContext.getInterpolatedOpacity())
      return
    }

    const targetBaseDataId = this.getTargetBaseDataID()
    if (runtimeContext.targetBaseDataIndex === Cubism2BaseData.UNRESOLVED_BASE_DATA_INDEX) {
      runtimeContext.targetBaseDataIndex = runtimeModelContext.getBaseDataIndex(targetBaseDataId)
    }
    if (runtimeContext.targetBaseDataIndex < 0) {
      if (Live2D.isVerboseLoggingEnabled()) {
        UtDebug.logWithLegacyPrefix('Target base data was not found: %s', targetBaseDataId)
      }
      runtimeContext.setActive(false)
      return
    }

    const targetBaseData = runtimeModelContext.getBaseData(runtimeContext.targetBaseDataIndex)
    if (targetBaseData == null) {
      runtimeContext.setActive(false)
      return
    }

    const targetBaseContext = runtimeModelContext.getBaseContext(
      runtimeContext.targetBaseDataIndex,
    )!

    const scratchPosition = TransformBaseData.scratchPosition
    scratchPosition[0] = runtimeContext.interpolatedTransform!.translationX
    scratchPosition[1] = runtimeContext.interpolatedTransform!.translationY
    const targetDirectionProbe = TransformBaseData.targetDirectionProbe
    targetDirectionProbe[0] = 0
    targetDirectionProbe[1] = -0.1
    const targetBaseType = (
      targetBaseContext.getSourceData() as Cubism2TransformTargetSourceDataLike
    ).getType()
    if (targetBaseType === Cubism2BaseData.TYPE_TRANSFORM) {
      targetDirectionProbe[1] = -10
    } else {
      targetDirectionProbe[1] = -0.1
    }
    const transformedDirectionProbe = TransformBaseData.transformedDirectionProbe
    this.estimateTransformedDirection(
      modelContext,
      targetBaseData,
      targetBaseContext,
      scratchPosition,
      targetDirectionProbe,
      transformedDirectionProbe,
    )
    const targetRotationRadians = Cubism2Math.angleBetweenVectors(
      targetDirectionProbe as unknown as readonly number[],
      transformedDirectionProbe as unknown as readonly number[],
    )
    targetBaseData.transformPoints(
      modelContext,
      targetBaseContext,
      scratchPosition,
      scratchPosition,
      1,
      0,
      2,
    )

    runtimeContext.targetSpaceTransform!.translationX = scratchPosition[0]!
    runtimeContext.targetSpaceTransform!.translationY = scratchPosition[1]!
    runtimeContext.targetSpaceTransform!.scaleX = runtimeContext.interpolatedTransform!.scaleX
    runtimeContext.targetSpaceTransform!.scaleY = runtimeContext.interpolatedTransform!.scaleY
    runtimeContext.targetSpaceTransform!.rotationDegrees =
      runtimeContext.interpolatedTransform!.rotationDegrees -
      targetRotationRadians * Cubism2Math.RADIANS_TO_DEGREES
    const targetTotalScale = targetBaseContext.getTotalScale()
    runtimeContext.setTotalScaleNotForClient(
      targetTotalScale * runtimeContext.targetSpaceTransform!.scaleX,
    )
    const targetTotalOpacity = targetBaseContext.getTotalOpacity()
    runtimeContext.setTotalOpacity(
      targetTotalOpacity * runtimeContext.getInterpolatedOpacity(),
    )
    runtimeContext.targetSpaceTransform!.reflectX =
      runtimeContext.interpolatedTransform!.reflectX
    runtimeContext.targetSpaceTransform!.reflectY =
      runtimeContext.interpolatedTransform!.reflectY
    runtimeContext.setActive(targetBaseContext.isRenderable())
  }

  /**
   * Transforms interleaved x/y vertices through the current transform context.
   * @param modelContext Runtime model context kept for the legacy polymorphic signature.
   * @param baseContext Runtime base context that supplies total scale and transform values.
   * @param sourcePoints Interleaved x/y source point array.
   * @param targetPoints Interleaved x/y output point array.
   * @param pointCount Number of logical points to transform.
   * @param sourceOffset First element offset inside the interleaved point arrays.
   * @param pointStride Distance between adjacent logical points in the interleaved arrays.
   * @returns Nothing; writes transformed points into `targetPoints`.
   */
  TransformBaseData.prototype.transformPoints = function (
    modelContext: unknown,
    baseContext: unknown,
    sourcePoints: unknown,
    targetPoints: unknown,
    pointCount: number,
    sourceOffset: number,
    pointStride: number,
  ): void {
    void modelContext
    const runtimeContext = baseContext as Cubism2TransformContextInstance
    const sourcePointBuffer = sourcePoints as MutableNumberArray
    const targetPointBuffer = targetPoints as MutableNumberArray
    if (!(this === runtimeContext.getSourceData())) {
      console.log('### assert!! ### ')
    }

    const transformValue =
      runtimeContext.targetSpaceTransform != null
        ? runtimeContext.targetSpaceTransform
        : runtimeContext.interpolatedTransform!
    const sinRotation = Math.sin(Cubism2Math.DEGREES_TO_RADIANS * transformValue.rotationDegrees)
    const cosRotation = Math.cos(Cubism2Math.DEGREES_TO_RADIANS * transformValue.rotationDegrees)
    const totalScale = runtimeContext.getTotalScale()
    const reflectXSign = transformValue.reflectX ? -1 : 1
    const reflectYSign = transformValue.reflectY ? -1 : 1
    const matrixA = cosRotation * totalScale * reflectXSign
    const matrixB = -sinRotation * totalScale * reflectYSign
    const matrixC = sinRotation * totalScale * reflectXSign
    const matrixD = cosRotation * totalScale * reflectYSign
    const translationX = transformValue.translationX
    const translationY = transformValue.translationY
    const sourceEnd = pointCount * pointStride
    for (let sourceIndex = sourceOffset; sourceIndex < sourceEnd; sourceIndex += pointStride) {
      const sourceX = sourcePointBuffer[sourceIndex]!
      const sourceY = sourcePointBuffer[sourceIndex + 1]!
      targetPointBuffer[sourceIndex] = matrixA * sourceX + matrixB * sourceY + translationX
      targetPointBuffer[sourceIndex + 1] = matrixC * sourceX + matrixD * sourceY + translationY
    }
  }

  /**
   * Estimates how a short direction vector changes after a target base-data transform.
   * @param modelContext Runtime model context required by the base-data transform method.
   * @param targetBaseData Base data that owns the target transform method.
   * @param targetBaseContext Runtime context for `targetBaseData`.
   * @param sourcePosition Scratch x/y point in source transform space.
   * @param directionProbe Small x/y vector sampled around `sourcePosition`.
   * @param transformedDirection Output x/y vector after target-base transformation.
   * @returns Nothing; writes the first non-zero transformed probe direction.
   */
  TransformBaseData.prototype.estimateTransformedDirection = function (
    modelContext: unknown,
    targetBaseData: Cubism2TransformTargetBaseDataLike,
    targetBaseContext: unknown,
    sourcePosition: MutableNumberArray,
    directionProbe: MutableNumberArray,
    transformedDirection: MutableNumberArray,
  ): void {
    const runtimeTargetBaseContext = targetBaseContext as Cubism2BaseContextInstance
    if (!(targetBaseData === runtimeTargetBaseContext.getSourceData())) {
      console.log('### assert!! ### ')
    }
    const sourcePoint = TransformBaseData.directionProbeSourcePoint
    sourcePoint[0] = sourcePosition[0]!
    sourcePoint[1] = sourcePosition[1]!
    targetBaseData.transformPoints(
      modelContext,
      runtimeTargetBaseContext,
      sourcePoint,
      sourcePoint,
      1,
      0,
      2,
    )

    const transformedProbePoint = TransformBaseData.directionProbeOutputPoint
    const probeInputPoint = TransformBaseData.directionProbeInputPoint
    const maxProbeAttempts = 10
    let probeDistance = 1
    for (let attemptIndex = 0; attemptIndex < maxProbeAttempts; attemptIndex += 1) {
      probeInputPoint[0] = sourcePosition[0]! + probeDistance * directionProbe[0]!
      probeInputPoint[1] = sourcePosition[1]! + probeDistance * directionProbe[1]!
      targetBaseData.transformPoints(
        modelContext,
        runtimeTargetBaseContext,
        probeInputPoint,
        transformedProbePoint,
        1,
        0,
        2,
      )
      transformedProbePoint[0] = transformedProbePoint[0]! - sourcePoint[0]!
      transformedProbePoint[1] = transformedProbePoint[1]! - sourcePoint[1]!
      if (transformedProbePoint[0] !== 0 || transformedProbePoint[1] !== 0) {
        transformedDirection[0] = transformedProbePoint[0]!
        transformedDirection[1] = transformedProbePoint[1]!
        return
      }

      probeInputPoint[0] = sourcePosition[0]! - probeDistance * directionProbe[0]!
      probeInputPoint[1] = sourcePosition[1]! - probeDistance * directionProbe[1]!
      targetBaseData.transformPoints(
        modelContext,
        runtimeTargetBaseContext,
        probeInputPoint,
        transformedProbePoint,
        1,
        0,
        2,
      )
      transformedProbePoint[0] -= sourcePoint[0]!
      transformedProbePoint[1] -= sourcePoint[1]!
      if (transformedProbePoint[0] !== 0 || transformedProbePoint[1] !== 0) {
        transformedProbePoint[0] = -transformedProbePoint[0]!
        transformedProbePoint[0] = -transformedProbePoint[0]!
        transformedDirection[0] = transformedProbePoint[0]!
        transformedDirection[1] = transformedProbePoint[1]!
        return
      }
      probeDistance *= 0.1
    }
    if (Live2D.isVerboseLoggingEnabled()) {
      console.log('Failed to estimate transformed direction.\n')
    }
  }

  /**
   * Initializes a legacy base-data runtime context derived from the shared Cubism2 base context.
   * @param baseData Source base-data definition that owns this runtime context.
   * @returns Nothing; the context stores target-base indexes and temporary transformed buffers.
   */
  function Cubism2TransformContext(
    this: Cubism2TransformContextInstance,
    baseData: Cubism2TransformBaseDataInstance,
  ): void {
    Cubism2BaseContext.prototype.constructor.call(this, baseData)
    this.targetBaseDataIndex = Cubism2BaseData.UNRESOLVED_BASE_DATA_INDEX
    this.interpolatedTransform = null
    this.targetSpaceTransform = null
  }

  const TransformContext =
    Cubism2TransformContext as unknown as Cubism2TransformContextConstructor
  TransformContext.prototype = new Cubism2BaseContext() as Cubism2TransformContextInstance

  return {
    Cubism2TransformBaseData: TransformBaseData,
    Cubism2TransformContext: TransformContext,
  }
}
