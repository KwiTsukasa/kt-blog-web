import type { Live2DModelEntry } from './live2dRuntimeTypes'

export const DEFAULT_LIVE2D_MODEL_KEY = 'pio'

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
] as const

/**
 * 按持久化模型键查找 Blog 注册的 Live2D 条目；未知键返回 undefined。
 * @param key - 用于在当前映射或缓存中定位记录的键。
 * @returns 持久化模型键对应的 Live2D 注册项；未知键时为 undefined。
 */
export function findLive2DModelEntry(key: string): Live2DModelEntry | undefined {
  return BLOG_LIVE2D_MODELS.find((entry) => entry.key === key)
}
