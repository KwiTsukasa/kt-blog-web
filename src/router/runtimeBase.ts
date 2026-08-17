const BLOG_GATEWAY_BASE = '/blog/'

/**
 * 当路径位于 /blog 网关前缀下时使用该部署基址，其他页面回退根路径。
 * @param pathname - URL 中待匹配或重写的路径部分；未提供时使用 `(() => { if (typeof window === 'undefined') { return…`。
 * @returns 当前路径适用的 /blog 网关基址或根路径。
 */
export function resolveBlogRuntimeBase(
  pathname = (() => {
    if (typeof window === 'undefined') {
      return '/'
    }
    return window.location.pathname
  })(),
) {
  if (pathname === '/blog' || pathname.startsWith(BLOG_GATEWAY_BASE)) {
    return BLOG_GATEWAY_BASE
  }
  return '/'
}

/**
 * 按当前部署路径推导 Blog 运行基址，并拼接去除前导斜杠的静态资源路径。
 * @param assetPath - 相对于模型目录的 Live2D 资源路径。
 * @param pathname - URL 中待匹配或重写的路径部分；未提供时使用 `(() => { if (typeof window === 'undefined') { return…`。
 * @returns 适配当前部署基址的 Blog 静态资源路径。
 */
export function resolveBlogRuntimeAssetPath(
  assetPath: string,
  pathname = (() => {
    if (typeof window === 'undefined') {
      return '/'
    }
    return window.location.pathname
  })(),
) {
  return `${resolveBlogRuntimeBase(pathname)}${assetPath.replace(/^\/+/, '')}`
}
