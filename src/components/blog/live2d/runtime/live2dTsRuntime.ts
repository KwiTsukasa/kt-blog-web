import {
  BLOG_LIVE2D_MODELS,
  DEFAULT_LIVE2D_MODEL_KEY,
  findLive2DModelEntry,
} from './live2dRuntimeCatalog';
import { fetchLive2DModelSettings } from './live2dModelSettings';
import { createWebGLLive2DRenderer } from './webglLive2DRenderer';
import type {
  Live2DModelEntry,
  Live2DModelSettings,
  Live2DRendererAdapter,
  Live2DResolvedState,
  Live2DRuntimeStorage,
  Live2DTSRuntime,
} from './live2dRuntimeTypes';
import { createLive2DRuntimeStorage } from './live2dRuntimeStorage';

export interface CreateLive2DTSRuntimeOptions {
  canvas: HTMLCanvasElement;
  entries?: readonly Live2DModelEntry[];
  loadSettings?: (url: string) => Promise<Live2DModelSettings>;
  renderer?: Live2DRendererAdapter;
  storage?: Live2DRuntimeStorage;
}

/**
 * Creates the Blog-owned TypeScript Live2D runtime facade.
 * @param options Canvas, catalog, storage, metadata loader, and optional test renderer.
 * @returns Runtime handle with direct model and texture selection APIs.
 */
export function createLive2DTSRuntime(options: CreateLive2DTSRuntimeOptions): Live2DTSRuntime {
  const entries = options.entries || BLOG_LIVE2D_MODELS;
  const settingsCache = new Map<string, Live2DModelSettings>();
  const storage = options.storage || createLive2DRuntimeStorage();
  const loadSettings = options.loadSettings || fetchLive2DModelSettings;
  const renderer = options.renderer || createWebGLLive2DRenderer(options.canvas);
  let state: Live2DResolvedState | null = null;

  /**
   * Resolves a model key to a registered entry, falling back to Pio.
   * @param modelKey Cache or user-selected model key.
   * @returns Registered model entry.
   */
  const resolveEntry = (modelKey: string | null): Live2DModelEntry => {
    const fromCatalog = entries.find((entry) => entry.key === modelKey);
    return fromCatalog || entries.find((entry) => entry.key === DEFAULT_LIVE2D_MODEL_KEY) || entries[0]!;
  };

  /**
   * Loads settings once per model key.
   * @param entry Registered model entry.
   * @returns Normalized model settings.
   */
  const resolveSettings = async (entry: Live2DModelEntry): Promise<Live2DModelSettings> => {
    const cached = settingsCache.get(entry.key);
    if (cached) {
      return cached;
    }
    const settings = await loadSettings(entry.modelUrl);
    settingsCache.set(entry.key, settings);
    return settings;
  };

  /**
   * Builds a runtime state object and clamps texture selection to the model's texture count.
   * @param entry Registered model entry.
   * @param requestedTexture Optional explicit texture index.
   * @returns Runtime state for renderer application.
   */
  const createState = async (
    entry: Live2DModelEntry,
    requestedTexture?: number,
  ): Promise<Live2DResolvedState> => {
    const settings = await resolveSettings(entry);
    const textureIndex =
      typeof requestedTexture === 'number'
        ? clampTextureIndex(requestedTexture, settings.textures.length)
        : storage.readTextureIndex(entry.key, settings.textures.length);
    return {
      modelKey: entry.key,
      settings,
      textureIndex,
    };
  };

  return {
    destroy() {
      renderer.destroy();
      state = null;
    },
    getState() {
      return state;
    },
    async mount() {
      const nextState = await createState(resolveEntry(storage.readModelKey()));
      await renderer.mount(nextState);
      storage.writeModelKey(nextState.modelKey);
      storage.writeTextureIndex(nextState.modelKey, nextState.textureIndex);
      state = nextState;
      return nextState;
    },
    async switchModel(modelKey: string) {
      const nextState = await createState(resolveEntry(modelKey));
      await renderer.switchModel(nextState);
      storage.writeModelKey(nextState.modelKey);
      storage.writeTextureIndex(nextState.modelKey, nextState.textureIndex);
      state = nextState;
      return nextState;
    },
    async switchTexture(textureIndex: number) {
      if (!state) {
        throw new Error('Live2D runtime is not mounted.');
      }
      if (textureIndex < 0 || textureIndex >= state.settings.textures.length) {
        throw new Error('Live2D texture index is out of range.');
      }
      const nextState = {
        ...state,
        textureIndex,
      };
      await renderer.switchTexture(nextState);
      storage.writeTextureIndex(nextState.modelKey, nextState.textureIndex);
      state = nextState;
      return nextState;
    },
  };
}

/**
 * Keeps texture selections inside the model's available texture list.
 * @param textureIndex Requested texture index.
 * @param textureCount Number of textures exposed by the active model.
 * @returns Clamped texture index.
 */
function clampTextureIndex(textureIndex: number, textureCount: number): number {
  if (!Number.isInteger(textureIndex) || textureCount <= 0) {
    return 0;
  }
  return Math.min(Math.max(textureIndex, 0), textureCount - 1);
}
