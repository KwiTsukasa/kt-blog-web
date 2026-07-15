export interface Cubism2BaseDataIdLike {
  getDefaultBaseDataID: () => unknown
}

export interface Cubism2BaseDataMocVersionLike {
  LIVE2D_FORMAT_VERSION_V2_10_SDK2: number
}

export interface Cubism2BaseDataOpacityInterpolator {
  interpolateFloat(
    modelContext: unknown,
    paramBindingSet: unknown,
    dirtyFlagRef: boolean[],
    opacityValues: number[],
  ): number
}

export interface Cubism2BaseDataReader {
  getFormatVersion: () => number
  readFloat32Array: () => number[] | null | undefined
  readObject: () => unknown
}

export interface Cubism2BaseDataRuntimeContext {
  setInterpolatedOpacity: (opacity: number) => void
}

export interface Cubism2BaseDataInstance {
  applyRuntimeContext: (modelContext: unknown, runtimeContext: unknown) => void
  transformPoints: (
    modelContext: unknown,
    sourceContext: unknown,
    outputPoints: unknown,
    optionalOutputPoints: unknown,
    pointCount: number,
    outputOffset: number,
    outputStride: number,
  ) => void
  updateRuntimeContext: (modelContext: unknown, runtimeContext: unknown) => void
  baseDataId: unknown | null
  getBaseDataID: () => unknown | null
  getTargetBaseDataID: () => unknown | null
  getType: () => unknown
  hasTargetBaseData: () => boolean
  createRuntimeContext: (modelContext: unknown) => unknown
  interpolateOpacity: (
    modelContext: unknown,
    paramBindingSet: unknown,
    runtimeContext: Cubism2BaseDataRuntimeContext,
    dirtyFlagRef: boolean[],
  ) => void
  opacityValues: number[] | null | undefined
  readBaseData: (reader: Cubism2BaseDataReader) => void
  readV2Opacity: (reader: Cubism2BaseDataReader) => void
  setBaseDataID: (baseDataId: unknown) => void
  setTargetBaseDataID: (targetBaseDataId: unknown) => void
  targetBaseDataId: unknown | null
}

export interface Cubism2BaseDataConstructor {
  new (): Cubism2BaseDataInstance
  TYPE_GRID: number
  TYPE_TRANSFORM: number
  UNRESOLVED_BASE_DATA_INDEX: number
  prototype: Cubism2BaseDataInstance
}

export interface CreateCubism2BaseDataOptions {
  BaseDataID: Cubism2BaseDataIdLike
  Cubism2MocVersion: Cubism2BaseDataMocVersionLike
  interpolator: Cubism2BaseDataOpacityInterpolator
  isBootstrapping: () => boolean
}

/**
 * Creates the shared Cubism2 base-data constructor used by transform and grid data.
 * @param options Runtime dependencies required for target-base checks and opacity interpolation.
 * @returns Base-data constructor bound to the supplied runtime Core dependencies.
 */
export function createCubism2BaseData(
  options: CreateCubism2BaseDataOptions,
): Cubism2BaseDataConstructor {
  /**
   * Stores common Cubism2 base-data identity and opacity-timeline payload.
   */
  function Cubism2BaseData(this: Cubism2BaseDataInstance): void {
    if (options.isBootstrapping()) {
      return
    }

    this.baseDataId = null
    this.targetBaseDataId = null
    this.opacityValues = null
  }

  const BaseData = Cubism2BaseData as unknown as Cubism2BaseDataConstructor

  BaseData.UNRESOLVED_BASE_DATA_INDEX = -2
  BaseData.TYPE_TRANSFORM = 1
  BaseData.TYPE_GRID = 2

  /**
   * Reads the shared base-data IDs from a Cubism2 MOC object payload.
   * @param reader Binary reader positioned at the shared base-data header.
   * @returns Nothing; base and target base IDs are stored on this data object.
   */
  BaseData.prototype.readBaseData = function (reader: Cubism2BaseDataReader): void {
    this.baseDataId = reader.readObject()
    this.targetBaseDataId = reader.readObject()
  }

  /**
   * Reads optional SDK2 v2.10 opacity interpolation values.
   * @param reader Binary reader whose format version decides whether opacity values exist.
   * @returns Nothing; opacity values remain null for older MOC payloads.
   */
  BaseData.prototype.readV2Opacity = function (reader: Cubism2BaseDataReader): void {
    if (
      reader.getFormatVersion() >=
      options.Cubism2MocVersion.LIVE2D_FORMAT_VERSION_V2_10_SDK2
    ) {
      this.opacityValues = reader.readFloat32Array()
    }
  }

  /**
   * Creates a runtime context for this base data.
   * @param modelContext Model context that owns the runtime context list.
   * @returns Runtime context in subclasses; the shared base hook returns nothing.
   */
  BaseData.prototype.createRuntimeContext = function (modelContext: unknown): unknown {
    void modelContext
    return undefined
  }

  /**
   * Updates parameter-dependent runtime state before dependency propagation.
   * @param modelContext Runtime model context supplying parameter values and scratch buffers.
   * @param runtimeContext Runtime context paired with this data object.
   * @returns Nothing; concrete subclasses perform the update.
   */
  BaseData.prototype.updateRuntimeContext = function (
    modelContext: unknown,
    runtimeContext: unknown,
  ): void {
    void modelContext
    void runtimeContext
  }

  /**
   * Applies optional opacity interpolation values into a runtime context.
   * @param modelContext Runtime model context supplying parameter values.
   * @param paramBindingSet Parameter binding set used to interpolate opacity values.
   * @param runtimeContext Runtime context receiving the interpolated opacity.
   * @param dirtyFlagRef Single-item scratch flag updated by interpolation.
   * @returns Nothing; the runtime context stores the interpolated opacity.
   */
  BaseData.prototype.interpolateOpacity = function (
    modelContext: unknown,
    paramBindingSet: unknown,
    runtimeContext: Cubism2BaseDataRuntimeContext,
    dirtyFlagRef: boolean[],
  ): void {
    if (this.opacityValues == null) {
      runtimeContext.setInterpolatedOpacity(1)
    } else {
      runtimeContext.setInterpolatedOpacity(
        options.interpolator.interpolateFloat(
          modelContext,
          paramBindingSet,
          dirtyFlagRef,
          this.opacityValues,
        ),
      )
    }
  }

  /**
   * Propagates parent base-data state into a runtime context.
   * @param modelContext Runtime model context containing base-data lookup tables.
   * @param runtimeContext Runtime context paired with this data object.
   * @returns Nothing; concrete subclasses perform dependency propagation.
   */
  BaseData.prototype.applyRuntimeContext = function (
    modelContext: unknown,
    runtimeContext: unknown,
  ): void {
    void modelContext
    void runtimeContext
  }

  /**
   * Applies base-data point transforms into output buffers.
   * @param modelContext Runtime model context containing base-data lookup tables.
   * @param sourceContext Source runtime context that provides parent transforms.
   * @param outputPoints Destination transformed point buffer.
   * @param optionalOutputPoints Optional destination buffer used by target-dependent data.
   * @param pointCount Number of points to transform.
   * @param outputOffset First output element offset.
   * @param outputStride Element stride for the output buffers.
   * @returns Nothing; concrete subclasses write transformed points.
   */
  BaseData.prototype.transformPoints = function (
    modelContext: unknown,
    sourceContext: unknown,
    outputPoints: unknown,
    optionalOutputPoints: unknown,
    pointCount: number,
    outputOffset: number,
    outputStride: number,
  ): void {
    void modelContext
    void sourceContext
    void outputPoints
    void optionalOutputPoints
    void pointCount
    void outputOffset
    void outputStride
  }

  /**
   * Reads the base-data type marker used by dependency propagation.
   * @returns Type marker in concrete subclasses.
   */
  BaseData.prototype.getType = function (): unknown {
    return undefined
  }

  /**
   * Updates the target base-data ID used for dependency propagation.
   * @param targetBaseDataId Base-data ID that this data object depends on.
   * @returns Nothing; dependency checks read the stored target ID.
   */
  BaseData.prototype.setTargetBaseDataID = function (targetBaseDataId: unknown): void {
    this.targetBaseDataId = targetBaseDataId
  }

  /**
   * Updates the base-data ID used to register this data object in ModelContext.
   * @param baseDataId Base-data ID read from or resolved for this data object.
   * @returns Nothing; ModelContext lookup reads the stored base-data ID.
   */
  BaseData.prototype.setBaseDataID = function (baseDataId: unknown): void {
    this.baseDataId = baseDataId
  }

  /**
   * Reads the target base-data ID used for dependency propagation.
   * @returns Target base-data ID or the SDK empty ID when no dependency exists.
   */
  BaseData.prototype.getTargetBaseDataID = function (): unknown | null {
    return this.targetBaseDataId
  }

  /**
   * Reads the base-data ID used by ModelContext lookup.
   * @returns Base-data ID associated with this data object.
   */
  BaseData.prototype.getBaseDataID = function (): unknown | null {
    return this.baseDataId
  }

  /**
   * Reports whether this data object depends on another base-data object.
   * @returns True when a non-empty target base-data ID is stored.
   */
  BaseData.prototype.hasTargetBaseData = function (): boolean {
    return (
      this.targetBaseDataId != null &&
      this.targetBaseDataId != options.BaseDataID.getDefaultBaseDataID()
    )
  }

  return BaseData
}
