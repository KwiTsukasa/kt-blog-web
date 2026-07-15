import type { Cubism2RuntimeConstantsLike } from './runtimeConstants'

declare const Exception: ErrorConstructor

export interface Cubism2ParamBindingReader {
  readInt32: () => number
  readObject: () => unknown
}

export interface Cubism2ParamBindingInstance {
  cachedParamGeneration: number
  cachedParamIndex: number
  getInterpolationWeight: () => number
  getLowerPointIndex: () => number
  getParamID: () => unknown
  getParamIndex: (paramGeneration: number) => number
  getPointCount: () => number
  getPointValues: () => ArrayLike<number> | null
  interpolationWeight: number
  lowerPointIndex: number
  paramId: unknown | null
  paramPointCount: number
  paramPointValues: ArrayLike<number> | null
  readParamBinding: (reader: Cubism2ParamBindingReader) => void
  cacheParamIndex: (paramIndex: number, paramGeneration: number) => void
  setInterpolationWeight: (interpolationWeight: number) => void
  setLowerPointIndex: (lowerPointIndex: number) => void
  setParamID: (paramId: unknown) => void
  setPointValues: (pointCount: number, pointValues: ArrayLike<number>) => void
}

export interface Cubism2ParamBindingConstructor {
  UNRESOLVED_PARAM_INDEX: number
  new (): Cubism2ParamBindingInstance
  prototype: Cubism2ParamBindingInstance
}

export interface Cubism2ParamBindingSetInstance {
  addParamBinding: (paramId: unknown, pointCount: number, pointValues: ArrayLike<number>) => void
  bindings: Cubism2ParamBindingInstance[] | null
  buildInterpolationCorners(
    cornerIndexes: ArrayLike<number> & Record<number, number>,
    cornerWeights: ArrayLike<number> & Record<number, number>,
    interpolatedAxisCount: number,
  ): void
  dumpPointForIndex: (flattenedIndex: number) => void
  getBindings: () => Cubism2ParamBindingInstance[] | null
  getParamCount: () => number
  hasChangedParams(modelContext: Cubism2ParamBindingModelContextLike): boolean
  initBindingList: () => void
  readParamBindingSet: (reader: Cubism2ParamBindingReader) => void
  resolveInterpolationWeights(
    modelContext: Cubism2ParamBindingModelContextLike,
    dirtyFlagRef: boolean[],
  ): number
}

export interface Cubism2ParamBindingSetConstructor {
  new (): Cubism2ParamBindingSetInstance
  prototype: Cubism2ParamBindingSetInstance
}

export interface Cubism2ParamBindingConstructors {
  Cubism2ParamBinding: Cubism2ParamBindingConstructor
  Cubism2ParamBindingSet: Cubism2ParamBindingSetConstructor
}

export type Cubism2ParamBindingRuntimeConstantsLike = Pick<
  Cubism2RuntimeConstantsLike,
  'PARAM_VALUE_EPSILON' | 'maxInterpolationCornerCount'
>

export interface Cubism2ParamBindingLive2DFlags {
  shouldThrowOnInvalidInterpolationCorner: boolean
}

export interface Cubism2ParamBindingModelContextLike {
  getParamCacheGeneration: () => number
  getParamFloat: (paramIndex: number) => number
  getParamIndex: (paramId: unknown) => number
  isInitialParamUpdatePending: () => boolean
  isParamChanged: (paramIndex: number) => boolean
}

export interface CreateCubism2ParamBindingsOptions {
  Cubism2RuntimeConstants: Cubism2ParamBindingRuntimeConstantsLike
  Live2D: Cubism2ParamBindingLive2DFlags
  isBootstrapping: () => boolean
}

/**
 * Creates Cubism2 parameter binding constructors that resolve interpolation-grid coordinates.
 * @param options Runtime constants, debug flags, and prototype-bootstrap state from the SDK2 capsule.
 * @returns Parameter binding and binding-set constructors bound to the supplied runtime dependencies.
 */
export function createCubism2ParamBindings(
  options: CreateCubism2ParamBindingsOptions,
): Cubism2ParamBindingConstructors {
  const { Cubism2RuntimeConstants, Live2D, isBootstrapping } = options

  /**
   * Represents one Cubism2 parameter axis used to choose interpolation points.
   */
  function Cubism2ParamBinding(this: Cubism2ParamBindingInstance): void {
    if (isBootstrapping()) {
      return
    }

    this.paramPointCount = 0
    this.paramId = null
    this.paramPointValues = null
    this.cachedParamIndex = Binding.UNRESOLVED_PARAM_INDEX
    this.cachedParamGeneration = -1
    this.lowerPointIndex = 0
    this.interpolationWeight = 0
  }

  const Binding = Cubism2ParamBinding as unknown as Cubism2ParamBindingConstructor
  Binding.UNRESOLVED_PARAM_INDEX = -2

  /**
   * Reads one parameter interpolation axis from the MOC object stream.
   * @param reader Binary reader positioned at the parameter binding body.
   * @returns Nothing; the binding receives ID, point count, and authored point values.
   */
  Binding.prototype.readParamBinding = function (reader: Cubism2ParamBindingReader): void {
    this.paramId = reader.readObject()
    this.paramPointCount = reader.readInt32()
    this.paramPointValues = reader.readObject() as ArrayLike<number>
  }

  /**
   * Reads the cached model parameter index for the current model generation.
   * @param paramGeneration ModelContext parameter-cache generation used to invalidate stale indexes.
   * @returns Cached model parameter index, or `UNRESOLVED_PARAM_INDEX` when it must be resolved again.
   */
  Binding.prototype.getParamIndex = function (paramGeneration: number): number {
    if (this.cachedParamGeneration != paramGeneration) {
      this.cachedParamIndex = Binding.UNRESOLVED_PARAM_INDEX
    }
    return this.cachedParamIndex
  }

  /**
   * Stores a resolved model parameter index together with the generation that produced it.
   * @param paramIndex ModelContext parameter index for `paramId`.
   * @param paramGeneration ModelContext parameter-cache generation that validates the cached index.
   * @returns Nothing; the cache fields are updated in place.
   */
  Binding.prototype.cacheParamIndex = function (paramIndex: number, paramGeneration: number): void {
    this.cachedParamIndex = paramIndex
    this.cachedParamGeneration = paramGeneration
  }

  /**
   * Reads the parameter ID used by this interpolation axis.
   * @returns ParamID decoded from the MOC stream.
   */
  Binding.prototype.getParamID = function (): unknown {
    return this.paramId
  }

  /**
   * Sets the parameter ID when constructing a binding programmatically.
   * @param paramId ParamID that should drive this interpolation axis.
   * @returns Nothing; the ID is stored on the binding.
   */
  Binding.prototype.setParamID = function (paramId: unknown): void {
    this.paramId = paramId
  }

  /**
   * Reads the number of authored grid points for this parameter axis.
   * @returns Count of values in `paramPointValues`.
   */
  Binding.prototype.getPointCount = function (): number {
    return this.paramPointCount
  }

  /**
   * Reads the sorted authored parameter values used as grid points.
   * @returns Array-like set of parameter values decoded from the MOC stream.
   */
  Binding.prototype.getPointValues = function (): ArrayLike<number> | null {
    return this.paramPointValues
  }

  /**
   * Stores authored grid points when creating a binding without the binary reader.
   * @param pointCount Number of authored parameter values.
   * @param pointValues Parameter values ordered the same way as MOC point data.
   * @returns Nothing; point metadata is stored on the binding.
   */
  Binding.prototype.setPointValues = function (
    pointCount: number,
    pointValues: ArrayLike<number>,
  ): void {
    this.paramPointCount = pointCount
    this.paramPointValues = pointValues
  }

  /**
   * Reads the lower grid-point index selected during the last interpolation resolve.
   * @returns Lower point index for this parameter axis.
   */
  Binding.prototype.getLowerPointIndex = function (): number {
    return this.lowerPointIndex
  }

  /**
   * Stores the lower grid-point index selected for the current model parameter value.
   * @param lowerPointIndex Lower point index used by the interpolation corner builder.
   * @returns Nothing; the selected lower point is stored on the binding.
   */
  Binding.prototype.setLowerPointIndex = function (lowerPointIndex: number): void {
    this.lowerPointIndex = lowerPointIndex
  }

  /**
   * Reads the interpolation weight between lower and upper grid points.
   * @returns Zero for exact/out-of-range values, otherwise the normalized interpolation weight.
   */
  Binding.prototype.getInterpolationWeight = function (): number {
    return this.interpolationWeight
  }

  /**
   * Stores the interpolation weight selected for the current model parameter value.
   * @param interpolationWeight Normalized interpolation weight written into the scratch weight buffer.
   * @returns Nothing; the selected interpolation weight is stored on the binding.
   */
  Binding.prototype.setInterpolationWeight = function (interpolationWeight: number): void {
    this.interpolationWeight = interpolationWeight
  }

  /**
   * Holds the parameter axes that address a Cubism2 interpolation grid.
   */
  function Cubism2ParamBindingSet(this: Cubism2ParamBindingSetInstance): void {
    if (isBootstrapping()) {
      return
    }

    this.bindings = null
  }

  const BindingSet = Cubism2ParamBindingSet as unknown as Cubism2ParamBindingSetConstructor

  /**
   * Initializes an empty binding list for programmatic MOC object construction.
   * @returns Nothing; the binding list is reset to an empty array.
   */
  BindingSet.prototype.initBindingList = function (): void {
    this.bindings = new Array()
  }

  /**
   * Reads the binding list from the MOC object stream.
   * @param reader Binary reader positioned at the binding-set body.
   * @returns Nothing; `bindings` receives the decoded binding array.
   */
  BindingSet.prototype.readParamBindingSet = function (reader: Cubism2ParamBindingReader): void {
    this.bindings = reader.readObject() as Cubism2ParamBindingInstance[]
  }

  /**
   * Checks whether any bound model parameter changed since the previous resolve.
   * @param modelContext Model runtime context that owns parameter values and dirty flags.
   * @returns True when interpolation must be recalculated.
   */
  BindingSet.prototype.hasChangedParams = function (
    modelContext: Cubism2ParamBindingModelContextLike,
  ): boolean {
    if (modelContext.isInitialParamUpdatePending()) {
      return true
    }

    const paramGeneration = modelContext.getParamCacheGeneration()
    for (let bindingIndex = this.bindings!.length - 1; bindingIndex >= 0; --bindingIndex) {
      const binding = this.bindings![bindingIndex]!
      let paramIndex = binding.getParamIndex(paramGeneration)
      if (paramIndex == Binding.UNRESOLVED_PARAM_INDEX) {
        paramIndex = modelContext.getParamIndex(binding.getParamID())
      }
      if (modelContext.isParamChanged(paramIndex)) {
        return true
      }
    }
    return false
  }

  /**
   * Resolves each parameter axis to a lower point and optional interpolation weight.
   * @param modelContext Model runtime context that supplies current parameter values.
   * @param dirtyFlagRef Single-element boolean array flagged when a value is outside authored points.
   * @returns Number of axes that require interpolation between two neighboring points.
   */
  BindingSet.prototype.resolveInterpolationWeights = function (
    modelContext: Cubism2ParamBindingModelContextLike,
    dirtyFlagRef: boolean[],
  ): number {
    const bindingCount = this.bindings!.length
    const paramGeneration = modelContext.getParamCacheGeneration()
    let interpolatedAxisCount = 0

    for (let bindingIndex = 0; bindingIndex < bindingCount; bindingIndex++) {
      const binding = this.bindings![bindingIndex]!
      let paramIndex = binding.getParamIndex(paramGeneration)
      if (paramIndex == Binding.UNRESOLVED_PARAM_INDEX) {
        paramIndex = modelContext.getParamIndex(binding.getParamID())
        binding.cacheParamIndex(paramIndex, paramGeneration)
      }
      if (paramIndex < 0) {
        throw new Exception('err 23242 : ' + binding.getParamID())
      }

      const paramValue = paramIndex < 0 ? 0 : modelContext.getParamFloat(paramIndex)
      const pointCount = binding.getPointCount()
      const pointValues = binding.getPointValues()!
      let lowerPointIndex = -1
      let interpolationWeight = 0

      if (pointCount >= 1) {
        let previousPointValue = pointValues[0]!
        if (pointCount == 1) {
          if (
            previousPointValue - Cubism2RuntimeConstants.PARAM_VALUE_EPSILON < paramValue &&
            paramValue < previousPointValue + Cubism2RuntimeConstants.PARAM_VALUE_EPSILON
          ) {
            lowerPointIndex = 0
            interpolationWeight = 0
          } else {
            lowerPointIndex = 0
            dirtyFlagRef[0] = true
          }
        } else {
          if (paramValue < previousPointValue - Cubism2RuntimeConstants.PARAM_VALUE_EPSILON) {
            lowerPointIndex = 0
            dirtyFlagRef[0] = true
          } else if (paramValue < previousPointValue + Cubism2RuntimeConstants.PARAM_VALUE_EPSILON) {
            lowerPointIndex = 0
          } else {
            let foundRange = false
            for (let pointIndex = 1; pointIndex < pointCount; ++pointIndex) {
              const currentPointValue = pointValues[pointIndex]!
              if (paramValue < currentPointValue + Cubism2RuntimeConstants.PARAM_VALUE_EPSILON) {
                if (currentPointValue - Cubism2RuntimeConstants.PARAM_VALUE_EPSILON < paramValue) {
                  lowerPointIndex = pointIndex
                } else {
                  lowerPointIndex = pointIndex - 1
                  interpolationWeight =
                    (paramValue - previousPointValue) / (currentPointValue - previousPointValue)
                  interpolatedAxisCount++
                }
                foundRange = true
                break
              }
              previousPointValue = currentPointValue
            }
            if (!foundRange) {
              lowerPointIndex = pointCount - 1
              interpolationWeight = 0
              dirtyFlagRef[0] = true
            }
          }
        }
      }

      binding.setLowerPointIndex(lowerPointIndex)
      binding.setInterpolationWeight(interpolationWeight)
    }
    return interpolatedAxisCount
  }

  /**
   * Builds interpolation corner indexes and per-axis weights for the resolved grid position.
   * @param cornerIndexes Scratch buffer receiving grid corner indexes plus a sentinel.
   * @param cornerWeights Scratch buffer receiving interpolation weights plus a sentinel.
   * @param interpolatedAxisCount Number of axes with non-zero interpolation weight.
   * @returns Nothing; scratch buffers are filled in place for interpolation helpers.
   */
  BindingSet.prototype.buildInterpolationCorners = function (
    cornerIndexes: ArrayLike<number> & Record<number, number>,
    cornerWeights: ArrayLike<number> & Record<number, number>,
    interpolatedAxisCount: number,
  ): void {
    const cornerCount = 1 << interpolatedAxisCount
    if (cornerCount + 1 > Cubism2RuntimeConstants.maxInterpolationCornerCount) {
      console.log('err 23245\n')
    }

    const bindingCount = this.bindings!.length
    let pointStride = 1
    let weightSlotStride = 1
    let weightIndex = 0
    for (let cornerIndex = 0; cornerIndex < cornerCount; ++cornerIndex) {
      cornerIndexes[cornerIndex] = 0
    }
    for (let bindingIndex = 0; bindingIndex < bindingCount; ++bindingIndex) {
      const binding = this.bindings![bindingIndex]!
      if (binding.getInterpolationWeight() == 0) {
        const lowerPointOffset = binding.getLowerPointIndex() * pointStride
        if (lowerPointOffset < 0 && Live2D.shouldThrowOnInvalidInterpolationCorner) {
          throw new Exception('err 23246')
        }
        for (let cornerIndex = 0; cornerIndex < cornerCount; ++cornerIndex) {
          cornerIndexes[cornerIndex] = (cornerIndexes[cornerIndex] ?? 0) + lowerPointOffset
        }
      } else {
        const lowerPointOffset = pointStride * binding.getLowerPointIndex()
        const upperPointOffset = pointStride * (binding.getLowerPointIndex() + 1)
        for (let cornerIndex = 0; cornerIndex < cornerCount; ++cornerIndex) {
          cornerIndexes[cornerIndex] =
            (cornerIndexes[cornerIndex] ?? 0) +
            (((cornerIndex / weightSlotStride) | 0) % 2 == 0 ? lowerPointOffset : upperPointOffset)
        }
        cornerWeights[weightIndex++] = binding.getInterpolationWeight()
        weightSlotStride *= 2
      }
      pointStride *= binding.getPointCount()
    }
    cornerIndexes[cornerCount] = 65535
    cornerWeights[weightIndex] = -1
  }

  /**
   * Adds one parameter axis to the binding set for programmatic test/model construction.
   * @param paramId ParamID that drives the axis.
   * @param pointCount Number of authored parameter values.
   * @param pointValues Source parameter values copied into the binding.
   * @returns Nothing; a copied binding is appended to the binding set.
   */
  BindingSet.prototype.addParamBinding = function (
    paramId: unknown,
    pointCount: number,
    pointValues: ArrayLike<number>,
  ): void {
    const copiedPointValues = new Float32Array(pointCount)
    for (let pointIndex = 0; pointIndex < pointCount; ++pointIndex) {
      copiedPointValues[pointIndex] = pointValues[pointIndex]!
    }
    const binding = new Binding()
    binding.setParamID(paramId)
    binding.setPointValues(pointCount, copiedPointValues)
    this.bindings!.push(binding)
  }

  /**
   * Dumps the parameter values represented by one flattened grid-point index.
   * @param flattenedIndex Flattened MOC grid point index to decode.
   * @returns Nothing; values are emitted through the legacy console diagnostic path.
   */
  BindingSet.prototype.dumpPointForIndex = function (flattenedIndex: number): void {
    let remainingIndex = flattenedIndex
    const bindingCount = this.bindings!.length
    for (let bindingIndex = 0; bindingIndex < bindingCount; ++bindingIndex) {
      const binding = this.bindings![bindingIndex]!
      const pointCount = binding.getPointCount()
      const pointIndex = remainingIndex % binding.getPointCount()
      const pointValue = binding.getPointValues()![pointIndex]
      console.log('%s[%d]=%7.2f / ', binding.getParamID(), pointIndex, pointValue)
      remainingIndex /= pointCount
    }
    console.log('\n')
  }

  /**
   * Reads the number of parameter axes in this binding set.
   * @returns Binding count.
   */
  BindingSet.prototype.getParamCount = function (): number {
    return this.bindings!.length
  }

  /**
   * Reads all parameter axis bindings in MOC order.
   * @returns Binding records used by this interpolation grid.
   */
  BindingSet.prototype.getBindings = function (): Cubism2ParamBindingInstance[] | null {
    return this.bindings
  }

  return {
    Cubism2ParamBinding: Binding,
    Cubism2ParamBindingSet: BindingSet,
  }
}
