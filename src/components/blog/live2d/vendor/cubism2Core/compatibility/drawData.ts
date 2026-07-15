import type {
  Cubism2DrawContextBaseConstructor,
  Cubism2DrawContextBaseInstance,
} from './drawContextBase'
import type {
  Cubism2InterpolationModelContextLike,
  Cubism2InterpolationParamBindingSetLike,
} from './interpolation'
import type { Cubism2ParamBindingModelContextLike } from './paramBinding'
import type { Cubism2RuntimeConstantsLike } from './runtimeConstants'

export type Cubism2DrawDataRuntimeConstantsLike = Pick<
  Cubism2RuntimeConstantsLike,
  | 'FLIP_MODEL_SPACE_UV_Y'
  | 'MODEL_SPACE_COORDINATE_MODE'
  | 'POINT_TUPLE_SIZE'
  | 'POINT_X_OFFSET'
  | 'SDK2_COORDINATE_MODE'
  | 'activeCoordinateMode'
>

export interface Cubism2DrawDataReader {
  getFormatVersion: () => number
  readFloat32Array: () => number[]
  readInt32: () => number
  readInt32Array: () => number[]
  readObject: () => unknown
}

export interface Cubism2DrawDataBaseInstance {
  clipID: unknown | null
  clipIDList: unknown[] | null
  drawDataId: unknown | null
  drawOrderPointCount: number | null
  drawOrderValues: number[] | null
  opacityValues: number[] | null
  paramBindingSet: Cubism2ParamBindingSetLike | null
  targetBaseDataId: unknown | null
  applyDrawContext: (
    modelContext: Cubism2ModelContextLike,
    drawContext: Cubism2DrawContextBaseInstance,
  ) => void
  convertClipIDForV2_11: (clipId: unknown) => unknown[] | null
  draw: (drawParam: unknown, modelContext: unknown, drawContext: unknown) => void
  getClipIDList: () => unknown[] | null
  getDrawDataID: () => unknown | null
  getDrawOrder: (modelContext: unknown, drawContext: Cubism2DrawContextBaseInstance) => unknown
  getOpacity: (modelContext: unknown, drawContext: Cubism2DrawContextBaseInstance) => unknown
  getTargetBaseDataID: () => unknown | null
  getType: () => unknown
  hasTargetBaseData: () => boolean
  createDrawContext: (modelContext: unknown) => unknown
  preDraw: (drawParam: unknown, modelContext: unknown, drawContext: unknown) => void
  readDrawDataBase: (reader: Cubism2DrawDataReader) => void
  setDrawDataID: (drawDataId: unknown) => void
  setTargetBaseDataID: (targetBaseDataId: unknown) => void
  trackDrawOrderBounds: (drawOrderValues: number[]) => void
  updateDrawContext: (
    modelContext: Cubism2ModelContextLike,
    drawContext: Cubism2DrawContextBaseInstance,
  ) => void
  writeDrawOrderToPointBuffer: (
    modelContext: unknown,
    drawContext: unknown,
    drawOrderOffset: number,
  ) => void
}

export interface Cubism2MeshDrawDataInstance extends Cubism2DrawDataBaseInstance {
  blendMode: number
  culling: boolean
  drawFlagBits: number | null
  drawFlagOptions: Record<string, unknown> | null
  gl_cacheImage: unknown | null
  indexArray: Int16Array | null
  instanceNo: number
  textureNo: number
  triangleCount: number
  uvCoordinates: number[] | null
  vertexCount: number
  vertexPointValues: number[][] | null
  createDrawContext: () => Cubism2MeshDrawContextInstance
  dump: () => void
  getDrawFlagBits: () => number | null
  getDrawFlagOption: (optionKey: string) => unknown | null
  getIndexArray: () => Int16Array | null
  getNumPoints: () => number
  getTextureNo: () => number
  getUVCoordinates: () => number[] | null
  initMeshStorage: () => void
  readMeshDrawData: (reader: Cubism2DrawDataReader) => void
  setTextureNo: (textureNo: number) => void
  writeDrawOrderToPointBuffer: (
    modelContext: unknown,
    drawContext: unknown,
    drawOrderOffset: number,
  ) => void
}

export interface Cubism2MeshDrawContextInstance extends Cubism2DrawContextBaseInstance {
  localPoints: Float32Array | null
  targetBaseDataIndex: number
  targetSpacePoints: Float32Array | null
  getTransformedPoints: () => Float32Array | null
}

export interface Cubism2DrawDataBaseConstructor {
  DEFAULT_DRAW_ORDER_BOUND: number
  TYPE_LEGACY_3: number
  TYPE_LEGACY_4: number
  TYPE_MESH: number
  UNRESOLVED_TARGET_BASE_DATA_INDEX: number
  getMaxDrawOrder: () => number
  getMinDrawOrder: () => number
  maxDrawOrder: number
  minDrawOrder: number
  new (): Cubism2DrawDataBaseInstance
  prototype: Cubism2DrawDataBaseInstance
  trackDrawOrderBounds: (drawOrderValues: number[]) => void
}

type Cubism2LegacyDrawDataParentConstructor = Omit<
  Cubism2DrawDataBaseConstructor,
  'trackDrawOrderBounds'
>

export interface Cubism2MeshDrawDataConstructor {
  BLEND_ADD: number
  BLEND_MULTIPLY: number
  BLEND_NORMAL: number
  DRAW_FLAG_BLEND_MODE_MASK: number
  instanceCount: number
  new (): Cubism2MeshDrawDataInstance
  paramDirtyFlagScratch: boolean[]
  prototype: Cubism2MeshDrawDataInstance
}

export interface Cubism2MeshDrawContextConstructor {
  new (sourceDrawData?: Cubism2MeshDrawDataInstance): Cubism2MeshDrawContextInstance
  prototype: Cubism2MeshDrawContextInstance
}

export interface Cubism2DrawDataConstructors {
  Cubism2DrawDataBase: Cubism2DrawDataBaseConstructor
  Cubism2MeshDrawContext: Cubism2MeshDrawContextConstructor
  Cubism2MeshDrawData: Cubism2MeshDrawDataConstructor
}

export interface Cubism2BaseDataIdLike {
  getDefaultBaseDataID: () => unknown
}

export interface Cubism2MocVersionLike {
  LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER: number
  MAX_SUPPORTED_FORMAT_VERSION: number
}

export interface Cubism2ParamBindingSetConstructorLike {
  new (): Cubism2ParamBindingSetLike
}

export interface Cubism2ParamBindingSetLike
  extends Cubism2InterpolationParamBindingSetLike<Cubism2ModelContextLike> {
  buildInterpolationCorners(
    indexBuffer: ArrayLike<number>,
    weightBuffer: ArrayLike<number>,
    dimensionCount: number,
  ): void
  hasChangedParams(modelContext: Cubism2ModelContextLike): boolean
  initBindingList(): void
  resolveInterpolationWeights(
    modelContext: Cubism2ModelContextLike,
    dirtyFlagRef: boolean[],
  ): number
}

export interface Cubism2DrawDataInterpolator {
  interpolatePoints(
    modelContext: Cubism2ModelContextLike,
    paramBindingSet: Cubism2ParamBindingSetLike,
    dirtyFlagRef: boolean[],
    pointCount: number,
    pointValues: number[][] | null,
    outputPoints: Float32Array | null,
    valueOffset: number,
    tupleStride: number,
  ): void
  interpolateInteger(
    modelContext: Cubism2ModelContextLike,
    paramBindingSet: Cubism2ParamBindingSetLike,
    dirtyFlagRef: boolean[],
    sourceValues: number[] | null,
  ): number
  interpolateFloat(
    modelContext: Cubism2ModelContextLike,
    paramBindingSet: Cubism2ParamBindingSetLike,
    dirtyFlagRef: boolean[],
    sourceValues: number[] | null,
  ): number
}

export interface Cubism2ModelContextLike
  extends Cubism2InterpolationModelContextLike,
    Cubism2ParamBindingModelContextLike {
  getBaseContext: (baseDataIndex: number) => Cubism2BaseContextLike
  getBaseData: (baseDataIndex: number) => Cubism2TargetBaseDataLike | null
  getBaseDataIndex: (baseDataId: unknown) => number
}

export interface Cubism2BaseContextLike {
  getTotalOpacity: () => number
  hasTransform: () => boolean
}

export interface Cubism2TargetBaseDataLike {
  transformPoints: (
    modelContext: Cubism2ModelContextLike,
    targetBaseContext: Cubism2BaseContextLike,
    inputPoints: Float32Array | null,
    outputPoints: Float32Array | null,
    pointCount: number,
    valueOffset: number,
    tupleStride: number,
  ) => void
}

export interface Cubism2Live2DFlags {
  isVerboseLoggingEnabled: () => boolean
  shouldUpdateClippedDrawContextOpacity: boolean
}

export interface Cubism2DebugLoggerLike {
  logWithLegacyPrefix: (message: string, ...args: unknown[]) => void
}

export interface Cubism2DrawParamLike {
  drawTexture: (
    textureNo: number,
    triangleIndexCount: number,
    indexArray: Int16Array | null,
    outputPoints: Float32Array | null,
    uvCoordinates: number[] | null,
    opacity: number,
    blendMode: number,
    drawContext: Cubism2MeshDrawContextInstance,
  ) => void
  setCulling: (culling: boolean) => void
  setClipBufPre_clipContextForDraw: (clipContext: unknown) => void
}

export interface CreateCubism2DrawDataOptions {
  BaseDataID: Cubism2BaseDataIdLike
  Cubism2DrawContextBase: Cubism2DrawContextBaseConstructor
  Cubism2MocVersion: Cubism2MocVersionLike
  Cubism2ParamBindingSet: Cubism2ParamBindingSetConstructorLike
  Cubism2RuntimeConstants: Cubism2DrawDataRuntimeConstantsLike
  Live2D: Cubism2Live2DFlags
  UtDebug: Cubism2DebugLoggerLike
  interpolator: Cubism2DrawDataInterpolator
  isBootstrapping: () => boolean
}

/**
 * Creates Cubism2 draw-data constructors used by type-70 mesh draw records.
 * @param options Runtime dependencies from the min.js compatibility capsule.
 * @returns Draw-data constructors bound to the supplied runtime dependencies.
 */
export function createCubism2DrawData(
  options: CreateCubism2DrawDataOptions,
): Cubism2DrawDataConstructors {
  const {
    BaseDataID,
    Cubism2DrawContextBase,
    Cubism2MocVersion,
    Cubism2ParamBindingSet,
    Cubism2RuntimeConstants,
    Live2D,
    UtDebug,
    interpolator,
  } = options

  /**
   * Shared draw-data parent retained as the semantic prototype base.
   */
  function Cubism2LegacyDrawDataParent(this: Cubism2DrawDataBaseInstance): void {
    if (options.isBootstrapping()) {
      return
    }
    this.drawDataId = null
    this.targetBaseDataId = null
    this.paramBindingSet = null
    this.drawOrderPointCount = null
    this.drawOrderValues = null
    this.opacityValues = null
    this.clipID = null
    this.clipIDList = new Array()
  }

  const LegacyDrawDataParent =
    Cubism2LegacyDrawDataParent as unknown as Cubism2LegacyDrawDataParentConstructor

  LegacyDrawDataParent.UNRESOLVED_TARGET_BASE_DATA_INDEX = -2
  LegacyDrawDataParent.DEFAULT_DRAW_ORDER_BOUND = 500
  LegacyDrawDataParent.TYPE_MESH = 2
  LegacyDrawDataParent.TYPE_LEGACY_3 = 3
  LegacyDrawDataParent.TYPE_LEGACY_4 = 4
  LegacyDrawDataParent.minDrawOrder = LegacyDrawDataParent.DEFAULT_DRAW_ORDER_BOUND
  LegacyDrawDataParent.maxDrawOrder = LegacyDrawDataParent.DEFAULT_DRAW_ORDER_BOUND

  /**
   * Expands the parent draw-order bounds from one parsed payload.
   * @param drawOrderValues Interpolated draw-order values parsed from the MOC record.
   */
  LegacyDrawDataParent.prototype.trackDrawOrderBounds = function (drawOrderValues: number[]): void {
    for (let drawOrderIndex = drawOrderValues.length - 1; drawOrderIndex >= 0; --drawOrderIndex) {
      const drawOrderValue = drawOrderValues[drawOrderIndex]!
      if (drawOrderValue < LegacyDrawDataParent.minDrawOrder) {
        LegacyDrawDataParent.minDrawOrder = drawOrderValue
      } else if (drawOrderValue > LegacyDrawDataParent.maxDrawOrder) {
        LegacyDrawDataParent.maxDrawOrder = drawOrderValue
      }
    }
  }

  /**
   * Reads the lowest authored draw order seen while loading draw data.
   * @returns Minimum draw-order value used to size draw-order buckets.
   */
  LegacyDrawDataParent.getMinDrawOrder = function (): number {
    return LegacyDrawDataParent.minDrawOrder
  }

  /**
   * Reads the highest authored draw order seen while loading draw data.
   * @returns Maximum draw-order value used to size draw-order buckets.
   */
  LegacyDrawDataParent.getMaxDrawOrder = function (): number {
    return LegacyDrawDataParent.maxDrawOrder
  }

  /**
   * Converts a Cubism2.1+ clip ID payload into the draw-data ID list expected by clipping setup.
   * @param clipId Raw clip ID object read from the MOC payload.
   * @returns List of draw-data IDs used as clipping masks, or null when no clip exists.
   */
  LegacyDrawDataParent.prototype.convertClipIDForV2_11 = function (
    clipId: unknown,
  ): unknown[] | null {
    let clipIdList: unknown[] = []
    if (clipId == null) {
      return null
    }
    const clipIdObject = clipId as { id: string }
    if (clipIdObject.id.length === 0) {
      return null
    }
    if (!/,/.test(clipId as string)) {
      clipIdList.push(clipIdObject.id)
      return clipIdList
    }
    clipIdList = clipIdObject.id.split(',')
    return clipIdList
  }

  /**
   * Reads the shared draw-data payload before a concrete mesh drawable reads its own arrays.
   * @param reader Cubism2 binary reader positioned at a draw-data base payload.
   */
  LegacyDrawDataParent.prototype.readDrawDataBase = function (reader: Cubism2DrawDataReader): void {
    this.drawDataId = reader.readObject()
    this.targetBaseDataId = reader.readObject()
    this.paramBindingSet = reader.readObject() as Cubism2ParamBindingSetLike | null
    this.drawOrderPointCount = reader.readInt32()
    this.drawOrderValues = reader.readInt32Array()
    this.opacityValues = reader.readFloat32Array()
    if (reader.getFormatVersion() >= Cubism2MocVersion.MAX_SUPPORTED_FORMAT_VERSION) {
      this.clipID = reader.readObject()
      this.clipIDList = this.convertClipIDForV2_11(this.clipID)
    } else {
      this.clipIDList = null
    }
    this.trackDrawOrderBounds(this.drawOrderValues)
  }

  /**
   * Reads draw data IDs that should be rendered into this drawable's clipping mask.
   * @returns Clip draw-data ID list, or null when the drawable has no clipping mask.
   */
  LegacyDrawDataParent.prototype.getClipIDList = function (): unknown[] | null {
    return this.clipIDList
  }

  /**
   * Legacy base-data initialization hook retained for polymorphic readers.
   * @param modelContext Model context supplied by the caller; unused for the base hook.
   * @returns Undefined because the base hook does not create a concrete context.
   */
  LegacyDrawDataParent.prototype.createDrawContext = function (modelContext: unknown): unknown {
    void modelContext
    return undefined
  }

  /**
   * Updates draw-order and opacity interpolation for one draw context.
   * @param modelContext Runtime model context that provides current parameter values.
   * @param drawContext Mutable draw context receiving draw order and opacity.
   */
  LegacyDrawDataParent.prototype.updateDrawContext = function (
    modelContext: Cubism2ModelContextLike,
    drawContext: Cubism2DrawContextBaseInstance,
  ): void {
    drawContext.clippedFlagRef[0] = false
    drawContext.drawOrder = interpolator.interpolateInteger(
      modelContext,
      this.paramBindingSet!,
      drawContext.clippedFlagRef,
      this.drawOrderValues,
    )
    if (!Live2D.shouldUpdateClippedDrawContextOpacity && drawContext.clippedFlagRef[0]) {
      return
    }
    drawContext.interpolatedOpacity = interpolator.interpolateFloat(
      modelContext,
      this.paramBindingSet!,
      drawContext.clippedFlagRef,
      this.opacityValues,
    )
  }

  /**
   * Base draw-context application hook; concrete draw data overrides this when it targets base data.
   * @param modelContext Runtime model context retained for legacy call compatibility.
   * @param drawContext Runtime draw context retained for legacy call compatibility.
   */
  LegacyDrawDataParent.prototype.applyDrawContext = function (
    modelContext: Cubism2ModelContextLike,
    drawContext: Cubism2DrawContextBaseInstance,
  ): void {
    void modelContext
    void drawContext
  }

  /**
   * Reads the MOC draw-data identifier.
   * @returns DrawDataID object/string stored on this draw data record.
   */
  LegacyDrawDataParent.prototype.getDrawDataID = function (): unknown | null {
    return this.drawDataId
  }

  /**
   * Replaces the MOC draw-data identifier.
   * @param drawDataId DrawDataID object/string used by model-context lookup.
   */
  LegacyDrawDataParent.prototype.setDrawDataID = function (drawDataId: unknown): void {
    this.drawDataId = drawDataId
  }

  /**
   * Reads the interpolated opacity from a draw context.
   * @param modelContext Runtime model context retained for legacy call compatibility.
   * @param drawContext Draw context that stores the latest interpolated opacity.
   * @returns Current opacity value for this draw data.
   */
  LegacyDrawDataParent.prototype.getOpacity = function (
    modelContext: unknown,
    drawContext: Cubism2DrawContextBaseInstance,
  ): unknown {
    void modelContext
    return drawContext.interpolatedOpacity
  }

  /**
   * Reads the interpolated draw order from a draw context.
   * @param modelContext Runtime model context retained for legacy call compatibility.
   * @param drawContext Draw context that stores the latest interpolated draw order.
   * @returns Current draw order value for this draw data.
   */
  LegacyDrawDataParent.prototype.getDrawOrder = function (
    modelContext: unknown,
    drawContext: Cubism2DrawContextBaseInstance,
  ): unknown {
    void modelContext
    return drawContext.drawOrder
  }

  /**
   * Reads the optional base-data ID that this draw data should transform through.
   * @returns BaseDataID object/string, or the empty base-data sentinel.
   */
  LegacyDrawDataParent.prototype.getTargetBaseDataID = function (): unknown | null {
    return this.targetBaseDataId
  }

  /**
   * Replaces the optional base-data target ID for this draw data.
   * @param targetBaseDataId BaseDataID object/string parsed or resolved by the MOC reader.
   */
  LegacyDrawDataParent.prototype.setTargetBaseDataID = function (targetBaseDataId: unknown): void {
    this.targetBaseDataId = targetBaseDataId
  }

  /**
   * Reports whether this draw data targets another base-data transform.
   * @returns True when a non-empty target base-data ID is present.
   */
  LegacyDrawDataParent.prototype.hasTargetBaseData = function (): boolean {
    return (
      this.targetBaseDataId != null && this.targetBaseDataId != BaseDataID.getDefaultBaseDataID()
    )
  }

  /**
   * Legacy pre-draw hook retained for polymorphic draw data.
   * @param drawParam Active draw parameter implementation.
   * @param modelContext Runtime model context.
   * @param drawContext Runtime draw context.
   */
  LegacyDrawDataParent.prototype.preDraw = function (
    drawParam: unknown,
    modelContext: unknown,
    drawContext: unknown,
  ): void {
    void drawParam
    void modelContext
    void drawContext
  }

  /**
   * Legacy draw hook retained for polymorphic draw data.
   * @param drawParam Active draw parameter implementation.
   * @param modelContext Runtime model context.
   * @param drawContext Runtime draw context.
   */
  LegacyDrawDataParent.prototype.draw = function (
    drawParam: unknown,
    modelContext: unknown,
    drawContext: unknown,
  ): void {
    void drawParam
    void modelContext
    void drawContext
  }

  /**
   * Polymorphic draw-data type hook implemented by concrete draw-data records.
   * @returns Undefined for the abstract legacy parent.
   */
  LegacyDrawDataParent.prototype.getType = function (): unknown {
    return undefined
  }

  /**
   * Legacy draw-order-to-point-buffer hook retained for polymorphic draw data.
   * @param modelContext Runtime model context.
   * @param drawContext Runtime draw context.
   * @param drawOrderOffset Draw-order bucket offset.
   */
  LegacyDrawDataParent.prototype.writeDrawOrderToPointBuffer = function (
    modelContext: unknown,
    drawContext: unknown,
    drawOrderOffset: number,
  ): void {
    void modelContext
    void drawContext
    void drawOrderOffset
  }

  /**
   * Stores draw-data fields shared by mesh drawable records parsed from the Cubism2 MOC.
   */
  function Cubism2DrawDataBase(this: Cubism2DrawDataBaseInstance): void {
    if (options.isBootstrapping()) {
      return
    }
    Cubism2LegacyDrawDataParent.call(this)
  }

  const DrawDataBase = Cubism2DrawDataBase as unknown as Cubism2DrawDataBaseConstructor
  DrawDataBase.prototype = Object.create(
    LegacyDrawDataParent.prototype,
  ) as Cubism2DrawDataBaseInstance
  DrawDataBase.prototype.constructor = Cubism2DrawDataBase
  DrawDataBase.UNRESOLVED_TARGET_BASE_DATA_INDEX =
    LegacyDrawDataParent.UNRESOLVED_TARGET_BASE_DATA_INDEX
  DrawDataBase.DEFAULT_DRAW_ORDER_BOUND = LegacyDrawDataParent.DEFAULT_DRAW_ORDER_BOUND
  DrawDataBase.TYPE_MESH = LegacyDrawDataParent.TYPE_MESH
  DrawDataBase.TYPE_LEGACY_3 = LegacyDrawDataParent.TYPE_LEGACY_3
  DrawDataBase.TYPE_LEGACY_4 = LegacyDrawDataParent.TYPE_LEGACY_4
  DrawDataBase.minDrawOrder = LegacyDrawDataParent.minDrawOrder
  DrawDataBase.maxDrawOrder = LegacyDrawDataParent.maxDrawOrder

  /**
   * Expands the mesh draw-data model-wide draw-order bounds from one parsed payload.
   * @param drawOrderValues Interpolated draw-order values parsed from the MOC record.
   */
  DrawDataBase.trackDrawOrderBounds = function (drawOrderValues: number[]): void {
    for (let drawOrderIndex = drawOrderValues.length - 1; drawOrderIndex >= 0; --drawOrderIndex) {
      const drawOrderValue = drawOrderValues[drawOrderIndex]!
      if (drawOrderValue < DrawDataBase.minDrawOrder) {
        DrawDataBase.minDrawOrder = drawOrderValue
      } else if (drawOrderValue > DrawDataBase.maxDrawOrder) {
        DrawDataBase.maxDrawOrder = drawOrderValue
      }
    }
  }
  /**
   * Reads the lowest authored mesh draw order seen while loading draw data.
   * @returns Minimum draw-order value used to size draw-order buckets.
   */
  DrawDataBase.getMinDrawOrder = function (): number {
    return DrawDataBase.minDrawOrder
  }
  /**
   * Reads the highest authored mesh draw order seen while loading draw data.
   * @returns Maximum draw-order value used to size draw-order buckets.
   */
  DrawDataBase.getMaxDrawOrder = function (): number {
    return DrawDataBase.maxDrawOrder
  }
  /**
   * Reads the shared draw-data payload and updates the mesh draw-order range.
   * @param reader Cubism2 binary reader positioned at a draw-data base payload.
   */
  DrawDataBase.prototype.readDrawDataBase = function (reader: Cubism2DrawDataReader): void {
    this.drawDataId = reader.readObject()
    this.targetBaseDataId = reader.readObject()
    this.paramBindingSet = reader.readObject() as Cubism2ParamBindingSetLike | null
    this.drawOrderPointCount = reader.readInt32()
    this.drawOrderValues = reader.readInt32Array()
    this.opacityValues = reader.readFloat32Array()
    if (reader.getFormatVersion() >= Cubism2MocVersion.MAX_SUPPORTED_FORMAT_VERSION) {
      this.clipID = reader.readObject()
      this.clipIDList = this.convertClipIDForV2_11(this.clipID)
    } else {
      this.clipIDList = null
    }
    DrawDataBase.trackDrawOrderBounds(this.drawOrderValues)
  }
  /**
   * Stores one mesh drawable parsed from a Cubism2 MOC and renders it through the active draw parameter.
   */
  function Cubism2MeshDrawData(this: Cubism2MeshDrawDataInstance): void {
    if (options.isBootstrapping()) {
      return
    }
    Cubism2DrawDataBase.call(this)
    this.textureNo = -1
    this.vertexCount = 0
    this.triangleCount = 0
    this.drawFlagBits = null
    this.drawFlagOptions = null
    this.indexArray = null
    this.vertexPointValues = null
    this.uvCoordinates = null
    this.blendMode = MeshDrawData.BLEND_NORMAL
    this.culling = true
    this.gl_cacheImage = null
    this.instanceNo = MeshDrawData.instanceCount++
  }

  const MeshDrawData = Cubism2MeshDrawData as unknown as Cubism2MeshDrawDataConstructor
  MeshDrawData.prototype = Object.create(DrawDataBase.prototype) as Cubism2MeshDrawDataInstance
  MeshDrawData.prototype.constructor = Cubism2MeshDrawData
  MeshDrawData.instanceCount = 0
  MeshDrawData.DRAW_FLAG_BLEND_MODE_MASK = 30
  MeshDrawData.BLEND_NORMAL = 0
  MeshDrawData.BLEND_ADD = 1
  MeshDrawData.BLEND_MULTIPLY = 2
  MeshDrawData.paramDirtyFlagScratch = new Array()

  /**
   * Replaces the texture slot used when this drawable is rendered.
   * @param textureNo Texture index supplied by the MOC mesh payload.
   */
  MeshDrawData.prototype.setTextureNo = function (textureNo: number): void {
    this.textureNo = textureNo
  }

  /**
   * Reads the texture slot used by this mesh.
   * @returns Texture index selected by the MOC mesh payload.
   */
  MeshDrawData.prototype.getTextureNo = function (): number {
    return this.textureNo
  }

  /**
   * Reads authored UV coordinates for this mesh.
   * @returns Flat UV coordinate array paired with the vertex list.
   */
  MeshDrawData.prototype.getUVCoordinates = function (): number[] | null {
    return this.uvCoordinates
  }

  /**
   * Reads raw draw flag bits parsed from SDK2.1+ mesh payloads.
   * @returns Draw flag bitset, or null/0 when the payload predates the flag field.
   */
  MeshDrawData.prototype.getDrawFlagBits = function (): number | null {
    return this.drawFlagBits
  }

  /**
   * Reads the mesh vertex count.
   * @returns Number of vertices in the mesh point and UV buffers.
   */
  MeshDrawData.prototype.getNumPoints = function (): number {
    return this.vertexCount
  }

  /**
   * Reads this draw-data record's type marker.
   * @returns Mesh draw-data type marker used by public index-array accessors.
   */
  MeshDrawData.prototype.getType = function (): number {
    return DrawDataBase.TYPE_MESH
  }

  /**
   * Writes the draw-order bucket offset into every transformed point tuple.
   * @param modelContext Runtime model context retained for legacy call compatibility.
   * @param drawContext Mesh draw context that owns the point buffers.
   * @param drawOrderOffset Draw-order bucket offset to store in each point tuple.
   */
  MeshDrawData.prototype.writeDrawOrderToPointBuffer = function (
    modelContext: unknown,
    drawContext: unknown,
    drawOrderOffset: number,
  ): void {
    void modelContext
    const meshDrawContext = drawContext as Cubism2MeshDrawContextInstance
    const outputPoints =
      meshDrawContext.targetSpacePoints != null
        ? meshDrawContext.targetSpacePoints
        : meshDrawContext.localPoints
    const runtimeCoordinateMode = Cubism2RuntimeConstants.activeCoordinateMode
    switch (runtimeCoordinateMode) {
      default:
      case Cubism2RuntimeConstants.MODEL_SPACE_COORDINATE_MODE:
        throw new Error('Draw-order point buffers require SDK2 coordinate mode')
      case Cubism2RuntimeConstants.SDK2_COORDINATE_MODE:
        for (let pointIndex = this.vertexCount - 1; pointIndex >= 0; --pointIndex) {
          const tupleOffset = pointIndex * Cubism2RuntimeConstants.POINT_TUPLE_SIZE
          outputPoints![tupleOffset + 4] = drawOrderOffset
        }
        break
    }
  }

  /**
   * Allocates the mesh-specific parameter binding set before the reader fills it.
   */
  MeshDrawData.prototype.initMeshStorage = function (): void {
    this.paramBindingSet = new Cubism2ParamBindingSet()
    this.paramBindingSet.initBindingList()
  }

  /**
   * Reads mesh-specific arrays after the shared draw-data header has been parsed.
   * @param reader Cubism2 binary reader positioned at a type-70 mesh draw-data payload.
   */
  MeshDrawData.prototype.readMeshDrawData = function (reader: Cubism2DrawDataReader): void {
    DrawDataBase.prototype.readDrawDataBase.call(this, reader)
    this.textureNo = reader.readInt32()
    this.vertexCount = reader.readInt32()
    this.triangleCount = reader.readInt32()
    const rawIndexArray = reader.readObject() as ArrayLike<number>
    this.indexArray = new Int16Array(this.triangleCount * 3)
    for (let indexCursor = this.triangleCount * 3 - 1; indexCursor >= 0; --indexCursor) {
      this.indexArray[indexCursor] = rawIndexArray[indexCursor]!
    }
    this.vertexPointValues = reader.readObject() as number[][]
    this.uvCoordinates = reader.readObject() as number[]
    if (
      reader.getFormatVersion() >= Cubism2MocVersion.LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER
    ) {
      this.drawFlagBits = reader.readInt32()
      if (this.drawFlagBits != 0) {
        if ((this.drawFlagBits & 1) != 0) {
          const extendedFlagValue = reader.readInt32()
          if (this.drawFlagOptions == null) {
            this.drawFlagOptions = new Object() as Record<string, unknown>
          }
          this.drawFlagOptions.extendedFlagValue = parseInt(String(extendedFlagValue))
        }
        if ((this.drawFlagBits & MeshDrawData.DRAW_FLAG_BLEND_MODE_MASK) != 0) {
          this.blendMode = (this.drawFlagBits & MeshDrawData.DRAW_FLAG_BLEND_MODE_MASK) >> 1
        } else {
          this.blendMode = MeshDrawData.BLEND_NORMAL
        }
        if ((this.drawFlagBits & 32) != 0) {
          this.culling = false
        }
      }
    } else {
      this.drawFlagBits = 0
    }
  }

  /**
   * Creates the runtime mesh context and initializes its point buffers from UV or authored point data.
   * @returns Mesh draw context paired with this draw-data record.
   */
  MeshDrawData.prototype.createDrawContext = function (): Cubism2MeshDrawContextInstance {
    const meshDrawContext = new MeshDrawContext(this)
    const pointBufferLength = this.vertexCount * Cubism2RuntimeConstants.POINT_TUPLE_SIZE
    const hasTargetBaseData = this.hasTargetBaseData()
    meshDrawContext.localPoints = new Float32Array(pointBufferLength)
    meshDrawContext.targetSpacePoints = hasTargetBaseData
      ? new Float32Array(pointBufferLength)
      : null
    const runtimeCoordinateMode = Cubism2RuntimeConstants.activeCoordinateMode
    switch (runtimeCoordinateMode) {
      default:
      case Cubism2RuntimeConstants.MODEL_SPACE_COORDINATE_MODE:
        if (Cubism2RuntimeConstants.FLIP_MODEL_SPACE_UV_Y) {
          for (let pointIndex = this.vertexCount - 1; pointIndex >= 0; --pointIndex) {
            const uvOffset = pointIndex << 1
            this.uvCoordinates![uvOffset + 1] = 1 - this.uvCoordinates![uvOffset + 1]!
          }
        }
        break
      case Cubism2RuntimeConstants.SDK2_COORDINATE_MODE:
        for (let pointIndex = this.vertexCount - 1; pointIndex >= 0; --pointIndex) {
          const uvOffset = pointIndex << 1
          const tupleOffset = pointIndex * Cubism2RuntimeConstants.POINT_TUPLE_SIZE
          const uvX = this.uvCoordinates![uvOffset]!
          const uvY = this.uvCoordinates![uvOffset + 1]!
          meshDrawContext.localPoints[tupleOffset] = uvX
          meshDrawContext.localPoints[tupleOffset + 1] = uvY
          meshDrawContext.localPoints[tupleOffset + 4] = 0
          if (hasTargetBaseData) {
            meshDrawContext.targetSpacePoints![tupleOffset] = uvX
            meshDrawContext.targetSpacePoints![tupleOffset + 1] = uvY
            meshDrawContext.targetSpacePoints![tupleOffset + 4] = 0
          }
        }
        break
    }
    return meshDrawContext
  }

  /**
   * Updates local mesh vertices by interpolating authored vertex point values through parameters.
   * @param modelContext Runtime model context that provides current parameter values.
   * @param drawContext Mesh draw context receiving local point updates.
   */
  MeshDrawData.prototype.updateDrawContext = function (
    modelContext: Cubism2ModelContextLike,
    drawContext: Cubism2DrawContextBaseInstance,
  ): void {
    const meshDrawContext = drawContext as Cubism2MeshDrawContextInstance
    if (!(this == meshDrawContext.getSourceDrawData())) {
      console.log('### assert!! ### ')
    }
    if (!this.paramBindingSet!.hasChangedParams(modelContext)) {
      return
    }
    DrawDataBase.prototype.updateDrawContext.call(this, modelContext, meshDrawContext)
    if (meshDrawContext.clippedFlagRef[0]) {
      return
    }
    const dirtyFlagRef = MeshDrawData.paramDirtyFlagScratch
    dirtyFlagRef[0] = false
    interpolator.interpolatePoints(
      modelContext,
      this.paramBindingSet!,
      dirtyFlagRef,
      this.vertexCount,
      this.vertexPointValues,
      meshDrawContext.localPoints,
      Cubism2RuntimeConstants.POINT_X_OFFSET,
      Cubism2RuntimeConstants.POINT_TUPLE_SIZE,
    )
  }

  /**
   * Applies optional target-base deformation to this mesh's local points.
   * @param modelContext Runtime model context used to resolve and read target base data.
   * @param drawContext Mesh draw context receiving target-space points and base opacity.
   */
  MeshDrawData.prototype.applyDrawContext = function (
    modelContext: Cubism2ModelContextLike,
    drawContext: Cubism2DrawContextBaseInstance,
  ): void {
    if (!(this == drawContext.getSourceDrawData())) {
      console.log('### assert!! ### ')
    }
    const meshDrawContext = drawContext as Cubism2MeshDrawContextInstance
    if (drawContext.clippedFlagRef[0]) {
      return
    }
    DrawDataBase.prototype.applyDrawContext.call(this, modelContext, meshDrawContext)
    if (this.hasTargetBaseData()) {
      const targetBaseDataId = this.getTargetBaseDataID()
      if (meshDrawContext.targetBaseDataIndex == DrawDataBase.UNRESOLVED_TARGET_BASE_DATA_INDEX) {
        meshDrawContext.targetBaseDataIndex = modelContext.getBaseDataIndex(targetBaseDataId)
      }
      if (meshDrawContext.targetBaseDataIndex < 0) {
        if (Live2D.isVerboseLoggingEnabled()) {
          UtDebug.logWithLegacyPrefix(
            'Unable to resolve target base data: %s',
            targetBaseDataId,
          )
        }
      } else {
        const targetBaseData = modelContext.getBaseData(meshDrawContext.targetBaseDataIndex)
        const targetBaseContext = modelContext.getBaseContext(meshDrawContext.targetBaseDataIndex)
        if (targetBaseData != null && !targetBaseContext.hasTransform()) {
          targetBaseData.transformPoints(
            modelContext,
            targetBaseContext,
            meshDrawContext.localPoints,
            meshDrawContext.targetSpacePoints,
            this.vertexCount,
            Cubism2RuntimeConstants.POINT_X_OFFSET,
            Cubism2RuntimeConstants.POINT_TUPLE_SIZE,
          )
          meshDrawContext.isActive = true
        } else {
          meshDrawContext.isActive = false
        }
        meshDrawContext.baseOpacity = targetBaseContext.getTotalOpacity()
      }
    }
  }

  /**
   * Draws this mesh through the active canvas or WebGL draw parameter.
   * @param drawParam Active draw parameter implementation.
   * @param modelContext Runtime model context retained for opacity lookup.
   * @param drawContext Mesh draw context carrying point buffers and clipping state.
   */
  MeshDrawData.prototype.draw = function (
    drawParam: unknown,
    modelContext: unknown,
    drawContext: unknown,
  ): void {
    const activeDrawParam = drawParam as Cubism2DrawParamLike
    const meshDrawContext = drawContext as Cubism2MeshDrawContextInstance
    if (!(this == meshDrawContext.getSourceDrawData())) {
      console.log('### assert!! ### ')
    }
    if (meshDrawContext.clippedFlagRef[0]) {
      return
    }
    let textureNo = this.textureNo
    if (textureNo < 0) {
      textureNo = 1
    }
    const opacity =
      (this.getOpacity(modelContext, meshDrawContext) as number) *
      (meshDrawContext.partsOpacity as number) *
      meshDrawContext.baseOpacity
    const outputPoints =
      meshDrawContext.targetSpacePoints != null
        ? meshDrawContext.targetSpacePoints
        : meshDrawContext.localPoints
    activeDrawParam.setClipBufPre_clipContextForDraw(meshDrawContext.clipBufPre_clipContext)
    activeDrawParam.setCulling(this.culling)
    activeDrawParam.drawTexture(
      textureNo,
      3 * this.triangleCount,
      this.indexArray,
      outputPoints,
      this.uvCoordinates,
      opacity,
      this.blendMode,
      meshDrawContext,
    )
  }

  /**
   * Logs mesh arrays for legacy debugging.
   */
  MeshDrawData.prototype.dump = function (): void {
    console.log(
      '  textureNo( %d ) , vertexCount( %d ) , triangleCount( %d ) \n',
      this.textureNo,
      this.vertexCount,
      this.triangleCount,
    )
    console.log('  indexArray = { ')
    for (let indexCursor = 0; indexCursor < this.indexArray!.length; indexCursor++) {
      console.log('%5d ,', this.indexArray![indexCursor])
    }
    console.log('\n  vertexPointValues')
    for (let valueIndex = 0; valueIndex < this.vertexPointValues!.length; valueIndex++) {
      console.log('\n    vertexPointValues[%d] = ', valueIndex)
      const pointValues = this.vertexPointValues![valueIndex]!
      for (let pointValueIndex = 0; pointValueIndex < pointValues.length; pointValueIndex++) {
        console.log('%6.2f, ', pointValues[pointValueIndex]!)
      }
    }
    console.log('\n')
  }

  /**
   * Reads one optional draw flag payload by semantic key.
   * @param optionKey Semantic option key stored in drawFlagOptions.
   * @returns Option value, or null when no extended draw flag payload exists.
   */
  MeshDrawData.prototype.getDrawFlagOption = function (optionKey: string): unknown | null {
    if (this.drawFlagOptions == null) {
      return null
    }
    return this.drawFlagOptions[optionKey]
  }

  /**
   * Reads the triangle index array consumed by public model APIs and drawTexture.
   * @returns Int16 triangle index array.
   */
  MeshDrawData.prototype.getIndexArray = function (): Int16Array | null {
    return this.indexArray
  }

  /**
   * Stores runtime buffers for one mesh draw data entry after model interpolation.
   * @param sourceDrawData Mesh draw data object that owns this runtime context.
   */
  function Cubism2MeshDrawContext(
    this: Cubism2MeshDrawContextInstance,
    sourceDrawData?: Cubism2MeshDrawDataInstance,
  ): void {
    Cubism2DrawContextBase.prototype.constructor.call(this, sourceDrawData)
    this.targetBaseDataIndex = DrawDataBase.UNRESOLVED_TARGET_BASE_DATA_INDEX
    this.localPoints = null
    this.targetSpacePoints = null
  }

  const MeshDrawContext = Cubism2MeshDrawContext as unknown as Cubism2MeshDrawContextConstructor
  MeshDrawContext.prototype = Object.create(
    Cubism2DrawContextBase.prototype,
  ) as Cubism2MeshDrawContextInstance
  MeshDrawContext.prototype.constructor = Cubism2MeshDrawContext

  /**
   * Reads transformed mesh vertices, preferring the deformed buffer when present.
   * @returns Float buffer containing transformed points, or the original buffer before deformation.
   */
  MeshDrawContext.prototype.getTransformedPoints = function (): Float32Array | null {
    return this.targetSpacePoints != null ? this.targetSpacePoints : this.localPoints
  }

  return {
    Cubism2DrawDataBase: DrawDataBase,
    Cubism2MeshDrawContext: MeshDrawContext,
    Cubism2MeshDrawData: MeshDrawData,
  }
}
