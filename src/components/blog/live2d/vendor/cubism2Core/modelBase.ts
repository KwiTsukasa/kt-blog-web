export interface Cubism2ModelBaseBinaryReaderConstructor {
  new (sourceBuffer: DataView): Cubism2ModelBaseReader
}

export interface Cubism2ModelBaseCoreErrorConstructor {
  new (message: string): unknown
}

export interface Cubism2ModelBaseDrawDataBaseLike {
  TYPE_MESH: number
}

export interface Cubism2ModelBaseIdRegistryLike {
  getID(id: unknown): unknown
}

export interface Cubism2ModelBaseMocVersionLike {
  MAX_SUPPORTED_FORMAT_VERSION: number
  LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER: number
}

export interface Cubism2ModelBaseModelImplConstructor {
  new (): Cubism2ModelImplLike
}

export interface Cubism2ModelBasePartsDataIdConstructor extends Cubism2ModelBaseIdRegistryLike {
  new (...args: never[]): unknown
}

export interface Cubism2ModelBaseReader {
  readInt8: () => number
  readInt16: () => number
  readObject: () => unknown
  setFormatVersion: (formatVersion: number) => void
}

export interface Cubism2ModelContextConstructor {
  new (model: Cubism2ModelBaseInstance): Cubism2ModelContextLike
}

export interface Cubism2ModelContextLike {
  drawDataList?: Cubism2ModelDrawDataLike[]
  getDrawContext: (drawDataIndex: number) => Cubism2ModelDrawContextLike | null
  getDrawData(drawDataIdOrIndex: unknown): unknown
  getDrawDataIndex: (drawDataId: unknown) => number
  getParamFloat: (paramIndex: number) => number
  getParamIndex: (paramId: unknown) => number
  getParamMax: (paramIndex: number) => number
  getParamMin: (paramIndex: number) => number
  getPartsDataIndex: (partsId: unknown) => number
  getPartsOpacity: (partsIndex: number) => number
  init: () => void
  loadParam: () => void
  saveParam: () => void
  setDrawParam: (drawParam: unknown) => void
  setParamFloat: (paramIndex: number, value: number) => void
  setPartsOpacity: (partsIndex: number, opacity: number) => void
  update: () => void
}

export interface Cubism2ModelDrawDataLike {
  getIndexArray?: () => unknown
  getType: () => unknown
}

export interface Cubism2ModelDrawContextLike extends Cubism2ModelDrawDataLike {
  getTransformedPoints?: () => unknown
}

export interface Cubism2ModelImplLike {
  getCanvasHeight: () => number
  getCanvasWidth: () => number
  initializeModelContainers: () => void
}

export interface Cubism2ModelBaseInstance {
  addToParamFloat: (paramIdOrIndex: unknown, value: number, weight?: number) => void
  draw: () => void
  getCanvasHeight: () => number
  getCanvasWidth: () => number
  getDrawData: (drawDataIndex: number) => unknown
  getDrawDataIndex: (drawDataId: unknown) => number
  getDrawParam: () => unknown
  getIndexArray: (drawDataIndex: number) => unknown
  getLoadErrorFlags: () => number
  getModelContext: () => Cubism2ModelContextLike
  getModelImpl: () => Cubism2ModelImplLike
  getParamFloat: (paramIdOrIndex: unknown) => number
  getParamIndex: (paramId: unknown) => number
  getPartsDataIndex: (partsId: unknown) => number
  getPartsOpacity: (partsIdOrIndex: unknown) => number
  getTextureCount: () => number
  getTransformedPoints: (drawDataIndex: number) => unknown
  init: () => void
  loadErrorFlags: number
  loadParam: () => void
  modelContext: Cubism2ModelContextLike
  modelImpl: Cubism2ModelImplLike | null
  multParamFloat: (paramIdOrIndex: unknown, value: number, weight?: number) => void
  releaseRendererTextures: () => void
  saveParam: () => void
  setDrawParam: (drawParam: unknown) => void
  setModelImpl: (modelImpl: Cubism2ModelImplLike) => void
  setParamFloat: (paramIdOrIndex: unknown, value: number, weight?: number) => void
  setPartsOpacity: (partsIdOrIndex: unknown, opacity: number) => void
  update: () => void
  updateParamDrivenPartsOpacity: (
    paramIdsOrIndexes: unknown[],
    partsIdsOrIndexes: unknown[],
    deltaTime: number,
    fadeDuration: number,
  ) => void
}

export interface Cubism2ModelBaseConstructor {
  LOAD_FLAG_CHECKSUM_MISMATCH: number
  LOAD_FLAG_UNSUPPORTED_MOC_VERSION: number
  instanceCount: number
  loadMocDataIntoModel: (
    model: Cubism2ModelBaseInstance,
    sourceBuffer: ArrayBuffer | DataView,
  ) => void
  new (): Cubism2ModelBaseInstance
  prototype: Cubism2ModelBaseInstance
}

export interface Cubism2ModelBaseUtDebugLike {
  logException: (error: unknown) => void
  logWithLegacyPrefix: (message: string, ...args: unknown[]) => void
}

export interface CreateCubism2ModelBaseOptions {
  Cubism2BinaryReader: Cubism2ModelBaseBinaryReaderConstructor
  Cubism2CoreError: Cubism2ModelBaseCoreErrorConstructor
  Cubism2DrawDataBase: Cubism2ModelBaseDrawDataBaseLike
  Cubism2MeshDrawContext: abstract new (...args: never[]) => object
  Cubism2MeshDrawData: abstract new (...args: never[]) => Cubism2ModelDrawDataLike
  Cubism2MocVersion: Cubism2ModelBaseMocVersionLike
  Cubism2ModelImpl: Cubism2ModelBaseModelImplConstructor
  DrawDataID: Cubism2ModelBaseIdRegistryLike
  ModelContext: Cubism2ModelContextConstructor
  ParamID: Cubism2ModelBaseIdRegistryLike
  PartsDataID: Cubism2ModelBasePartsDataIdConstructor
  UtDebug: Cubism2ModelBaseUtDebugLike
  isBootstrapping: () => boolean
}

/**
 * Creates the Cubism2 public model base constructor used by JS and WebGL model wrappers.
 * @param options Reader, ID registries, model-context dependencies, debug hooks, and bootstrap state.
 * @returns Legacy-compatible Live2DModelBase constructor with static MOC loading helpers.
 */
export function createCubism2ModelBase(
  options: CreateCubism2ModelBaseOptions,
): Cubism2ModelBaseConstructor {
  const {
    Cubism2BinaryReader,
    Cubism2CoreError,
    Cubism2DrawDataBase,
    Cubism2MeshDrawContext,
    Cubism2MeshDrawData,
    Cubism2MocVersion,
    Cubism2ModelImpl,
    DrawDataID,
    ModelContext,
    ParamID,
    PartsDataID,
    UtDebug,
    isBootstrapping,
  } = options

  /**
   * Public Cubism2 base model wrapper shared by JS and WebGL renderers.
   */
  function Live2DModelBase(this: Cubism2ModelBaseInstance): void {
    if (isBootstrapping()) {
      return
    }

    this.modelImpl = null
    this.modelContext = null as unknown as Cubism2ModelContextLike
    this.loadErrorFlags = 0
    ModelBase.instanceCount++
    this.modelContext = new ModelContext(this)
  }

  const ModelBase = Live2DModelBase as unknown as Cubism2ModelBaseConstructor
  ModelBase.LOAD_FLAG_CHECKSUM_MISMATCH = 1
  ModelBase.LOAD_FLAG_UNSUPPORTED_MOC_VERSION = 2
  ModelBase.instanceCount = 0

  /**
   * Loads one Cubism2 MOC binary into an existing model wrapper.
   * @param this Model-base constructor that owns the semantic MOC load flag constants.
   * @param model Model wrapper that receives the deserialized model implementation and load error flags.
   * @param sourceBuffer MOC payload supplied as ArrayBuffer or DataView by the JS/WebGL model loaders.
   * @returns Nothing; model state is mutated or load errors are recorded.
   */
  ModelBase.loadMocDataIntoModel = function (
    this: Cubism2ModelBaseConstructor,
    model: Cubism2ModelBaseInstance,
    sourceBuffer: ArrayBuffer | DataView,
  ): void {
    try {
      if (sourceBuffer instanceof ArrayBuffer) {
        sourceBuffer = new DataView(sourceBuffer)
      }
      if (!(sourceBuffer instanceof DataView)) {
        throw new Cubism2CoreError(
          'Live2DModelBase.loadModel(buffer): buffer must be a DataView or ArrayBuffer',
        )
      }
      const reader = new Cubism2BinaryReader(sourceBuffer)
      const magicM = reader.readInt8()
      const magicO = reader.readInt8()
      const magicC = reader.readInt8()
      let formatVersion
      if (magicM == 109 && magicO == 111 && magicC == 99) {
        formatVersion = reader.readInt8()
      } else {
        throw new Cubism2CoreError('Invalid MOC header: expected the moc signature')
      }
      reader.setFormatVersion(formatVersion)
      if (formatVersion > Cubism2MocVersion.MAX_SUPPORTED_FORMAT_VERSION) {
        model.loadErrorFlags |= ModelBase.LOAD_FLAG_UNSUPPORTED_MOC_VERSION
        const supportedVersion = Cubism2MocVersion.MAX_SUPPORTED_FORMAT_VERSION
        const versionErrorMessage =
          'Unsupported MOC format version (SDK: ' +
          supportedVersion +
          ' < file: ' +
          formatVersion +
          ') @Live2DModelBase.loadModel()\n'
        throw new Cubism2CoreError(versionErrorMessage)
      }
      const modelImpl = reader.readObject() as Cubism2ModelImplLike
      if (formatVersion >= Cubism2MocVersion.LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER) {
        const checksumMarkerA = reader.readInt16()
        const checksumMarkerB = reader.readInt16()
        if (checksumMarkerA != -30584 || checksumMarkerB != -30584) {
          model.loadErrorFlags |= ModelBase.LOAD_FLAG_CHECKSUM_MISMATCH
          throw new Cubism2CoreError('Invalid MOC checksum marker')
        }
      }
      model.setModelImpl(modelImpl)
      const modelContext = model.getModelContext()
      modelContext.setDrawParam(model.getDrawParam())
      modelContext.init()
    } catch (error) {
      UtDebug.logException(error)
    }
  }

  /**
   * Stores the deserialized model implementation used by context and canvas size lookups.
   * @param this Model wrapper receiving the reader-produced implementation.
   * @param modelImpl Binary-reader output that owns parts data, parameter definitions, and canvas dimensions.
   * @returns Nothing; subsequent model-context calls use this implementation.
   */
  ModelBase.prototype.setModelImpl = function (
    this: Cubism2ModelBaseInstance,
    modelImpl: Cubism2ModelImplLike,
  ): void {
    this.modelImpl = modelImpl
  }

  /**
   * Reads the active model implementation, creating an empty one for legacy callers when missing.
   * @param this Model wrapper that owns the lazily initialized implementation.
   * @returns Model implementation backing canvas and data-list lookups.
   */
  ModelBase.prototype.getModelImpl = function (
    this: Cubism2ModelBaseInstance,
  ): Cubism2ModelImplLike {
    if (this.modelImpl == null) {
      this.modelImpl = new Cubism2ModelImpl()
      this.modelImpl.initializeModelContainers()
    }
    return this.modelImpl
  }

  /**
   * Reads the model canvas width from the loaded implementation.
   * @param this Model wrapper whose implementation may still be missing before MOC load.
   * @returns Canvas width, or 0 before a model implementation has been loaded.
   */
  ModelBase.prototype.getCanvasWidth = function (this: Cubism2ModelBaseInstance): number {
    if (this.modelImpl == null) {
      return 0
    }
    return this.modelImpl.getCanvasWidth()
  }

  /**
   * Reads the model canvas height from the loaded implementation.
   * @param this Model wrapper whose implementation may still be missing before MOC load.
   * @returns Canvas height, or 0 before a model implementation has been loaded.
   */
  ModelBase.prototype.getCanvasHeight = function (this: Cubism2ModelBaseInstance): number {
    if (this.modelImpl == null) {
      return 0
    }
    return this.modelImpl.getCanvasHeight()
  }

  /**
   * Reads a parameter value by raw index or by legacy parameter id.
   * @param this Model wrapper whose context owns resolved parameter slots.
   * @param paramIdOrIndex Numeric parameter index or string/id object resolved through ParamID.
   * @returns Current parameter float from the model context.
   */
  ModelBase.prototype.getParamFloat = function (
    this: Cubism2ModelBaseInstance,
    paramIdOrIndex: unknown,
  ): number {
    const paramIndex =
      typeof paramIdOrIndex == 'number'
        ? paramIdOrIndex
        : this.modelContext.getParamIndex(ParamID.getID(paramIdOrIndex))
    return this.modelContext.getParamFloat(paramIndex)
  }

  /**
   * Blends a parameter toward a target value.
   * @param this Model wrapper whose context receives the weighted parameter value.
   * @param paramIdOrIndex Numeric parameter index or id resolved through ParamID.
   * @param value Target value written into the model context.
   * @param weight Blend weight; omitted values keep the legacy default of full replacement.
   * @returns Nothing; the selected model-context parameter is updated.
   */
  ModelBase.prototype.setParamFloat = function (
    this: Cubism2ModelBaseInstance,
    paramIdOrIndex: unknown,
    value: number,
    weight?: number,
  ): void {
    const paramIndex =
      typeof paramIdOrIndex == 'number'
        ? paramIdOrIndex
        : this.modelContext.getParamIndex(ParamID.getID(paramIdOrIndex))
    if (arguments.length < 3) {
      weight = 1
    }
    this.modelContext.setParamFloat(
      paramIndex,
      this.modelContext.getParamFloat(paramIndex) * (1 - weight!) + value * weight!,
    )
  }

  /**
   * Adds a weighted delta to a model parameter.
   * @param this Model wrapper whose context receives the additive parameter change.
   * @param paramIdOrIndex Numeric parameter index or id resolved through ParamID.
   * @param value Delta applied to the current value.
   * @param weight Delta multiplier; omitted values keep the legacy default of 1.
   * @returns Nothing; the selected model-context parameter is updated.
   */
  ModelBase.prototype.addToParamFloat = function (
    this: Cubism2ModelBaseInstance,
    paramIdOrIndex: unknown,
    value: number,
    weight?: number,
  ): void {
    const paramIndex =
      typeof paramIdOrIndex == 'number'
        ? paramIdOrIndex
        : this.modelContext.getParamIndex(ParamID.getID(paramIdOrIndex))
    if (arguments.length < 3) {
      weight = 1
    }
    this.modelContext.setParamFloat(
      paramIndex,
      this.modelContext.getParamFloat(paramIndex) + value * weight!,
    )
  }

  /**
   * Multiplies a parameter toward a target ratio while preserving legacy weighted blending.
   * @param this Model wrapper whose context receives the multiplicative parameter change.
   * @param paramIdOrIndex Numeric parameter index or id resolved through ParamID.
   * @param value Target multiplier.
   * @param weight Interpolation weight between unchanged and multiplied value.
   * @returns Nothing; the selected model-context parameter is updated.
   */
  ModelBase.prototype.multParamFloat = function (
    this: Cubism2ModelBaseInstance,
    paramIdOrIndex: unknown,
    value: number,
    weight?: number,
  ): void {
    const paramIndex =
      typeof paramIdOrIndex == 'number'
        ? paramIdOrIndex
        : this.modelContext.getParamIndex(ParamID.getID(paramIdOrIndex))
    if (arguments.length < 3) {
      weight = 1
    }
    this.modelContext.setParamFloat(
      paramIndex,
      this.modelContext.getParamFloat(paramIndex) * (1 + (value - 1) * weight!),
    )
  }

  /**
   * Resolves a legacy parameter id into its model-context index.
   * @param this Model wrapper whose context owns the parameter id-to-index mapping.
   * @param paramId Parameter identifier accepted by ParamID.getID.
   * @returns Parameter index in the current model context.
   */
  ModelBase.prototype.getParamIndex = function (
    this: Cubism2ModelBaseInstance,
    paramId: unknown,
  ): number {
    return this.modelContext.getParamIndex(ParamID.getID(paramId))
  }

  /**
   * Loads the previously saved parameter values into the active context.
   * @param this Model wrapper whose context stores the parameter snapshot.
   * @returns Nothing; parameter values are restored in the model context.
   */
  ModelBase.prototype.loadParam = function (this: Cubism2ModelBaseInstance): void {
    this.modelContext.loadParam()
  }

  /**
   * Saves current parameter values for later restoration.
   * @param this Model wrapper whose context stores current parameter values.
   * @returns Nothing; parameter values are cached by the model context.
   */
  ModelBase.prototype.saveParam = function (this: Cubism2ModelBaseInstance): void {
    this.modelContext.saveParam()
  }

  /**
   * Initializes runtime model contexts after model data is available.
   * @param this Model wrapper whose context has already received draw parameters.
   * @returns Nothing; delegated model-context state is initialized.
   */
  ModelBase.prototype.init = function (this: Cubism2ModelBaseInstance): void {
    this.modelContext.init()
  }

  /**
   * Updates runtime model contexts for the current parameter and parts state.
   * @param this Model wrapper whose context owns the mutable runtime model state.
   * @returns Nothing; delegated model-context state is updated.
   */
  ModelBase.prototype.update = function (this: Cubism2ModelBaseInstance): void {
    this.modelContext.update()
  }

  /**
   * Reads renderer texture capacity from concrete model renderers.
   * @param this Abstract model wrapper whose concrete subclass may override the renderer hook.
   * @returns `-1` in the abstract base implementation.
   */
  ModelBase.prototype.getTextureCount = function (this: Cubism2ModelBaseInstance): number {
    void this
    UtDebug.logWithLegacyPrefix('Live2DModelBase.getTextureCount() is abstract')
    return -1
  }

  /**
   * Base draw-param setter stub retained for concrete renderers.
   * @param this Abstract model wrapper whose concrete subclass may consume renderer draw parameters.
   * @param drawParam Draw parameter object supplied by JS/WebGL subclasses.
   * @returns Nothing; the base implementation only logs through UtDebug.
   */
  ModelBase.prototype.setDrawParam = function (
    this: Cubism2ModelBaseInstance,
    drawParam: unknown,
  ): void {
    void this
    void drawParam
    UtDebug.logWithLegacyPrefix('Live2DModelBase.setDrawParam() is abstract\n')
  }

  /**
   * Releases renderer-owned texture resources.
   * @param this Abstract model wrapper whose concrete subclass may own renderer resources.
   * @returns Nothing in the abstract base implementation.
   */
  ModelBase.prototype.releaseRendererTextures = function (
    this: Cubism2ModelBaseInstance,
  ): void {
    void this
  }

  /**
   * Legacy draw hook overridden by JS/WebGL subclasses.
   * @param this Abstract model wrapper whose concrete subclass draws with a renderer.
   * @returns Nothing in the abstract base implementation.
   */
  ModelBase.prototype.draw = function (this: Cubism2ModelBaseInstance): void {
    void this
  }

  /**
   * Reads the runtime model context owned by this wrapper.
   * @param this Model wrapper that owns the context created by the constructor.
   * @returns Model context created during model construction.
   */
  ModelBase.prototype.getModelContext = function (
    this: Cubism2ModelBaseInstance,
  ): Cubism2ModelContextLike {
    return this.modelContext
  }

  /**
   * Reads accumulated MOC load flags.
   * @param this Model wrapper that accumulates MOC load errors during binary parsing.
   * @returns Bitmask of load errors encountered by `loadMocDataIntoModel`.
   */
  ModelBase.prototype.getLoadErrorFlags = function (this: Cubism2ModelBaseInstance): number {
    return this.loadErrorFlags
  }

  /**
   * Updates parts opacity from one or more parameter-controlled visibility slots.
   * @param this Model wrapper whose parameters choose active parts and whose parts opacity is mutated.
   * @param paramIdsOrIndexes Parameter IDs or indexes that decide which part is active.
   * @param partsIdsOrIndexes Parts IDs or indexes paired with `paramIdsOrIndexes`.
   * @param deltaTime Elapsed time used by the legacy fade calculation; zero means snap immediately.
   * @param fadeDuration Duration divisor used by the legacy fade calculation.
   * @returns Nothing; paired parts opacities and fallback parameter state may be mutated.
   */
  ModelBase.prototype.updateParamDrivenPartsOpacity = function (
    this: Cubism2ModelBaseInstance,
    paramIdsOrIndexes: unknown[],
    partsIdsOrIndexes: unknown[],
    deltaTime: number,
    fadeDuration: number,
  ): void {
    let activeParameterIndex = -1
    let activePartOpacity = 0
    const halfwayOpacity = 0.5
    const maxInactivePartLeakOpacity = 0.15
    const shouldLimitInactivePartLeak = true
    if (deltaTime == 0) {
      for (let pairIndex = 0; pairIndex < paramIdsOrIndexes.length; pairIndex++) {
        const paramIdOrIndex = paramIdsOrIndexes[pairIndex]
        const partsIdOrIndex = partsIdsOrIndexes[pairIndex]
        const isParameterEnabled = this.getParamFloat(paramIdOrIndex) != 0
        this.setPartsOpacity(partsIdOrIndex, isParameterEnabled ? 1 : 0)
      }
      return
    } else {
      if (paramIdsOrIndexes.length == 1) {
        const paramIdOrIndex = paramIdsOrIndexes[0]
        const isParameterEnabled = this.getParamFloat(paramIdOrIndex) != 0
        const partsIdOrIndex = partsIdsOrIndexes[0]
        let currentPartOpacity = this.getPartsOpacity(partsIdOrIndex)
        const fadeStep = deltaTime / fadeDuration
        if (isParameterEnabled) {
          currentPartOpacity += fadeStep
          if (currentPartOpacity > 1) {
            currentPartOpacity = 1
          }
        } else {
          currentPartOpacity -= fadeStep
          if (currentPartOpacity < 0) {
            currentPartOpacity = 0
          }
        }
        this.setPartsOpacity(partsIdOrIndex, currentPartOpacity)
      } else {
        for (let pairIndex = 0; pairIndex < paramIdsOrIndexes.length; pairIndex++) {
          const paramIdOrIndex = paramIdsOrIndexes[pairIndex]
          const isParameterEnabled = this.getParamFloat(paramIdOrIndex) != 0
          if (isParameterEnabled) {
            if (activeParameterIndex >= 0) {
              break
            }
            activeParameterIndex = pairIndex
            const partsIdOrIndex = partsIdsOrIndexes[pairIndex]
            activePartOpacity = this.getPartsOpacity(partsIdOrIndex)
            activePartOpacity += deltaTime / fadeDuration
            if (activePartOpacity > 1) {
              activePartOpacity = 1
            }
          }
        }
        if (activeParameterIndex < 0) {
          console.log('No active visibility parameter; using default[%s]', paramIdsOrIndexes[0])
          activeParameterIndex = 0
          activePartOpacity = 1
          this.loadParam()
          this.setParamFloat(paramIdsOrIndexes[activeParameterIndex], activePartOpacity)
          this.saveParam()
        }
        for (let pairIndex = 0; pairIndex < paramIdsOrIndexes.length; pairIndex++) {
          const partsIdOrIndex = partsIdsOrIndexes[pairIndex]
          if (activeParameterIndex == pairIndex) {
            this.setPartsOpacity(partsIdOrIndex, activePartOpacity)
          } else {
            let inactivePartOpacity = this.getPartsOpacity(partsIdOrIndex)
            let targetInactivePartOpacity
            if (activePartOpacity < halfwayOpacity) {
              targetInactivePartOpacity =
                (activePartOpacity * (halfwayOpacity - 1)) / halfwayOpacity + 1
            } else {
              targetInactivePartOpacity =
                ((1 - activePartOpacity) * halfwayOpacity) / (1 - halfwayOpacity)
            }
            if (shouldLimitInactivePartLeak) {
              const inactivePartLeakOpacity =
                (1 - targetInactivePartOpacity) * (1 - activePartOpacity)
              if (inactivePartLeakOpacity > maxInactivePartLeakOpacity) {
                targetInactivePartOpacity =
                  1 - maxInactivePartLeakOpacity / (1 - activePartOpacity)
              }
            }
            if (inactivePartOpacity > targetInactivePartOpacity) {
              inactivePartOpacity = targetInactivePartOpacity
            }
            this.setPartsOpacity(partsIdOrIndex, inactivePartOpacity)
          }
        }
      }
    }
  }

  /**
   * Writes part opacity by raw parts index or by legacy parts id.
   * @param this Model wrapper whose context owns the parts opacity slots.
   * @param partsIdOrIndex Numeric parts index or id resolved through PartsDataID.
   * @param opacity Target opacity in the Cubism2 part state.
   * @returns Nothing; the selected parts opacity is updated on the model context.
   */
  ModelBase.prototype.setPartsOpacity = function (
    this: Cubism2ModelBaseInstance,
    partsIdOrIndex: unknown,
    opacity: number,
  ): void {
    const partsIndex =
      typeof partsIdOrIndex == 'number'
        ? partsIdOrIndex
        : this.modelContext.getPartsDataIndex(PartsDataID.getID(partsIdOrIndex))
    this.modelContext.setPartsOpacity(partsIndex, opacity)
  }

  /**
   * Resolves a parts id into its parts data index.
   * @param this Model wrapper whose context owns the parts id-to-index mapping.
   * @param partsId Parts identifier accepted by PartsDataID.getID.
   * @returns Parts data index, or -1 when missing.
   */
  ModelBase.prototype.getPartsDataIndex = function (
    this: Cubism2ModelBaseInstance,
    partsId: unknown,
  ): number {
    if (!(partsId instanceof PartsDataID)) {
      partsId = PartsDataID.getID(partsId)
    }
    return this.modelContext.getPartsDataIndex(partsId)
  }

  /**
   * Reads part opacity by raw index or by parts id.
   * @param this Model wrapper whose context owns the parts opacity slots.
   * @param partsIdOrIndex Numeric parts index or id resolved through PartsDataID.
   * @returns Current opacity, or 0 for invalid negative indexes.
   */
  ModelBase.prototype.getPartsOpacity = function (
    this: Cubism2ModelBaseInstance,
    partsIdOrIndex: unknown,
  ): number {
    const partsIndex =
      typeof partsIdOrIndex == 'number'
        ? partsIdOrIndex
        : this.modelContext.getPartsDataIndex(PartsDataID.getID(partsIdOrIndex))
    if (partsIndex < 0) {
      return 0
    }
    return this.modelContext.getPartsOpacity(partsIndex)
  }

  /**
   * Abstract renderer draw-parameter getter retained for concrete renderer subclasses.
   * @param this Abstract model wrapper whose subclasses provide renderer-specific draw params.
   * @returns Concrete subclasses override this to expose Canvas/WebGL draw parameters.
   */
  ModelBase.prototype.getDrawParam = function (this: Cubism2ModelBaseInstance): unknown {
    void this
    return undefined
  }

  /**
   * Resolves draw data id into the current model-context draw index.
   * @param this Model wrapper whose context owns draw-data id lookup.
   * @param drawDataId Draw identifier accepted by DrawDataID.getID.
   * @returns Draw data index.
   */
  ModelBase.prototype.getDrawDataIndex = function (
    this: Cubism2ModelBaseInstance,
    drawDataId: unknown,
  ): number {
    return this.modelContext.getDrawDataIndex(DrawDataID.getID(drawDataId))
  }

  /**
   * Reads draw data by model-context draw index.
   * @param this Model wrapper whose context owns the draw-data table.
   * @param drawDataIndex Draw data index.
   * @returns Internal draw data object for the index.
   */
  ModelBase.prototype.getDrawData = function (
    this: Cubism2ModelBaseInstance,
    drawDataIndex: number,
  ): unknown {
    return this.modelContext.getDrawData(drawDataIndex)
  }

  /**
   * Reads transformed vertex points for one draw data index when the draw context supports it.
   * @param this Model wrapper whose context owns draw contexts generated during update.
   * @param drawDataIndex Draw data index in the model context.
   * @returns Transformed point array, or null for unsupported draw contexts.
   */
  ModelBase.prototype.getTransformedPoints = function (
    this: Cubism2ModelBaseInstance,
    drawDataIndex: number,
  ): unknown {
    const drawContext = this.modelContext.getDrawContext(drawDataIndex)
    if (drawContext instanceof Cubism2MeshDrawContext) {
      return drawContext.getTransformedPoints?.()
    }
    return null
  }

  /**
   * Reads the triangle index array for one draw data index.
   * @param this Model wrapper whose context owns the draw-data table from the parsed model.
   * @param drawDataIndex Draw data index in the model context.
   * @returns Index array, or null when the index is outside drawDataList or not mesh-backed.
   */
  ModelBase.prototype.getIndexArray = function (
    this: Cubism2ModelBaseInstance,
    drawDataIndex: number,
  ): unknown {
    const drawDataList = this.modelContext.drawDataList ?? []
    if (drawDataIndex < 0 || drawDataIndex >= drawDataList.length) {
      return null
    }
    const drawData = drawDataList[drawDataIndex]
    if (drawData != null && drawData.getType() == Cubism2DrawDataBase.TYPE_MESH) {
      if (drawData instanceof Cubism2MeshDrawData) {
        return drawData.getIndexArray?.()
      }
    }
    return null
  }

  return ModelBase
}
