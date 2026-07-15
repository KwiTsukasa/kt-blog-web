import {
  uploadCubism2WebGLArrayBuffer,
  uploadCubism2WebGLElementArrayBuffer,
} from './webglBuffers'
import { CUBISM2_WEBGL_SHADER_SOURCES } from './webglShaderSources'
import {
  createCubism2LegacyWritableFloatBuffer,
  createCubism2LegacyWritableIndexBuffer,
  type Cubism2LegacyWritableFloatBuffer,
  type Cubism2LegacyWritableIndexBuffer,
} from './legacyWritableBuffer'

export interface Cubism2WebGLBlendModes {
  BLEND_ADD: number
  BLEND_MULTIPLY: number
  BLEND_NORMAL: number
}

export interface Cubism2WebGLDebugLogger {
  logDebug: (message: string) => void
}

export interface Cubism2WebGLLive2DProfile {
  polygonExpansionWidth: number
  clippingMaskBufferSize: number
  maskTextures: unknown[]
}

export interface Cubism2WebGLDrawParamBaseConstructor {
  new (): unknown
  prototype: {
    constructor: { call: (instance: unknown) => void }
  }
}

export type Cubism2WebGLFloatBuffer = Cubism2LegacyWritableFloatBuffer
export type Cubism2WebGLIndexBuffer = Cubism2LegacyWritableIndexBuffer

export interface Cubism2ClipLayoutBounds {
  getBottom: () => number
  getRight: () => number
  x: number
  y: number
}

export interface Cubism2ClipContext {
  layoutBounds: Cubism2ClipLayoutBounds
  layoutChannelNo: number
  matrixForDraw: Float32Array | number[]
  matrixForMask: Float32Array | number[]
}

export interface Cubism2ChannelColor {
  a: number
  b: number
  g: number
  r: number
}

export interface Cubism2AnisotropyExtension {
  MAX_TEXTURE_MAX_ANISOTROPY_EXT: number
  TEXTURE_MAX_ANISOTROPY_EXT: number
}

export type Cubism2WebGLContext = WebGLRenderingContext & {
  releaseTextureAtIndex: (deleteMode: number, textures: unknown[], textureIndex: number) => void
}

export interface Cubism2WebGLFramebufferResources {
  framebuffer: WebGLFramebuffer | null
  renderbuffer: WebGLRenderbuffer | null
  texture: unknown
}

export interface Cubism2WebGLDrawParamInstance {
  CHANNEL_COLORS: Cubism2ChannelColor[]
  attributePositionLocation: number
  clippedAttributePositionLocation: number
  attributeTexCoordLocation: number
  clippedAttributeTexCoordLocation: number
  anisotropy: number
  anisotropyExt: Cubism2AnisotropyExtension | null
  baseAlpha: number
  baseBlue: number
  baseGreen: number
  baseRed: number
  culling: boolean
  clippingContextForDraw: Cubism2ClipContext | null
  clippingContextForMask: Cubism2ClipContext | null
  compileShader: (shaderType: number, shaderSource: string) => WebGLShader | null
  createFramebuffer: () => Cubism2WebGLFramebufferResources
  disposeShader: () => void
  drawTexture: (
    textureIndex: number,
    triangleIndexCount: number,
    indexArray: ArrayLike<number>,
    vertexArray: ArrayLike<number>,
    uvArray: ArrayLike<number>,
    opacity: number,
    blendMode: number,
    drawContext: unknown,
  ) => void
  firstDraw: boolean
  fragShader: WebGLShader | 0 | null
  clippedFragmentShader: WebGLShader | 0 | null
  getChannelFlagAsColor: (channelIndex: number) => Cubism2ChannelColor
  getClippingContextForDraw: () => Cubism2ClipContext | null
  getClippingContextForMask: () => Cubism2ClipContext | null
  getGL: () => Cubism2WebGLContext | null
  getAnisotropy: () => number
  getTextureCount: () => never
  gl: Cubism2WebGLContext | null
  glIndex: number | undefined
  indexElementBuffer: WebGLBuffer | null
  initShader: () => void
  isPremultipliedAlpha: () => boolean
  loadShaders2: () => boolean
  matrix4x4: Float32Array
  maxAnisotropy: number
  prepareDrawState: () => void
  releaseRendererTextures: () => void
  setAnisotropy: (anisotropy: number) => void
  setDrawParam: (drawParam: unknown) => never
  setGL: (gl: Cubism2WebGLContext) => void
  setMatrix: (matrix: unknown) => void
  setPremultipliedAlpha: (enabled: boolean) => void
  setTexture: (textureIndex: number, texture: unknown) => void
  setTransform: (transform: unknown) => void
  shaderProgram: WebGLProgram | 0 | null
  clippedShaderProgram: WebGLProgram | 0 | null
  samplerTexture0Location: WebGLUniformLocation | null
  clippedSamplerTexture0Location: WebGLUniformLocation | null
  clippedSamplerTexture1Location: WebGLUniformLocation | null
  textureCoordBuffer: WebGLBuffer | null
  textures: unknown[]
  transform: unknown | null
  uniformBaseColorLocation: WebGLUniformLocation | null
  clippedUniformBaseColorLocation: WebGLUniformLocation | null
  uniformChannelFlagLocation: WebGLUniformLocation | null
  clippedUniformChannelFlagLocation: WebGLUniformLocation | null
  clippedUniformClipMatrixLocation: WebGLUniformLocation | null
  uniformMaskFlagLocation: WebGLUniformLocation | null
  uniformMatrixLocation: WebGLUniformLocation | null
  clippedUniformMatrixLocation: WebGLUniformLocation | null
  vertexPositionBuffer: WebGLBuffer | null
  vertShader: WebGLShader | 0 | null
  clippedVertexShader: WebGLShader | 0 | null
}

export interface Cubism2WebGLDrawParamConstructor {
  new (glIndex?: number): Cubism2WebGLDrawParamInstance
  createFloatBuffer: (length: number) => Cubism2WebGLFloatBuffer
  createIndexBuffer: (length: number) => Cubism2WebGLIndexBuffer
  prototype: Cubism2WebGLDrawParamInstance
  updateFloatBuffer: (
    buffer: Cubism2WebGLFloatBuffer | null,
    values: ArrayLike<number>,
  ) => Cubism2WebGLFloatBuffer
  updateIndexBuffer: (
    buffer: Cubism2WebGLIndexBuffer | null,
    values: ArrayLike<number>,
  ) => Cubism2WebGLIndexBuffer
}

export interface CreateCubism2WebGLDrawParamOptions {
  Cubism2DrawParamBase: Cubism2WebGLDrawParamBaseConstructor
  Live2D: Cubism2WebGLLive2DProfile
  UtDebug: Cubism2WebGLDebugLogger
  blendModes: Cubism2WebGLBlendModes
  isBootstrapping: () => boolean
}

/**
 * Creates the legacy WebGL draw-parameter constructor formerly bundled inside `live2d.min.js`.
 * @param options Runtime dependencies supplied by the Cubism2 runtime Core composition.
 * @returns WebGL draw-parameter constructor with the original shader and framebuffer surface.
 */
export function createCubism2WebGLDrawParam(
  options: CreateCubism2WebGLDrawParamOptions,
): Cubism2WebGLDrawParamConstructor {
  const { Cubism2DrawParamBase, Live2D, UtDebug, blendModes } = options

  /**
   * Stores WebGL draw resources and clipping shader state for one model instance.
   * @param glIndex Index into the legacy `Live2D.maskTextures` framebuffer texture registry.
   */
  function WebGLDrawParam(this: Cubism2WebGLDrawParamInstance, glIndex?: number): void {
    if (options.isBootstrapping()) {
      return
    }
    Cubism2DrawParamBase.prototype.constructor.call(this)
    this.textures = new Array()
    this.transform = null
    this.gl = null
    this.glIndex = glIndex
    this.firstDraw = true
    this.anisotropyExt = null
    this.maxAnisotropy = 0
    this.textureCoordBuffer = null
    this.vertexPositionBuffer = null
    this.indexElementBuffer = null
    this.vertShader = null
    this.fragShader = null
    this.clippedVertexShader = null
    this.clippedFragmentShader = null
  }

  const DrawParam = WebGLDrawParam as unknown as Cubism2WebGLDrawParamConstructor

  DrawParam.prototype = new Cubism2DrawParamBase() as Cubism2WebGLDrawParamInstance

  /**
   * Allocates a float buffer used for vertex positions or UV coordinates.
   * @param length Number of float slots to allocate.
   * @returns Newly allocated Float32Array cast to the legacy writable-buffer interface.
   */
  DrawParam.createFloatBuffer = function (length: number): Cubism2WebGLFloatBuffer {
    return createCubism2LegacyWritableFloatBuffer(length)
  }

  /**
   * Allocates an index buffer used by WebGL `drawElements`.
   * @param length Number of index slots to allocate.
   * @returns Newly allocated Int16Array cast to the legacy writable-buffer interface.
   */
  DrawParam.createIndexBuffer = function (length: number): Cubism2WebGLIndexBuffer {
    return createCubism2LegacyWritableIndexBuffer(length)
  }

  /**
   * Reuses or grows a float buffer, then rewinds it to the first element.
   * @param buffer Existing legacy buffer wrapper, when large enough.
   * @param values Source float values from transformed draw data.
   * @returns Buffer containing `values` and positioned at offset 0.
   */
  DrawParam.updateFloatBuffer = function (
    buffer: Cubism2WebGLFloatBuffer | null,
    values: ArrayLike<number>,
  ): Cubism2WebGLFloatBuffer {
    if (buffer == null || buffer.getCapacity() < values.length) {
      buffer = DrawParam.createFloatBuffer(values.length * 2)
      buffer.put(values)
      buffer.setWritePosition(0)
    } else {
      buffer.clear()
      buffer.put(values)
      buffer.setWritePosition(0)
    }
    return buffer
  }

  /**
   * Reuses or grows an index buffer, then rewinds it to the first element.
   * @param buffer Existing legacy buffer wrapper, when large enough.
   * @param values Source triangle indexes for the drawable.
   * @returns Buffer containing `values` and positioned at offset 0.
   */
  DrawParam.updateIndexBuffer = function (
    buffer: Cubism2WebGLIndexBuffer | null,
    values: ArrayLike<number>,
  ): Cubism2WebGLIndexBuffer {
    if (buffer == null || buffer.getCapacity() < values.length) {
      buffer = DrawParam.createIndexBuffer(values.length * 2)
      buffer.put(values)
      buffer.setWritePosition(0)
    } else {
      buffer.clear()
      buffer.put(values)
      buffer.setWritePosition(0)
    }
    return buffer
  }

  /**
   * Reads the WebGL context currently bound to this draw parameter.
   * @returns The WebGL context or null before `setGL`.
   */
  DrawParam.prototype.getGL = function (): Cubism2WebGLContext | null {
    return this.gl
  }

  /**
   * Attaches the WebGL context supplied by `Live2DModelWebGL`.
   * @param gl WebGL context used for all subsequent draw calls.
   */
  DrawParam.prototype.setGL = function (gl: Cubism2WebGLContext): void {
    this.gl = gl
  }

  /**
   * Attaches the legacy transform reference retained for polymorphic API parity.
   * @param transform Transform supplied through the public WebGL model wrapper.
   */
  DrawParam.prototype.setTransform = function (transform: unknown): void {
    this.transform = transform
  }

  /**
   * Prepares GL state before a clipping or model draw pass.
   */
  DrawParam.prototype.prepareDrawState = function (): void {
    const gl = this.gl!
    if (this.firstDraw) {
      this.initShader()
      this.firstDraw = false
      this.anisotropyExt =
        (gl.getExtension('EXT_texture_filter_anisotropic') as Cubism2AnisotropyExtension | null) ||
        (gl.getExtension(
          'WEBKIT_EXT_texture_filter_anisotropic',
        ) as Cubism2AnisotropyExtension | null) ||
        (gl.getExtension('MOZ_EXT_texture_filter_anisotropic') as Cubism2AnisotropyExtension | null)
      if (this.anisotropyExt) {
        this.maxAnisotropy = gl.getParameter(
          this.anisotropyExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT,
        ) as number
      }
    }
    gl.disable(gl.SCISSOR_TEST)
    gl.disable(gl.STENCIL_TEST)
    gl.disable(gl.DEPTH_TEST)
    gl.frontFace(gl.CW)
    gl.enable(gl.BLEND)
    gl.colorMask(
      1 as unknown as boolean,
      1 as unknown as boolean,
      1 as unknown as boolean,
      1 as unknown as boolean,
    )
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
  }

  /**
   * Draws one Cubism2 texture primitive either into the mask buffer or into the model framebuffer.
   * @param textureIndex Index into `this.textures` for the drawable's texture.
   * @param triangleIndexCount Legacy count argument from draw data; current min.js body uses the array length.
   * @param indexArray Triangle index array passed to `drawElements`.
   * @param vertexArray Transformed vertex positions for the drawable.
   * @param uvArray Texture UV coordinates for the drawable.
   * @param opacity Effective opacity after drawable, parts, and base opacity are multiplied.
   * @param blendMode Cubism2 blend mode constant controlling WebGL blend factors.
   * @param drawContext Runtime draw context; kept for signature compatibility with the min.js caller.
   */
  DrawParam.prototype.drawTexture = function (
    textureIndex: number,
    triangleIndexCount: number,
    indexArray: ArrayLike<number>,
    vertexArray: ArrayLike<number>,
    uvArray: ArrayLike<number>,
    opacity: number,
    blendMode: number,
    drawContext: unknown,
  ): void {
    if (opacity < 0.01 && this.clippingContextForMask == null) {
      return
    }
    const expandedStrokeWidth = opacity > 0.9 ? Live2D.polygonExpansionWidth : 0
    const gl = this.gl as Cubism2WebGLContext
    if (this.gl == null) {
      throw new Error('gl is null')
    }
    let usesDrawClip = false
    const unusedRedMultiplier = 1
    const redMultiplier = 1
    const greenMultiplier = 1
    const blueMultiplier = 1
    const baseRed = this.baseRed * redMultiplier * opacity
    const baseGreen = this.baseGreen * greenMultiplier * opacity
    const baseBlue = this.baseBlue * blueMultiplier * opacity
    const baseAlpha = this.baseAlpha * opacity
    if (this.clippingContextForMask != null) {
      gl.frontFace(gl.CCW)
      gl.useProgram(this.shaderProgram as WebGLProgram)
      this.vertexPositionBuffer = uploadCubism2WebGLArrayBuffer(
        gl,
        this.vertexPositionBuffer,
        vertexArray,
      )
      this.indexElementBuffer = uploadCubism2WebGLElementArrayBuffer(
        gl,
        this.indexElementBuffer,
        indexArray,
      )
      gl.enableVertexAttribArray(this.attributePositionLocation)
      gl.vertexAttribPointer(this.attributePositionLocation, 2, gl.FLOAT, false, 0, 0)
      this.textureCoordBuffer = uploadCubism2WebGLArrayBuffer(
        gl,
        this.textureCoordBuffer,
        uvArray,
      )
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, this.textures[textureIndex] as WebGLTexture)
      gl.uniform1i(this.samplerTexture0Location, 1)
      gl.enableVertexAttribArray(this.attributeTexCoordLocation)
      gl.vertexAttribPointer(this.attributeTexCoordLocation, 2, gl.FLOAT, false, 0, 0)
      gl.uniformMatrix4fv(
        this.uniformMatrixLocation,
        false,
        this.getClippingContextForMask()!.matrixForMask,
      )
      const channelIndex = this.getClippingContextForMask()!.layoutChannelNo
      const channelColor = this.getChannelFlagAsColor(channelIndex)
      gl.uniform4f(
        this.uniformChannelFlagLocation,
        channelColor.r,
        channelColor.g,
        channelColor.b,
        channelColor.a,
      )
      const layoutBounds = this.getClippingContextForMask()!.layoutBounds
      gl.uniform4f(
        this.uniformBaseColorLocation,
        layoutBounds.x * 2 - 1,
        layoutBounds.y * 2 - 1,
        layoutBounds.getRight() * 2 - 1,
        layoutBounds.getBottom() * 2 - 1,
      )
      gl.uniform1i(this.uniformMaskFlagLocation, true as unknown as number)
    } else {
      usesDrawClip = this.getClippingContextForDraw() != null
      if (usesDrawClip) {
        gl.useProgram(this.clippedShaderProgram as WebGLProgram)
        this.vertexPositionBuffer = uploadCubism2WebGLArrayBuffer(
          gl,
          this.vertexPositionBuffer,
          vertexArray,
        )
        this.indexElementBuffer = uploadCubism2WebGLElementArrayBuffer(
          gl,
          this.indexElementBuffer,
          indexArray,
        )
        gl.enableVertexAttribArray(this.clippedAttributePositionLocation)
        gl.vertexAttribPointer(this.clippedAttributePositionLocation, 2, gl.FLOAT, false, 0, 0)
        this.textureCoordBuffer = uploadCubism2WebGLArrayBuffer(
          gl,
          this.textureCoordBuffer,
          uvArray,
        )
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, this.textures[textureIndex] as WebGLTexture)
        gl.uniform1i(this.clippedSamplerTexture0Location, 1)
        gl.enableVertexAttribArray(this.clippedAttributeTexCoordLocation)
        gl.vertexAttribPointer(this.clippedAttributeTexCoordLocation, 2, gl.FLOAT, false, 0, 0)
        gl.uniformMatrix4fv(
          this.clippedUniformClipMatrixLocation,
          false,
          this.getClippingContextForDraw()!.matrixForDraw,
        )
        gl.uniformMatrix4fv(this.clippedUniformMatrixLocation, false, this.matrix4x4)
        gl.activeTexture(gl.TEXTURE2)
        gl.bindTexture(
          gl.TEXTURE_2D,
          Live2D.maskTextures[this.glIndex as number] as WebGLTexture,
        )
        gl.uniform1i(this.clippedSamplerTexture1Location, 2)
        const channelIndex = this.getClippingContextForDraw()!.layoutChannelNo
        const channelColor = this.getChannelFlagAsColor(channelIndex)
        gl.uniform4f(
          this.clippedUniformChannelFlagLocation,
          channelColor.r,
          channelColor.g,
          channelColor.b,
          channelColor.a,
        )
        gl.uniform4f(this.clippedUniformBaseColorLocation, baseRed, baseGreen, baseBlue, baseAlpha)
      } else {
        gl.useProgram(this.shaderProgram as WebGLProgram)
        this.vertexPositionBuffer = uploadCubism2WebGLArrayBuffer(
          gl,
          this.vertexPositionBuffer,
          vertexArray,
        )
        this.indexElementBuffer = uploadCubism2WebGLElementArrayBuffer(
          gl,
          this.indexElementBuffer,
          indexArray,
        )
        gl.enableVertexAttribArray(this.attributePositionLocation)
        gl.vertexAttribPointer(this.attributePositionLocation, 2, gl.FLOAT, false, 0, 0)
        this.textureCoordBuffer = uploadCubism2WebGLArrayBuffer(
          gl,
          this.textureCoordBuffer,
          uvArray,
        )
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, this.textures[textureIndex] as WebGLTexture)
        gl.uniform1i(this.samplerTexture0Location, 1)
        gl.enableVertexAttribArray(this.attributeTexCoordLocation)
        gl.vertexAttribPointer(this.attributeTexCoordLocation, 2, gl.FLOAT, false, 0, 0)
        gl.uniformMatrix4fv(this.uniformMatrixLocation, false, this.matrix4x4)
        gl.uniform4f(this.uniformBaseColorLocation, baseRed, baseGreen, baseBlue, baseAlpha)
        gl.uniform1i(this.uniformMaskFlagLocation, false as unknown as number)
      }
    }
    if (this.culling) {
      this.gl!.enable(gl.CULL_FACE)
    } else {
      this.gl!.disable(gl.CULL_FACE)
    }
    this.gl!.enable(gl.BLEND)
    let sourceRgbBlendFactor: number | undefined
    let destinationRgbBlendFactor: number | undefined
    let sourceAlphaBlendFactor: number | undefined
    let destinationAlphaBlendFactor: number | undefined
    if (this.clippingContextForMask != null) {
      sourceRgbBlendFactor = gl.ONE
      destinationRgbBlendFactor = gl.ONE_MINUS_SRC_ALPHA
      sourceAlphaBlendFactor = gl.ONE
      destinationAlphaBlendFactor = gl.ONE_MINUS_SRC_ALPHA
    } else {
      switch (blendMode) {
        case blendModes.BLEND_NORMAL:
          sourceRgbBlendFactor = gl.ONE
          destinationRgbBlendFactor = gl.ONE_MINUS_SRC_ALPHA
          sourceAlphaBlendFactor = gl.ONE
          destinationAlphaBlendFactor = gl.ONE_MINUS_SRC_ALPHA
          break
        case blendModes.BLEND_ADD:
          sourceRgbBlendFactor = gl.ONE
          destinationRgbBlendFactor = gl.ONE
          sourceAlphaBlendFactor = gl.ZERO
          destinationAlphaBlendFactor = gl.ONE
          break
        case blendModes.BLEND_MULTIPLY:
          sourceRgbBlendFactor = gl.DST_COLOR
          destinationRgbBlendFactor = gl.ONE_MINUS_SRC_ALPHA
          sourceAlphaBlendFactor = gl.ZERO
          destinationAlphaBlendFactor = gl.ONE
          break
      }
    }
    gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD)
    gl.blendFuncSeparate(
      sourceRgbBlendFactor!,
      destinationRgbBlendFactor!,
      sourceAlphaBlendFactor!,
      destinationAlphaBlendFactor!,
    )
    if (this.anisotropyExt) {
      gl.texParameteri(
        gl.TEXTURE_2D,
        this.anisotropyExt.TEXTURE_MAX_ANISOTROPY_EXT,
        this.maxAnisotropy,
      )
    }
    const elementCount = indexArray.length
    gl.drawElements(gl.TRIANGLES, elementCount, gl.UNSIGNED_SHORT, 0)
    gl.bindTexture(gl.TEXTURE_2D, null)
    void triangleIndexCount
    void expandedStrokeWidth
    void unusedRedMultiplier
    void drawContext
  }

  /**
   * Reports unsupported texture-count access for the WebGL draw path.
   * @returns Never; the WebGL path does not expose this old helper.
   */
  DrawParam.prototype.getTextureCount = function (): never {
    throw new Error('WebGL draw parameters do not expose a texture count')
  }

  /**
   * Reports unsupported draw-param reassignment for the WebGL draw path.
   * @param drawParam Ignored legacy draw parameter.
   * @returns Never; this WebGL path does not support the hook.
   */
  DrawParam.prototype.setDrawParam = function (drawParam: unknown): never {
    void drawParam
    throw new Error('WebGL draw parameters cannot be reassigned')
  }

  /**
   * Releases WebGL textures still owned by this draw parameter.
   */
  DrawParam.prototype.releaseRendererTextures = function (): void {
    for (let textureIndex = 0; textureIndex < this.textures.length; textureIndex++) {
      const texture = this.textures[textureIndex]
      if (texture != 0) {
        this.gl!.releaseTextureAtIndex(1, this.textures, textureIndex)
        this.textures[textureIndex] = null
      }
    }
  }

  /**
   * Stores a WebGL texture handle by texture slot.
   * @param textureIndex Texture slot used by draw data.
   * @param texture WebGL texture handle passed by the runtime image loader.
   */
  DrawParam.prototype.setTexture = function (textureIndex: number, texture: unknown): void {
    this.textures[textureIndex] = texture
  }

  /**
   * Compiles/link shaders and caches all attribute/uniform locations used by draw calls.
   */
  DrawParam.prototype.initShader = function (): void {
    const gl = this.gl!
    this.loadShaders2()
    this.attributePositionLocation = gl.getAttribLocation(this.shaderProgram as WebGLProgram, 'a_position')
    this.attributeTexCoordLocation = gl.getAttribLocation(this.shaderProgram as WebGLProgram, 'a_texCoord')
    this.uniformMatrixLocation = gl.getUniformLocation(this.shaderProgram as WebGLProgram, 'u_mvpMatrix')
    this.samplerTexture0Location = gl.getUniformLocation(this.shaderProgram as WebGLProgram, 's_texture0')
    this.uniformChannelFlagLocation = gl.getUniformLocation(this.shaderProgram as WebGLProgram, 'u_channelFlag')
    this.uniformBaseColorLocation = gl.getUniformLocation(this.shaderProgram as WebGLProgram, 'u_baseColor')
    this.uniformMaskFlagLocation = gl.getUniformLocation(this.shaderProgram as WebGLProgram, 'u_maskFlag')
    this.clippedAttributePositionLocation = gl.getAttribLocation(
      this.clippedShaderProgram as WebGLProgram,
      'a_position',
    )
    this.clippedAttributeTexCoordLocation = gl.getAttribLocation(
      this.clippedShaderProgram as WebGLProgram,
      'a_texCoord',
    )
    this.clippedUniformMatrixLocation = gl.getUniformLocation(
      this.clippedShaderProgram as WebGLProgram,
      'u_mvpMatrix',
    )
    this.clippedUniformClipMatrixLocation = gl.getUniformLocation(
      this.clippedShaderProgram as WebGLProgram,
      'u_ClipMatrix',
    )
    this.clippedSamplerTexture0Location = gl.getUniformLocation(
      this.clippedShaderProgram as WebGLProgram,
      's_texture0',
    )
    this.clippedSamplerTexture1Location = gl.getUniformLocation(
      this.clippedShaderProgram as WebGLProgram,
      's_texture1',
    )
    this.clippedUniformChannelFlagLocation = gl.getUniformLocation(
      this.clippedShaderProgram as WebGLProgram,
      'u_channelFlag',
    )
    this.clippedUniformBaseColorLocation = gl.getUniformLocation(
      this.clippedShaderProgram as WebGLProgram,
      'u_baseColor',
    )
  }

  /**
   * Deletes linked shader programs allocated by this draw parameter.
   */
  DrawParam.prototype.disposeShader = function (): void {
    const gl = this.gl!
    if (this.shaderProgram) {
      gl.deleteProgram(this.shaderProgram)
      this.shaderProgram = null
    }
    if (this.clippedShaderProgram) {
      gl.deleteProgram(this.clippedShaderProgram)
      this.clippedShaderProgram = null
    }
  }

  /**
   * Compiles one shader and reports legacy debug messages on failure.
   * @param shaderType WebGL shader type constant.
   * @param shaderSource GLSL source passed through from the legacy min.js bundle.
   * @returns Compiled shader, or null when creation/compilation failed.
   */
  DrawParam.prototype.compileShader = function (
    shaderType: number,
    shaderSource: string,
  ): WebGLShader | null {
    const gl = this.gl!
    const shader = gl.createShader(shaderType)
    if (shader == null) {
      UtDebug.logDebug('Failed to create shader')
      return null
    }
    gl.shaderSource(shader, shaderSource)
    gl.compileShader(shader)
    const didCompile = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (!didCompile) {
      const shaderInfoLog = gl.getShaderInfoLog(shader)
      UtDebug.logDebug('Failed to compile shader: ' + shaderInfoLog)
      gl.deleteShader(shader)
      return null
    }
    return shader
  }

  /**
   * Creates normal and clipped WebGL shader programs from the legacy GLSL sources.
   * @returns True when the normal shader program linked; false on any fatal setup error.
   */
  DrawParam.prototype.loadShaders2 = function (): boolean {
    const gl = this.gl!
    this.shaderProgram = gl.createProgram()
    if (!this.shaderProgram) {
      return false
    }
    this.clippedShaderProgram = gl.createProgram()
    if (!this.clippedShaderProgram) {
      return false
    }
    this.vertShader = this.compileShader(gl.VERTEX_SHADER, CUBISM2_WEBGL_SHADER_SOURCES.meshVertex)
    if (!this.vertShader) {
      UtDebug.logDebug('Vertex shader compilation failed')
      return false
    }
    this.clippedVertexShader = this.compileShader(
      gl.VERTEX_SHADER,
      CUBISM2_WEBGL_SHADER_SOURCES.clippedMeshVertex,
    )
    if (!this.clippedVertexShader) {
      UtDebug.logDebug('Clipped vertex shader compilation failed')
      return false
    }
    this.fragShader = this.compileShader(gl.FRAGMENT_SHADER, CUBISM2_WEBGL_SHADER_SOURCES.meshFragment)
    if (!this.fragShader) {
      UtDebug.logDebug('Fragment shader compilation failed')
      return false
    }
    this.clippedFragmentShader = this.compileShader(
      gl.FRAGMENT_SHADER,
      CUBISM2_WEBGL_SHADER_SOURCES.clippedMeshFragment,
    )
    if (!this.clippedFragmentShader) {
      UtDebug.logDebug('Clipped fragment shader compilation failed')
      return false
    }
    gl.attachShader(this.shaderProgram, this.vertShader)
    gl.attachShader(this.shaderProgram, this.fragShader)
    gl.attachShader(this.clippedShaderProgram, this.clippedVertexShader)
    gl.attachShader(this.clippedShaderProgram, this.clippedFragmentShader)
    gl.linkProgram(this.shaderProgram)
    gl.linkProgram(this.clippedShaderProgram)
    const didLink = gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)
    if (!didLink) {
      const programInfoLog = gl.getProgramInfoLog(this.shaderProgram)
      UtDebug.logDebug('Failed to link shader program: ' + programInfoLog)
      if (this.vertShader) {
        gl.deleteShader(this.vertShader)
        this.vertShader = 0
      }
      if (this.fragShader) {
        gl.deleteShader(this.fragShader)
        this.fragShader = 0
      }
      if (this.shaderProgram) {
        gl.deleteProgram(this.shaderProgram)
        this.shaderProgram = 0
      }
      if (this.clippedVertexShader) {
        gl.deleteShader(this.clippedVertexShader)
        this.clippedVertexShader = 0
      }
      if (this.clippedFragmentShader) {
        gl.deleteShader(this.clippedFragmentShader)
        this.clippedFragmentShader = 0
      }
      if (this.clippedShaderProgram) {
        gl.deleteProgram(this.clippedShaderProgram)
        this.clippedShaderProgram = 0
      }
      return false
    }
    return true
  }

  /**
   * Creates the mask framebuffer resources used by Cubism2 clipping.
   * @returns Framebuffer, renderbuffer, and registry texture handles.
   */
  DrawParam.prototype.createFramebuffer = function (): Cubism2WebGLFramebufferResources {
    const gl = this.gl!
    const bufferSize = Live2D.clippingMaskBufferSize
    const framebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    const renderbuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, bufferSize, bufferSize)
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.RENDERBUFFER,
      renderbuffer,
    )
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      bufferSize,
      bufferSize,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0,
    )
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    Live2D.maskTextures[this.glIndex as number] = texture
    return {
      framebuffer,
      renderbuffer,
      texture: Live2D.maskTextures[this.glIndex as number],
    }
  }

  return DrawParam
}
