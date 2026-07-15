import { DEFAULT_LIVE2D_MODEL_KEY } from './live2dRuntimeCatalog';
import type { Live2DRuntimeStorage } from './live2dRuntimeTypes';

const MODEL_KEY = 'kt-blog-live2d:model';
const TEXTURE_KEY_PREFIX = 'kt-blog-live2d:texture:';

/**
 * Creates the localStorage adapter used by the Blog Live2D runtime.
 * @param storage Storage implementation, defaults to browser localStorage.
 * @returns Cache adapter for model key and per-model texture index.
 */
export function createLive2DRuntimeStorage(storage: Storage = window.localStorage): Live2DRuntimeStorage {
  return {
    readModelKey() {
      return storage.getItem(MODEL_KEY) || DEFAULT_LIVE2D_MODEL_KEY;
    },
    readTextureIndex(modelKey: string, textureCount: number) {
      const rawValue = Number(storage.getItem(textureKey(modelKey)));
      if (!Number.isInteger(rawValue) || textureCount <= 0) {
        return 0;
      }
      return Math.min(Math.max(rawValue, 0), Math.max(textureCount - 1, 0));
    },
    writeModelKey(modelKey: string) {
      storage.setItem(MODEL_KEY, modelKey);
    },
    writeTextureIndex(modelKey: string, textureIndex: number) {
      storage.setItem(textureKey(modelKey), String(textureIndex));
    },
  };
}

/**
 * Builds the namespaced texture cache key for one model.
 * @param modelKey Stable model key such as `pio` or `tia`.
 * @returns localStorage key for the model's selected texture index.
 */
function textureKey(modelKey: string): string {
  return `${TEXTURE_KEY_PREFIX}${modelKey}`;
}
