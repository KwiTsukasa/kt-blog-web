import { blogDomId } from '@/factories/blogDomFactory';

import {
  WORDPRESS_WAIFU_SIZE,
  WORDPRESS_WAIFU_TEXTURE_BUTTON_ID,
  WORDPRESS_WAIFU_TOOLS,
} from './wordpressWidgetConfig';
import {
  mountWordPressWidgetController,
  type WordPressWidgetControllerElements,
  type WordPressWidgetControllerHandle,
} from './wordpressWidgetController';

const WORDPRESS_RUNTIME_SCRIPT_ID = 'kt-blog-pio-wordpress-live2d-runtime';
const WORDPRESS_RUNTIME_CANVAS_CLASS = 'kt-blog__live2d-canvas';
const WORDPRESS_RUNTIME_WIDGET_CLASS = 'kt-blog__live2d-widget';
const WORDPRESS_RUNTIME_HIT_AREA_BRIDGE_MARKER = '__ktBlogPioCustomHitAreaBridge';
let runtimeScriptPromise: Promise<void> | null = null;
let runtimeMountPromise: Promise<WordPressLive2DRuntimeHandle> | null = null;
let mountedRuntimeCanvas: HTMLCanvasElement | null = null;
let mountedWidgetController: WordPressWidgetControllerHandle | null = null;
let mountedPagePointerBridge: WordPressPagePointerBridgeHandle | null = null;

export interface WordPressLive2DSettings {
  AUDIO_ID: string;
  BAN_BUTTON_CLASS: string;
  BUTTON_ID: string;
  CANVAS_ID: string;
  DEBUG_LOG: boolean;
  DEBUG_MOUSE_LOG: boolean;
  HIT_AREA_BODY: string;
  HIT_AREA_HEAD: string;
  IS_BAN_BUTTON: boolean;
  IS_BIND_BUTTON: boolean;
  IS_PLAY_AUDIO: boolean;
  IS_SCROLL_SCALE: boolean;
  IS_START_TEXURE_CHANGE: boolean;
  MODELS: string[][];
  MOTION_GROUP_FLICK_HEAD: string;
  MOTION_GROUP_IDLE: string;
  MOTION_GROUP_PINCH_IN: string;
  MOTION_GROUP_PINCH_OUT: string;
  MOTION_GROUP_SHAKE: string;
  MOTION_GROUP_TAP_BODY: string;
  NORMAL_BUTTON_CLASS: string;
  PRIORITY_FORCE: number;
  PRIORITY_IDLE: number;
  PRIORITY_NONE: number;
  PRIORITY_NORMAL: number;
  SCALE: number;
  TEXURE_BUTTON_ID: string;
  TEXURE_CHANGE_MODE: 'sequence' | 'random';
  VIEW_LOGICAL_LEFT: number;
  VIEW_LOGICAL_MAX_BOTTOM: number;
  VIEW_LOGICAL_MAX_LEFT: number;
  VIEW_LOGICAL_MAX_RIGHT: number;
  VIEW_LOGICAL_MAX_TOP: number;
  VIEW_LOGICAL_RIGHT: number;
  VIEW_MAX_SCALE: number;
  VIEW_MIN_SCALE: number;
  canvasSize: {
    height: number;
    width: number;
  };
}

export interface WordPressLive2DRuntimeHandle {
  /**
   * Releases Vue-owned runtime state. The WordPress runtime is kept as a page-level singleton for SPA routes.
   */
  destroy(): void;
}

declare global {
  interface Window {
    dragMgr?: WordPressRuntimeTargetPoint;
    InitLive2D?: () => void;
    LAppDefine?: WordPressLive2DSettings;
    LAppLive2DManager?: WordPressLive2DManagerConstructor;
    transformViewX?: (deviceX: number) => number;
    transformViewY?: (deviceY: number) => number;
  }
}

interface WordPressRuntimeTargetPoint {
  setPoint: (x: number, y: number) => void;
}

interface WordPressPagePointerBridgeHandle {
  /**
   * Removes document-level pointer tracking installed for the legacy WordPress runtime.
   */
  destroy(): void;
}

interface WordPressLive2DManagerConstructor {
  prototype: WordPressLive2DManagerPrototype;
}

interface WordPressLive2DManagerPrototype {
  [WORDPRESS_RUNTIME_HIT_AREA_BRIDGE_MARKER]?: boolean;
  tapEvent?: (this: WordPressLive2DManagerInstance, x: number, y: number) => boolean;
}

interface WordPressLive2DManagerInstance {
  models?: Array<WordPressLive2DModel | null | undefined>;
}

interface WordPressLive2DModel {
  modelSetting?: {
    json?: {
      hit_areas_custom?: WordPressLive2DCustomHitAreas;
    };
  };
  startRandomMotion?: (motionGroup: string, priority: number) => unknown;
}

interface WordPressLive2DCustomHitAreas {
  body_x?: [number, number];
  body_y?: [number, number];
  head_x?: [number, number];
  head_y?: [number, number];
}

type WordPressRuntimeWidgetShell = WordPressWidgetControllerElements;

export const DEFAULT_WORDPRESS_LIVE2D_SCRIPT = '/live2d/wordpress-moc/live2d.min.js';

export const DEFAULT_WORDPRESS_LIVE2D_MODEL_ENTRY = '/api/blog/live2d/pio/moc/index.json';

export const DEFAULT_WORDPRESS_LIVE2D_TIA_MODEL_ENTRY = '/api/blog/live2d/tia/moc/index.json';

export const DEFAULT_WORDPRESS_LIVE2D_SETTINGS: WordPressLive2DSettings = {
  AUDIO_ID: 'kt-blog-pio-audio',
  BAN_BUTTON_CLASS: 'inactive',
  BUTTON_ID: 'kt-blog-pio-change',
  CANVAS_ID: blogDomId('live2dCanvas'),
  DEBUG_LOG: false,
  DEBUG_MOUSE_LOG: false,
  HIT_AREA_BODY: 'body',
  HIT_AREA_HEAD: 'head',
  IS_BAN_BUTTON: true,
  IS_BIND_BUTTON: true,
  IS_PLAY_AUDIO: false,
  IS_SCROLL_SCALE: false,
  IS_START_TEXURE_CHANGE: true,
  MODELS: [[DEFAULT_WORDPRESS_LIVE2D_MODEL_ENTRY], [DEFAULT_WORDPRESS_LIVE2D_TIA_MODEL_ENTRY]],
  MOTION_GROUP_FLICK_HEAD: 'flick_head',
  MOTION_GROUP_IDLE: 'idle',
  MOTION_GROUP_PINCH_IN: 'pinch_in',
  MOTION_GROUP_PINCH_OUT: 'pinch_out',
  MOTION_GROUP_SHAKE: 'shake',
  MOTION_GROUP_TAP_BODY: 'tap_body',
  NORMAL_BUTTON_CLASS: 'active',
  PRIORITY_FORCE: 3,
  PRIORITY_IDLE: 1,
  PRIORITY_NONE: 0,
  PRIORITY_NORMAL: 2,
  SCALE: 1,
  TEXURE_BUTTON_ID: WORDPRESS_WAIFU_TEXTURE_BUTTON_ID,
  TEXURE_CHANGE_MODE: 'sequence',
  VIEW_LOGICAL_LEFT: -1,
  VIEW_LOGICAL_MAX_BOTTOM: -2,
  VIEW_LOGICAL_MAX_LEFT: -2,
  VIEW_LOGICAL_MAX_RIGHT: 2,
  VIEW_LOGICAL_MAX_TOP: 2,
  VIEW_LOGICAL_RIGHT: 1,
  VIEW_MAX_SCALE: 2,
  VIEW_MIN_SCALE: 0.8,
  canvasSize: {
    height: WORDPRESS_WAIFU_SIZE.height,
    width: WORDPRESS_WAIFU_SIZE.width,
  },
};

/**
 * Mounts the WordPress-exported Cubism2 MOC runtime into the singleton blog canvas.
 * @param settings WordPress runtime settings, including the MOC model entry and motion groups.
 * @returns Handle used by Vue teardown; route unmounts intentionally keep the singleton runtime alive.
 */
export async function mountWordPressLive2DRuntime(
  settings: WordPressLive2DSettings = DEFAULT_WORDPRESS_LIVE2D_SETTINGS,
): Promise<WordPressLive2DRuntimeHandle> {
  if (mountedRuntimeCanvas && !mountedRuntimeCanvas.isConnected) {
    mountedRuntimeCanvas = null;
    mountedWidgetController?.destroy();
    mountedWidgetController = null;
    mountedPagePointerBridge?.destroy();
    mountedPagePointerBridge = null;
  }

  if (mountedRuntimeCanvas?.isConnected) {
    return createWordPressRuntimeHandle();
  }

  if (runtimeMountPromise) {
    return runtimeMountPromise;
  }

  const shell = ensureWordPressRuntimeWidgetShell(settings);
  runtimeMountPromise = initializeWordPressRuntime(shell, settings).finally(() => {
    runtimeMountPromise = null;
  });
  return runtimeMountPromise;
}

/**
 * Creates or reuses the page-level WordPress waifu DOM shell so hash route switches do not destroy WebGL state.
 * @param settings WordPress Cubism2 runtime settings that define canvas id and intrinsic WebGL size.
 * @returns Connected widget shell elements used by the runtime and local toolbar controller.
 */
function ensureWordPressRuntimeWidgetShell(settings: WordPressLive2DSettings): WordPressRuntimeWidgetShell {
  const canvasId = settings.CANVAS_ID;
  const existingWidget = document.querySelector<HTMLElement>(`.waifu.${WORDPRESS_RUNTIME_WIDGET_CLASS}`);
  const widget = existingWidget ?? document.createElement('div');
  widget.className = `waifu ${WORDPRESS_RUNTIME_WIDGET_CLASS}`;
  widget.style.display = '';

  const canvas = document.createElement('canvas');
  canvas.id = canvasId;
  canvas.className = `live2d ${WORDPRESS_RUNTIME_CANVAS_CLASS}`;
  canvas.width = settings.canvasSize.width;
  canvas.height = settings.canvasSize.height;
  const tips = document.createElement('div');
  tips.className = 'waifu-tips';
  const tool = createWordPressToolMenu();
  const chat = createWordPressChatPanel();
  const modelButton = createWordPressHiddenButton(settings.BUTTON_ID);
  const textureButton = createWordPressHiddenButton(settings.TEXURE_BUTTON_ID);

  widget.replaceChildren(tips, canvas, tool, chat.container, modelButton, textureButton);
  if (!existingWidget) {
    document.body.appendChild(widget);
  }

  return {
    canvas,
    chat: chat.container,
    closeButton: chat.closeButton,
    input: chat.input,
    modelButton,
    sendButton: chat.sendButton,
    textureButton,
    tips,
    tool,
    widget,
  };
}

/**
 * Loads the WordPress runtime script and starts it against the singleton canvas.
 * @param shell Persistent WordPress widget shell whose canvas id is passed through `window.LAppDefine.CANVAS_ID`.
 * @param settings WordPress runtime settings for model entry, sizing, and interaction motions.
 * @returns Runtime handle that preserves the page-level singleton on Vue route teardown.
 */
async function initializeWordPressRuntime(
  shell: WordPressRuntimeWidgetShell,
  settings: WordPressLive2DSettings,
): Promise<WordPressLive2DRuntimeHandle> {
  window.LAppDefine = createWordPressRuntimeSettings(settings, shell.canvas.id);
  await appendWordPressRuntimeScript(DEFAULT_WORDPRESS_LIVE2D_SCRIPT);
  installWordPressCustomHitAreaBridge(settings);
  if (!window.InitLive2D) {
    throw new Error('WordPress Live2D runtime was not registered.');
  }

  window.InitLive2D();
  mountedRuntimeCanvas = shell.canvas;
  mountedPagePointerBridge?.destroy();
  mountedPagePointerBridge = mountWordPressPagePointerBridge(shell.canvas);
  const textureCounts = settings.MODELS.map(() => undefined as number | undefined);
  const resolveTextureCount = createWordPressModelTextureCountResolver(settings, textureCounts);
  await resolveTextureCount(0);
  mountedWidgetController?.destroy();
  mountedWidgetController = mountWordPressWidgetController(shell, { resolveTextureCount, textureCounts });
  return createWordPressRuntimeHandle();
}

/**
 * Mirrors the WordPress plugin's page-wide mouse tracking without emitting synthetic tap events.
 * @param canvas Legacy runtime canvas used as the coordinate origin for model-view transforms.
 * @returns Cleanup handle for replacing a disconnected widget shell.
 */
function mountWordPressPagePointerBridge(canvas: HTMLCanvasElement): WordPressPagePointerBridgeHandle {
  const handleMouseMove = (event: MouseEvent) => {
    if (!canvas.isConnected || typeof window.dragMgr?.setPoint !== 'function') {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const deviceX = event.clientX - rect.left;
    const deviceY = event.clientY - rect.top;
    window.dragMgr.setPoint(resolveWordPressViewX(canvas, deviceX), resolveWordPressViewY(canvas, deviceY));
  };

  const handleMouseOut = (event: MouseEvent) => {
    if (!event.relatedTarget && typeof window.dragMgr?.setPoint === 'function') {
      window.dragMgr.setPoint(0, 0);
    }
  };

  window.addEventListener('mousemove', handleMouseMove, { passive: true });
  window.addEventListener('mouseout', handleMouseOut, { passive: true });
  return {
    destroy() {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
    },
  };
}

/**
 * Converts a page-level pointer x offset with the legacy runtime transform when available.
 * @param canvas Runtime canvas used for fallback normalization before the script exposes helpers.
 * @param deviceX Pointer x offset relative to the canvas left edge.
 * @returns Model-view x coordinate consumed by `L2DTargetPoint`.
 */
function resolveWordPressViewX(canvas: HTMLCanvasElement, deviceX: number): number {
  if (typeof window.transformViewX === 'function') {
    return window.transformViewX(deviceX);
  }
  return (deviceX - canvas.width / 2) * (2 / canvas.width);
}

/**
 * Converts a page-level pointer y offset with the legacy runtime transform when available.
 * @param canvas Runtime canvas used for fallback normalization before the script exposes helpers.
 * @param deviceY Pointer y offset relative to the canvas top edge.
 * @returns Model-view y coordinate consumed by `L2DTargetPoint`.
 */
function resolveWordPressViewY(canvas: HTMLCanvasElement, deviceY: number): number {
  if (typeof window.transformViewY === 'function') {
    return window.transformViewY(deviceY);
  }
  return (deviceY - canvas.height / 2) * (-2 / canvas.width);
}

/**
 * Creates a per-model texture count resolver so the toolbar can avoid destructive single-texture reloads.
 * @param settings Runtime settings whose `MODELS` entries point at each character's `index.json`.
 * @param textureCounts Mutable count cache shared with the toolbar controller.
 * @returns Function that resolves and caches the texture count for a specific model index.
 */
function createWordPressModelTextureCountResolver(
  settings: WordPressLive2DSettings,
  textureCounts: Array<number | undefined>,
): (modelIndex: number) => Promise<number | undefined> {
  const pendingCounts: Array<Promise<number | undefined> | undefined> = [];
  return async function resolveWordPressTextureCountForModel(modelIndex: number): Promise<number | undefined> {
    if (typeof textureCounts[modelIndex] === 'number') {
      return textureCounts[modelIndex];
    }
    if (pendingCounts[modelIndex]) {
      return pendingCounts[modelIndex];
    }

    const modelEntry = settings.MODELS[modelIndex]?.[0];
    if (!modelEntry || typeof window.fetch !== 'function') {
      return undefined;
    }

    pendingCounts[modelIndex] = resolveWordPressModelTextureCount(modelEntry)
      .then((count) => {
        textureCounts[modelIndex] = count;
        return count;
      })
      .finally(() => {
        pendingCounts[modelIndex] = undefined;
      });
    return pendingCounts[modelIndex];
  };
}

/**
 * Reads one WordPress MOC model JSON and counts its usable texture entries.
 * @param modelEntry API URL for a character's legacy MOC `index.json`.
 * @returns Number of usable texture entries, or `undefined` when the model JSON cannot be inspected.
 */
async function resolveWordPressModelTextureCount(modelEntry: string): Promise<number | undefined> {
  try {
    const response = await window.fetch(modelEntry, { credentials: 'same-origin' });
    if (!response.ok) {
      return undefined;
    }
    const modelJson = (await response.json()) as { textures?: unknown };
    if (!Array.isArray(modelJson.textures)) {
      return undefined;
    }
    return modelJson.textures.filter((texture) => typeof texture === 'string' && texture.trim().length > 0).length;
  } catch {
    return undefined;
  }
}

/**
 * Creates the WordPress plugin toolbar with the original `fui-*` class contract.
 * @returns Toolbar element whose spans carry action metadata for the local controller.
 */
function createWordPressToolMenu(): HTMLElement {
  const tool = document.createElement('div');
  tool.className = 'waifu-tool';
  for (const item of WORDPRESS_WAIFU_TOOLS) {
    const button = document.createElement('span');
    button.className = item.className;
    button.dataset.live2dAction = item.action;
    button.title = item.title;
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    tool.appendChild(button);
  }
  return tool;
}

interface WordPressChatPanel {
  closeButton: HTMLButtonElement;
  container: HTMLElement;
  input: HTMLInputElement;
  sendButton: HTMLButtonElement;
}

/**
 * Creates the WordPress live-2d GPT input panel while leaving future backend wiring explicit.
 * @returns Input panel nodes needed by toolbar actions and local close/send behavior.
 */
function createWordPressChatPanel(): WordPressChatPanel {
  const container = document.createElement('div');
  container.className = 'gptInput';

  const input = document.createElement('input');
  input.id = blogDomId('live2dChatText');
  input.placeholder = '和 Pio 说点什么...';
  input.type = 'text';

  const sendButton = document.createElement('button');
  sendButton.id = blogDomId('live2dSend');
  sendButton.type = 'button';
  sendButton.textContent = '发送';

  const closeButton = document.createElement('button');
  closeButton.id = blogDomId('live2dSendClose');
  closeButton.type = 'button';
  closeButton.textContent = '关闭';

  container.append(input, sendButton, closeButton);
  return {
    closeButton,
    container,
    input,
    sendButton,
  };
}

/**
 * Creates the hidden texture button consumed by the legacy runtime's `changeTexure` binding.
 * @param id Stable DOM id passed to `window.LAppDefine.TEXURE_BUTTON_ID`.
 * @returns Hidden button clicked by the local toolbar texture action.
 */
function createWordPressHiddenButton(id: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = id;
  button.hidden = true;
  button.type = 'button';
  return button;
}

/**
 * Builds the global `LAppDefine` object consumed by the legacy WordPress Cubism2 runtime.
 * @param settings Vue-owned runtime settings and model entry URL.
 * @param canvasId DOM id of the singleton canvas created by Blog Web.
 * @returns A shallow copy safe to assign to `window.LAppDefine`.
 */
function createWordPressRuntimeSettings(
  settings: WordPressLive2DSettings,
  canvasId: string,
): WordPressLive2DSettings {
  return {
    ...settings,
    CANVAS_ID: canvasId,
    MODELS: settings.MODELS.map((modelGroup) => [...modelGroup]),
    canvasSize: { ...settings.canvasSize },
  };
}

/**
 * Makes the generic Cubism2 runtime honor WordPress Pio's `hit_areas_custom` contract.
 * @param settings Runtime motion group and priority names used when a custom hit area matches.
 */
function installWordPressCustomHitAreaBridge(settings: WordPressLive2DSettings): void {
  const managerPrototype = window.LAppLive2DManager?.prototype;
  if (!managerPrototype || managerPrototype[WORDPRESS_RUNTIME_HIT_AREA_BRIDGE_MARKER]) {
    return;
  }

  const originalTapEvent = managerPrototype.tapEvent;
  managerPrototype.tapEvent = function tapWordPressCustomHitArea(x: number, y: number) {
    const handled = startWordPressCustomHitAreaMotion(this, settings, x, y);
    if (handled) {
      return true;
    }
    return typeof originalTapEvent === 'function' ? originalTapEvent.call(this, x, y) : false;
  };
  managerPrototype[WORDPRESS_RUNTIME_HIT_AREA_BRIDGE_MARKER] = true;
}

/**
 * Starts the WordPress Pio interaction motion matching the pointer position.
 * @param manager Live2D manager instance created by the legacy Cubism2 runtime.
 * @param settings Runtime motion group and priority names.
 * @param x Pointer x coordinate in model-view space.
 * @param y Pointer y coordinate in model-view space.
 * @returns `true` when a custom hit area matched and a motion request was issued.
 */
function startWordPressCustomHitAreaMotion(
  manager: WordPressLive2DManagerInstance,
  settings: WordPressLive2DSettings,
  x: number,
  y: number,
): boolean {
  const models = Array.isArray(manager.models) ? manager.models : [];
  for (const model of models) {
    const hitAreas = model?.modelSetting?.json?.hit_areas_custom;
    if (!hitAreas || typeof model?.startRandomMotion !== 'function') {
      continue;
    }
    if (isPointInsideWordPressHitArea(hitAreas.head_x, hitAreas.head_y, x, y)) {
      model.startRandomMotion(settings.MOTION_GROUP_FLICK_HEAD, settings.PRIORITY_NORMAL);
      return true;
    }
    if (isPointInsideWordPressHitArea(hitAreas.body_x, hitAreas.body_y, x, y)) {
      model.startRandomMotion(settings.MOTION_GROUP_TAP_BODY, settings.PRIORITY_NORMAL);
      return true;
    }
  }
  return false;
}

/**
 * Checks a WordPress custom hit rectangle whose coordinate arrays may be reversed.
 * @param xRange Two x bounds from `hit_areas_custom`.
 * @param yRange Two y bounds from `hit_areas_custom`.
 * @param x Pointer x coordinate in model-view space.
 * @param y Pointer y coordinate in model-view space.
 * @returns `true` when the point falls inside the normalized rectangle.
 */
function isPointInsideWordPressHitArea(
  xRange: [number, number] | undefined,
  yRange: [number, number] | undefined,
  x: number,
  y: number,
): boolean {
  if (!xRange || !yRange) {
    return false;
  }
  const minX = Math.min(...xRange);
  const maxX = Math.max(...xRange);
  const minY = Math.min(...yRange);
  const maxY = Math.max(...yRange);
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

/**
 * @returns No-op Vue handle because the WordPress runtime cleans itself only on full page unload.
 */
function createWordPressRuntimeHandle(): WordPressLive2DRuntimeHandle {
  return {
    destroy() {
      // Keep the singleton runtime alive across hash-route component unmounts.
    },
  };
}

/**
 * Appends the WordPress universal Live2D runtime script only once per document.
 * @param src Static runtime script copied from the WordPress Cubism2/Pio runtime package.
 * @returns Promise that resolves after the script has registered `window.InitLive2D`.
 */
async function appendWordPressRuntimeScript(src: string): Promise<void> {
  if (runtimeScriptPromise) {
    return runtimeScriptPromise;
  }

  if (document.getElementById(WORDPRESS_RUNTIME_SCRIPT_ID)) {
    return;
  }

  let resolveLoad: () => void = () => undefined;
  let rejectLoad: (error: Error) => void = () => undefined;
  runtimeScriptPromise = new Promise<void>((resolve, reject) => {
    resolveLoad = resolve;
    rejectLoad = reject;
  });

  const script = document.createElement('script');
  script.id = WORDPRESS_RUNTIME_SCRIPT_ID;
  script.src = src;
  script.async = true;
  script.onload = () => {
    runtimeScriptPromise = null;
    resolveLoad();
  };
  script.onerror = () => {
    runtimeScriptPromise = null;
    script.remove();
    rejectLoad(new Error(`WordPress Live2D runtime failed: ${src}`));
  };
  document.body.appendChild(script);

  return runtimeScriptPromise;
}
