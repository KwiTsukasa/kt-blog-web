import { DEFAULT_LIVE2D_MODEL_KEY } from './live2dRuntimeCatalog'
import type { Live2DRuntimeStorage } from './live2dRuntimeTypes'

const MODEL_KEY = 'kt-blog-live2d:model'
const TEXTURE_KEY_PREFIX = 'kt-blog-live2d:texture:'

/**
 * 创建保存模型键与各模型纹理索引的 localStorage 适配器，并为缺失或越界记录提供默认值。
 * @param storage - 包含 `storage.getItem`、`storage.setItem` 字段的`storage`对象；未提供时使用 `window.localStorage`。
 * @returns 新建的保存模型键与各模型纹理索引的 localStorage 适配器，并为缺失或越界记录提供默认值，包含 `readModelKey`、`readTextureIndex`、`writeModelKey`、`writeTextureIndex` 等字段。
 */
export function createLive2DRuntimeStorage(
  storage: Storage = window.localStorage,
): Live2DRuntimeStorage {
  return {
    /**
     * 在 `createLive2DRuntimeStorage` 中，从 localStorage 读取上次选择的 Live2D 模型键；未保存时回退默认模型。
     * @returns 上次选择的 Live2D 模型键。
     */
    readModelKey() {
      return storage.getItem(MODEL_KEY) || DEFAULT_LIVE2D_MODEL_KEY
    },
    /**
     * 在 `createLive2DRuntimeStorage` 中，读取指定模型保存的纹理索引，并限制在当前纹理数量范围内；无效记录回退零。
     * @param modelKey - 用于定位 Live2D 模型的持久化键。
     * @param textureCount - 当前模型可选的纹理总数。
     * @returns 读取到的指定模型保存的纹理索引，并限制在当前纹理数量范围内。
     */
    readTextureIndex(modelKey: string, textureCount: number) {
      const rawValue = Number(storage.getItem(textureKey(modelKey)))
      if (!Number.isInteger(rawValue) || textureCount <= 0) {
        return 0
      }
      return Math.min(Math.max(rawValue, 0), Math.max(textureCount - 1, 0))
    },
    /**
     * 在 `createLive2DRuntimeStorage` 中，把当前选择的 Live2D 模型键持久化到 localStorage。
     * @param modelKey - 用于定位 Live2D 模型的持久化键。
     */
    writeModelKey(modelKey: string) {
      storage.setItem(MODEL_KEY, modelKey)
    },
    /**
     * 在 `createLive2DRuntimeStorage` 中，把指定模型的纹理索引转成十进制文本并持久化到 localStorage。
     * @param modelKey - 用于定位 Live2D 模型的持久化键。
     * @param textureIndex - Live2D 模型要使用的纹理序号。
     */
    writeTextureIndex(modelKey: string, textureIndex: number) {
      storage.setItem(textureKey(modelKey), String(textureIndex))
    },
  }
}

/**
 * 纹理选择键通过固定前缀与模型键隔离不同 Live2D 角色的持久化索引。
 * @param modelKey - Live2D 模型在目录中的稳定键。
 * @returns 仅属于该模型的 localStorage 纹理索引键。
 */
function textureKey(modelKey: string): string {
  return `${TEXTURE_KEY_PREFIX}${modelKey}`
}
