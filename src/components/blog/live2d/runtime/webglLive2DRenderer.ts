import { createCubism2ModelAnimator, type Cubism2ModelAnimator } from './cubism2ModelAnimator'
import { configureCubism2ModelProjection } from './cubism2ModelProjection'
import { toCubism2ModelPoint, toCubism2PageTarget } from './cubism2PointerCoordinates'
import type {
  Live2DCoreModel,
  Live2DRendererAdapter,
  Live2DResolvedState,
} from './live2dRuntimeTypes'
import {
  Live2D,
  Live2DModelWebGL,
  Live2DMotion,
  MotionQueueManager,
} from '../vendor/cubism2Core/runtimeCore'
import { installCubism2WebGLTextureReleaseHook } from '../vendor/cubism2Core/webglTextureRelease'

/**
 * 创建负责加载 Cubism2 模型与纹理、驱动动画帧、处理指针交互并释放 WebGL 资源的渲染器。
 * @param canvas - 提供 Live2D 投影宽高的画布。
 * @returns 新建的负责加载 Cubism2 模型与纹理、驱动动画帧、处理指针交互并释放 WebGL 资源的渲染器，包含 `destroy`、`mount`、`switchModel`、`switchTexture` 等字段。
 */
export function createWebGLLive2DRenderer(canvas: HTMLCanvasElement): Live2DRendererAdapter {
  let gl: WebGLRenderingContext | null = null
  let model: Live2DCoreModel | null = null
  let animator: Cubism2ModelAnimator | null = null
  let activeTexture: WebGLTexture | null = null
  let frame = 0
  let touchDragging = false

  /*
   * Loads and displays one model state.
   * @param state Resolved model and texture state.
   */
  const applyState = async (state: Live2DResolvedState): Promise<void> => {
    const context = await resolveContext()
    const modelBuffer = await fetchArrayBuffer(
      resolveAssetUrl(state.settings.baseUrl, state.settings.model),
    )
    const nextModel = Live2DModelWebGL.loadModel(modelBuffer)
    configureCubism2ModelProjection(nextModel, canvas, state.settings.layout)
    nextModel.saveParam()
    const nextAnimator = createCubism2ModelAnimator({
      Live2DMotion,
      MotionQueueManager,
      loadMotionBytes: fetchArrayBuffer,
      settings: state.settings,
    })
    let nextTexture: WebGLTexture
    try {
      nextTexture = await loadTexture(
        context,
        nextModel,
        resolveAssetUrl(
          state.settings.baseUrl,
          state.settings.textures[state.textureIndex] || state.settings.textures[0] || '',
        ),
      )
    } catch (error: unknown) {
      nextAnimator.stop()
      throw error
    }
    releaseActiveTexture()
    animator?.stop()
    model = nextModel
    animator = nextAnimator
    activeTexture = nextTexture
    void nextAnimator.preloadMotionGroup('idle').catch((error: unknown) => {
      console.warn('[KT Blog] Live2D idle motion preload failed.', error)
    })
    startLoop()
  }

  /*
   * Resolves and initializes the WebGL context.
   * @returns WebGL context for the Live2D core.
   */
  const resolveContext = async (): Promise<WebGLRenderingContext> => {
    if (gl) {
      return gl
    }
    const context =
      canvas.getContext('webgl', { premultipliedAlpha: true }) ||
      canvas.getContext('experimental-webgl', { premultipliedAlpha: true })
    if (!(context instanceof WebGLRenderingContext)) {
      throw new Error('Live2D WebGL context is not available.')
    }
    installCubism2WebGLTextureReleaseHook(context)
    Live2D.setGL(context)
    context.clearColor(0, 0, 0, 0)
    gl = context
    return context
  }

  /*
   * Starts the draw loop once.
   */
  const startLoop = () => {
    if (frame) {
      return
    }
    /* Draws one source-ordered Cubism2 animation frame. */
    const tick = () => {
      frame = window.requestAnimationFrame(tick)
      if (!gl || !model || !animator) {
        return
      }
      gl.clear(gl.COLOR_BUFFER_BIT)
      animator.update(model)
      model.draw()
    }
    frame = window.requestAnimationFrame(tick)
  }

  /*
   * Updates the smoothed look-at target from a page-level pointer.
   * @param event Mouse or touch coordinates in the browser client space.
   */
  const updatePagePointerTarget = (event: Pick<MouseEvent, 'clientX' | 'clientY'>) => {
    const point = toCubism2PageTarget(canvas, window, event)
    animator?.setPointerTarget(point.x, point.y)
  }

  /* Restores the source look-front behavior after the pointer leaves or is released. */
  const handlePointerRelease = () => {
    animator?.setPointerTarget(0, 0)
  }

  /*
   * Handles the source left-button press behavior.
   * @param event Canvas mouse-down event.
   */
  const handleMouseDown = (event: MouseEvent) => {
    if (event.button !== 0) {
      return
    }
    event.preventDefault()
    const point = toCubism2ModelPoint(canvas, event)
    void animator?.startMotionForPoint(point.x, point.y).catch((error: unknown) => {
      console.warn('[KT Blog] Live2D interaction motion failed.', error)
    })
  }

  /*
   * Preserves the WordPress widget's page-wide gaze tracking.
   * @param event Page-level mouse-move event.
   */
  const handleMouseMove = (event: MouseEvent) => {
    updatePagePointerTarget(event)
  }

  /*
   * Starts source-compatible single-touch tracking and interaction.
   * @param event Canvas touch-start event.
   */
  const handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1) {
      return
    }
    event.preventDefault()
    const touch = event.touches[0]
    if (touch) {
      touchDragging = true
      const point = toCubism2ModelPoint(canvas, touch)
      animator?.setPointerTarget(point.x, point.y)
      void animator?.startMotionForPoint(point.x, point.y).catch((error: unknown) => {
        console.warn('[KT Blog] Live2D interaction motion failed.', error)
      })
    }
  }

  /*
   * Follows a source-compatible single touch without repeatedly starting hit motions.
   * @param event Canvas touch-move event.
   */
  const handleTouchMove = (event: TouchEvent) => {
    if (!touchDragging) {
      return
    }
    const touch = event.touches[0]
    if (!touch) {
      return
    }
    event.preventDefault()
    const point = toCubism2ModelPoint(canvas, touch)
    animator?.setPointerTarget(point.x, point.y)
  }

  /*
   * Ends source-compatible touch tracking and restores the front-facing target.
   * @param event Canvas touch-end event.
   */
  const handleTouchEnd = (event: TouchEvent) => {
    event.preventDefault()
    touchDragging = false
    handlePointerRelease()
  }

  /*
   * Releases the WebGL texture currently owned by this renderer.
   */
  const releaseActiveTexture = () => {
    if (!gl || !activeTexture) {
      return
    }
    gl.deleteTexture(activeTexture)
    activeTexture = null
  }

  window.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseleave', handlePointerRelease)
  canvas.addEventListener('mousedown', handleMouseDown)
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

  return {
    /**
     * 渲染器通过解绑指针事件、取消动画帧及释放纹理和动作状态，终止当前 WebGL 会话。
     */
    destroy() {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handlePointerRelease)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      if (frame) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
      releaseActiveTexture()
      animator?.stop()
      animator = null
      model = null
      gl = null
    },
    mount: applyState,
    switchModel: applyState,
    /**
     * 在 `createWebGLLive2DRenderer` 中，切换并持久化当前 Live2D 模型的纹理选择；已渲染同一索引时不重复调用渲染器。
     * @param state - 待读取、替换或推进的运行状态。
     */
    async switchTexture(state) {
      if (!model || !gl) {
        await applyState(state)
        return
      }
      const nextTexture = await loadTexture(
        gl,
        model,
        resolveAssetUrl(
          state.settings.baseUrl,
          state.settings.textures[state.textureIndex] || state.settings.textures[0] || '',
        ),
      )
      releaseActiveTexture()
      activeTexture = nextTexture
    },
  }
}

/**
 * Live2D 二进制资源通过同源凭据请求并转换为 ArrayBuffer，供模型或动作解析器使用。
 * @param url - 模型、动作等 Live2D 二进制资源地址。
 * @returns 成功响应的完整二进制缓冲区。
 * @throws 资源响应不是成功状态时抛出包含 HTTP 状态的 Error。
 */
async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url, { credentials: 'same-origin' })
  if (!response.ok) {
    throw new Error(`Live2D asset request failed: ${response.status}`)
  }
  return response.arrayBuffer()
}

/**
 * 把图片上传为 WebGL 纹理并绑定到 Live2D 模型的零号槽；纹理创建失败时抛错。
 * @param gl - 包含 `gl.createTexture`、`gl.pixelStorei`、`gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL`、`gl.UNPACK_FLIP_Y_WEBGL` 字段的`gl`对象。
 * @param model - 待驱动、投影或渲染的模型实例。
 * @param url - 待校验、请求或导航的 URL。
 * @returns Promise 兑现为上传图片后绑定到模型零号槽的 WebGL 纹理。
 * @throws 当 `!texture` 成立时抛出 `new Error('Live2D WebGL texture creation failed.')`。
 */
async function loadTexture(
  gl: WebGLRenderingContext,
  model: Live2DCoreModel,
  url: string,
): Promise<WebGLTexture> {
  const image = await loadImage(url)
  const texture = gl.createTexture()
  if (!texture) {
    throw new Error('Live2D WebGL texture creation failed.')
  }
  if (model.isPremultipliedAlpha?.() === false) {
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1)
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST)
  gl.generateMipmap(gl.TEXTURE_2D)
  model.setTexture(0, texture)
  return texture
}

/**
 * 加载 Live2D 纹理图片；浏览器加载失败时以包含 URL 的错误拒绝 Promise。
 * @param url - 待校验、请求或导航的 URL。
 * @returns 加载完成的 Live2D 纹理图片。
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Live2D texture request failed: ${url}`))
    image.src = url
  })
}

/**
 * 以页面 origin 解析模型基址，再把相对资源路径转换为浏览器可请求的绝对 URL。
 * @param baseUrl - 解析相对资源地址时使用的基础 URL。
 * @param assetPath - 相对于模型目录的 Live2D 资源路径。
 * @returns 浏览器可直接请求的 Live2D 资源绝对 URL。
 */
function resolveAssetUrl(baseUrl: string, assetPath: string): string {
  return new URL(assetPath, new URL(baseUrl, window.location.origin)).toString()
}
