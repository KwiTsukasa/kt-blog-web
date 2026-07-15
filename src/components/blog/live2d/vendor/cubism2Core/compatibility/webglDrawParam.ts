import { enableCubism2WebGLAttributePointer } from './webglAttributes'
import {
  uploadCubism2WebGLArrayBuffer,
  uploadCubism2WebGLElementArrayBuffer,
} from './webglBuffers'
import { applyCubism2WebGLDrawTail } from './webglDrawTail'
import { createCubism2WebGLMaskFramebuffer } from './webglFramebuffer'
import { cacheCubism2WebGLShaderLocations } from './webglShaderLocations'
import { CUBISM2_WEBGL_SHADER_SOURCES } from './webglShaderSources'
import {
  bindCubism2WebGLGeneratedMaskTexture,
  bindCubism2WebGLSourceTexture,
} from './webglTextureBindings'
import { releaseCubism2WebGLTextures } from './webglTextureRelease'
import {
  applyCubism2WebGLClippedUniforms,
  applyCubism2WebGLMaskUniforms,
  applyCubism2WebGLUnclippedUniforms,
} from './webglUniforms'
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
  EXPAND_W: number
  clippingMaskBufferSize: number
  fTexture: unknown[]
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
  a_position_Loc: number
  a_position_Loc_Off: number
  a_texCoord_Loc: number
  a_texCoord_Loc_Off: number
  anisotropy: number
  anisotropyExt: Cubism2AnisotropyExtension | null
  baseAlpha: number
  baseBlue: number
  baseGreen: number
  baseRed: number
  culling: boolean
  clipBufPre_clipContextDraw: Cubism2ClipContext | null
  clipBufPre_clipContextMask: Cubism2ClipContext | null
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
  fragShaderOff: WebGLShader | 0 | null
  getChannelFlagAsColor: (channelIndex: number) => Cubism2ChannelColor
  getClipBufPre_clipContextDraw: () => Cubism2ClipContext | null
  getClipBufPre_clipContextMask: () => Cubism2ClipContext | null
  getGL: () => Cubism2WebGLContext | null
  getAnisotropy: () => number
  getTextureCount: () => never
  gl: Cubism2WebGLContext | null
  glno: number
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
  shaderProgramOff: WebGLProgram | 0 | null
  s_texture0_Loc: WebGLUniformLocation | null
  s_texture0_Loc_Off: WebGLUniformLocation | null
  s_texture1_Loc_Off: WebGLUniformLocation | null
  textureCoordBuffer: WebGLBuffer | null
  textures: unknown[]
  transform: unknown | null
  u_baseColor_Loc: WebGLUniformLocation | null
  u_baseColor_Loc_Off: WebGLUniformLocation | null
  u_channelFlag: WebGLUniformLocation | null
  u_channelFlag_Loc_Off: WebGLUniformLocation | null
  u_clipMatrix_Loc_Off: WebGLUniformLocation | null
  u_maskFlag_Loc: WebGLUniformLocation | null
  u_matrix_Loc: WebGLUniformLocation | null
  u_matrix_Loc_Off: WebGLUniformLocation | null
  vertexPositionBuffer: WebGLBuffer | null
  vertShader: WebGLShader | 0 | null
  vertShaderOff: WebGLShader | 0 | null
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
 * @param options Runtime dependencies supplied by the Cubism2 compatibility capsule.
 * @returns WebGL draw-parameter constructor with the original shader and framebuffer surface.
 */
export function createCubism2WebGLDrawParam(
  options: CreateCubism2WebGLDrawParamOptions,
): Cubism2WebGLDrawParamConstructor {
  const { Cubism2DrawParamBase, Live2D, UtDebug, blendModes } = options

  /**
   * Stores WebGL draw resources and clipping shader state for one model instance.
   * @param glIndex Index into the legacy `Live2D.fTexture` framebuffer texture registry.
   */
  function WebGLDrawParam(this: Cubism2WebGLDrawParamInstance, glIndex = 0): void {
    if (options.isBootstrapping()) {
      return
    }
    Cubism2DrawParamBase.prototype.constructor.call(this)
    this.textures = new Array()
    this.transform = null
    this.gl = null
    this.glno = glIndex
    this.firstDraw = true
    this.anisotropyExt = null
    this.maxAnisotropy = 0
    this.textureCoordBuffer = null
    this.vertexPositionBuffer = null
    this.indexElementBuffer = null
    this.vertShader = null
    this.fragShader = null
    this.vertShaderOff = null
    this.fragShaderOff = null
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
    gl.colorMask(true, true, true, true)
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
    if (opacity < 0.01 && this.clipBufPre_clipContextMask == null) {
      return
    }
    const expandedStrokeWidth = opacity > 0.9 ? Live2D.EXPAND_W : 0
    const gl = this.gl
    if (gl == null) {
      throw new Error('gl is null')
    }
    let usesDrawClip = false
    const redMultiplier = 1
    const greenMultiplier = 1
    const blueMultiplier = 1
    const baseRed = this.baseRed * redMultiplier * opacity
    const baseGreen = this.baseGreen * greenMultiplier * opacity
    const baseBlue = this.baseBlue * blueMultiplier * opacity
    const baseAlpha = this.baseAlpha * opacity
    if (this.clipBufPre_clipContextMask != null) {
      drawMaskPrimitive(this, gl, textureIndex, indexArray, vertexArray, uvArray)
    } else {
      usesDrawClip = this.getClipBufPre_clipContextDraw() != null
      if (usesDrawClip) {
        drawClippedPrimitive(
          this,
          gl,
          textureIndex,
          indexArray,
          vertexArray,
          uvArray,
          baseRed,
          baseGreen,
          baseBlue,
          baseAlpha,
        )
      } else {
        drawUnclippedPrimitive(
          this,
          gl,
          textureIndex,
          indexArray,
          vertexArray,
          uvArray,
          baseRed,
          baseGreen,
          baseBlue,
          baseAlpha,
        )
      }
    }
    applyCubism2WebGLDrawTail(gl, this, blendMode, blendModes, indexArray.length)
    void triangleIndexCount
    void expandedStrokeWidth
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
    releaseCubism2WebGLTextures(this.gl!, this.textures)
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
    cacheCubism2WebGLShaderLocations(this, gl)
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
    if (this.shaderProgramOff) {
      gl.deleteProgram(this.shaderProgramOff)
      this.shaderProgramOff = null
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
    this.shaderProgramOff = gl.createProgram()
    if (!this.shaderProgramOff) {
      return false
    }
    this.vertShader = this.compileShader(gl.VERTEX_SHADER, CUBISM2_WEBGL_SHADER_SOURCES.meshVertex)
    if (!this.vertShader) {
      UtDebug.logDebug('Vertex shader compilation failed')
      return false
    }
    this.vertShaderOff = this.compileShader(
      gl.VERTEX_SHADER,
      CUBISM2_WEBGL_SHADER_SOURCES.clippedMeshVertex,
    )
    if (!this.vertShaderOff) {
      UtDebug.logDebug('Clipped vertex shader compilation failed')
      return false
    }
    this.fragShader = this.compileShader(gl.FRAGMENT_SHADER, CUBISM2_WEBGL_SHADER_SOURCES.meshFragment)
    if (!this.fragShader) {
      UtDebug.logDebug('Fragment shader compilation failed')
      return false
    }
    this.fragShaderOff = this.compileShader(
      gl.FRAGMENT_SHADER,
      CUBISM2_WEBGL_SHADER_SOURCES.clippedMeshFragment,
    )
    if (!this.fragShaderOff) {
      UtDebug.logDebug('Clipped fragment shader compilation failed')
      return false
    }
    gl.attachShader(this.shaderProgram, this.vertShader)
    gl.attachShader(this.shaderProgram, this.fragShader)
    gl.attachShader(this.shaderProgramOff, this.vertShaderOff)
    gl.attachShader(this.shaderProgramOff, this.fragShaderOff)
    gl.linkProgram(this.shaderProgram)
    gl.linkProgram(this.shaderProgramOff)
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
      if (this.vertShaderOff) {
        gl.deleteShader(this.vertShaderOff)
        this.vertShaderOff = 0
      }
      if (this.fragShaderOff) {
        gl.deleteShader(this.fragShaderOff)
        this.fragShaderOff = 0
      }
      if (this.shaderProgramOff) {
        gl.deleteProgram(this.shaderProgramOff)
        this.shaderProgramOff = 0
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
    return createCubism2WebGLMaskFramebuffer(this.gl!, Live2D, this.glno)
  }

  /**
   * Binds geometry, texture, mask matrix, and channel uniforms for the mask-generation pass.
   * @param drawParam WebGL draw parameter carrying current clipping mask state.
   * @param gl WebGL context receiving state changes.
   * @param textureIndex Texture slot selected by draw data.
   * @param indexArray Triangle indexes uploaded into the element array buffer.
   * @param vertexArray Vertex positions uploaded into the array buffer.
   * @param uvArray UV coordinates uploaded into the array buffer.
   */
  function drawMaskPrimitive(
    drawParam: Cubism2WebGLDrawParamInstance,
    gl: Cubism2WebGLContext,
    textureIndex: number,
    indexArray: ArrayLike<number>,
    vertexArray: ArrayLike<number>,
    uvArray: ArrayLike<number>,
  ): void {
    gl.frontFace(gl.CCW)
    gl.useProgram(drawParam.shaderProgram as WebGLProgram)
    drawParam.vertexPositionBuffer = uploadCubism2WebGLArrayBuffer(
      gl,
      drawParam.vertexPositionBuffer,
      vertexArray,
    )
    drawParam.indexElementBuffer = uploadCubism2WebGLElementArrayBuffer(
      gl,
      drawParam.indexElementBuffer,
      indexArray,
    )
    enableCubism2WebGLAttributePointer(gl, drawParam.a_position_Loc)
    drawParam.textureCoordBuffer = uploadCubism2WebGLArrayBuffer(
      gl,
      drawParam.textureCoordBuffer,
      uvArray,
    )
    bindCubism2WebGLSourceTexture(gl, drawParam.textures, textureIndex, drawParam.s_texture0_Loc)
    enableCubism2WebGLAttributePointer(gl, drawParam.a_texCoord_Loc)
    applyCubism2WebGLMaskUniforms(gl, drawParam)
  }

  /**
   * Binds geometry, source texture, generated mask texture, and clip uniforms for clipped drawing.
   * @param drawParam WebGL draw parameter carrying current draw clipping state.
   * @param gl WebGL context receiving state changes.
   * @param textureIndex Texture slot selected by draw data.
   * @param indexArray Triangle indexes uploaded into the element array buffer.
   * @param vertexArray Vertex positions uploaded into the array buffer.
   * @param uvArray UV coordinates uploaded into the array buffer.
   * @param baseRed Final red multiplier.
   * @param baseGreen Final green multiplier.
   * @param baseBlue Final blue multiplier.
   * @param baseAlpha Final alpha multiplier.
   */
  function drawClippedPrimitive(
    drawParam: Cubism2WebGLDrawParamInstance,
    gl: Cubism2WebGLContext,
    textureIndex: number,
    indexArray: ArrayLike<number>,
    vertexArray: ArrayLike<number>,
    uvArray: ArrayLike<number>,
    baseRed: number,
    baseGreen: number,
    baseBlue: number,
    baseAlpha: number,
  ): void {
    gl.useProgram(drawParam.shaderProgramOff as WebGLProgram)
    drawParam.vertexPositionBuffer = uploadCubism2WebGLArrayBuffer(
      gl,
      drawParam.vertexPositionBuffer,
      vertexArray,
    )
    drawParam.indexElementBuffer = uploadCubism2WebGLElementArrayBuffer(
      gl,
      drawParam.indexElementBuffer,
      indexArray,
    )
    enableCubism2WebGLAttributePointer(gl, drawParam.a_position_Loc_Off)
    drawParam.textureCoordBuffer = uploadCubism2WebGLArrayBuffer(
      gl,
      drawParam.textureCoordBuffer,
      uvArray,
    )
    bindCubism2WebGLSourceTexture(gl, drawParam.textures, textureIndex, drawParam.s_texture0_Loc_Off)
    enableCubism2WebGLAttributePointer(gl, drawParam.a_texCoord_Loc_Off)

    /**
     * Binds the generated clipping mask sampler at the exact min.js point between clipped matrices and color uniforms.
     */
    function bindGeneratedMaskTexture(): void {
      bindCubism2WebGLGeneratedMaskTexture(gl, Live2D, drawParam.glno, drawParam.s_texture1_Loc_Off)
    }

    applyCubism2WebGLClippedUniforms(
      gl,
      drawParam,
      baseRed,
      baseGreen,
      baseBlue,
      baseAlpha,
      bindGeneratedMaskTexture,
    )
  }

  /**
   * Binds geometry, texture, model matrix, and base color uniforms for normal drawing.
   * @param drawParam WebGL draw parameter carrying current shader state.
   * @param gl WebGL context receiving state changes.
   * @param textureIndex Texture slot selected by draw data.
   * @param indexArray Triangle indexes uploaded into the element array buffer.
   * @param vertexArray Vertex positions uploaded into the array buffer.
   * @param uvArray UV coordinates uploaded into the array buffer.
   * @param baseRed Final red multiplier.
   * @param baseGreen Final green multiplier.
   * @param baseBlue Final blue multiplier.
   * @param baseAlpha Final alpha multiplier.
   */
  function drawUnclippedPrimitive(
    drawParam: Cubism2WebGLDrawParamInstance,
    gl: Cubism2WebGLContext,
    textureIndex: number,
    indexArray: ArrayLike<number>,
    vertexArray: ArrayLike<number>,
    uvArray: ArrayLike<number>,
    baseRed: number,
    baseGreen: number,
    baseBlue: number,
    baseAlpha: number,
  ): void {
    gl.useProgram(drawParam.shaderProgram as WebGLProgram)
    drawParam.vertexPositionBuffer = uploadCubism2WebGLArrayBuffer(
      gl,
      drawParam.vertexPositionBuffer,
      vertexArray,
    )
    drawParam.indexElementBuffer = uploadCubism2WebGLElementArrayBuffer(
      gl,
      drawParam.indexElementBuffer,
      indexArray,
    )
    enableCubism2WebGLAttributePointer(gl, drawParam.a_position_Loc)
    drawParam.textureCoordBuffer = uploadCubism2WebGLArrayBuffer(
      gl,
      drawParam.textureCoordBuffer,
      uvArray,
    )
    bindCubism2WebGLSourceTexture(gl, drawParam.textures, textureIndex, drawParam.s_texture0_Loc)
    enableCubism2WebGLAttributePointer(gl, drawParam.a_texCoord_Loc)
    applyCubism2WebGLUnclippedUniforms(gl, drawParam, baseRed, baseGreen, baseBlue, baseAlpha)
  }

  return DrawParam
}
