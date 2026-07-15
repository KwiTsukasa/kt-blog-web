import { loadCubism2Core } from './cubism2CoreLoader';
import {
  createCubism2ModelAnimator,
  type Cubism2ModelAnimator,
} from './cubism2ModelAnimator';
import { configureCubism2ModelProjection } from './cubism2ModelProjection';
import { toCubism2ViewPoint } from './cubism2PointerCoordinates';
import type { Live2DCoreModel, Live2DRendererAdapter, Live2DResolvedState } from './live2dRuntimeTypes';
import { installCubism2WebGLTextureReleaseHook } from '../vendor/cubism2Core/compatibility/webglTextureRelease';

/**
 * Creates the browser WebGL renderer used by the TypeScript Live2D runtime.
 * @param canvas Canvas owned by the Blog Live2D widget.
 * @returns Renderer adapter that applies model and texture state to Cubism2 core objects.
 */
export function createWebGLLive2DRenderer(canvas: HTMLCanvasElement): Live2DRendererAdapter {
  let gl: WebGLRenderingContext | null = null;
  let model: Live2DCoreModel | null = null;
  let animator: Cubism2ModelAnimator | null = null;
  let activeTexture: WebGLTexture | null = null;
  let frame = 0;
  let touchDragging = false;

  /**
   * Loads and displays one model state.
   * @param state Resolved model and texture state.
   */
  const applyState = async (state: Live2DResolvedState): Promise<void> => {
    const context = await resolveContext();
    const modelBuffer = await fetchArrayBuffer(resolveAssetUrl(state.settings.baseUrl, state.settings.model));
    const nextModel = window.Live2DModelWebGL!.loadModel(modelBuffer);
    configureCubism2ModelProjection(nextModel, canvas, state.settings.layout);
    nextModel.saveParam();
    const nextAnimator = createCubism2ModelAnimator({
      Live2DMotion: window.Live2DMotion!,
      MotionQueueManager: window.MotionQueueManager!,
      loadMotionBytes: fetchArrayBuffer,
      settings: state.settings,
    });
    let nextTexture: WebGLTexture;
    try {
      nextTexture = await loadTexture(
        context,
        nextModel,
        resolveAssetUrl(state.settings.baseUrl, state.settings.textures[state.textureIndex] || state.settings.textures[0] || ''),
      );
    } catch (error: unknown) {
      nextAnimator.stop();
      throw error;
    }
    releaseActiveTexture();
    animator?.stop();
    model = nextModel;
    animator = nextAnimator;
    activeTexture = nextTexture;
    void nextAnimator.preloadMotionGroup('idle').catch((error: unknown) => {
      console.warn('[KT Blog] Live2D idle motion preload failed.', error);
    });
    startLoop();
  };

  /**
   * Resolves and initializes the WebGL context.
   * @returns WebGL context for the Live2D core.
   */
  const resolveContext = async (): Promise<WebGLRenderingContext> => {
    if (gl) {
      return gl;
    }
    await loadCubism2Core();
    const context = canvas.getContext('webgl', { premultipliedAlpha: true })
      || canvas.getContext('experimental-webgl', { premultipliedAlpha: true });
    if (!(context instanceof WebGLRenderingContext)) {
      throw new Error('Live2D WebGL context is not available.');
    }
    installCubism2WebGLTextureReleaseHook(context);
    window.Live2D?.setGL?.(context);
    context.clearColor(0, 0, 0, 0);
    gl = context;
    return context;
  };

  /**
   * Starts the draw loop once.
   */
  const startLoop = () => {
    if (frame) {
      return;
    }
    /** Draws one source-ordered Cubism2 animation frame. */
    const tick = () => {
      frame = window.requestAnimationFrame(tick);
      if (!gl || !model || !animator) {
        return;
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
      animator.update(model);
      model.draw();
    };
    frame = window.requestAnimationFrame(tick);
  };

  /**
   * Tracks the mouse in the source canvas-local coordinate space.
   * @param event Canvas mouse move event.
   */
  const handleModelTurnHead = (event: Pick<MouseEvent, 'clientX' | 'clientY'>) => {
    const point = toCubism2ViewPoint(canvas, event);
    animator?.setPointerTarget(point.x, point.y);
    void animator?.startMotionForPoint(point.x, point.y).catch((error: unknown) => {
      console.warn('[KT Blog] Live2D interaction motion failed.', error);
    });
  };

  /** Restores the source look-front behavior after the pointer leaves or is released. */
  const handlePointerRelease = () => {
    animator?.setPointerTarget(0, 0);
  };

  /**
   * Handles the source left-button press behavior.
   * @param event Canvas mouse-down event.
   */
  const handleMouseDown = (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    handleModelTurnHead(event);
  };

  /**
   * Handles the source hover behavior, including hit-motion attempts.
   * @param event Canvas mouse-move event.
   */
  const handleMouseMove = (event: MouseEvent) => {
    event.preventDefault();
    handleModelTurnHead(event);
  };

  /**
   * Starts source-compatible single-touch tracking and interaction.
   * @param event Canvas touch-start event.
   */
  const handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1) {
      return;
    }
    event.preventDefault();
    const touch = event.touches[0];
    if (touch) {
      touchDragging = true;
      handleModelTurnHead(touch);
    }
  };

  /**
   * Follows a source-compatible single touch without repeatedly starting hit motions.
   * @param event Canvas touch-move event.
   */
  const handleTouchMove = (event: TouchEvent) => {
    if (!touchDragging) {
      return;
    }
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    event.preventDefault();
    const point = toCubism2ViewPoint(canvas, touch);
    animator?.setPointerTarget(point.x, point.y);
  };

  /**
   * Ends source-compatible touch tracking and restores the front-facing target.
   * @param event Canvas touch-end event.
   */
  const handleTouchEnd = (event: TouchEvent) => {
    event.preventDefault();
    touchDragging = false;
    handlePointerRelease();
  };

  /**
   * Releases the WebGL texture currently owned by this renderer.
   */
  const releaseActiveTexture = () => {
    if (!gl || !activeTexture) {
      return;
    }
    gl.deleteTexture(activeTexture);
    activeTexture = null;
  };

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handlePointerRelease);
  canvas.addEventListener('mouseout', handlePointerRelease);
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

  return {
    destroy() {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handlePointerRelease);
      canvas.removeEventListener('mouseout', handlePointerRelease);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      releaseActiveTexture();
      animator?.stop();
      animator = null;
      model = null;
      gl = null;
    },
    mount: applyState,
    switchModel: applyState,
    async switchTexture(state) {
      if (!model || !gl) {
        await applyState(state);
        return;
      }
      const nextTexture = await loadTexture(
        gl,
        model,
        resolveAssetUrl(state.settings.baseUrl, state.settings.textures[state.textureIndex] || state.settings.textures[0] || ''),
      );
      releaseActiveTexture();
      activeTexture = nextTexture;
    },
  };
}

/**
 * Fetches binary data used by Cubism2 model and motion loaders.
 * @param url Asset URL.
 * @returns ArrayBuffer response body.
 */
async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Live2D asset request failed: ${response.status}`);
  }
  return response.arrayBuffer();
}

/**
 * Loads a texture image into Live2D model texture slot zero.
 * @param gl WebGL context.
 * @param model Live2D core model.
 * @param url Texture image URL.
 * @returns WebGL texture now attached to the model.
 */
async function loadTexture(gl: WebGLRenderingContext, model: Live2DCoreModel, url: string): Promise<WebGLTexture> {
  const image = await loadImage(url);
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error('Live2D WebGL texture creation failed.');
  }
  if (model.isPremultipliedAlpha?.() === false) {
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  model.setTexture(0, texture);
  return texture;
}

/**
 * Loads an HTML image element for WebGL upload.
 * @param url Texture URL.
 * @returns Loaded image element.
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Live2D texture request failed: ${url}`));
    image.src = url;
  });
}

/**
 * Resolves a relative model asset URL against its model settings location.
 * @param baseUrl Settings directory URL.
 * @param assetPath Relative asset path.
 * @returns Browser-resolvable asset URL.
 */
function resolveAssetUrl(baseUrl: string, assetPath: string): string {
  return new URL(assetPath, new URL(baseUrl, window.location.origin)).toString();
}
