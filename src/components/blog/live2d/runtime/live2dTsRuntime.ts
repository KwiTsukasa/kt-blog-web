import {
  BLOG_LIVE2D_MODELS,
  DEFAULT_LIVE2D_MODEL_KEY,
  findLive2DModelEntry,
} from './live2dRuntimeCatalog'
import { fetchLive2DModelSettings } from './live2dModelSettings'
import { createWebGLLive2DRenderer } from './webglLive2DRenderer'
import type {
  Live2DModelEntry,
  Live2DModelSettings,
  Live2DRendererAdapter,
  Live2DResolvedState,
  Live2DRuntimeStorage,
  Live2DTSRuntime,
} from './live2dRuntimeTypes'
import { createLive2DRuntimeStorage } from './live2dRuntimeStorage'

export interface CreateLive2DTSRuntimeOptions {
  canvas: HTMLCanvasElement
  entries?: readonly Live2DModelEntry[]
  loadSettings?: (url: string) => Promise<Live2DModelSettings>
  renderer?: Live2DRendererAdapter
  storage?: Live2DRuntimeStorage
}

/**
 * Live2D 运行时通过目录回退、设置缓存、选择持久化与可替换渲染器协调模型及纹理切换。
 * @param options - 提供画布及可选模型目录、设置加载器、渲染器与持久化适配器。
 * @returns 支持挂载、预览、切换和销毁的 Live2D 运行时控制器。
 */
export function createLive2DTSRuntime(options: CreateLive2DTSRuntimeOptions): Live2DTSRuntime {
  const entries = options.entries || BLOG_LIVE2D_MODELS
  const settingsCache = new Map<string, Live2DModelSettings>()
  const storage = options.storage || createLive2DRuntimeStorage()
  const loadSettings = options.loadSettings || fetchLive2DModelSettings
  const renderer = options.renderer || createWebGLLive2DRenderer(options.canvas)
  let state: Live2DResolvedState | null = null
  let renderedTextureIndex: number | null = null

  /*
   * Resolves a model key to a registered entry, falling back to Pio.
   * @param modelKey Cache or user-selected model key.
   * @returns Registered model entry.
   */
  const resolveEntry = (modelKey: string | null): Live2DModelEntry => {
    const fromCatalog = entries.find((entry) => entry.key === modelKey)
    return (
      fromCatalog || entries.find((entry) => entry.key === DEFAULT_LIVE2D_MODEL_KEY) || entries[0]!
    )
  }

  /*
   * Loads settings once per model key.
   * @param entry Registered model entry.
   * @returns Normalized model settings.
   */
  const resolveSettings = async (entry: Live2DModelEntry): Promise<Live2DModelSettings> => {
    const cached = settingsCache.get(entry.key)
    if (cached) {
      return cached
    }
    const settings = await loadSettings(entry.modelUrl)
    settingsCache.set(entry.key, settings)
    return settings
  }

  /*
   * Builds a runtime state object and clamps texture selection to the model's texture count.
   * @param entry Registered model entry.
   * @param requestedTexture Optional explicit texture index.
   * @returns Runtime state for renderer application.
   */
  const createState = async (
    entry: Live2DModelEntry,
    requestedTexture?: number,
  ): Promise<Live2DResolvedState> => {
    const settings = await resolveSettings(entry)
    const textureIndex = (() => {
      if (typeof requestedTexture === 'number') {
        return clampTextureIndex(requestedTexture, settings.textures.length)
      }
      return storage.readTextureIndex(entry.key, settings.textures.length)
    })()
    return {
      modelKey: entry.key,
      settings,
      textureIndex,
    }
  }

  return {
    /**
     * 运行时通过销毁渲染器并清空已提交状态与纹理索引，释放当前 Live2D 会话。
     */
    destroy() {
      renderer.destroy()
      state = null
      renderedTextureIndex = null
    },

    /**
     * 在 `createLive2DTSRuntime` 中，读取最近一次提交的 Live2D 模型与纹理状态；挂载前或销毁后返回 null。
     * @returns 读取到的最近一次提交的 Live2D 模型与纹理状态。
     */
    getState() {
      return state
    },

    /**
     * 在 `createLive2DTSRuntime` 中，加载并挂载 Live2D 模型，返回挂载后的运行状态。
     * @returns Promise 兑现为挂载完成后的 Live2D 运行状态。
     */
    async mount() {
      const nextState = await createState(resolveEntry(storage.readModelKey()))
      await renderer.mount(nextState)
      storage.writeModelKey(nextState.modelKey)
      storage.writeTextureIndex(nextState.modelKey, nextState.textureIndex)
      state = nextState
      renderedTextureIndex = nextState.textureIndex
      return nextState
    },

    /**
     * 在 `createLive2DTSRuntime` 中，切换 Live2D 预览纹理并返回更新后的运行状态。
     * @param textureIndex - Live2D 模型要使用的纹理序号。
     * @returns Promise 兑现为更新后的运行状态。
     */
    async previewTexture(textureIndex: number) {
      const nextState = resolveTextureState(state, textureIndex)
      if (renderedTextureIndex !== textureIndex) {
        await renderer.switchTexture(nextState)
        renderedTextureIndex = textureIndex
      }
      return nextState
    },

    /**
     * 在 `createLive2DTSRuntime` 中，加载指定 Live2D 模型及其已保存纹理，切换渲染器并持久化规范化后的选择。
     * @param modelKey - 用于定位 Live2D 模型的持久化键。
     * @returns Promise 兑现为加载完成的指定 Live2D 模型及其已保存纹理，切换渲染器并持久化规范化后的选择。
     */
    async switchModel(modelKey: string) {
      const nextState = await createState(resolveEntry(modelKey))
      await renderer.switchModel(nextState)
      storage.writeModelKey(nextState.modelKey)
      storage.writeTextureIndex(nextState.modelKey, nextState.textureIndex)
      state = nextState
      renderedTextureIndex = nextState.textureIndex
      return nextState
    },

    /**
     * 在 `createLive2DTSRuntime` 中，切换并持久化当前 Live2D 模型的纹理选择；已渲染同一索引时不重复调用渲染器。
     * @param textureIndex - Live2D 模型要使用的纹理序号。
     * @returns Promise 兑现为切换并持久化纹理选择后的 Live2D 运行状态。
     */
    async switchTexture(textureIndex: number) {
      const nextState = resolveTextureState(state, textureIndex)
      if (renderedTextureIndex !== textureIndex) {
        await renderer.switchTexture(nextState)
        renderedTextureIndex = textureIndex
      }
      storage.writeTextureIndex(nextState.modelKey, nextState.textureIndex)
      state = nextState
      return nextState
    },
  }
}

/**
 * Live2D 纹理切换仅在已挂载且索引位于当前模型范围内时复制状态，原状态保持不变。
 * @param state - 最近一次成功挂载或切换后提交的运行状态。
 * @param textureIndex - 准备预览或持久化的纹理序号。
 * @returns 保留模型设置并替换纹理索引的新状态对象。
 * @throws 运行时尚未挂载，或纹理索引不是范围内整数时抛出对应 Error。
 */
function resolveTextureState(
  state: Live2DResolvedState | null,
  textureIndex: number,
): Live2DResolvedState {
  if (!state) {
    throw new Error('Live2D runtime is not mounted.')
  }
  if (
    !Number.isInteger(textureIndex) ||
    textureIndex < 0 ||
    textureIndex >= state.settings.textures.length
  ) {
    throw new Error('Live2D texture index is out of range.')
  }
  return {
    ...state,
    textureIndex,
  }
}

/**
 * 把纹理索引限制在有效范围，无效索引或空纹理列表回退零。
 * @param textureIndex - Live2D 模型要使用的纹理序号。
 * @param textureCount - 当前模型可选的纹理总数。
 * @returns 限制在有效范围内的纹理索引。
 */
function clampTextureIndex(textureIndex: number, textureCount: number): number {
  if (!Number.isInteger(textureIndex) || textureCount <= 0) {
    return 0
  }
  return Math.min(Math.max(textureIndex, 0), textureCount - 1)
}
