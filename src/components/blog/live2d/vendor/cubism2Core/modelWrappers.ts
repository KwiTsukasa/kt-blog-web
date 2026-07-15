import type {
  Cubism2CanvasDrawParamConstructor,
  Cubism2CanvasDrawParamInstance,
  Cubism2CanvasDrawParamRenderer,
} from './canvasDrawParam'
import type { Cubism2ModelBaseConstructor, Cubism2ModelBaseInstance } from './modelBase'
import type {
  Cubism2WebGLContext,
  Cubism2WebGLDrawParamConstructor,
  Cubism2WebGLDrawParamInstance,
} from './webglDrawParam'

export interface Cubism2ModelWrapperDebugLogger {
  logWithLegacyPrefix: (message: string, ...args: unknown[]) => void
}

export interface Cubism2ModelWrapperLive2DProfile {
  getGL: (glIndex?: number) => Cubism2WebGLContext
  setGL: (gl: Cubism2WebGLContext) => void
}

export interface Cubism2ModelWrapperContextLike {
  draw: (drawParam: unknown) => void
  preDraw: (drawParam: unknown) => void
  update: () => void
}

export interface Cubism2ModelJSInstance extends Cubism2ModelBaseInstance {
  drawParamCanvas: Cubism2CanvasDrawParamInstance
  modelContext: Cubism2ModelBaseInstance['modelContext'] & Cubism2ModelWrapperContextLike
  setGL: (renderer: Cubism2CanvasDrawParamRenderer) => void
  setTexture: (textureIndex: number, texture: unknown) => void
  setTransform: (transform: unknown) => void
}

export interface Cubism2ModelWebGLInstance extends Cubism2ModelBaseInstance {
  drawParamWebGL: Cubism2WebGLDrawParamInstance
  getAnisotropy: () => number
  isPremultipliedAlpha: () => boolean
  modelContext: Cubism2ModelBaseInstance['modelContext'] & Cubism2ModelWrapperContextLike
  setAnisotropy: (anisotropy: number) => void
  setGL: (gl: Cubism2WebGLContext) => void
  setMatrix: (matrix: unknown) => void
  setPremultipliedAlpha: (enabled: boolean) => void
  setTexture: (textureIndex: number, texture: unknown) => void
  setTransform: (transform: unknown) => void
}

export interface Cubism2ModelJSConstructor {
  createEmptyModel: () => Cubism2ModelJSInstance
  loadModel: (sourceBuffer: ArrayBuffer | DataView) => Cubism2ModelJSInstance
  new (): Cubism2ModelJSInstance
  prototype: Cubism2ModelJSInstance
}

export interface Cubism2ModelWebGLConstructor {
  createEmptyModel: () => Cubism2ModelWebGLInstance
  loadModel: (
    sourceBuffer: ArrayBuffer | DataView,
    glContextIndex?: number,
  ) => Cubism2ModelWebGLInstance
  new (glContextIndex?: number): Cubism2ModelWebGLInstance
  prototype: Cubism2ModelWebGLInstance
}

export interface Cubism2ModelWrappers {
  Live2DModelJS: Cubism2ModelJSConstructor
  Live2DModelWebGL: Cubism2ModelWebGLConstructor
}

export interface CreateCubism2ModelWrappersOptions {
  CanvasDrawParam: Cubism2CanvasDrawParamConstructor
  Live2D: Cubism2ModelWrapperLive2DProfile
  Live2DModelBase: Cubism2ModelBaseConstructor
  UtDebug: Cubism2ModelWrapperDebugLogger
  WebGLDrawParam: Cubism2WebGLDrawParamConstructor
  isBootstrapping: () => boolean
}

/**
 * Creates the Cubism2 public JS and WebGL model wrappers formerly bundled in `live2d.min.js`.
 * @param options Draw-param constructors, base model constructor, Live2D global profile, debug hooks, and bootstrap state.
 * @returns JS and WebGL wrapper constructors with owner-local semantic methods.
 */
export function createCubism2ModelWrappers(
  options: CreateCubism2ModelWrappersOptions,
): Cubism2ModelWrappers {
  const { CanvasDrawParam, Live2D, Live2DModelBase, UtDebug, WebGLDrawParam, isBootstrapping } =
    options

  /**
   * Invokes the shared base-model constructor while keeping the prototype bootstrap guard intact.
   * @param instance JS or WebGL wrapper instance being initialized.
   * @returns Nothing; base model state is written onto the wrapper instance.
   */
  function callBaseModelConstructor(instance: Cubism2ModelBaseInstance): void {
    ;(
      Live2DModelBase.prototype as Cubism2ModelBaseInstance & {
        constructor: { call: (target: Cubism2ModelBaseInstance) => void }
      }
    ).constructor.call(instance)
  }

  /**
   * Creates a Canvas/JS-backed Cubism2 model wrapper.
   * @returns Nothing; the wrapper owns one Canvas draw parameter.
   */
  const Live2DModelJS = function Live2DModelJS(this: Cubism2ModelJSInstance): void {
    if (isBootstrapping()) {
      return
    }
    callBaseModelConstructor(this)
    this.drawParamCanvas = new CanvasDrawParam()
  } as unknown as Cubism2ModelJSConstructor

  Live2DModelJS.prototype = new Live2DModelBase() as Cubism2ModelJSInstance

  /**
   * Loads one MOC payload into a Canvas/JS-backed model wrapper.
   * @param sourceBuffer Cubism2 MOC payload supplied by the caller.
   * @returns Loaded JS wrapper instance.
   */
  Live2DModelJS.loadModel = function loadCanvasModelFromMocPayload(
    sourceBuffer: ArrayBuffer | DataView,
  ): Cubism2ModelJSInstance {
    const model = new Live2DModelJS()
    Live2DModelBase.loadMocDataIntoModel(model, sourceBuffer)
    return model
  }

  /**
   * Creates an unloaded Canvas/JS-backed model wrapper.
   * @returns New JS wrapper instance without loading a MOC payload.
   */
  Live2DModelJS.createEmptyModel =
    function createEmptyCanvasModelWrapper(): Cubism2ModelJSInstance {
      return new Live2DModelJS()
    }

  /**
   * Assigns the Canvas renderer used by this model's draw parameter.
   * @param this Canvas/JS wrapper instance that owns the Canvas draw parameter.
   * @param renderer Renderer adapter that receives Canvas draw calls.
   * @returns Nothing; the Canvas draw parameter stores the renderer.
   */
  Live2DModelJS.prototype.setGL = function setCanvasDrawParamRenderer(
    this: Cubism2ModelJSInstance,
    renderer: Cubism2CanvasDrawParamRenderer,
  ): void {
    this.drawParamCanvas.setGL(renderer)
  }

  /**
   * Assigns the Canvas transform forwarded to drawElements.
   * @param this Canvas/JS wrapper instance that owns the Canvas draw parameter.
   * @param transform Transform object consumed by the Canvas draw parameter.
   * @returns Nothing; the draw parameter stores the transform.
   */
  Live2DModelJS.prototype.setTransform = function setCanvasDrawParamTransform(
    this: Cubism2ModelJSInstance,
    transform: unknown,
  ): void {
    this.drawParamCanvas.setTransform(transform)
  }

  /**
   * Draws the current model through the Canvas draw parameter.
   * @param this Canvas/JS wrapper instance that joins the model context with its Canvas draw parameter.
   * @returns Nothing; model context writes draw commands to the draw parameter.
   */
  Live2DModelJS.prototype.draw = function drawCanvasModelContext(
    this: Cubism2ModelJSInstance,
  ): void {
    this.modelContext.draw(this.drawParamCanvas)
  }

  /**
   * Releases queued Canvas texture resources through the owned draw parameter.
   * @param this Canvas/JS wrapper instance that owns the Canvas draw parameter.
   * @returns Nothing; delegated draw-param cleanup result is ignored just like the legacy bundle.
   */
  Live2DModelJS.prototype.releaseRendererTextures = function releaseCanvasRendererTextures(
    this: Cubism2ModelJSInstance,
  ): void {
    this.drawParamCanvas.releaseRendererTextures()
  }

  /**
   * Assigns one Canvas texture handle to the requested texture slot.
   * @param this Canvas/JS wrapper instance that owns the draw parameter.
   * @param textureIndex Texture slot index used by the MOC draw data.
   * @param texture Canvas texture or image handle.
   * @returns Nothing; the Canvas draw parameter stores the texture.
   */
  Live2DModelJS.prototype.setTexture = function setCanvasTextureSlot(
    this: Cubism2ModelJSInstance,
    textureIndex: number,
    texture: unknown,
  ): void {
    if (this.drawParamCanvas == null) {
      UtDebug.logWithLegacyPrefix('Canvas draw parameter is unavailable while assigning a texture')
    }
    this.drawParamCanvas.setTexture(textureIndex, texture)
  }

  /**
   * Reads Canvas texture capacity from the owned draw parameter.
   * @param this Canvas/JS wrapper instance that owns the Canvas draw parameter.
   * @returns Canvas draw parameter sentinel value.
   */
  Live2DModelJS.prototype.getTextureCount = function getCanvasTextureCount(
    this: Cubism2ModelJSInstance,
  ): number {
    return this.drawParamCanvas.getTextureCount()
  }

  /**
   * Delegates renderer setup payload to the Canvas draw parameter.
   * @param this Canvas/JS wrapper instance that owns the Canvas draw parameter.
   * @param drawParam Draw parameter payload passed by legacy callers.
   * @returns Nothing; this method follows the legacy no-return wrapper.
   */
  Live2DModelJS.prototype.setDrawParam = function setCanvasDrawParamPayload(
    this: Cubism2ModelJSInstance,
    drawParam: unknown,
  ): void {
    this.drawParamCanvas.setDrawParam(drawParam)
  }

  /**
   * Reads the Canvas draw parameter owned by this wrapper.
   * @param this Canvas/JS wrapper instance forwarding min.js `v.prototype.getDrawParam`.
   * @returns Canvas draw parameter instance used by model context drawing.
   */
  Live2DModelJS.prototype.getDrawParam = function getCanvasDrawParam(
    this: Cubism2ModelJSInstance,
  ): Cubism2CanvasDrawParamInstance {
    return this.drawParamCanvas
  }

  /**
   * Creates a WebGL-backed Cubism2 model wrapper.
   * @param glContextIndex Index into the legacy Live2D GL context registry.
   * @returns Nothing; the wrapper owns one WebGL draw parameter.
   */
  const Live2DModelWebGL = function Live2DModelWebGL(
    this: Cubism2ModelWebGLInstance,
    glContextIndex?: number,
  ): void {
    if (isBootstrapping()) {
      return
    }
    callBaseModelConstructor(this)
    this.drawParamWebGL = new WebGLDrawParam(glContextIndex)
    this.drawParamWebGL.setGL(Live2D.getGL(glContextIndex))
  } as unknown as Cubism2ModelWebGLConstructor

  Live2DModelWebGL.prototype = new Live2DModelBase() as Cubism2ModelWebGLInstance

  /**
   * Loads one MOC payload into a WebGL-backed model wrapper using the requested GL context.
   * @param sourceBuffer Cubism2 MOC payload supplied by the caller.
   * @param glContextIndex Optional legacy GL registry slot; falsey values resolve to slot zero.
   * @returns Loaded WebGL wrapper instance.
   */
  Live2DModelWebGL.loadModel = function loadWebGLModelFromMocPayloadWithContextIndex(
    sourceBuffer: ArrayBuffer | DataView,
    glContextIndex?: number,
  ): Cubism2ModelWebGLInstance {
    const resolvedGlContextIndex = glContextIndex || 0
    const model = new Live2DModelWebGL(resolvedGlContextIndex)
    Live2DModelBase.loadMocDataIntoModel(model, sourceBuffer)
    return model
  }

  /**
   * Creates an unloaded WebGL-backed model wrapper.
   * @returns New WebGL wrapper instance without loading a MOC payload.
   */
  Live2DModelWebGL.createEmptyModel =
    function createEmptyWebGLModelWrapper(): Cubism2ModelWebGLInstance {
      return new Live2DModelWebGL()
    }

  /**
   * Updates the legacy Live2D GL context registry.
   * @param gl WebGL context assigned to the default legacy registry slot.
   * @returns Nothing; this preserves the original wrapper behavior.
   */
  Live2DModelWebGL.prototype.setGL = function setLive2DGlobalWebGLContext(
    gl: Cubism2WebGLContext,
  ): void {
    Live2D.setGL(gl)
  }

  /**
   * Assigns the WebGL transform matrix wrapper.
   * @param this WebGL wrapper instance that owns the WebGL draw parameter.
   * @param transform Transform consumed by the WebGL draw parameter.
   * @returns Nothing; the draw parameter stores the transform.
   */
  Live2DModelWebGL.prototype.setTransform = function setWebGLDrawParamTransform(
    this: Cubism2ModelWebGLInstance,
    transform: unknown,
  ): void {
    this.drawParamWebGL.setTransform(transform)
  }

  /**
   * Updates model parameters and prepares WebGL draw state.
   * @param this WebGL wrapper instance that owns the model context and WebGL draw parameter.
   * @returns Nothing; model context mutates runtime draw contexts.
   */
  Live2DModelWebGL.prototype.update = function updateWebGLModelContextAndPrepareDraw(
    this: Cubism2ModelWebGLInstance,
  ): void {
    this.modelContext.update()
    this.modelContext.preDraw(this.drawParamWebGL)
  }

  /**
   * Draws the current model through the WebGL draw parameter.
   * @param this WebGL wrapper instance that joins the model context with its WebGL draw parameter.
   * @returns Nothing; model context writes WebGL draw calls.
   */
  Live2DModelWebGL.prototype.draw = function drawWebGLModelContext(
    this: Cubism2ModelWebGLInstance,
  ): void {
    this.modelContext.draw(this.drawParamWebGL)
  }

  /**
   * Releases queued WebGL texture resources through the owned draw parameter.
   * @param this WebGL wrapper instance that owns the WebGL draw parameter.
   * @returns Nothing; delegated draw-param cleanup result is ignored just like the legacy bundle.
   */
  Live2DModelWebGL.prototype.releaseRendererTextures = function releaseWebGLRendererTextures(
    this: Cubism2ModelWebGLInstance,
  ): void {
    this.drawParamWebGL.releaseRendererTextures()
  }

  /**
   * Assigns one WebGL texture handle to the requested texture slot.
   * @param this WebGL wrapper instance that owns the draw parameter.
   * @param textureIndex Texture slot index used by the MOC draw data.
   * @param texture WebGL texture handle.
   * @returns Nothing; the WebGL draw parameter stores the texture.
   */
  Live2DModelWebGL.prototype.setTexture = function setWebGLTextureSlot(
    this: Cubism2ModelWebGLInstance,
    textureIndex: number,
    texture: unknown,
  ): void {
    if (this.drawParamWebGL == null) {
      UtDebug.logWithLegacyPrefix('WebGL draw parameter is unavailable while assigning a texture')
    }
    this.drawParamWebGL.setTexture(textureIndex, texture)
  }

  /**
   * Reads WebGL texture capacity from the owned draw parameter.
   * @param this WebGL wrapper instance that owns the WebGL draw parameter.
   * @returns WebGL draw parameter sentinel value.
   */
  Live2DModelWebGL.prototype.getTextureCount = function getWebGLTextureCount(
    this: Cubism2ModelWebGLInstance,
  ): number {
    return this.drawParamWebGL.getTextureCount()
  }

  /**
   * Delegates renderer setup payload to the WebGL draw parameter.
   * @param this WebGL wrapper instance that owns the WebGL draw parameter.
   * @param drawParam Draw parameter payload passed by legacy callers.
   * @returns Nothing; this method follows the legacy no-return wrapper.
   */
  Live2DModelWebGL.prototype.setDrawParam = function setWebGLDrawParamPayload(
    this: Cubism2ModelWebGLInstance,
    drawParam: unknown,
  ): void {
    this.drawParamWebGL.setDrawParam(drawParam)
  }

  /**
   * Reads the WebGL draw parameter owned by this wrapper.
   * @param this WebGL wrapper instance forwarding min.js `l.prototype.getDrawParam`.
   * @returns WebGL draw parameter instance used by model context drawing.
   */
  Live2DModelWebGL.prototype.getDrawParam = function getWebGLDrawParam(
    this: Cubism2ModelWebGLInstance,
  ): Cubism2WebGLDrawParamInstance {
    return this.drawParamWebGL
  }

  /**
   * Assigns the WebGL model matrix.
   * @param this WebGL wrapper instance forwarding min.js `l.prototype.setMatrix`.
   * @param matrix Matrix payload forwarded to the WebGL draw parameter.
   * @returns Nothing; the draw parameter stores the matrix.
   */
  Live2DModelWebGL.prototype.setMatrix = function setWebGLModelMatrix(
    this: Cubism2ModelWebGLInstance,
    matrix: unknown,
  ): void {
    this.drawParamWebGL.setMatrix(matrix)
  }

  /**
   * Sets whether incoming texture color is premultiplied by alpha.
   * @param this WebGL wrapper instance forwarding min.js `l.prototype.setPremultipliedAlpha`.
   * @param enabled Whether premultiplied alpha mode should be enabled.
   * @returns Nothing; the draw parameter stores the flag.
   */
  Live2DModelWebGL.prototype.setPremultipliedAlpha = function setWebGLPremultipliedAlphaMode(
    this: Cubism2ModelWebGLInstance,
    enabled: boolean,
  ): void {
    this.drawParamWebGL.setPremultipliedAlpha(enabled)
  }

  /**
   * Reads the WebGL premultiplied-alpha mode.
   * @param this WebGL wrapper instance forwarding min.js `l.prototype.isPremultipliedAlpha`.
   * @returns True when the draw parameter is in premultiplied alpha mode.
   */
  Live2DModelWebGL.prototype.isPremultipliedAlpha = function isWebGLPremultipliedAlphaEnabled(
    this: Cubism2ModelWebGLInstance,
  ): boolean {
    return this.drawParamWebGL.isPremultipliedAlpha()
  }

  /**
   * Sets the texture anisotropy level used by WebGL texture filtering.
   * @param this WebGL wrapper instance forwarding min.js `l.prototype.setAnisotropy`.
   * @param anisotropy Anisotropy value forwarded to the draw parameter.
   * @returns Nothing; the draw parameter stores the value.
   */
  Live2DModelWebGL.prototype.setAnisotropy = function setWebGLTextureAnisotropy(
    this: Cubism2ModelWebGLInstance,
    anisotropy: number,
  ): void {
    this.drawParamWebGL.setAnisotropy(anisotropy)
  }

  /**
   * Reads the texture anisotropy level from the WebGL draw parameter.
   * @param this WebGL wrapper instance forwarding min.js `l.prototype.getAnisotropy`.
   * @returns Current anisotropy value.
   */
  Live2DModelWebGL.prototype.getAnisotropy = function getWebGLTextureAnisotropy(
    this: Cubism2ModelWebGLInstance,
  ): number {
    return this.drawParamWebGL.getAnisotropy()
  }

  return {
    Live2DModelJS,
    Live2DModelWebGL,
  }
}
