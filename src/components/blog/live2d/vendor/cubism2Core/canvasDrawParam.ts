export interface Cubism2CanvasDrawParamRenderer {
  releaseTextureIdAtIndex: (
    deleteMode: number,
    textureIds: Int32Array,
    textureIndex: number,
  ) => void
  drawElements: (
    texture: unknown,
    indexArray: unknown,
    vertexArray: unknown,
    uvArray: unknown,
    opacity: number,
    expandedStrokeWidth: number,
    transform: unknown,
    drawContext: unknown,
  ) => void
}

export interface Cubism2DrawParamBaseConstructor {
  new (): unknown
  prototype: {
    constructor: { call: (instance: unknown) => void }
  }
}

export interface Cubism2Live2DCanvasProfile {
  polygonExpansionWidth: number
}

export interface Cubism2CanvasUtSystem {
  copyArraySegmentForward: (
    source: ArrayLike<unknown>,
    sourceStart: number,
    target: ArrayLike<unknown>,
    targetStart: number,
    length: number,
  ) => void
}

export type Cubism2CanvasFloatBuffer = Float32Array
export type Cubism2CanvasIndexBuffer = Int16Array

export interface Cubism2CanvasDrawParamInstance {
  drawTexture: (
    textureIndex: number,
    triangleIndexCount: number,
    indexArray: unknown,
    vertexArray: unknown,
    uvArray: unknown,
    opacity: number,
    blendMode: number,
    drawContext: unknown,
  ) => void
  expandTextureStorage: (textureIndex: number) => void
  gl: Cubism2CanvasDrawParamRenderer | null
  getTextureCount: () => never
  prepareDrawState: () => void
  releaseRendererTextures: () => void
  setGL: (renderer: Cubism2CanvasDrawParamRenderer) => void
  setDrawParam: (drawParam: unknown) => never
  setTexture: (textureIndex: number, texture: unknown) => void
  setTransform: (transform: unknown) => void
  textureHandles: unknown[]
  textureIds: Int32Array
  transform: unknown | null
}

export interface Cubism2CanvasDrawParamConstructor {
  new (): Cubism2CanvasDrawParamInstance
  createFloatBuffer: (length: number) => Cubism2CanvasFloatBuffer
  createIndexBuffer: (length: number) => Cubism2CanvasIndexBuffer
  debugEnabled: boolean
  initialTextureCapacity: number
  isDebugEnabled: () => boolean
  prototype: Cubism2CanvasDrawParamInstance
  setDebugEnabled: (enabled: boolean) => void
  sharedIndexBuffer: Cubism2CanvasIndexBuffer | null
  sharedUvBuffer: Cubism2CanvasFloatBuffer | null
  sharedVertexBuffer: Cubism2CanvasFloatBuffer | null
  updateFloatBuffer: (
    buffer: Cubism2CanvasFloatBuffer | null,
    values: ArrayLike<number>,
  ) => Cubism2CanvasFloatBuffer
  updateIndexBuffer: (
    buffer: Cubism2CanvasIndexBuffer | null,
    values: ArrayLike<number>,
  ) => Cubism2CanvasIndexBuffer
}

export interface CreateCubism2CanvasDrawParamOptions {
  Cubism2DrawParamBase: Cubism2DrawParamBaseConstructor
  Live2D: Cubism2Live2DCanvasProfile
  UtSystem: Cubism2CanvasUtSystem
  isBootstrapping: () => boolean
}

/**
 * Creates the Canvas draw-parameter constructor restored from the legacy runtime.
 * @param options Runtime dependencies from the Cubism2 runtime Core composition.
 * @returns Canvas draw-parameter constructor with the original legacy static and prototype surface.
 */
export function createCubism2CanvasDrawParam(
  options: CreateCubism2CanvasDrawParamOptions,
): Cubism2CanvasDrawParamConstructor {
  /**
   * Stores texture handles and delegates primitive drawing to the Canvas2D helper renderer.
   */
  function Cubism2CanvasDrawParam(this: Cubism2CanvasDrawParamInstance): void {
    if (options.isBootstrapping()) {
      return
    }
    options.Cubism2DrawParamBase.prototype.constructor.call(this)
    this.textureIds = new Int32Array(CanvasDrawParam.initialTextureCapacity)
    this.textureHandles = new Array()
    this.transform = null
    this.gl = null
    if (CanvasDrawParam.sharedVertexBuffer == null) {
      CanvasDrawParam.sharedVertexBuffer = CanvasDrawParam.createFloatBuffer(256)
      CanvasDrawParam.sharedUvBuffer = CanvasDrawParam.createFloatBuffer(256)
      CanvasDrawParam.sharedIndexBuffer = CanvasDrawParam.createIndexBuffer(256)
    }
  }

  const CanvasDrawParam = Cubism2CanvasDrawParam as unknown as Cubism2CanvasDrawParamConstructor

  CanvasDrawParam.prototype = new options.Cubism2DrawParamBase() as Cubism2CanvasDrawParamInstance
  CanvasDrawParam.initialTextureCapacity = 32
  CanvasDrawParam.debugEnabled = false
  CanvasDrawParam.sharedVertexBuffer = null
  CanvasDrawParam.sharedUvBuffer = null
  CanvasDrawParam.sharedIndexBuffer = null

  /**
   * Allocates a Float32Array buffer used for Canvas vertex and UV staging.
   * @param length Number of float entries to allocate.
   * @returns Fresh native float buffer without writable-buffer augmentation.
   */
  CanvasDrawParam.createFloatBuffer = function (length: number): Cubism2CanvasFloatBuffer {
    return new Float32Array(length)
  }

  /**
   * Allocates an Int16Array buffer used for Canvas triangle index staging.
   * @param length Number of index entries to allocate.
   * @returns Fresh native index buffer without writable-buffer augmentation.
   */
  CanvasDrawParam.createIndexBuffer = function (length: number): Cubism2CanvasIndexBuffer {
    return new Int16Array(length)
  }

  /**
   * Ensures a Float32 staging buffer can hold the supplied values and copies them from offset zero.
   * @param buffer Existing buffer, if any.
   * @param values Values copied into the buffer.
   * @returns Native float buffer containing the copied prefix.
   * @remarks Native `set` is the runtime adaptation for the omitted global typed-array cursor patch.
   */
  CanvasDrawParam.updateFloatBuffer = function (
    buffer: Cubism2CanvasFloatBuffer | null,
    values: ArrayLike<number>,
  ): Cubism2CanvasFloatBuffer {
    if (buffer == null || buffer.length < values.length) {
      buffer = CanvasDrawParam.createFloatBuffer(values.length * 2)
    }
    buffer.set(values)
    return buffer
  }

  /**
   * Ensures an Int16 staging buffer can hold the supplied triangle indexes and copies them from offset zero.
   * @param buffer Existing buffer, if any.
   * @param values Triangle index values copied into the buffer.
   * @returns Native index buffer containing the copied prefix.
   * @remarks Native `set` is the runtime adaptation for the omitted global typed-array cursor patch.
   */
  CanvasDrawParam.updateIndexBuffer = function (
    buffer: Cubism2CanvasIndexBuffer | null,
    values: ArrayLike<number>,
  ): Cubism2CanvasIndexBuffer {
    if (buffer == null || buffer.length < values.length) {
      buffer = CanvasDrawParam.createIndexBuffer(values.length * 2)
    }
    buffer.set(values)
    return buffer
  }

  /**
   * Reads the legacy Canvas draw-param debug/static flag.
   * @returns True when the flag is enabled.
   */
  CanvasDrawParam.isDebugEnabled = function (): boolean {
    return CanvasDrawParam.debugEnabled
  }

  /**
   * Writes the legacy Canvas draw-param debug/static flag.
   * @param enabled Flag value used by legacy profiling/debug paths.
   * @returns Nothing; mutates the constructor static flag.
   */
  CanvasDrawParam.setDebugEnabled = function (enabled: boolean): void {
    CanvasDrawParam.debugEnabled = enabled
  }

  /**
   * Attaches the Canvas2D triangle renderer used by the JS model path.
   * @param renderer Renderer object exposing the legacy `drawElements` and texture release hooks.
   * @returns Nothing; stores the renderer reference.
   */
  CanvasDrawParam.prototype.setGL = function (renderer: Cubism2CanvasDrawParamRenderer): void {
    this.gl = renderer
  }

  /**
   * Attaches the model-to-canvas transform object passed to the Canvas2D renderer.
   * @param transform Transform supplied by `Live2DModelJS.setTransform`.
   * @returns Nothing; stores the transform reference.
   */
  CanvasDrawParam.prototype.setTransform = function (transform: unknown): void {
    this.transform = transform
  }

  /**
   * Canvas draw-param no-op matching the WebGL `prepareDrawState` polymorphic entry.
   * @returns Nothing; the canvas path prepares state inside its draw helper.
   */
  CanvasDrawParam.prototype.prepareDrawState = function (): void {}

  /**
   * Draws one primitive through the legacy Canvas draw helper.
   * @param textureIndex Texture slot selected by draw data.
   * @param triangleIndexCount Legacy triangle index count argument, ignored by the Canvas helper.
   * @param indexArray Triangle index data.
   * @param vertexArray Transformed vertex positions.
   * @param uvArray Texture UV coordinates.
   * @param opacity Effective drawable opacity.
   * @param blendMode Legacy Cubism2 blend mode constant, ignored by the Canvas helper.
   * @param drawContext Runtime draw context passed through to the Canvas helper.
   * @returns Nothing; delegates to the attached renderer when opacity is visible.
   */
  CanvasDrawParam.prototype.drawTexture = function (
    textureIndex: number,
    triangleIndexCount: number,
    indexArray: unknown,
    vertexArray: unknown,
    uvArray: unknown,
    opacity: number,
    blendMode: number,
    drawContext: unknown,
  ): void {
    if (opacity < 0.01) {
      return
    }
    const canvasTexture = this.textureHandles[textureIndex]
    const expandedStrokeWidth = opacity > 0.9 ? options.Live2D.polygonExpansionWidth : 0
    this.gl!.drawElements(
      canvasTexture,
      indexArray,
      vertexArray,
      uvArray,
      opacity,
      expandedStrokeWidth,
      this.transform,
      drawContext,
    )
    void triangleIndexCount
    void blendMode
  }

  /**
   * Reports unsupported texture-count access for the Canvas draw path.
   * @returns Never; the Canvas path does not expose WebGL texture ids.
   */
  CanvasDrawParam.prototype.getTextureCount = function (): never {
    throw new Error('Canvas draw parameters do not expose a texture count')
  }

  /**
   * Reports unsupported draw-param reassignment for the Canvas draw path.
   * @param _drawParam Ignored legacy draw parameter.
   * @returns Never; the Canvas path does not support this hook.
   */
  CanvasDrawParam.prototype.setDrawParam = function (_drawParam: unknown): never {
    throw new Error('Canvas draw parameters cannot be reassigned')
  }

  /**
   * Releases any texture ids still queued in the legacy texture-id array.
   * @returns Nothing; calls the renderer release hook and clears released ids.
   */
  CanvasDrawParam.prototype.releaseRendererTextures = function (): void {
    for (let textureIndex = 0; textureIndex < this.textureIds.length; textureIndex++) {
      const textureId = this.textureIds[textureIndex]
      if (textureId != 0) {
        this.gl!.releaseTextureIdAtIndex(1, this.textureIds, textureIndex)
        this.textureIds[textureIndex] = 0
      }
    }
  }

  /**
   * Stores one Canvas texture handle by texture slot, preserving the final duplicate min.js method body.
   * @param textureIndex Texture slot used by draw data.
   * @param texture Canvas texture or image handle passed by `Live2DModelJS.setTexture`.
   * @returns Nothing; expands storage when the slot is outside the current capacity.
   */
  CanvasDrawParam.prototype.setTexture = function (textureIndex: number, texture: unknown): void {
    if (this.textureIds.length < textureIndex + 1) {
      this.expandTextureStorage(textureIndex)
    }
    this.textureHandles[textureIndex] = texture
  }

  /**
   * Expands texture-id and texture-handle storage for a high texture slot.
   * @param textureIndex Requested texture slot that must fit after expansion.
   * @returns Nothing; replaces the backing arrays with larger copies.
   */
  CanvasDrawParam.prototype.expandTextureStorage = function (textureIndex: number): void {
    const nextCapacity = Math.max(this.textureIds.length * 2, textureIndex + 1 + 10)
    const nextTextureIds = new Int32Array(nextCapacity)
    options.UtSystem.copyArraySegmentForward(
      this.textureIds,
      0,
      nextTextureIds,
      0,
      this.textureIds.length,
    )
    this.textureIds = nextTextureIds
    const nextTextureHandles = new Array()
    options.UtSystem.copyArraySegmentForward(
      this.textureHandles,
      0,
      nextTextureHandles,
      0,
      this.textureHandles.length,
    )
    this.textureHandles = nextTextureHandles
  }

  return CanvasDrawParam
}
