const BLOG_GATEWAY_BASE = '/blog/'

export function resolveBlogRuntimeBase(
  pathname = typeof window === 'undefined' ? '/' : window.location.pathname,
) {
  return pathname === '/blog' || pathname.startsWith(BLOG_GATEWAY_BASE) ? BLOG_GATEWAY_BASE : '/'
}

export function resolveBlogRuntimeAssetPath(
  assetPath: string,
  pathname = typeof window === 'undefined' ? '/' : window.location.pathname,
) {
  return `${resolveBlogRuntimeBase(pathname)}${assetPath.replace(/^\/+/, '')}`
}
