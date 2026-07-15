interface Cubism2MutableFloatRectangle {
  copyFromRectangle: (sourceRect: Cubism2MutableFloatRectangle) => void
  expand?: (marginX: number, marginY: number) => void
  height: number | null
  width: number | null
  x: number | null
  y: number | null
}

interface Cubism2FloatRectangleConstructor {
  new (): Cubism2MutableFloatRectangle
}

interface Cubism2Matrix44Instance {
  applyLocalScale: (scaleX: number, scaleY: number, scaleZ: number) => void
  applyLocalTranslation: (
    translateX: number,
    translateY: number,
    translateZ: number,
  ) => void
  copyFromSourceMatrix: (sourceMatrix: ArrayLike<number> | null) => void
  elements: Float32Array
  getBackingMatrixArray: () => Float32Array
  resetToIdentity: () => void
}

interface Cubism2Matrix44Constructor {
  new (): Cubism2Matrix44Instance
}

interface Cubism2RgbaColorInstance {
  a: number
  b: number
  g: number
  r: number
}

interface Cubism2RgbaColorConstructor {
  new (): Cubism2RgbaColorInstance
}

interface Cubism2WebGLClippingRuntimeConstants {
  POINT_TUPLE_SIZE: number
  POINT_X_OFFSET: number
}

interface Cubism2WebGLClippingLive2DProfile {
  clippingMaskBufferSize: number
  frameBuffers: Array<Cubism2WebGLFramebufferResources | undefined>
  glContext: unknown[]
}

interface Cubism2WebGLFramebufferResources {
  framebuffer: unknown
}

interface Cubism2WebGLClippingDebugLogger {
  logWithLegacyPrefix: (message: string, value: number) => void
}

interface Cubism2WebGLClippingDrawParam {
  createFramebuffer: () => Cubism2WebGLFramebufferResources
  gl: WebGLRenderingContext & { canvas: { height: number; width: number } }
  glno: number
  setChannelFlagAsColor: (channelIndex: number, color: Cubism2RgbaColorInstance) => void
  setClipBufPre_clipContextForMask: (clipContext: Cubism2ClippingContextInstance | null) => void
}

interface Cubism2ClippingDrawDataDefinition {
  getClipIDList: () => unknown[] | null
  getDrawDataID: () => unknown
}

interface Cubism2RenderableDrawContext {
  getTransformedPoints: () => ArrayLike<number>
  isRenderable: () => boolean
}

interface Cubism2MaskDrawData {
  draw: (
    drawParam: Cubism2WebGLClippingDrawParam,
    modelContext: Cubism2ClippingModelContext,
    drawContext: unknown,
  ) => void
}

interface Cubism2ClippingModelContext {
  drawContextList?: unknown[]
  getDrawContext: (drawDataIndex: number) => Cubism2RenderableDrawContext
  getDrawData: (drawDataIndex: number) => Cubism2MaskDrawData
  getDrawDataIndex: (drawDataId: unknown) => number
  model: {
    getModelImpl: () => {
      getCanvasHeight: () => number
      getCanvasWidth: () => number
    }
  }
}

export interface Cubism2ClippedDrawDataInstance {
  drawDataId: unknown
  drawDataIndex: number
}

interface Cubism2ClippingContextInstance {
  allClippedDrawRect: Cubism2MutableFloatRectangle
  clipIDList: unknown[]
  clippedDrawContextList: Cubism2ClippedDrawDataInstance[]
  clippingMaskDrawIndexList: number[]
  isUsing: boolean
  layoutBounds: Cubism2MutableFloatRectangle
  layoutChannelNo: number
  matrixForDraw: Float32Array
  matrixForMask: Float32Array
  owner: Cubism2ClippingManagerInstance
  addClippedDrawData: (drawDataId: unknown, drawDataIndex: number) => void
}

interface Cubism2ClippingManagerRuntimeStateOptions {
  Cubism2FloatRectangle: Cubism2FloatRectangleConstructor
  Cubism2Matrix44: Cubism2Matrix44Constructor
  Cubism2RgbaColor: Cubism2RgbaColorConstructor
  Live2D: Cubism2WebGLClippingLive2DProfile
}

interface Cubism2ClippingContextConstructor {
  new (
    owner: Cubism2ClippingManagerInstance,
    modelContext: Cubism2ClippingModelContext,
    clipIdList: unknown[],
  ): Cubism2ClippingContextInstance
  prototype: Cubism2ClippingContextInstance
}

interface Cubism2ClippedDrawDataConstructor {
  new (drawDataId: unknown, drawDataIndex: number): Cubism2ClippedDrawDataInstance
}

interface Cubism2ClippingMaskFramebufferState {
  previousFramebuffer: unknown
  previousViewport: [number, number, number, number]
}

interface Cubism2ClippedBoundsAccumulator {
  clippedBottom: number
  clippedLeft: number
  clippedRight: number
  clippedTop: number
  inactiveBoundsSentinel: number
}

interface Cubism2RenderableDrawableBounds {
  maxX: number
  maxY: number
  minX: number
  minY: number
}

export interface Cubism2ClippingManagerInstance {
  CHANNEL_COLORS: Cubism2RgbaColorInstance[]
  clipContextList: Cubism2ClippingContextInstance[]
  colorBuffer: number
  curFrameNo: number
  dp_webgl: Cubism2WebGLClippingDrawParam
  firstError_clipInNotUpdate: boolean
  glcontext: WebGLRenderingContext
  isInitGLFBFunc: boolean
  tmpBoundsOnModel: Cubism2MutableFloatRectangle | null
  tmpMatrix2: Cubism2Matrix44Instance | null
  tmpMatrixForDraw: Cubism2Matrix44Instance | null
  tmpMatrixForMask: Cubism2Matrix44Instance | null
  tmpModelToViewMatrix: Cubism2Matrix44Instance | null
  calcClippedDrawTotalBounds: (
    modelContext: Cubism2ClippingModelContext,
    clipContext: Cubism2ClippingContextInstance,
  ) => void
  findSameClip: (clipIdList: unknown[]) => Cubism2ClippingContextInstance | null
  getColorBuffer: () => number
  getMaskRenderTexture: () => number
  init: (
    modelContext: Cubism2ClippingModelContext,
    drawDataList: Cubism2ClippingDrawDataDefinition[],
    drawContextList: Array<{ clipBufPre_clipContext: Cubism2ClippingContextInstance | null }>,
  ) => void
  releaseFramebuffers: () => void
  setupClip: (
    modelContext: Cubism2ClippingModelContext,
    drawParam: Cubism2WebGLClippingDrawParam,
  ) => void
  setupLayoutBounds: (activeClipContextCount: number) => void
}

export interface Cubism2ClippingManagerConstructor {
  new (drawParam: Cubism2WebGLClippingDrawParam): Cubism2ClippingManagerInstance
  CHANNEL_COUNT: number
  NOT_USED_FRAME: number
  RENDER_TEXTURE_USE_MIPMAP: boolean
  prototype: Cubism2ClippingManagerInstance
}

export interface CreateCubism2WebGLClippingOptions {
  Cubism2FloatRectangle: Cubism2FloatRectangleConstructor
  Cubism2Matrix44: Cubism2Matrix44Constructor
  Cubism2RgbaColor: Cubism2RgbaColorConstructor
  Cubism2RuntimeConstants: Cubism2WebGLClippingRuntimeConstants
  Live2D: Cubism2WebGLClippingLive2DProfile
  UtDebug: Cubism2WebGLClippingDebugLogger
  isBootstrapping: () => boolean
}

export interface Cubism2WebGLClippingConstructors {
  Cubism2ClippingManager: Cubism2ClippingManagerConstructor
}

/**
 * Creates one Cubism2 clipping-mask channel color in the exact slot style used by min.js `W`.
 * @param Cubism2RgbaColor RGBA constructor restored from the shared draw-param base module.
 * @param red Red channel flag value for this mask channel.
 * @param green Green channel flag value for this mask channel.
 * @param blue Blue channel flag value for this mask channel.
 * @param alpha Alpha channel flag value for this mask channel.
 * @returns Channel color object passed to WebGL draw parameters.
 */
function createClippingMaskChannelColor(
  Cubism2RgbaColor: Cubism2RgbaColorConstructor,
  red: number,
  green: number,
  blue: number,
  alpha: number,
): Cubism2RgbaColorInstance {
  const channelColor = new Cubism2RgbaColor()
  channelColor.r = red
  channelColor.g = green
  channelColor.b = blue
  channelColor.a = alpha
  return channelColor
}

/**
 * Builds the four default clipping-mask channel colors from min.js `W.CHANNEL_COUNT`.
 * @param Cubism2RgbaColor RGBA constructor used by the legacy draw-param base surface.
 * @returns Ordered channel palette registered on the WebGL draw parameter.
 */
function createClippingMaskChannelPalette(
  Cubism2RgbaColor: Cubism2RgbaColorConstructor,
): Cubism2RgbaColorInstance[] {
  return [
    createClippingMaskChannelColor(Cubism2RgbaColor, 0, 0, 0, 1),
    createClippingMaskChannelColor(Cubism2RgbaColor, 1, 0, 0, 0),
    createClippingMaskChannelColor(Cubism2RgbaColor, 0, 1, 0, 0),
    createClippingMaskChannelColor(Cubism2RgbaColor, 0, 0, 1, 0),
  ]
}

/**
 * Registers the clipping-mask channel palette on the active WebGL draw adapter.
 * @param drawParam WebGL draw adapter that stores channel colors for shader uniforms.
 * @param channelPalette Ordered RGBA channel palette restored from the min.js constructor.
 * @returns Nothing; mutates the draw parameter's channel color slots.
 */
function applyClippingMaskChannelPalette(
  drawParam: Cubism2WebGLClippingDrawParam,
  channelPalette: Cubism2RgbaColorInstance[],
): void {
  for (let channelIndex = 0; channelIndex < channelPalette.length; channelIndex++) {
    drawParam.setChannelFlagAsColor(channelIndex, channelPalette[channelIndex]!)
  }
}

/**
 * Allocates a clipping mask framebuffer and records it in the Live2D GL-slot registry.
 * @param drawParam WebGL draw adapter that creates framebuffer resources for its GL slot.
 * @param Live2D Live2D static profile carrying the shared framebuffer registry.
 * @returns Legacy GL slot index used by the clipping manager as `curFrameNo`.
 */
function allocateMaskRenderTextureForDrawParam(
  drawParam: Cubism2WebGLClippingDrawParam,
  Live2D: Cubism2WebGLClippingLive2DProfile,
): number {
  let framebufferResources: Cubism2WebGLFramebufferResources | null = null
  framebufferResources = drawParam.createFramebuffer()
  Live2D.frameBuffers[drawParam.glno] = framebufferResources
  return drawParam.glno
}

/**
 * Initializes the min.js `W` clipping-manager state that belongs to the draw parameter.
 * @param manager Clipping manager instance being constructed.
 * @param drawParam WebGL draw adapter that owns GL state and channel color registration.
 * @param options Constructors and shared Live2D profile needed by the clipping manager.
 * @returns Nothing; mutates the manager with runtime matrices, bounds, and channel palette.
 */
function initializeClippingManagerRuntimeState(
  manager: Cubism2ClippingManagerInstance,
  drawParam: Cubism2WebGLClippingDrawParam,
  options: Cubism2ClippingManagerRuntimeStateOptions,
): void {
  const { Cubism2FloatRectangle, Cubism2Matrix44, Cubism2RgbaColor, Live2D } = options
  manager.clipContextList = new Array()
  manager.glcontext = drawParam.gl
  manager.dp_webgl = drawParam
  manager.curFrameNo = 0
  manager.firstError_clipInNotUpdate = true
  manager.colorBuffer = 0
  manager.isInitGLFBFunc = false
  manager.tmpBoundsOnModel = new Cubism2FloatRectangle()
  if (Live2D.glContext.length > Live2D.frameBuffers.length) {
    manager.curFrameNo = manager.getMaskRenderTexture()
  } else {
  }
  manager.tmpModelToViewMatrix = new Cubism2Matrix44()
  manager.tmpMatrix2 = new Cubism2Matrix44()
  manager.tmpMatrixForMask = new Cubism2Matrix44()
  manager.tmpMatrixForDraw = new Cubism2Matrix44()
  manager.CHANNEL_COLORS = createClippingMaskChannelPalette(Cubism2RgbaColor)
  applyClippingMaskChannelPalette(manager.dp_webgl, manager.CHANNEL_COLORS)
}

/**
 * Clears temporary clipping matrices, aggregate bounds, and channel-color slots.
 * @param manager Clipping manager whose per-instance temporary render state is being released.
 * @returns Nothing; nulls matrix/bounds references and empties `CHANNEL_COLORS`.
 */
function clearClippingManagerTemporaryState(manager: Cubism2ClippingManagerInstance): void {
  if (manager.tmpModelToViewMatrix) {
    manager.tmpModelToViewMatrix = null
  }
  if (manager.tmpMatrix2) {
    manager.tmpMatrix2 = null
  }
  if (manager.tmpMatrixForMask) {
    manager.tmpMatrixForMask = null
  }
  if (manager.tmpMatrixForDraw) {
    manager.tmpMatrixForDraw = null
  }
  if (manager.tmpBoundsOnModel) {
    manager.tmpBoundsOnModel = null
  }
  if (manager.CHANNEL_COLORS) {
    for (let channelIndex = manager.CHANNEL_COLORS.length - 1; channelIndex >= 0; --channelIndex) {
      manager.CHANNEL_COLORS.splice(channelIndex, 1)
    }
    manager.CHANNEL_COLORS = []
  }
}

/**
 * Deletes every clipping-mask framebuffer tracked by the shared Live2D profile.
 * @param manager Clipping manager whose GL context deletes the framebuffer handles.
 * @param Live2D Live2D static profile carrying framebuffer and GL-context registries.
 * @returns Nothing; clears shared framebuffer and GL-context registries after deletion.
 */
function releaseClippingMaskFramebuffers(
  manager: Cubism2ClippingManagerInstance,
  Live2D: Cubism2WebGLClippingLive2DProfile,
): void {
  const framebufferCount = Live2D.frameBuffers.length
  for (let framebufferIndex = 0; framebufferIndex < framebufferCount; framebufferIndex++) {
    manager.glcontext.deleteFramebuffer(
      Live2D.frameBuffers[framebufferIndex]!.framebuffer as WebGLFramebuffer,
    )
  }
  Live2D.frameBuffers = []
  Live2D.glContext = []
}

/**
 * Resolves every clip draw-data ID into the model-context draw index consumed by mask rendering.
 * @param modelContext Runtime model context that maps draw data IDs to draw indexes.
 * @param clipIdList Draw data IDs declared by the clipped drawable's mask list.
 * @returns Ordered draw indexes for the mask drawables, matching min.js `U.clippingMaskDrawIndexList`.
 */
function resolveClippingMaskDrawIndexList(
  modelContext: Cubism2ClippingModelContext,
  clipIdList: unknown[],
): number[] {
  const clippingMaskDrawIndexList = new Array<number>()
  for (let clipIdIndex = 0; clipIdIndex < clipIdList.length; clipIdIndex++) {
    clippingMaskDrawIndexList.push(modelContext.getDrawDataIndex(clipIdList[clipIdIndex]))
  }
  return clippingMaskDrawIndexList
}

/**
 * Initializes one clipping context from the min.js `U` constructor state block.
 * @param clippingContext Context instance receiving mask ID, bounds, matrix, and owner state.
 * @param owner Clipping manager that owns this context.
 * @param modelContext Runtime model context used to resolve each mask draw-data ID.
 * @param clipIdList Draw data IDs that render into the clipping mask for this context.
 * @param Cubism2FloatRectangle Rectangle constructor used for layout and aggregate bounds.
 * @returns Nothing; mutates the context with min.js-compatible runtime fields.
 */
function initializeClippingContextRuntimeState(
  clippingContext: Cubism2ClippingContextInstance,
  owner: Cubism2ClippingManagerInstance,
  modelContext: Cubism2ClippingModelContext,
  clipIdList: unknown[],
  Cubism2FloatRectangle: Cubism2FloatRectangleConstructor,
): void {
  clippingContext.clipIDList = new Array()
  clippingContext.clipIDList = clipIdList
  clippingContext.clippingMaskDrawIndexList = resolveClippingMaskDrawIndexList(
    modelContext,
    clipIdList,
  )
  clippingContext.clippedDrawContextList = new Array()
  clippingContext.isUsing = true
  clippingContext.layoutChannelNo = 0
  clippingContext.layoutBounds = new Cubism2FloatRectangle()
  clippingContext.allClippedDrawRect = new Cubism2FloatRectangle()
  clippingContext.matrixForMask = new Float32Array(16)
  clippingContext.matrixForDraw = new Float32Array(16)
  clippingContext.owner = owner
}

/**
 * Appends one clipped drawable record to a clipping context.
 * @param clippingContext Context whose clipped draw list receives the record.
 * @param ClippedDrawData Constructor restored from min.js `function R`.
 * @param drawDataId Draw data ID retained for traceability with the source clip relationship.
 * @param drawDataIndex Runtime draw data index used when calculating clipped bounds.
 * @returns Nothing; mutates `clippedDrawContextList`.
 */
function appendClippedDrawDataToContext(
  clippingContext: Cubism2ClippingContextInstance,
  ClippedDrawData: Cubism2ClippedDrawDataConstructor,
  drawDataId: unknown,
  drawDataIndex: number,
): void {
  const clippedDrawData = new ClippedDrawData(drawDataId, drawDataIndex)
  clippingContext.clippedDrawContextList.push(clippedDrawData)
}

/**
 * Reads the legacy color buffer value from the clipping manager.
 * @param manager Clipping manager whose `colorBuffer` slot is exposed by min.js.
 * @returns Stored legacy color buffer value.
 */
function readClippingManagerColorBuffer(manager: Cubism2ClippingManagerInstance): number {
  return manager.colorBuffer
}

/**
 * Finds a clipping context whose clip IDs match the requested IDs using min.js comparison rules.
 * @param manager Clipping manager whose context list is searched in source order.
 * @param requestedClipIdList Clip IDs requested by the drawable currently being initialized.
 * @returns First matching clipping context, or null when no legacy-equivalent ID set exists.
 */
function findClippingContextWithSameClipIds(
  manager: Cubism2ClippingManagerInstance,
  requestedClipIdList: unknown[],
): Cubism2ClippingContextInstance | null {
  for (let contextIndex = 0; contextIndex < manager.clipContextList.length; contextIndex++) {
    const clipContext = manager.clipContextList[contextIndex]!
    if (hasSameLooseUnorderedClipIdSet(clipContext.clipIDList, requestedClipIdList)) {
      return clipContext
    }
  }
  return null
}

/**
 * Checks clip ID equivalence with the non-set, loose-equality behavior preserved from min.js.
 * @param existingClipIdList Clip IDs stored on an existing clipping context.
 * @param requestedClipIdList Clip IDs from the drawable being matched.
 * @returns True when legacy length and loose unordered match-count checks pass.
 */
function hasSameLooseUnorderedClipIdSet(
  existingClipIdList: unknown[],
  requestedClipIdList: unknown[],
): boolean {
  const clipIdCount = existingClipIdList.length
  if (clipIdCount != requestedClipIdList.length) {
    return false
  }
  return countLooseClipIdMatches(existingClipIdList, requestedClipIdList) == clipIdCount
}

/**
 * Counts how many existing clip IDs can find at least one loosely equal requested ID.
 * @param existingClipIdList Clip IDs from the clipping context already registered.
 * @param requestedClipIdList Clip IDs from the drawable being matched.
 * @returns Legacy match count; duplicate existing IDs may match the same requested ID.
 */
function countLooseClipIdMatches(
  existingClipIdList: unknown[],
  requestedClipIdList: unknown[],
): number {
  let matchedClipIdCount = 0
  for (let existingClipIdIndex = 0; existingClipIdIndex < existingClipIdList.length; existingClipIdIndex++) {
    const existingClipId = existingClipIdList[existingClipIdIndex]
    for (let requestedClipIdIndex = 0; requestedClipIdIndex < existingClipIdList.length; requestedClipIdIndex++) {
      if (requestedClipIdList[requestedClipIdIndex] == existingClipId) {
        matchedClipIdCount++
        break
      }
    }
  }
  return matchedClipIdCount
}

/**
 * Creates the model-space clipping bounds accumulator using the min.js canvas-size sentinel.
 * @param modelContext Runtime model context whose model dimensions seed the inactive sentinel.
 * @returns Bounds accumulator initialized to the legacy inactive state.
 */
function createClippedBoundsAccumulator(
  modelContext: Cubism2ClippingModelContext,
): Cubism2ClippedBoundsAccumulator {
  const modelCanvasWidth = modelContext.model.getModelImpl().getCanvasWidth()
  const modelCanvasHeight = modelContext.model.getModelImpl().getCanvasHeight()
  const inactiveBoundsSentinel =
    modelCanvasWidth > modelCanvasHeight ? modelCanvasWidth : modelCanvasHeight
  return {
    clippedBottom: 0,
    clippedLeft: inactiveBoundsSentinel,
    clippedRight: 0,
    clippedTop: inactiveBoundsSentinel,
    inactiveBoundsSentinel,
  }
}

/**
 * Reads one drawable's transformed point bounds when its draw context is renderable.
 * @param modelContext Runtime model context used to resolve draw context and transformed points.
 * @param drawDataIndex Runtime draw data index stored in the clipped draw record.
 * @param Cubism2RuntimeConstants Point tuple offsets restored from min.js `aw` constants.
 * @returns Drawable min/max bounds, or null when the drawable is not renderable.
 */
function collectRenderableDrawPointBounds(
  modelContext: Cubism2ClippingModelContext,
  drawDataIndex: number,
  Cubism2RuntimeConstants: Cubism2WebGLClippingRuntimeConstants,
): Cubism2RenderableDrawableBounds | null {
  const drawContext = modelContext.getDrawContext(drawDataIndex)
  if (!drawContext.isRenderable()) {
    return null
  }
  const transformedPoints = drawContext.getTransformedPoints()
  const pointCount = transformedPoints.length
  const xPositions = []
  const yPositions = []
  let pointCursor = 0
  for (
    let pointArrayIndex = Cubism2RuntimeConstants.POINT_X_OFFSET;
    pointArrayIndex < pointCount;
    pointArrayIndex += Cubism2RuntimeConstants.POINT_TUPLE_SIZE
  ) {
    xPositions[pointCursor] = transformedPoints[pointArrayIndex]!
    yPositions[pointCursor] = transformedPoints[pointArrayIndex + 1]!
    pointCursor++
  }
  return {
    maxX: Math.max.apply(null, xPositions),
    maxY: Math.max.apply(null, yPositions),
    minX: Math.min.apply(null, xPositions),
    minY: Math.min.apply(null, yPositions),
  }
}

/**
 * Merges one drawable's bounds into the aggregate clipping rectangle accumulator.
 * @param boundsAccumulator Aggregate model-space bounds for the clipping context.
 * @param drawableBounds Bounds collected from one renderable clipped drawable.
 * @returns Nothing; mutates `boundsAccumulator`.
 */
function mergeClippedDrawableBounds(
  boundsAccumulator: Cubism2ClippedBoundsAccumulator,
  drawableBounds: Cubism2RenderableDrawableBounds,
): void {
  if (drawableBounds.minX < boundsAccumulator.clippedLeft) {
    boundsAccumulator.clippedLeft = drawableBounds.minX
  }
  if (drawableBounds.minY < boundsAccumulator.clippedTop) {
    boundsAccumulator.clippedTop = drawableBounds.minY
  }
  if (drawableBounds.maxX > boundsAccumulator.clippedRight) {
    boundsAccumulator.clippedRight = drawableBounds.maxX
  }
  if (drawableBounds.maxY > boundsAccumulator.clippedBottom) {
    boundsAccumulator.clippedBottom = drawableBounds.maxY
  }
}

/**
 * Resets a clipping context to the exact unused rectangle written by min.js.
 * @param clipContext Clipping context whose aggregate bounds are inactive.
 * @returns Nothing; writes zero bounds and marks the context unused.
 */
function resetUnusedClippedDrawBounds(clipContext: Cubism2ClippingContextInstance): void {
  clipContext.allClippedDrawRect.x = 0
  clipContext.allClippedDrawRect.y = 0
  clipContext.allClippedDrawRect.width = 0
  clipContext.allClippedDrawRect.height = 0
  clipContext.isUsing = false
}

/**
 * Applies active aggregate clipping bounds to the context.
 * @param clipContext Clipping context whose aggregate bounds are active.
 * @param boundsAccumulator Accumulated model-space min/max values for clipped drawables.
 * @returns Nothing; writes the rectangle and marks the context used.
 */
function applyActiveClippedDrawBounds(
  clipContext: Cubism2ClippingContextInstance,
  boundsAccumulator: Cubism2ClippedBoundsAccumulator,
): void {
  clipContext.allClippedDrawRect.x = boundsAccumulator.clippedLeft
  clipContext.allClippedDrawRect.y = boundsAccumulator.clippedTop
  clipContext.allClippedDrawRect.width =
    boundsAccumulator.clippedRight - boundsAccumulator.clippedLeft
  clipContext.allClippedDrawRect.height =
    boundsAccumulator.clippedBottom - boundsAccumulator.clippedTop
  clipContext.isUsing = true
}

/**
 * Calculates the min.js per-channel mask count from base and remainder distribution.
 * @param baseMaskCountPerChannel Integer-truncated mask count shared by every channel.
 * @param extraMaskChannelCount Integer-truncated remainder assigned to low-index channels.
 * @param channelIndex Current RGBA mask channel index.
 * @returns Number of mask contexts assigned to this channel before tile branch selection.
 */
function calculateMaskCountForLayoutChannel(
  baseMaskCountPerChannel: number,
  extraMaskChannelCount: number,
  channelIndex: number,
): number {
  return baseMaskCountPerChannel + (channelIndex < extraMaskChannelCount ? 1 : 0)
}

/**
 * Writes one channel-local normalized tile rectangle to a clipping context.
 * @param clipContext Clipping context consumed by the layout cursor.
 * @param channelIndex RGBA mask channel assigned to this context.
 * @param tileX Normalized channel-local x coordinate.
 * @param tileY Normalized channel-local y coordinate.
 * @param tileWidth Normalized channel-local tile width.
 * @param tileHeight Normalized channel-local tile height.
 * @returns Nothing; mutates `layoutChannelNo` and `layoutBounds`.
 */
function writeClippingContextLayoutBounds(
  clipContext: Cubism2ClippingContextInstance,
  channelIndex: number,
  tileX: number,
  tileY: number,
  tileWidth: number,
  tileHeight: number,
): void {
  clipContext.layoutChannelNo = channelIndex
  clipContext.layoutBounds.x = tileX
  clipContext.layoutBounds.y = tileY
  clipContext.layoutBounds.width = tileWidth
  clipContext.layoutBounds.height = tileHeight
}

/**
 * Assigns the single-mask branch where one context fills the whole channel.
 * @param manager Clipping manager whose context list is consumed in prefix order.
 * @param channelIndex Channel currently being assigned.
 * @param layoutContextCursor Cursor into `clipContextList`.
 * @returns Cursor after consuming one context.
 */
function assignFullChannelLayoutBounds(
  manager: Cubism2ClippingManagerInstance,
  channelIndex: number,
  layoutContextCursor: number,
): number {
  const clipContext = manager.clipContextList[layoutContextCursor]!
  writeClippingContextLayoutBounds(clipContext, channelIndex, 0, 0, 1, 1)
  return layoutContextCursor + 1
}

/**
 * Assigns the two-mask branch as two horizontal half-width tiles.
 * @param manager Clipping manager whose context list is consumed in prefix order.
 * @param channelIndex Channel currently being assigned.
 * @param maskCountForChannel Mask count for this branch; source reaches here only for `2`.
 * @param layoutContextCursor Cursor into `clipContextList`.
 * @returns Cursor after consuming all horizontal-half contexts.
 */
function assignHorizontalHalfLayoutBounds(
  manager: Cubism2ClippingManagerInstance,
  channelIndex: number,
  maskCountForChannel: number,
  layoutContextCursor: number,
): number {
  let nextLayoutContextCursor = layoutContextCursor
  for (let maskSlotIndex = 0; maskSlotIndex < maskCountForChannel; maskSlotIndex++) {
    let tileColumn = maskSlotIndex % 2
    const tileRow = 0
    tileColumn = ~~tileColumn
    const clipContext = manager.clipContextList[nextLayoutContextCursor]!
    writeClippingContextLayoutBounds(clipContext, channelIndex, tileColumn * 0.5, tileRow, 0.5, 1)
    nextLayoutContextCursor++
  }
  return nextLayoutContextCursor
}

/**
 * Assigns the three-or-four-mask branch as a two-by-two tile grid.
 * @param manager Clipping manager whose context list is consumed in prefix order.
 * @param channelIndex Channel currently being assigned.
 * @param maskCountForChannel Mask count for this branch, from three through four.
 * @param layoutContextCursor Cursor into `clipContextList`.
 * @returns Cursor after consuming all two-by-two contexts.
 */
function assignTwoByTwoLayoutBounds(
  manager: Cubism2ClippingManagerInstance,
  channelIndex: number,
  maskCountForChannel: number,
  layoutContextCursor: number,
): number {
  let nextLayoutContextCursor = layoutContextCursor
  for (let maskSlotIndex = 0; maskSlotIndex < maskCountForChannel; maskSlotIndex++) {
    let tileColumn = maskSlotIndex % 2
    let tileRow = maskSlotIndex / 2
    tileColumn = ~~tileColumn
    tileRow = ~~tileRow
    const clipContext = manager.clipContextList[nextLayoutContextCursor]!
    writeClippingContextLayoutBounds(
      clipContext,
      channelIndex,
      tileColumn * 0.5,
      tileRow * 0.5,
      0.5,
      0.5,
    )
    nextLayoutContextCursor++
  }
  return nextLayoutContextCursor
}

/**
 * Assigns the five-through-nine-mask branch as a three-by-three tile grid.
 * @param manager Clipping manager whose context list is consumed in prefix order.
 * @param channelIndex Channel currently being assigned.
 * @param maskCountForChannel Mask count for this branch, from five through nine.
 * @param layoutContextCursor Cursor into `clipContextList`.
 * @returns Cursor after consuming all three-by-three contexts.
 */
function assignThreeByThreeLayoutBounds(
  manager: Cubism2ClippingManagerInstance,
  channelIndex: number,
  maskCountForChannel: number,
  layoutContextCursor: number,
): number {
  let nextLayoutContextCursor = layoutContextCursor
  for (let maskSlotIndex = 0; maskSlotIndex < maskCountForChannel; maskSlotIndex++) {
    let tileColumn = maskSlotIndex % 3
    let tileRow = maskSlotIndex / 3
    tileColumn = ~~tileColumn
    tileRow = ~~tileRow
    const clipContext = manager.clipContextList[nextLayoutContextCursor]!
    writeClippingContextLayoutBounds(
      clipContext,
      channelIndex,
      tileColumn / 3,
      tileRow / 3,
      1 / 3,
      1 / 3,
    )
    nextLayoutContextCursor++
  }
  return nextLayoutContextCursor
}

/**
 * Logs the unsupported overflow branch without consuming a layout context.
 * @param UtDebug Legacy debug logger restored from min.js `q`.
 * @param maskCountForChannel Unsupported per-channel mask count above the 3x3 branch.
 * @returns Nothing; emits the original diagnostic message and leaves layout cursor unchanged.
 */
function logUnsupportedClippingMaskCount(
  UtDebug: Cubism2WebGLClippingDebugLogger,
  maskCountForChannel: number,
): void {
  UtDebug.logWithLegacyPrefix('Clipping mask count for channel: %d', maskCountForChannel)
}

/**
 * Assigns one mask channel through the same branch cascade used by min.js.
 * @param manager Clipping manager whose context list is consumed in prefix order.
 * @param channelIndex Channel currently being assigned.
 * @param maskCountForChannel Number of contexts assigned to this channel.
 * @param layoutContextCursor Cursor into `clipContextList`; overflow preserves it.
 * @param UtDebug Legacy debug logger for unsupported per-channel counts.
 * @returns Cursor after this channel branch has run.
 */
function assignClippingMaskChannelLayoutBounds(
  manager: Cubism2ClippingManagerInstance,
  channelIndex: number,
  maskCountForChannel: number,
  layoutContextCursor: number,
  UtDebug: Cubism2WebGLClippingDebugLogger,
): number {
  if (maskCountForChannel == 0) {
    return layoutContextCursor
  }
  if (maskCountForChannel == 1) {
    return assignFullChannelLayoutBounds(manager, channelIndex, layoutContextCursor)
  }
  if (maskCountForChannel == 2) {
    return assignHorizontalHalfLayoutBounds(
      manager,
      channelIndex,
      maskCountForChannel,
      layoutContextCursor,
    )
  }
  if (maskCountForChannel <= 4) {
    return assignTwoByTwoLayoutBounds(
      manager,
      channelIndex,
      maskCountForChannel,
      layoutContextCursor,
    )
  }
  if (maskCountForChannel <= 9) {
    return assignThreeByThreeLayoutBounds(
      manager,
      channelIndex,
      maskCountForChannel,
      layoutContextCursor,
    )
  }
  logUnsupportedClippingMaskCount(UtDebug, maskCountForChannel)
  return layoutContextCursor
}

/**
 * Recalculates clipping bounds and counts the contexts that need mask texture work.
 * @param manager Clipping manager whose contexts are scanned in original min.js order.
 * @param modelContext Runtime model context used to refresh each clipped drawable bounds.
 * @returns Number of contexts with `isUsing` set after bounds recalculation.
 */
function countActiveClippingContexts(
  manager: Cubism2ClippingManagerInstance,
  modelContext: Cubism2ClippingModelContext,
): number {
  let activeClipContextCount = 0
  for (let clipIndex = 0; clipIndex < manager.clipContextList.length; clipIndex++) {
    const clipContext = manager.clipContextList[clipIndex]!
    manager.calcClippedDrawTotalBounds(modelContext, clipContext)
    if (clipContext.isUsing) {
      activeClipContextCount++
    }
  }
  return activeClipContextCount
}

/**
 * Captures the framebuffer and canvas-sized viewport that min.js restores after mask rendering.
 * @param gl WebGL context used by the clipping draw parameter.
 * @returns Previous framebuffer plus `[0, 0, canvas.width, canvas.height]` restore viewport.
 */
function captureClippingMaskFramebufferState(
  gl: Cubism2WebGLClippingDrawParam['gl'],
): Cubism2ClippingMaskFramebufferState {
  return {
    previousFramebuffer: gl.getParameter(gl.FRAMEBUFFER_BINDING),
    previousViewport: [0, 0, gl.canvas.width, gl.canvas.height],
  }
}

/**
 * Switches WebGL state into the mask framebuffer pass and applies the current layout.
 * @param manager Clipping manager owning the mask framebuffer index.
 * @param drawParam WebGL draw adapter used for the mask pass.
 * @param Live2D Live2D static profile carrying mask buffer size and framebuffer registry.
 * @param activeClipContextCount Number of active contexts used to tile mask layout bounds.
 * @returns Nothing; mutates WebGL state and clipping layout.
 */
function prepareClippingMaskFramebuffer(
  manager: Cubism2ClippingManagerInstance,
  drawParam: Cubism2WebGLClippingDrawParam,
  Live2D: Cubism2WebGLClippingLive2DProfile,
  activeClipContextCount: number,
): void {
  drawParam.gl.viewport(0, 0, Live2D.clippingMaskBufferSize, Live2D.clippingMaskBufferSize)
  manager.setupLayoutBounds(activeClipContextCount)
  drawParam.gl.bindFramebuffer(
    drawParam.gl.FRAMEBUFFER,
    Live2D.frameBuffers[manager.curFrameNo]!.framebuffer as WebGLFramebuffer,
  )
  drawParam.gl.clearColor(0, 0, 0, 0)
  drawParam.gl.clear(drawParam.gl.COLOR_BUFFER_BIT)
}

/**
 * Writes the mask and draw matrices for one clipping context using the min.js transform sequence.
 * @param manager Clipping manager providing temporary rectangle and matrix objects.
 * @param clipContext Clipping context whose matrices receive the computed values.
 * @returns Nothing; mutates `matrixForMask` and `matrixForDraw`.
 */
function writeClippingContextMatrices(
  manager: Cubism2ClippingManagerInstance,
  clipContext: Cubism2ClippingContextInstance,
): void {
  const clippedDrawBounds = clipContext.allClippedDrawRect
  const layoutBounds = clipContext.layoutBounds
  const boundsMargin = 0.05
  manager.tmpBoundsOnModel!.copyFromRectangle(clippedDrawBounds)
  manager.tmpBoundsOnModel!.expand!(
    clippedDrawBounds.width! * boundsMargin,
    clippedDrawBounds.height! * boundsMargin,
  )
  const maskScaleX = layoutBounds.width! / manager.tmpBoundsOnModel!.width!
  const maskScaleY = layoutBounds.height! / manager.tmpBoundsOnModel!.height!
  manager.tmpMatrix2!.resetToIdentity()
  manager.tmpMatrix2!.applyLocalTranslation(-1, -1, 0)
  manager.tmpMatrix2!.applyLocalScale(2, 2, 1)
  manager.tmpMatrix2!.applyLocalTranslation(layoutBounds.x!, layoutBounds.y!, 0)
  manager.tmpMatrix2!.applyLocalScale(maskScaleX, maskScaleY, 1)
  manager.tmpMatrix2!.applyLocalTranslation(
    -manager.tmpBoundsOnModel!.x!,
    -manager.tmpBoundsOnModel!.y!,
    0,
  )
  manager.tmpMatrixForMask!.copyFromSourceMatrix(manager.tmpMatrix2!.elements)
  manager.tmpMatrix2!.resetToIdentity()
  manager.tmpMatrix2!.applyLocalTranslation(layoutBounds.x!, layoutBounds.y!, 0)
  manager.tmpMatrix2!.applyLocalScale(maskScaleX, maskScaleY, 1)
  manager.tmpMatrix2!.applyLocalTranslation(
    -manager.tmpBoundsOnModel!.x!,
    -manager.tmpBoundsOnModel!.y!,
    0,
  )
  manager.tmpMatrixForDraw!.copyFromSourceMatrix(manager.tmpMatrix2!.elements)
  const maskMatrixValues = manager.tmpMatrixForMask!.getBackingMatrixArray()
  for (let matrixIndex = 0; matrixIndex < 16; matrixIndex++) {
    clipContext.matrixForMask[matrixIndex] = maskMatrixValues[matrixIndex]!
  }
  const drawMatrixValues = manager.tmpMatrixForDraw!.getBackingMatrixArray()
  for (let matrixIndex = 0; matrixIndex < 16; matrixIndex++) {
    clipContext.matrixForDraw[matrixIndex] = drawMatrixValues[matrixIndex]!
  }
}

/**
 * Renders every mask drawable for one clipping context in `clippingMaskDrawIndexList` order.
 * @param modelContext Runtime model context used to resolve mask draw data and draw contexts.
 * @param drawParam WebGL draw adapter receiving the current mask clipping context.
 * @param clipContext Clipping context whose mask drawable indexes are rendered.
 * @returns Nothing; invokes draw hooks and updates the draw parameter's mask context before each one.
 */
function renderClippingMaskDrawables(
  modelContext: Cubism2ClippingModelContext,
  drawParam: Cubism2WebGLClippingDrawParam,
  clipContext: Cubism2ClippingContextInstance,
): void {
  const maskDrawCount = clipContext.clippingMaskDrawIndexList.length
  for (let maskDrawCursor = 0; maskDrawCursor < maskDrawCount; maskDrawCursor++) {
    const maskDrawIndex = clipContext.clippingMaskDrawIndexList[maskDrawCursor]!
    const maskDrawData = modelContext.getDrawData(maskDrawIndex)
    const maskDrawContext = modelContext.getDrawContext(maskDrawIndex)
    drawParam.setClipBufPre_clipContextForMask(clipContext)
    maskDrawData.draw(drawParam, modelContext, maskDrawContext)
  }
}

/**
 * Restores framebuffer, clears the mask clip context, and restores the canvas-sized viewport.
 * @param drawParam WebGL draw adapter whose state is restored.
 * @param framebufferState State captured before the mask framebuffer pass.
 * @returns Nothing; mutates WebGL state and draw-parameter mask context.
 */
function restoreClippingMaskFramebuffer(
  drawParam: Cubism2WebGLClippingDrawParam,
  framebufferState: Cubism2ClippingMaskFramebufferState,
): void {
  drawParam.gl.bindFramebuffer(
    drawParam.gl.FRAMEBUFFER,
    framebufferState.previousFramebuffer as WebGLFramebuffer,
  )
  drawParam.setClipBufPre_clipContextForMask(null)
  drawParam.gl.viewport(
    framebufferState.previousViewport[0],
    framebufferState.previousViewport[1],
    framebufferState.previousViewport[2],
    framebufferState.previousViewport[3],
  )
}

/**
 * Creates the WebGL clipping constructors restored from the legacy WordPress `live2d.min.js`.
 * @param options Runtime dependencies supplied by the min.js-derived compatibility capsule.
 * @returns Clipping manager constructor; context records stay module-private to avoid widening API.
 */
export function createCubism2WebGLClipping(
  options: CreateCubism2WebGLClippingOptions,
): Cubism2WebGLClippingConstructors {
  const {
    Cubism2FloatRectangle,
    Cubism2Matrix44,
    Cubism2RgbaColor,
    Cubism2RuntimeConstants,
    Live2D,
    UtDebug,
  } = options

  /**
   * Manages Cubism2 mask clipping state for one WebGL draw parameter instance.
   * @param drawParam WebGL draw adapter that owns the GL context and framebuffer helpers.
   */
  function Cubism2ClippingManager(
    this: Cubism2ClippingManagerInstance,
    drawParam: Cubism2WebGLClippingDrawParam,
  ): void {
    if (options.isBootstrapping()) {
      return
    }
    initializeClippingManagerRuntimeState(this, drawParam, {
      Cubism2FloatRectangle,
      Cubism2Matrix44,
      Cubism2RgbaColor,
      Live2D,
    })
  }

  const ClippingManager =
    Cubism2ClippingManager as unknown as Cubism2ClippingManagerConstructor

  ClippingManager.CHANNEL_COUNT = 4
  ClippingManager.RENDER_TEXTURE_USE_MIPMAP = false
  ClippingManager.NOT_USED_FRAME = -100

  /**
   * Releases temporary clipping state and every mask framebuffer allocated by the Cubism2 WebGL path.
   * @returns Nothing; clears per-manager temporary state and shared framebuffer/GL-context arrays.
   */
  ClippingManager.prototype.releaseFramebuffers = function (): void {
    clearClippingManagerTemporaryState(this)
    releaseClippingMaskFramebuffers(this, Live2D)
  }

  /**
   * Builds clipping contexts and attaches them to every draw context that references clip IDs.
   * @param modelContext Runtime model context used to resolve draw data IDs into draw indexes.
   * @param drawDataList Ordered draw data definitions from the Cubism2 model.
   * @param drawContextList Runtime draw contexts that receive clip context references.
   * @returns Nothing; populates clipping context lists and mutates draw contexts.
   */
  ClippingManager.prototype.init = function (
    modelContext: Cubism2ClippingModelContext,
    drawDataList: Cubism2ClippingDrawDataDefinition[],
    drawContextList: Array<{ clipBufPre_clipContext: Cubism2ClippingContextInstance | null }>,
  ): void {
    for (let drawDataCursor = 0; drawDataCursor < drawDataList.length; drawDataCursor++) {
      const clipIdList = drawDataList[drawDataCursor]!.getClipIDList()
      if (clipIdList == null) {
        continue
      }
      let clipContext = this.findSameClip(clipIdList)
      if (clipContext == null) {
        clipContext = new ClippingContext(this, modelContext, clipIdList)
        this.clipContextList.push(clipContext)
      }
      const drawDataId = drawDataList[drawDataCursor]!.getDrawDataID()
      const drawDataIndex = modelContext.getDrawDataIndex(drawDataId)
      clipContext.addClippedDrawData(drawDataId, drawDataIndex)
      const drawContext = drawContextList[drawDataCursor]!
      drawContext.clipBufPre_clipContext = clipContext
    }
  }

  /**
   * Allocates the mask render texture for this WebGL draw-parameter slot.
   * @returns Legacy GL slot index used to address `Live2D.frameBuffers`.
   */
  ClippingManager.prototype.getMaskRenderTexture = function (): number {
    return allocateMaskRenderTextureForDrawParam(this.dp_webgl, Live2D)
  }

  /**
   * Renders all mask drawables into the clipping mask framebuffer before the real draw pass.
   * @param modelContext Runtime model context used to read draw data and transformed points.
   * @param drawParam WebGL draw adapter used to render mask drawables into the mask framebuffer.
   * @returns Nothing; updates clip matrices and restores the previous framebuffer/viewport.
   */
  ClippingManager.prototype.setupClip = function (
    modelContext: Cubism2ClippingModelContext,
    drawParam: Cubism2WebGLClippingDrawParam,
  ): void {
    const activeClipContextCount = countActiveClippingContexts(this, modelContext)
    if (activeClipContextCount > 0) {
      const framebufferState = captureClippingMaskFramebufferState(drawParam.gl)
      prepareClippingMaskFramebuffer(this, drawParam, Live2D, activeClipContextCount)
      for (let clipIndex = 0; clipIndex < this.clipContextList.length; clipIndex++) {
        const clipContext = this.clipContextList[clipIndex]!
        writeClippingContextMatrices(this, clipContext)
        renderClippingMaskDrawables(modelContext, drawParam, clipContext)
      }
      restoreClippingMaskFramebuffer(drawParam, framebufferState)
    }
  }

  /**
   * Reads the legacy color-buffer slot used by old clipping code.
   * @returns Stored color-buffer value.
   */
  ClippingManager.prototype.getColorBuffer = function (): number {
    return readClippingManagerColorBuffer(this)
  }

  /**
   * Finds an existing clipping context with the same unordered clip ID set.
   * @param clipIdList Clip draw-data IDs declared by a drawable.
   * @returns Matching clipping context, or null when this clip set has not been registered.
   */
  ClippingManager.prototype.findSameClip = function (
    clipIdList: unknown[],
  ): Cubism2ClippingContextInstance | null {
    return findClippingContextWithSameClipIds(this, clipIdList)
  }

  /**
   * Calculates the total model-space bounds covered by drawables using one clipping context.
   * @param modelContext Runtime model context that exposes transformed drawable points.
   * @param clipContext Clipping context whose aggregate bounds and active flag are updated.
   * @returns Nothing; writes `allClippedDrawRect` and `isUsing` on the clip context.
   */
  ClippingManager.prototype.calcClippedDrawTotalBounds = function (
    modelContext: Cubism2ClippingModelContext,
    clipContext: Cubism2ClippingContextInstance,
  ): void {
    const boundsAccumulator = createClippedBoundsAccumulator(modelContext)
    const clippedDrawCount = clipContext.clippedDrawContextList.length
    for (let clippedDrawCursor = 0; clippedDrawCursor < clippedDrawCount; clippedDrawCursor++) {
      const clippedDrawData = clipContext.clippedDrawContextList[clippedDrawCursor]!
      const drawDataIndex = clippedDrawData.drawDataIndex
      const drawableBounds = collectRenderableDrawPointBounds(
        modelContext,
        drawDataIndex,
        Cubism2RuntimeConstants,
      )
      if (drawableBounds != null) {
        mergeClippedDrawableBounds(boundsAccumulator, drawableBounds)
      }
    }
    if (boundsAccumulator.clippedLeft == boundsAccumulator.inactiveBoundsSentinel) {
      resetUnusedClippedDrawBounds(clipContext)
    } else {
      applyActiveClippedDrawBounds(clipContext, boundsAccumulator)
    }
  }

  /**
   * Assigns each active clipping context to a mask channel and normalized tile bounds.
   * @param activeClipContextCount Number of clipping contexts that need mask texture space.
   * @returns Nothing; mutates each clip context's `layoutChannelNo` and `layoutBounds`.
   */
  ClippingManager.prototype.setupLayoutBounds = function (activeClipContextCount: number): void {
    let baseMaskCountPerChannel = activeClipContextCount / ClippingManager.CHANNEL_COUNT
    let extraMaskChannelCount = activeClipContextCount % ClippingManager.CHANNEL_COUNT
    baseMaskCountPerChannel = ~~baseMaskCountPerChannel
    extraMaskChannelCount = ~~extraMaskChannelCount
    let layoutContextCursor = 0
    for (
      let channelIndex = 0;
      channelIndex < ClippingManager.CHANNEL_COUNT;
      channelIndex++
    ) {
      const maskCountForChannel = calculateMaskCountForLayoutChannel(
        baseMaskCountPerChannel,
        extraMaskChannelCount,
        channelIndex,
      )
      layoutContextCursor = assignClippingMaskChannelLayoutBounds(
        this,
        channelIndex,
        maskCountForChannel,
        layoutContextCursor,
        UtDebug,
      )
    }
  }

  /**
   * Stores one shared clip ID set and all drawables that depend on that mask.
   * @param owner Clipping manager that owns matrix and framebuffer state.
   * @param modelContext Runtime model context used to resolve clip draw data indexes.
   * @param clipIdList Draw data IDs that render into this mask.
   */
  function Cubism2ClippingContext(
    this: Cubism2ClippingContextInstance,
    owner: Cubism2ClippingManagerInstance,
    modelContext: Cubism2ClippingModelContext,
    clipIdList: unknown[],
  ): void {
    initializeClippingContextRuntimeState(
      this,
      owner,
      modelContext,
      clipIdList,
      Cubism2FloatRectangle,
    )
  }

  const ClippingContext =
    Cubism2ClippingContext as unknown as Cubism2ClippingContextConstructor

  /**
   * Adds one drawable that will be clipped by this context.
   * @param drawDataId Original Cubism2 draw data ID used for traceability.
   * @param drawDataIndex Runtime draw data index used by ModelContext.
   * @returns Nothing; appends to the clipped draw list.
   */
  ClippingContext.prototype.addClippedDrawData = function (
    drawDataId: unknown,
    drawDataIndex: number,
  ): void {
    appendClippedDrawDataToContext(this, ClippedDrawData, drawDataId, drawDataIndex)
  }

  /**
   * Records one drawable attached to a clipping context.
   * @param drawDataId Cubism2 draw data ID that declared the clipping relationship.
   * @param drawDataIndex Runtime draw data index used to fetch transformed points.
   */
  function Cubism2ClippedDrawData(
    this: Cubism2ClippedDrawDataInstance,
    drawDataId: unknown,
    drawDataIndex: number,
  ): void {
    this.drawDataId = drawDataId
    this.drawDataIndex = drawDataIndex
  }

  const ClippedDrawData =
    Cubism2ClippedDrawData as unknown as Cubism2ClippedDrawDataConstructor

  return {
    Cubism2ClippingManager: ClippingManager,
  }
}
