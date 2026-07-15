export interface Cubism2DrawParamLive2DProfile {
  COLOR_BLEND_MODE_MULTIPLY: number
}

export interface Cubism2RgbaColorInstance {
  a: number
  b: number
  blendMode: number
  g: number
  r: number
  scale: number
  unitScalar: number
}

export interface Cubism2RgbaColorConstructor {
  new (): Cubism2RgbaColorInstance
  prototype: Cubism2RgbaColorInstance
}

export interface Cubism2DrawParamBaseInstance {
  CHANNEL_COLORS: unknown[]
  anisotropy: number
  baseAlpha: number
  baseBlue: number
  baseGreen: number
  baseRed: number
  clippingContextForDraw: unknown | null
  clippingContextForMask: unknown | null
  clippingProcess: number
  culling: boolean
  drawTexture: (
    textureIndex: number,
    triangleIndexCount: number,
    indexArray: unknown,
    vertexArray: unknown,
    uvArray: unknown,
    opacity: number,
    blendMode: number,
  ) => void
  getAnisotropy: () => number
  getChannelFlagAsColor: (channelIndex: number) => unknown
  getClippingContextForDraw: () => unknown | null
  getClippingContextForMask: () => unknown | null
  getClippingProcess: () => number
  getMatrix: () => Float32Array
  getTextureCount: () => number
  isPremultipliedAlpha: () => boolean
  matrix4x4: Float32Array
  premultipliedAlpha: boolean
  textureCapacity: number
  prepareDrawState: () => void
  setAnisotropy: (anisotropy: number) => void
  setBaseColor: (alpha: number, red: number, green: number, blue: number) => void
  setCulling: (enabled: boolean) => void
  setChannelFlagAsColor: (channelIndex: number, color: unknown) => void
  setClippingContextForDraw: (clipContext: unknown | null) => void
  setClippingContextForMask: (clipContext: unknown | null) => void
  setClippingProcess: (clippingProcess: number) => void
  setDrawParam: (drawParam: unknown) => void
  setMatrix: (sourceMatrix: ArrayLike<number>) => void
  setPremultipliedAlpha: (enabled: boolean) => void
}

export interface Cubism2DrawParamBaseConstructor {
  new (): Cubism2DrawParamBaseInstance
  CLIPPING_PROCESS_CLEAR_ALPHA: number
  CLIPPING_PROCESS_DRAW: number
  CLIPPING_PROCESS_MULTIPLY_ALPHA: number
  CLIPPING_PROCESS_NONE: number
  CLIPPING_PROCESS_OVERWRITE_ALPHA: number
  initialTextureCapacity: number
  prototype: Cubism2DrawParamBaseInstance
}

export interface CreateCubism2DrawParamBaseOptions {
  Live2D: Cubism2DrawParamLive2DProfile
  isBootstrapping: () => boolean
}

export interface Cubism2DrawParamBaseConstructors {
  Cubism2DrawParamBase: Cubism2DrawParamBaseConstructor
  Cubism2RgbaColor: Cubism2RgbaColorConstructor
}

/**
 * Clamps a base-color channel to the legacy draw-parameter unit interval.
 * @param channelValue Color component supplied by SDK callers or draw-state setup.
 * @returns The component constrained to the inclusive `[0, 1]` range.
 */
function clampUnitColorComponent(channelValue: number): number {
  if (channelValue < 0) {
    return 0
  }

  if (channelValue > 1) {
    return 1
  }

  return channelValue
}

/**
 * Creates the shared Cubism2 draw-parameter base and RGBA color constructors.
 * @param options Runtime dependencies from the runtime Core composition.
 * @returns Constructors consumed by Canvas/WebGL draw params and clipping color setup.
 */
export function createCubism2DrawParamBase(
  options: CreateCubism2DrawParamBaseOptions,
): Cubism2DrawParamBaseConstructors {
  /**
   * Stores common draw-state flags shared by Canvas and WebGL draw parameter subclasses.
   */
  function Cubism2DrawParamBase(this: Cubism2DrawParamBaseInstance): void {
    if (options.isBootstrapping()) {
      return
    }

    this.textureCapacity = DrawParamBase.initialTextureCapacity
    this.baseAlpha = 1
    this.baseRed = 1
    this.baseGreen = 1
    this.baseBlue = 1
    this.culling = false
    this.matrix4x4 = new Float32Array(16)
    this.premultipliedAlpha = false
    this.anisotropy = 0
    this.clippingProcess = DrawParamBase.CLIPPING_PROCESS_NONE
    this.clippingContextForMask = null
    this.clippingContextForDraw = null
    this.CHANNEL_COLORS = new Array()
  }

  const DrawParamBase = Cubism2DrawParamBase as unknown as Cubism2DrawParamBaseConstructor

  DrawParamBase.initialTextureCapacity = 32
  DrawParamBase.CLIPPING_PROCESS_NONE = 0
  DrawParamBase.CLIPPING_PROCESS_OVERWRITE_ALPHA = 1
  DrawParamBase.CLIPPING_PROCESS_MULTIPLY_ALPHA = 2
  DrawParamBase.CLIPPING_PROCESS_DRAW = 3
  DrawParamBase.CLIPPING_PROCESS_CLEAR_ALPHA = 4

  /**
   * Stores the mask-channel color assigned by the clipping manager.
   * @param channelIndex Clipping color channel slot used by mask rendering.
   * @param color RGBA color object consumed by WebGL shader uniform upload.
   * @returns Nothing; mutates the channel color table in place.
   */
  DrawParamBase.prototype.setChannelFlagAsColor = function (
    channelIndex: number,
    color: unknown,
  ): void {
    this.CHANNEL_COLORS[channelIndex] = color
  }

  /**
   * Reads the mask-channel color assigned for shader uniform upload.
   * @param channelIndex Clipping color channel slot requested by WebGL rendering.
   * @returns The color object previously assigned to the requested channel.
   */
  DrawParamBase.prototype.getChannelFlagAsColor = function (channelIndex: number): unknown {
    return this.CHANNEL_COLORS[channelIndex]
  }

  /**
   * Polymorphic draw-state hook implemented by WebGL and canvas draw parameters.
   * @returns Nothing in the base implementation.
   */
  DrawParamBase.prototype.prepareDrawState = function (): void {}

  /**
   * Polymorphic texture draw hook implemented by WebGL and canvas draw parameters.
   * @param textureIndex Texture slot selected by draw data.
   * @param triangleIndexCount Legacy triangle index count argument.
   * @param indexArray Triangle index data.
   * @param vertexArray Transformed vertex positions.
   * @param uvArray Texture UV coordinates.
   * @param opacity Effective drawable opacity.
   * @param blendMode Legacy Cubism2 blend mode constant.
   * @returns Nothing in the base implementation.
   */
  DrawParamBase.prototype.drawTexture = function (
    textureIndex: number,
    triangleIndexCount: number,
    indexArray: unknown,
    vertexArray: unknown,
    uvArray: unknown,
    opacity: number,
    blendMode: number,
  ): void {}

  /**
   * Reads subclass texture-count state for model-wrapper compatibility.
   * @returns The original sentinel value from the base implementation.
   */
  DrawParamBase.prototype.getTextureCount = function (): number {
    return -1
  }

  /**
   * Accepts draw-param setup payloads forwarded by model wrappers.
   * @param drawParam Caller-provided setup payload ignored by the base implementation.
   * @returns Nothing in the base implementation.
   */
  DrawParamBase.prototype.setDrawParam = function (drawParam: unknown): void {}

  /**
   * Stores the base ARGB color after clamping each channel to Cubism2's unit range.
   * @param alpha Alpha multiplier used by shader or canvas draw state.
   * @param red Red multiplier used by shader or canvas draw state.
   * @param green Green multiplier used by shader or canvas draw state.
   * @param blue Blue multiplier used by shader or canvas draw state.
   * @returns Nothing; mutates the draw parameter's base-color slots.
   */
  DrawParamBase.prototype.setBaseColor = function (
    alpha: number,
    red: number,
    green: number,
    blue: number,
  ): void {
    const clampedAlpha = clampUnitColorComponent(alpha)
    const clampedRed = clampUnitColorComponent(red)
    const clampedGreen = clampUnitColorComponent(green)
    const clampedBlue = clampUnitColorComponent(blue)

    this.baseAlpha = clampedAlpha
    this.baseRed = clampedRed
    this.baseGreen = clampedGreen
    this.baseBlue = clampedBlue
  }

  /**
   * Sets whether back-face culling should be enabled for subsequent draws.
   * @param enabled Whether back-face culling should be enabled for subsequent draws.
   * @returns Nothing; mutates the draw parameter culling flag.
   */
  DrawParamBase.prototype.setCulling = function (enabled: boolean): void {
    this.culling = enabled
  }

  /**
   * Copies the current model-view-projection matrix into draw-param state.
   * @param sourceMatrix Sixteen matrix entries consumed by Canvas/WebGL draw paths.
   * @returns Nothing; mutates the internal matrix buffer in place.
   */
  DrawParamBase.prototype.setMatrix = function (sourceMatrix: ArrayLike<number>): void {
    for (var matrixIndex = 0; matrixIndex < 16; matrixIndex++) {
      this.matrix4x4[matrixIndex] = sourceMatrix[matrixIndex]!
    }
  }

  /**
   * Reads the current model-view-projection matrix.
   * @returns The internal 4x4 matrix buffer.
   */
  DrawParamBase.prototype.getMatrix = function (): Float32Array {
    return this.matrix4x4
  }

  /**
   * Sets whether texture colors are already premultiplied by alpha.
   * @param enabled True when the renderer should use premultiplied-alpha blending.
   * @returns Nothing; mutates the premultiplied-alpha flag.
   */
  DrawParamBase.prototype.setPremultipliedAlpha = function (enabled: boolean): void {
    this.premultipliedAlpha = enabled
  }

  /**
   * Reads the current premultiplied-alpha rendering flag.
   * @returns True when texture colors are treated as premultiplied.
   */
  DrawParamBase.prototype.isPremultipliedAlpha = function (): boolean {
    return this.premultipliedAlpha
  }

  /**
   * Sets the requested texture anisotropy level.
   * @param anisotropy Texture anisotropy value forwarded to the WebGL extension when available.
   * @returns Nothing; mutates the anisotropy slot.
   */
  DrawParamBase.prototype.setAnisotropy = function (anisotropy: number): void {
    this.anisotropy = anisotropy
  }

  /**
   * Reads the requested texture anisotropy level.
   * @returns Current anisotropy value stored on the draw parameter.
   */
  DrawParamBase.prototype.getAnisotropy = function (): number {
    return this.anisotropy
  }

  /**
   * Reads the clipping pass currently being rendered.
   * @returns One of the `CLIPPING_PROCESS_*` constants.
   */
  DrawParamBase.prototype.getClippingProcess = function (): number {
    return this.clippingProcess
  }

  /**
   * Sets the clipping pass currently being rendered.
   * @param clippingProcess One of the `CLIPPING_PROCESS_*` constants.
   * @returns Nothing; mutates the clipping-process state.
   */
  DrawParamBase.prototype.setClippingProcess = function (clippingProcess: number): void {
    this.clippingProcess = clippingProcess
  }

  /**
   * Stores the clipping context used while writing a mask texture.
   * @param clipContext Mask clipping context selected by the clipping manager.
   * @returns Nothing; mutates the mask clipping-context slot.
   */
  DrawParamBase.prototype.setClippingContextForMask = function (
    clipContext: unknown | null,
  ): void {
    this.clippingContextForMask = clipContext
  }

  /**
   * Reads the clipping context used while writing a mask texture.
   * @returns Current mask clipping context or null when no mask pass is active.
   */
  DrawParamBase.prototype.getClippingContextForMask = function (): unknown | null {
    return this.clippingContextForMask
  }

  /**
   * Stores the clipping context used while drawing clipped mesh geometry.
   * @param clipContext Draw clipping context selected for the active mesh.
   * @returns Nothing; mutates the draw clipping-context slot.
   */
  DrawParamBase.prototype.setClippingContextForDraw = function (
    clipContext: unknown | null,
  ): void {
    this.clippingContextForDraw = clipContext
  }

  /**
   * Reads the clipping context used while drawing clipped mesh geometry.
   * @returns Current draw clipping context or null when no clipped mesh is active.
   */
  DrawParamBase.prototype.getClippingContextForDraw = function (): unknown | null {
    return this.clippingContextForDraw
  }

  /**
   * Stores one RGBA multiplier/channel color in the Cubism2 v2 format.
   */
  function Cubism2RgbaColor(this: Cubism2RgbaColorInstance): void {
    if (options.isBootstrapping()) {
      return
    }

    this.a = 1
    this.r = 1
    this.g = 1
    this.b = 1
    this.scale = 1
    this.unitScalar = 1
    this.blendMode = options.Live2D.COLOR_BLEND_MODE_MULTIPLY
  }

  const RgbaColor = Cubism2RgbaColor as unknown as Cubism2RgbaColorConstructor

  return {
    Cubism2DrawParamBase: DrawParamBase,
    Cubism2RgbaColor: RgbaColor,
  }
}
