export interface Cubism2ModelDataParamDefinitionSetInstance {
  initializeParamDefinitions: () => void
}

export type Cubism2ModelDataParamDefinitionSetConstructor = {
  new (): Cubism2ModelDataParamDefinitionSetInstance
}

export interface Cubism2ModelDataReader {
  readInt32: () => number
  readObject: () => unknown
}

export interface Cubism2ModelDataPayload {
  canvasHeight: number
  canvasWidth: number
  paramDefinitionSet: Cubism2ModelDataParamDefinitionSetInstance | unknown | null
  partsDataList: unknown[] | null
}

export interface Cubism2ModelDataInstance {
  canvasHeight: number
  canvasWidth: number
  paramDefinitionSet: Cubism2ModelDataParamDefinitionSetInstance | unknown | null
  partsDataList: unknown[] | null
  addPartsData: (partsData: unknown) => void
  getCanvasHeight: () => number
  getCanvasWidth: () => number
  getParamDefinitionSet: () => Cubism2ModelDataParamDefinitionSetInstance | unknown | null
  getPartsDataList: () => unknown[] | null
  initializeModelContainers: () => void
  readModelData: (reader: Cubism2ModelDataReader) => void
}

export type Cubism2ModelDataConstructor = {
  instanceCount: number
  new (): Cubism2ModelDataInstance
  prototype: Cubism2ModelDataInstance
}

export interface CreateCubism2ModelDataOptions {
  Cubism2ParamDefinitionSet: Cubism2ModelDataParamDefinitionSetConstructor
  isBootstrapping: () => boolean
}

export interface Cubism2ModelDataConstructors {
  Cubism2ModelImpl: Cubism2ModelDataConstructor
}

const DEFAULT_MODEL_CANVAS_WIDTH = 400
const DEFAULT_MODEL_CANVAS_HEIGHT = 400

/**
 * Reads the type-136 model implementation payload in the original min.js field order.
 * @param reader Binary reader positioned after the model-implementation type tag.
 * @returns Named payload carrying parameter definitions, parts list, and authored canvas size.
 */
function readCubism2ModelDataPayload(
  reader: Cubism2ModelDataReader,
): Cubism2ModelDataPayload {
  const paramDefinitionSet = reader.readObject()
  const partsDataList = reader.readObject() as unknown[] | null
  const canvasWidth = reader.readInt32()
  const canvasHeight = reader.readInt32()

  return {
    canvasHeight,
    canvasWidth,
    paramDefinitionSet,
    partsDataList,
  }
}

/**
 * Applies a decoded model-data payload to the mutable legacy model implementation object.
 * @param modelData Model implementation instance receiving the decoded MOC fields.
 * @param modelPayload Payload returned by the type-136 model-data reader.
 */
function applyCubism2ModelDataPayload(
  modelData: Cubism2ModelDataInstance,
  modelPayload: Cubism2ModelDataPayload,
): void {
  modelData.paramDefinitionSet = modelPayload.paramDefinitionSet
  modelData.partsDataList = modelPayload.partsDataList
  modelData.canvasWidth = modelPayload.canvasWidth
  modelData.canvasHeight = modelPayload.canvasHeight
}

/**
 * Creates the decoded model-data constructor used by the min.js-derived MOC reader.
 * @param options Param-definition constructor and bootstrap guard needed by legacy prototype setup.
 * @returns Model-data constructor bound to the supplied dependencies.
 */
export function createCubism2ModelData(
  options: CreateCubism2ModelDataOptions,
): Cubism2ModelDataConstructors {
  /**
   * Stores deserialized Cubism2 model metadata, parameter definitions, parts blocks, and canvas size.
   */
  function Cubism2ModelImpl(this: Cubism2ModelDataInstance): void {
    if (options.isBootstrapping()) {
      return
    }
    this.paramDefinitionSet = null
    this.partsDataList = null
    this.canvasWidth = DEFAULT_MODEL_CANVAS_WIDTH
    this.canvasHeight = DEFAULT_MODEL_CANVAS_HEIGHT
    ModelImpl.instanceCount++
  }

  const ModelImpl = Cubism2ModelImpl as unknown as Cubism2ModelDataConstructor
  ModelImpl.instanceCount = 0

  /**
   * Ensures fallback model containers exist before an empty model is used.
   */
  ModelImpl.prototype.initializeModelContainers = function (): void {
    if (this.paramDefinitionSet == null) {
      this.paramDefinitionSet = new options.Cubism2ParamDefinitionSet()
    }
    if (this.partsDataList == null) {
      this.partsDataList = new Array()
    }
  }

  /**
   * Reads the authored model canvas width.
   * @returns Canvas width stored in the decoded MOC model data.
   */
  ModelImpl.prototype.getCanvasWidth = function (): number {
    return this.canvasWidth
  }

  /**
   * Reads the authored model canvas height.
   * @returns Canvas height stored in the decoded MOC model data.
   */
  ModelImpl.prototype.getCanvasHeight = function (): number {
    return this.canvasHeight
  }

  /**
   * Deserializes parameter definitions, parts data, and canvas size from a model-data payload.
   * @param reader Binary reader positioned at the type-136 model implementation payload.
   */
  ModelImpl.prototype.readModelData = function (reader: Cubism2ModelDataReader): void {
    const modelPayload = readCubism2ModelDataPayload(reader)
    applyCubism2ModelDataPayload(this, modelPayload)
  }

  /**
   * Appends one parts data block while a fallback model is being assembled programmatically.
   * @param partsData Parts-level data object produced by the Cubism2 reader or caller.
   */
  ModelImpl.prototype.addPartsData = function (partsData: unknown): void {
    this.partsDataList!.push(partsData)
  }

  /**
   * Reads the model's parts data list consumed by ModelContext initialization.
   * @returns Parts data objects deserialized from the MOC payload, or null before initialization.
   */
  ModelImpl.prototype.getPartsDataList = function (): unknown[] | null {
    return this.partsDataList
  }

  /**
   * Reads the model's parameter definition set consumed by ModelContext parameter registration.
   * @returns Parameter definition set deserialized from the MOC payload, or null before initialization.
   */
  ModelImpl.prototype.getParamDefinitionSet = function ():
    | Cubism2ModelDataParamDefinitionSetInstance
    | unknown
    | null {
    return this.paramDefinitionSet
  }

  return {
    Cubism2ModelImpl: ModelImpl,
  }
}
