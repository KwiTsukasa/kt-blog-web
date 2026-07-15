import { loadCubism2Core } from './cubism2CoreLoader';
import { configureCubism2ModelProjection } from './cubism2ModelProjection';
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
  let activeTexture: WebGLTexture | null = null;
  let frame = 0;
  let startedAt = Date.now();
  const pointer = {
    x: 0,
    y: 0,
  };
  const pointerTarget = {
    x: 0,
    y: 0,
  };

  /**
   * Loads and displays one model state.
   * @param state Resolved model and texture state.
   */
  const applyState = async (state: Live2DResolvedState): Promise<void> => {
    const context = await resolveContext();
    const modelBuffer = await fetchArrayBuffer(resolveAssetUrl(state.settings.baseUrl, state.settings.model));
    const nextModel = window.Live2DModelWebGL!.loadModel(modelBuffer);
    configureCubism2ModelProjection(nextModel, canvas, state.settings.layout);
    const nextTexture = await loadTexture(
      context,
      nextModel,
      resolveAssetUrl(state.settings.baseUrl, state.settings.textures[state.textureIndex] || state.settings.textures[0] || ''),
    );
    releaseActiveTexture();
    model = nextModel;
    activeTexture = nextTexture;
    startedAt = Date.now();
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
    const tick = () => {
      frame = window.requestAnimationFrame(tick);
      if (!gl || !model) {
        return;
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
      animateModel(model, startedAt, pointer, pointerTarget);
      model.update();
      model.draw();
    };
    frame = window.requestAnimationFrame(tick);
  };

  /**
   * Tracks the mouse against the whole page, matching the WordPress widget's global look-at behavior.
   * @param event Page-level mouse move event.
   */
  const handleMouseMove = (event: MouseEvent) => {
    pointerTarget.x = (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
    pointerTarget.y = -((event.clientY / Math.max(window.innerHeight, 1)) * 2 - 1);
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

  window.addEventListener('mousemove', handleMouseMove);

  return {
    destroy() {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      releaseActiveTexture();
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
 * Applies lightweight idle motion parameters before drawing.
 * @param model Live2D core model.
 * @param startedAt Runtime model start timestamp.
 * @param pointer Current smoothed page-level look-at value.
 * @param pointerTarget Latest target look-at value derived from global pointer movement.
 */
function animateModel(
  model: Live2DCoreModel,
  startedAt: number,
  pointer: { x: number; y: number },
  pointerTarget: { x: number; y: number },
): void {
  const timeSec = (Date.now() - startedAt) / 1000;
  const t = timeSec * 2 * Math.PI;
  pointer.x += (pointerTarget.x - pointer.x) * 0.12;
  pointer.y += (pointerTarget.y - pointer.y) * 0.12;
  model.loadParam?.();
  model.addToParamFloat?.('PARAM_ANGLE_X', pointer.x * 25 + 15 * Math.sin(t / 6.5345), 0.5);
  model.addToParamFloat?.('PARAM_ANGLE_Y', pointer.y * 16 + 8 * Math.sin(t / 3.5345), 0.5);
  model.addToParamFloat?.('PARAM_ANGLE_Z', 10 * Math.sin(t / 5.5345), 0.5);
  model.addToParamFloat?.('PARAM_BODY_ANGLE_X', 4 * Math.sin(t / 15.5345), 0.5);
  model.setParamFloat?.('PARAM_BREATH', 0.5 + 0.5 * Math.sin(t / 3.2345), 1);
  model.saveParam?.();
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
