import type { Live2DModelEntry } from './live2dRuntimeTypes';

export const DEFAULT_LIVE2D_MODEL_KEY = 'pio';

export const BLOG_LIVE2D_MODELS: readonly Live2DModelEntry[] = [
  {
    key: 'pio',
    label: 'Pio',
    modelUrl: '/api/blog/live2d/pio/moc/index.json',
  },
  {
    key: 'tia',
    label: 'Tia',
    modelUrl: '/api/blog/live2d/tia/moc/index.json',
  },
] as const;

/**
 * Finds a registered Live2D model by its stable key.
 * @param key Model key stored in cache or emitted by the picker modal.
 * @returns Registered model entry, or undefined when the key is unknown.
 */
export function findLive2DModelEntry(key: string): Live2DModelEntry | undefined {
  return BLOG_LIVE2D_MODELS.find((entry) => entry.key === key);
}
