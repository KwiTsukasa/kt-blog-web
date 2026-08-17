import { resolveBlogRuntimeAssetPath } from '@/router/runtimeBase'

export const PREVIOUS_BLOG_BACKGROUND_IMAGE = 'https://s3.kwitsukasa.top/images/bg-冬滚滚.png'
export const PREVIOUS_BLOG_AUTHOR_AVATAR = 'https://s3.kwitsukasa.top/images/avatar-tsukasa-1.jpg'
export const LOCAL_BLOG_BACKGROUND_IMAGE = resolveBlogRuntimeAssetPath(
  'blog-assets/bg-donggungun.png',
)
export const LOCAL_BLOG_AUTHOR_AVATAR = resolveBlogRuntimeAssetPath(
  'blog-assets/avatar-tsukasa-1.jpg',
)

const LEGACY_ARGON_ASSET_REPLACEMENTS: Record<string, string> = {
  '/argon/theme/img-1-1200x1000.jpg': PREVIOUS_BLOG_BACKGROUND_IMAGE,
  '/argon/theme/img-2-1200x1000.jpg': PREVIOUS_BLOG_BACKGROUND_IMAGE,
  '/argon/theme/landing.jpg': PREVIOUS_BLOG_BACKGROUND_IMAGE,
  '/argon/theme/profile.jpg': PREVIOUS_BLOG_AUTHOR_AVATAR,
  '/argon/theme/promo-1.png': PREVIOUS_BLOG_BACKGROUND_IMAGE,
}

/**
 * 解包 CSS url 后替换旧 Argon 演示资源；输入为空时返回指定兜底资源。
 * @param value - 待校验、转换或写入的原始值；省略时按 undefined 的缺省分支处理。
 * @param fallback - 主路径无法提供结果时使用的兜底值或操作；未提供时使用 `PREVIOUS_BLOG_BACKGROUND_IMAGE`。
 * @returns 已替换旧演示资源的博客静态地址；空输入时为指定兜底地址。
 */
export function resolveBlogStaticAsset(
  value?: null | string,
  fallback = PREVIOUS_BLOG_BACKGROUND_IMAGE,
) {
  const asset = unwrapBlogCssImage(value)
  if (!asset) return fallback

  const replacementKey = getAssetPath(asset)

  return LEGACY_ARGON_ASSET_REPLACEMENTS[replacementKey] || asset
}

/**
 * 去除 CSS url() 包裹、引号与多余空白，空输入返回空串。
 * @param value - 待校验、转换或写入的原始值；省略时按 undefined 的缺省分支处理。
 * @returns 去除 url() 与引号后的资源地址；空输入时为空字符串。
 */
export function unwrapBlogCssImage(value?: null | string) {
  const normalized = `${value || ''}`.trim()
  if (!normalized) return ''

  const cssImage = /^url\((.*)\)$/i.exec(normalized)?.[1]?.trim()

  return (() => {
    if (cssImage) {
      return cssImage.replace(/^['"]|['"]$/g, '')
    }
    return normalized
  })().trim()
}

/**
 * 保留根路径，对完整 URL 仅取 pathname，地址无法解析时保留原值。
 * @param asset - 待解析为浏览器可请求地址的 Live2D 资源路径。
 * @returns 读取到的资源路径。
 */
function getAssetPath(asset: string) {
  if (asset.startsWith('/')) return asset

  try {
    return new URL(asset).pathname
  } catch {
    return asset
  }
}
