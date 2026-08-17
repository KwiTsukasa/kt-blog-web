import type { Live2DHitAreas, Live2DModelSettings, Live2DMotionSetting } from './live2dRuntimeTypes'

interface RawLive2DModelSettings {
  hit_areas_custom?: {
    body_x?: [number, number]
    body_y?: [number, number]
    head_x?: [number, number]
    head_y?: [number, number]
  }
  layout?: Record<string, number>
  model?: unknown
  motions?: Record<string, Array<{ fade_in?: number; fade_out?: number; file?: unknown }>>
  textures?: unknown
}

/**
 * 模型设置请求通过同源凭据读取 index.json，并规范化资源基址、纹理、动作和命中区域。
 * @param url - Live2D 模型设置文件的站内地址。
 * @returns 可供 Cubism2 渲染器直接使用的规范化模型设置。
 * @throws 设置文件响应不是成功状态时抛出包含 HTTP 状态的 Error。
 */
export async function fetchLive2DModelSettings(url: string): Promise<Live2DModelSettings> {
  const response = await fetch(url, { credentials: 'same-origin' })
  if (!response.ok) {
    throw new Error(`Live2D model settings request failed: ${response.status}`)
  }
  return normalizeLive2DModelSettings(url, (await response.json()) as RawLive2DModelSettings)
}

/**
 * 从 index.json 提取模型、纹理、动作、布局和命中区，并以配置 URL 推导资源基址；缺少模型文件时抛错。
 * @param url - 待校验、请求或导航的 URL。
 * @param raw - 待规范化的原始配置或输入数据。
 * @returns 模型、纹理、动作、布局和命中区，包含 `baseUrl`、`hitAreas`、`layout`、`model`、`motions` 等字段。
 * @throws 当 `!model` 成立时抛出 `new Error('Live2D model settings missing model file.')`。
 */
export function normalizeLive2DModelSettings(
  url: string,
  raw: RawLive2DModelSettings,
): Live2DModelSettings {
  const model = (() => {
    if (typeof raw.model === 'string' && raw.model.trim()) {
      return raw.model.trim()
    }
    return ''
  })()
  if (!model) {
    throw new Error('Live2D model settings missing model file.')
  }

  return {
    baseUrl: url.slice(0, url.lastIndexOf('/') + 1),
    hitAreas: normalizeHitAreas(raw.hit_areas_custom),
    layout: raw.layout,
    model,
    motions: normalizeMotions(raw.motions),
    textures: (() => {
      if (Array.isArray(raw.textures)) {
        return raw.textures.filter(
          (texture): texture is string => typeof texture === 'string' && texture.trim().length > 0,
        )
      }
      return []
    })(),
    url,
  }
}

/**
 * 把 Live2D 配置中的 body_x、body_y、head_x 与 head_y 转为运行时使用的驼峰命中区字段。
 * @param raw - 待规范化的原始配置或输入数据。
 * @returns 使用驼峰字段的 Live2D 头部与身体命中区，包含 `bodyX`、`bodyY`、`headX`、`headY` 等字段。
 */
function normalizeHitAreas(raw: RawLive2DModelSettings['hit_areas_custom']): Live2DHitAreas {
  return {
    bodyX: raw?.body_x,
    bodyY: raw?.body_y,
    headX: raw?.head_x,
    headY: raw?.head_y,
  }
}

/**
 * 过滤缺少文件路径的 Live2D 动作，规范化淡入淡出字段并移除空动作组。
 * @param raw - 待规范化的原始配置或输入数据。
 * @returns 过滤后的缺少文件路径的 Live2D 动作，规范化淡入淡出字段并移除空动作组。
 */
function normalizeMotions(
  raw: RawLive2DModelSettings['motions'],
): Record<string, Live2DMotionSetting[]> {
  const motions: Record<string, Live2DMotionSetting[]> = {}
  Object.entries(raw || {}).forEach(([group, entries]) => {
    const validEntries = entries
      .filter(
        (entry): entry is { fade_in?: number; fade_out?: number; file: string } =>
          typeof entry.file === 'string' && entry.file.trim().length > 0,
      )
      .map((entry) => ({
        fadeIn: entry.fade_in,
        fadeOut: entry.fade_out,
        file: entry.file.trim(),
      }))
    if (validEntries.length > 0) {
      motions[group] = validEntries
    }
  })
  return motions
}
