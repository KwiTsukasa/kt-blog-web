import {
  allocateCubism2ModelContextInstanceId,
  initializeCubism2ModelContextStaticState,
} from './modelContextStatics'
import type { Cubism2ModelContextStaticState } from './modelContextStatics'
import type { Cubism2ModelContextLike as Cubism2ModelBaseContextLike } from './modelBase'

export interface Cubism2ModelContextBaseDataIdLike {
  getDefaultBaseDataID: () => unknown
}

export interface Cubism2ModelContextClippingManagerLike<TDrawParam> {
  init(modelContext: unknown, drawDataList: unknown[], drawContextList: unknown[]): void
  setupClip(modelContext: unknown, drawParam: TDrawParam): void
}

export type Cubism2ModelContextClippingManagerConstructor<TDrawParam> = {
  new (drawParam: TDrawParam): Cubism2ModelContextClippingManagerLike<TDrawParam>
}

export interface Cubism2ModelContextDrawDataBaseLike {
  getMaxDrawOrder: () => number
  getMinDrawOrder: () => number
}

export interface Cubism2ModelContextDrawParamLike {
  prepareDrawState: () => void
}

export interface Cubism2ModelContextRuntimeConstantsLike {
  maxInterpolationCornerCount: number
  maxTransformParameterDimensionCount: number
}

export type Cubism2ModelContextDrawDataIdConstructor = {
  new (...args: never[]): unknown
}

export interface Cubism2ModelContextLive2DLike {
  L2D_ERROR_MODEL_UPDATE: number
  setErrorCode: (errorCode: number) => void
}

export interface Cubism2ModelContextUtDebugLike {
  logException: (error: unknown) => void
  logWithLegacyPrefix: (message: string, ...args: unknown[]) => void
  dump: (timerName: string) => void
  start: (timerName: string) => void
}

export interface Cubism2ModelContextUtSystemLike {
  copyArraySegmentForward: (
    source: ArrayLike<unknown>,
    sourceStart: number,
    target: { [index: number]: unknown },
    targetStart: number,
    copyCount: number,
  ) => void
}

export interface CreateCubism2ModelContextOptions<TDrawParam> {
  BaseDataID: Cubism2ModelContextBaseDataIdLike
  Cubism2ClippingManager: Cubism2ModelContextClippingManagerConstructor<TDrawParam>
  Cubism2DrawDataBase: Cubism2ModelContextDrawDataBaseLike
  Cubism2RuntimeConstants: Cubism2ModelContextRuntimeConstantsLike
  DrawDataID: Cubism2ModelContextDrawDataIdConstructor
  Live2D: Cubism2ModelContextLive2DLike
  UtDebug: Cubism2ModelContextUtDebugLike
  UtSystem: Cubism2ModelContextUtSystemLike
  isBootstrapping: () => boolean
}

export type Cubism2ModelContextInstance = Record<string, any>

export type Cubism2ModelContextConstructor = Cubism2ModelContextStaticState & {
  new (model: unknown): Cubism2ModelContextInstance & Cubism2ModelBaseContextLike
  prototype: Cubism2ModelContextInstance
}

export interface Cubism2ModelContextConstructors {
  ModelContext: Cubism2ModelContextConstructor
}

/**
 * Creates the runtime model-context constructor that coordinates decoded model data, params, draw contexts, and clipping.
 * @param options Base-id, clipping, draw-order, runtime constants, debug, copy, and bootstrap dependencies from the min.js capsule.
 * @returns Legacy-compatible ModelContext constructor bound to the supplied dependencies.
 */
export function createCubism2ModelContext<TDrawParam>(
  options: CreateCubism2ModelContextOptions<TDrawParam>,
): Cubism2ModelContextConstructors {
  const {
    BaseDataID,
    Cubism2ClippingManager,
    Cubism2DrawDataBase,
    Cubism2RuntimeConstants,
    DrawDataID,
    Live2D,
    UtDebug,
    UtSystem,
    isBootstrapping,
  } = options

  /**
   * Stores runtime state derived from one Cubism2 model and coordinates update/draw traversal.
   * @param model Live2D model wrapper that owns the decoded model implementation.
   */
  function ModelContext(this: Cubism2ModelContextInstance, model: unknown): void {
    if (isBootstrapping()) {
      return
    }
    this.initialParamUpdatePending = true
    this.paramCacheGeneration = -1
    this.paramCount = 0
    const initialParamCapacity = ModelContextCtor.initialParamCapacity
    this.paramIds = new Array(initialParamCapacity)
    this.paramValues = new Float32Array(initialParamCapacity)
    this.previousParamValues = new Float32Array(initialParamCapacity)
    this.paramMinValues = new Float32Array(initialParamCapacity)
    this.paramMaxValues = new Float32Array(initialParamCapacity)
    this.savedParamValues = new Float32Array(initialParamCapacity)
    this.paramDirtyFlags = new Array(initialParamCapacity)
    this.baseDataList = new Array()
    this.drawDataList = new Array()
    this.drawDataByIdCache = null
    this.partsDataList = new Array()
    this.baseContextList = new Array()
    this.drawContextList = new Array()
    this.partsContextList = new Array()
    this.drawOrderHeadIndices = null
    this.drawOrderTailIndices = null
    this.nextDrawDataIndices = null
    this.scratchIndexBuffer = new Int16Array(Cubism2RuntimeConstants.maxInterpolationCornerCount)
    this.scratchWeightBuffer = new Float32Array(
      Cubism2RuntimeConstants.maxTransformParameterDimensionCount * 2,
    )
    this.model = model
    this.instanceId = allocateCubism2ModelContextInstanceId(ModelContextCtor)
    this.clipManager = null
    this.drawParam = null
  }

  const ModelContextCtor = ModelContext as unknown as Cubism2ModelContextConstructor
  initializeCubism2ModelContextStaticState(ModelContextCtor)

  /**
   * Resolves a draw data id into the runtime draw-data array index.
   * @param drawDataId DrawDataID value requested by public model APIs.
   * @returns Draw data index, or -1 when the id does not exist in this model.
   */
  ModelContextCtor.prototype.getDrawDataIndex = function (drawDataId: unknown): number {
    for (let drawDataIndex = this.drawDataList.length - 1; drawDataIndex >= 0; --drawDataIndex) {
      if (
        this.drawDataList[drawDataIndex] != null &&
        this.drawDataList[drawDataIndex].getDrawDataID() == drawDataId
      ) {
        return drawDataIndex
      }
    }
    return -1
  }

  /**
   * Reads draw data either by draw id or already-resolved runtime index.
   * @param drawDataIdOrIndex DrawDataID instance or numeric draw data index.
   * @returns Draw data object, or null/undefined when the lookup misses.
   */
  ModelContextCtor.prototype.getDrawData = function (drawDataIdOrIndex: unknown): unknown {
    if (drawDataIdOrIndex instanceof DrawDataID) {
      if (this.drawDataByIdCache == null) {
        this.drawDataByIdCache = new Object()
        const drawDataCount = this.drawDataList.length
        for (let drawDataIndex = 0; drawDataIndex < drawDataCount; drawDataIndex++) {
          const drawData = this.drawDataList[drawDataIndex]
          const drawDataId = drawData.getDrawDataID()
          if (drawDataId == null) {
            continue
          }
          this.drawDataByIdCache[String(drawDataId)] = drawData
        }
      }
      return this.drawDataByIdCache[String(drawDataIdOrIndex)]
    } else {
      if ((drawDataIdOrIndex as number) < this.drawDataList.length) {
        return this.drawDataList[drawDataIdOrIndex as number]
      } else {
        return null
      }
    }
  }

  /**
   * Releases cached runtime arrays before the model context is rebuilt.
   * @returns Nothing; runtime arrays are cleared in place.
   */
  ModelContextCtor.prototype.release = function (): void {
    this.baseDataList.clear()
    this.drawDataList.clear()
    this.partsDataList.clear()
    if (this.drawDataByIdCache != null) {
      this.drawDataByIdCache.clear()
    }
    this.baseContextList.clear()
    this.drawContextList.clear()
    this.partsContextList.clear()
  }

  /**
   * Rebuilds runtime base, parts, draw, parameter, and clipping tables from the decoded model.
   * @returns Nothing; the context stores the rebuilt tables for update and draw passes.
   */
  ModelContextCtor.prototype.init = function (): void {
    this.paramCacheGeneration++
    if (this.partsDataList.length > 0) {
      this.release()
    }
    const modelImpl = this.model.getModelImpl()
    const sourcePartsDataList = modelImpl.getPartsDataList()
    const partsDataCount = sourcePartsDataList.length
    const unorderedBaseDataList = new Array()
    const unorderedBaseContextList = new Array()
    for (let partsIndex = 0; partsIndex < partsDataCount; ++partsIndex) {
      const partsData = sourcePartsDataList[partsIndex]
      this.partsDataList.push(partsData)
      this.partsContextList.push(partsData.createPartsContext(this))
      const sourceBaseDataList = partsData.getBaseDataList()
      const sourceBaseDataCount = sourceBaseDataList.length
      for (let baseDataIndex = 0; baseDataIndex < sourceBaseDataCount; ++baseDataIndex) {
        unorderedBaseDataList.push(sourceBaseDataList[baseDataIndex])
      }
      for (let baseDataIndex = 0; baseDataIndex < sourceBaseDataCount; ++baseDataIndex) {
        const baseContext = sourceBaseDataList[baseDataIndex].createRuntimeContext(this)
        baseContext.setPartsIndex(partsIndex)
        unorderedBaseContextList.push(baseContext)
      }
      const sourceDrawDataList = partsData.getDrawDataList()
      const sourceDrawDataCount = sourceDrawDataList.length
      for (let drawDataIndex = 0; drawDataIndex < sourceDrawDataCount; ++drawDataIndex) {
        const drawData = sourceDrawDataList[drawDataIndex]
        const drawContext = drawData.createDrawContext(this)
        drawContext.partsIndex = partsIndex
        this.drawDataList.push(drawData)
        this.drawContextList.push(drawContext)
      }
    }
    const unorderedBaseDataCount = unorderedBaseDataList.length
    const defaultBaseDataId = BaseDataID.getDefaultBaseDataID()
    while (true) {
      let didResolveAnyBaseData = false
      for (let baseDataIndex = 0; baseDataIndex < unorderedBaseDataCount; ++baseDataIndex) {
        const baseData = unorderedBaseDataList[baseDataIndex]
        if (baseData == null) {
          continue
        }
        const targetBaseDataId = baseData.getTargetBaseDataID()
        if (
          targetBaseDataId == null ||
          targetBaseDataId == defaultBaseDataId ||
          this.getBaseDataIndex(targetBaseDataId) >= 0
        ) {
          this.baseDataList.push(baseData)
          this.baseContextList.push(unorderedBaseContextList[baseDataIndex])
          unorderedBaseDataList[baseDataIndex] = null
          didResolveAnyBaseData = true
        }
      }
      if (!didResolveAnyBaseData) {
        break
      }
    }
    const paramDefinitionSet = modelImpl.getParamDefinitionSet()
    if (paramDefinitionSet != null) {
      const paramDefinitions = paramDefinitionSet.getParamDefinitions()
      if (paramDefinitions != null) {
        const paramDefinitionCount = paramDefinitions.length
        for (
          let paramDefinitionIndex = 0;
          paramDefinitionIndex < paramDefinitionCount;
          ++paramDefinitionIndex
        ) {
          const paramDefinition = paramDefinitions[paramDefinitionIndex]
          if (paramDefinition == null) {
            continue
          }
          this.registerParamDefinition(
            paramDefinition.getParamID(),
            paramDefinition.getDefaultValue(),
            paramDefinition.getMinValue(),
            paramDefinition.getMaxValue(),
          )
        }
      }
    }
    this.clipManager = new Cubism2ClippingManager(this.drawParam)
    this.clipManager.init(this, this.drawDataList, this.drawContextList)
    this.initialParamUpdatePending = true
  }

  /**
   * Updates parameter-dependent base data, draw data, and draw-order traversal caches.
   * @returns Legacy dirty flag, currently preserved from min.js behavior and always false.
   */
  ModelContextCtor.prototype.update = function (): boolean {
    if (ModelContextCtor.traceUpdatePhases) {
      UtDebug.start('modelContextParamChangeScan')
    }
    const paramCapacity = this.paramValues.length
    for (let paramIndex = 0; paramIndex < paramCapacity; paramIndex++) {
      if (this.paramValues[paramIndex] != this.previousParamValues[paramIndex]) {
        this.paramDirtyFlags[paramIndex] = ModelContextCtor.dirtyParamFlag
        this.previousParamValues[paramIndex] = this.paramValues[paramIndex]
      }
    }
    const hasRuntimeChanges = false
    const baseDataCount = this.baseDataList.length
    const drawDataCount = this.drawDataList.length
    const minDrawOrder = Cubism2DrawDataBase.getMinDrawOrder()
    const maxDrawOrder = Cubism2DrawDataBase.getMaxDrawOrder()
    const drawOrderSpan = maxDrawOrder - minDrawOrder + 1
    if (this.drawOrderHeadIndices == null || this.drawOrderHeadIndices.length < drawOrderSpan) {
      this.drawOrderHeadIndices = new Int16Array(drawOrderSpan)
      this.drawOrderTailIndices = new Int16Array(drawOrderSpan)
    }
    for (let drawOrderOffset = 0; drawOrderOffset < drawOrderSpan; drawOrderOffset++) {
      this.drawOrderHeadIndices[drawOrderOffset] = ModelContextCtor.emptyDrawOrderIndex
      this.drawOrderTailIndices[drawOrderOffset] = ModelContextCtor.emptyDrawOrderIndex
    }
    if (this.nextDrawDataIndices == null || this.nextDrawDataIndices.length < drawDataCount) {
      this.nextDrawDataIndices = new Int16Array(drawDataCount)
    }
    for (let drawDataIndex = 0; drawDataIndex < drawDataCount; drawDataIndex++) {
      this.nextDrawDataIndices[drawDataIndex] = ModelContextCtor.endOfDrawOrderIndex
    }
    if (ModelContextCtor.traceUpdatePhases) {
      UtDebug.dump('modelContextParamChangeScan')
    }
    if (ModelContextCtor.traceUpdatePhases) {
      UtDebug.start('modelContextBaseUpdate')
    }
    let firstBaseUpdateError = null
    for (let baseDataIndex = 0; baseDataIndex < baseDataCount; ++baseDataIndex) {
      const baseData = this.baseDataList[baseDataIndex]
      const baseContext = this.baseContextList[baseDataIndex]
      try {
        baseData.updateRuntimeContext(this, baseContext)
        baseData.applyRuntimeContext(this, baseContext)
      } catch (baseUpdateError) {
        if (firstBaseUpdateError == null) {
          firstBaseUpdateError = baseUpdateError
        }
      }
    }
    if (firstBaseUpdateError != null) {
      if (ModelContextCtor.reportUpdateErrors) {
        UtDebug.logException(firstBaseUpdateError)
      }
    }
    if (ModelContextCtor.traceUpdatePhases) {
      UtDebug.dump('modelContextBaseUpdate')
    }
    if (ModelContextCtor.traceUpdatePhases) {
      UtDebug.start('modelContextDrawUpdate')
    }
    let firstDrawUpdateError = null
    for (let drawDataIndex = 0; drawDataIndex < drawDataCount; ++drawDataIndex) {
      const drawData = this.drawDataList[drawDataIndex]
      const drawContext = this.drawContextList[drawDataIndex]
      try {
        drawData.updateDrawContext(this, drawContext)
        if (drawContext.isClipped()) {
          continue
        }
        drawData.applyDrawContext(this, drawContext)
        let drawOrderOffset = Math.floor(drawData.getDrawOrder(this, drawContext) - minDrawOrder)
        let previousDrawDataIndex
        try {
          previousDrawDataIndex = this.drawOrderTailIndices[drawOrderOffset]
        } catch (drawOrderError) {
          console.log(
            'Failed to resolve draw order: %s / %s\n',
            String(drawOrderError),
            drawData.getDrawDataID().toString(),
          )
          drawOrderOffset = Math.floor(drawData.getDrawOrder(this, drawContext) - minDrawOrder)
          continue
        }
        if (previousDrawDataIndex == ModelContextCtor.emptyDrawOrderIndex) {
          this.drawOrderHeadIndices[drawOrderOffset] = drawDataIndex
        } else {
          this.nextDrawDataIndices[previousDrawDataIndex] = drawDataIndex
        }
        this.drawOrderTailIndices[drawOrderOffset] = drawDataIndex
      } catch (drawUpdateError) {
        if (firstDrawUpdateError == null) {
          firstDrawUpdateError = drawUpdateError
          Live2D.setErrorCode(Live2D.L2D_ERROR_MODEL_UPDATE)
        }
      }
    }
    if (firstDrawUpdateError != null) {
      if (ModelContextCtor.reportUpdateErrors) {
        UtDebug.logException(firstDrawUpdateError)
      }
    }
    if (ModelContextCtor.traceUpdatePhases) {
      UtDebug.dump('modelContextDrawUpdate')
    }
    if (ModelContextCtor.traceUpdatePhases) {
      UtDebug.start('modelContextDirtyFlagReset')
    }
    for (let paramIndex = this.paramDirtyFlags.length - 1; paramIndex >= 0; paramIndex--) {
      this.paramDirtyFlags[paramIndex] = ModelContextCtor.cleanParamFlag
    }
    this.initialParamUpdatePending = false
    if (ModelContextCtor.traceUpdatePhases) {
      UtDebug.dump('modelContextDirtyFlagReset')
    }
    return hasRuntimeChanges
  }

  /**
   * Prepares clipping state before a draw call.
   * @param drawParam Draw parameter adapter used by the renderer.
   */
  ModelContextCtor.prototype.preDraw = function (
    drawParam: Cubism2ModelContextDrawParamLike,
  ): void {
    if (this.clipManager != null) {
      drawParam.prepareDrawState()
      this.clipManager.setupClip(this, drawParam)
    }
  }

  /**
   * Draws runtime draw contexts by min.js draw-order linked lists.
   * @param drawParam Draw parameter adapter used by WebGL or Canvas rendering.
   * @returns Nothing; draw commands are forwarded to each visible draw data entry.
   */
  ModelContextCtor.prototype.draw = function (drawParam: Cubism2ModelContextDrawParamLike): void {
    if (this.drawOrderHeadIndices == null) {
      UtDebug.logWithLegacyPrefix('Call model.update() before model.draw().')
      return
    }
    const drawOrderBucketCount = this.drawOrderHeadIndices.length
    drawParam.prepareDrawState()
    for (let drawOrderOffset = 0; drawOrderOffset < drawOrderBucketCount; ++drawOrderOffset) {
      let drawDataIndex = this.drawOrderHeadIndices[drawOrderOffset]
      if (drawDataIndex == ModelContextCtor.emptyDrawOrderIndex) {
        continue
      }
      do {
        const drawData = this.drawDataList[drawDataIndex]
        const drawContext = this.drawContextList[drawDataIndex]
        if (drawContext.isRenderable()) {
          const partsIndex = drawContext.partsIndex
          const partsContext = this.partsContextList[partsIndex]
          drawContext.partsOpacity = partsContext.getPartsOpacity()
          drawData.draw(drawParam, this, drawContext)
        }
        const nextDrawDataIndex = this.nextDrawDataIndices[drawDataIndex]
        if (
          nextDrawDataIndex <= drawDataIndex ||
          nextDrawDataIndex == ModelContextCtor.endOfDrawOrderIndex
        ) {
          break
        }
        drawDataIndex = nextDrawDataIndex
      } while (true)
    }
  }

  /**
   * Resolves or creates a runtime parameter index.
   * @param paramId Cubism2 parameter id used by model data and motions.
   * @returns Runtime parameter index.
   */
  ModelContextCtor.prototype.getParamIndex = function (paramId: unknown): number {
    for (let paramIndex = this.paramIds.length - 1; paramIndex >= 0; --paramIndex) {
      if (this.paramIds[paramIndex] == paramId) {
        return paramIndex
      }
    }
    return this.registerParamDefinition(
      paramId,
      0,
      ModelContextCtor.fallbackParamMinValue,
      ModelContextCtor.fallbackParamMaxValue,
    )
  }

  /**
   * Resolves a base-data index through the model-context lookup boundary.
   * @param baseDataId Cubism2 base-data id.
   * @returns Base data index, or -1.
   */
  ModelContextCtor.prototype.resolveBaseDataIndex = function (baseDataId: unknown): number {
    return this.getBaseDataIndex(baseDataId)
  }

  /**
   * Resolves a base data id into the runtime base-data array index.
   * @param baseDataId Cubism2 base-data id read from the model definition.
   * @returns Base data index, or -1 when no matching base data exists.
   */
  ModelContextCtor.prototype.getBaseDataIndex = function (baseDataId: unknown): number {
    for (let baseDataIndex = this.baseDataList.length - 1; baseDataIndex >= 0; --baseDataIndex) {
      if (
        this.baseDataList[baseDataIndex] != null &&
        this.baseDataList[baseDataIndex].getBaseDataID() == baseDataId
      ) {
        return baseDataIndex
      }
    }
    return -1
  }

  /**
   * Copies an existing parameter float array into a larger typed-array capacity.
   * @param sourceArray Existing parameter value/min/max/cache array.
   * @param nextCapacity New capacity used after the parameter table grows.
   * @returns New Float32Array containing the previous values.
   */
  ModelContextCtor.prototype.copyFloatArrayToCapacity = function (
    sourceArray: Float32Array,
    nextCapacity: number,
  ): Float32Array {
    const nextArray = new Float32Array(nextCapacity)
    UtSystem.copyArraySegmentForward(
      sourceArray,
      0,
      nextArray as unknown as { [index: number]: unknown },
      0,
      sourceArray.length,
    )
    return nextArray
  }

  /**
   * Registers a parameter definition and expands all parameter caches when needed.
   * @param paramId Cubism2 parameter id used by motions, parts, and draw data.
   * @param defaultValue Initial parameter value from the model definition.
   * @param minValue Lower clamp used by setParamFloat.
   * @param maxValue Upper clamp used by setParamFloat.
   * @returns Index assigned to the parameter in the runtime parameter arrays.
   */
  ModelContextCtor.prototype.registerParamDefinition = function (
    paramId: unknown,
    defaultValue: number,
    minValue: number,
    maxValue: number,
  ): number {
    if (this.paramCount >= this.paramIds.length) {
      const previousCapacity = this.paramIds.length
      const nextParamIds = new Array(previousCapacity * 2)
      UtSystem.copyArraySegmentForward(this.paramIds, 0, nextParamIds, 0, previousCapacity)
      this.paramIds = nextParamIds
      this.paramValues = this.copyFloatArrayToCapacity(this.paramValues, previousCapacity * 2)
      this.previousParamValues = this.copyFloatArrayToCapacity(
        this.previousParamValues,
        previousCapacity * 2,
      )
      this.paramMinValues = this.copyFloatArrayToCapacity(this.paramMinValues, previousCapacity * 2)
      this.paramMaxValues = this.copyFloatArrayToCapacity(this.paramMaxValues, previousCapacity * 2)
      const nextParamDirtyFlags = new Array()
      UtSystem.copyArraySegmentForward(
        this.paramDirtyFlags,
        0,
        nextParamDirtyFlags,
        0,
        previousCapacity,
      )
      this.paramDirtyFlags = nextParamDirtyFlags
    }
    const paramIndex = this.paramCount
    this.paramIds[paramIndex] = paramId
    this.paramValues[paramIndex] = defaultValue
    this.previousParamValues[paramIndex] = defaultValue
    this.paramMinValues[paramIndex] = minValue
    this.paramMaxValues[paramIndex] = maxValue
    this.paramDirtyFlags[paramIndex] = ModelContextCtor.dirtyParamFlag
    this.paramCount++
    return paramIndex
  }

  /**
   * Replaces one runtime base data entry after model-data resolution.
   * @param baseDataIndex Runtime base data index.
   * @param baseData Replacement base data object.
   * @returns Nothing; the base data table is mutated in place.
   */
  ModelContextCtor.prototype.setBaseData = function (
    baseDataIndex: number,
    baseData: unknown,
  ): void {
    this.baseDataList[baseDataIndex] = baseData
  }

  /**
   * Writes a clamped parameter value by runtime parameter index.
   * @param paramIndex Runtime parameter index.
   * @param nextValue Requested parameter value before min/max clamping.
   * @returns Nothing; the current parameter array is updated.
   */
  ModelContextCtor.prototype.setParamFloat = function (
    paramIndex: number,
    nextValue: number,
  ): void {
    if (nextValue < this.paramMinValues[paramIndex]) {
      nextValue = this.paramMinValues[paramIndex]
    }
    if (nextValue > this.paramMaxValues[paramIndex]) {
      nextValue = this.paramMaxValues[paramIndex]
    }
    this.paramValues[paramIndex] = nextValue
  }

  /**
   * Restores parameter values from the saved snapshot used by motion blending.
   * @returns Nothing; the current parameter array receives saved values.
   */
  ModelContextCtor.prototype.loadParam = function (): void {
    let copyCount = this.paramValues.length
    if (copyCount > this.savedParamValues.length) {
      copyCount = this.savedParamValues.length
    }
    UtSystem.copyArraySegmentForward(
      this.savedParamValues,
      0,
      this.paramValues,
      0,
      copyCount,
    )
  }

  /**
   * Saves the current parameter values for later restoration.
   * @returns Nothing; the saved parameter snapshot is resized when necessary.
   */
  ModelContextCtor.prototype.saveParam = function (): void {
    const copyCount = this.paramValues.length
    if (copyCount > this.savedParamValues.length) {
      this.savedParamValues = new Float32Array(copyCount)
    }
    UtSystem.copyArraySegmentForward(
      this.paramValues,
      0,
      this.savedParamValues,
      0,
      copyCount,
    )
  }

  /**
   * Returns the model-context generation used to invalidate cached parameter index lookups.
   * @returns Incrementing generation value bumped whenever ModelContext.init rebuilds runtime tables.
   */
  ModelContextCtor.prototype.getParamCacheGeneration = function (): number {
    return this.paramCacheGeneration
  }

  /**
   * Reports whether the first update after initialization should treat all parameter sources as dirty.
   * @returns True before the first completed update after init.
   */
  ModelContextCtor.prototype.isInitialParamUpdatePending = function (): boolean {
    return this.initialParamUpdatePending
  }

  /**
   * Checks whether a parameter changed since the last update pass.
   * @param paramIndex Runtime parameter index in the model context parameter arrays.
   * @returns True when dependent base/draw data should recompute.
   */
  ModelContextCtor.prototype.isParamChanged = function (paramIndex: number): boolean {
    return this.paramDirtyFlags[paramIndex] == ModelContextCtor.dirtyParamFlag
  }

  /**
   * Returns the shared scratch buffer used by interpolation helpers to store selected vertex indexes.
   * @returns Scratch Int16Array reused during model interpolation.
   */
  ModelContextCtor.prototype.getScratchIndexBuffer = function (): Int16Array {
    return this.scratchIndexBuffer
  }

  /**
   * Returns the shared scratch buffer used by interpolation helpers to store interpolation weights.
   * @returns Scratch Float32Array reused during model interpolation.
   */
  ModelContextCtor.prototype.getScratchWeightBuffer = function (): Float32Array {
    return this.scratchWeightBuffer
  }

  /**
   * Reads runtime base data by index.
   * @param baseDataIndex Runtime base data index.
   * @returns Base data object.
   */
  ModelContextCtor.prototype.getBaseData = function (baseDataIndex: number): unknown {
    return this.baseDataList[baseDataIndex]
  }

  /**
   * Reads the current parameter value by index.
   * @param paramIndex Runtime parameter index.
   * @returns Current clamped parameter value.
   */
  ModelContextCtor.prototype.getParamFloat = function (paramIndex: number): number {
    return this.paramValues[paramIndex]
  }

  /**
   * Reads the upper parameter clamp by index.
   * @param paramIndex Runtime parameter index.
   * @returns Maximum allowed value for the parameter.
   */
  ModelContextCtor.prototype.getParamMax = function (paramIndex: number): number {
    return this.paramMaxValues[paramIndex]
  }

  /**
   * Reads the lower parameter clamp by index.
   * @param paramIndex Runtime parameter index.
   * @returns Minimum allowed value for the parameter.
   */
  ModelContextCtor.prototype.getParamMin = function (paramIndex: number): number {
    return this.paramMinValues[paramIndex]
  }

  /**
   * Writes one parts context opacity.
   * @param partsIndex Runtime parts index.
   * @param opacity Opacity value forwarded to the parts context.
   * @returns Nothing; the parts context is mutated.
   */
  ModelContextCtor.prototype.setPartsOpacity = function (
    partsIndex: number,
    opacity: number,
  ): void {
    const partsContext = this.partsContextList[partsIndex]
    partsContext.setPartsOpacity(opacity)
  }

  /**
   * Reads one parts context opacity.
   * @param partsIndex Runtime parts index.
   * @returns Current opacity for that parts context.
   */
  ModelContextCtor.prototype.getPartsOpacity = function (partsIndex: number): number {
    const partsContext = this.partsContextList[partsIndex]
    return partsContext.getPartsOpacity()
  }

  /**
   * Resolves a parts id into the runtime parts array index.
   * @param partsDataId PartsDataID value requested by public model APIs.
   * @returns Parts index, or -1 when the id is missing.
   */
  ModelContextCtor.prototype.getPartsDataIndex = function (partsDataId: unknown): number {
    for (let partsIndex = this.partsDataList.length - 1; partsIndex >= 0; --partsIndex) {
      if (
        this.partsDataList[partsIndex] != null &&
        this.partsDataList[partsIndex].getPartsIDForModelLookup() == partsDataId
      ) {
        return partsIndex
      }
    }
    return -1
  }

  /**
   * Reads runtime base context by index for model-data update routines.
   * @param baseDataIndex Runtime base data index.
   * @returns Base context paired with the base data.
   */
  ModelContextCtor.prototype.getBaseContext = function (baseDataIndex: number): unknown {
    return this.baseContextList[baseDataIndex]
  }

  /**
   * Returns the runtime draw context paired with one draw data entry during model initialization.
   * @param drawDataIndex Draw data index resolved from `DrawDataID` or clipping order.
   * @returns Runtime draw context used for transform updates, clipping, and final drawing.
   */
  ModelContextCtor.prototype.getDrawContext = function (drawDataIndex: number): unknown {
    return this.drawContextList[drawDataIndex]
  }

  /**
   * Reads runtime parts context by index for draw opacity propagation.
   * @param partsIndex Runtime parts index.
   * @returns Parts context paired with the parts data.
   */
  ModelContextCtor.prototype.getPartsContext = function (partsIndex: number): unknown {
    return this.partsContextList[partsIndex]
  }

  /**
   * Writes transformed draw data vertices by walking the current draw-order chain.
   * @param outputOffset Initial offset into the destination point buffer.
   * @param drawStride Number of destination entries advanced after each visible draw context.
   * @returns Nothing; draw contexts write into their owning transformed-point buffers.
   */
  ModelContextCtor.prototype.writeTransformedPointsByDrawOrder = function (
    outputOffset: number,
    drawStride: number,
  ): void {
    const drawOrderBucketCount = this.drawOrderHeadIndices.length
    let nextOutputOffset = outputOffset
    for (let drawOrderOffset = 0; drawOrderOffset < drawOrderBucketCount; ++drawOrderOffset) {
      let drawDataIndex = this.drawOrderHeadIndices[drawOrderOffset]
      if (drawDataIndex == ModelContextCtor.emptyDrawOrderIndex) {
        continue
      }
      do {
        const drawContext = this.drawContextList[drawDataIndex]
        if (drawContext.isRenderable()) {
          drawContext
            .getSourceDrawData()
            .writeDrawOrderToPointBuffer(this, drawContext, nextOutputOffset)
          nextOutputOffset += drawStride
        }
        const nextDrawDataIndex = this.nextDrawDataIndices[drawDataIndex]
        if (
          nextDrawDataIndex <= drawDataIndex ||
          nextDrawDataIndex == ModelContextCtor.endOfDrawOrderIndex
        ) {
          break
        }
        drawDataIndex = nextDrawDataIndex
      } while (true)
    }
  }

  /**
   * Attaches the draw parameter adapter used by clipping initialization.
   * @param drawParam Draw parameter adapter supplied by the renderer.
   */
  ModelContextCtor.prototype.setDrawParam = function (drawParam: unknown): void {
    this.drawParam = drawParam
  }

  /**
   * Reads the current draw parameter adapter.
   * @returns Draw parameter adapter attached through setDrawParam.
   */
  ModelContextCtor.prototype.getDrawParam = function (): unknown {
    return this.drawParam
  }

  return {
    ModelContext: ModelContextCtor,
  }
}
