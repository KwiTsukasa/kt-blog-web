interface BlogAdminEnvironment {
  PROD?: boolean
  VITE_KT_ADMIN_BASE_URL?: string
}

const LOCAL_ADMIN_BASE_URL = 'http://localhost:5999/'
const PRODUCTION_ADMIN_BASE_URL = 'https://admin.kwitsukasa.top/'
const ADMIN_SSO_LOGIN_PATH = '/auth/login'

export const BLOG_ADMIN_MANAGEMENT_PATH = '/blog/article'

/**
 * 解析 Blog 管理入口使用的 KT Admin 基址。
 * @param env Vite 环境变量；受控的根相对路径或 HTTP(S) 绝对地址优先于环境默认值。
 * @param currentOrigin 当前页面的 origin，用于保留统一网关的动态 Host 与端口。
 * @returns KT Admin 绝对基址。
 */
export function resolveBlogAdminBaseUrl(
  env: BlogAdminEnvironment = import.meta.env,
  currentOrigin = typeof window === 'undefined' ? '' : window.location.origin,
) {
  const configured = env.VITE_KT_ADMIN_BASE_URL?.trim()
  const fallback = env.PROD ? PRODUCTION_ADMIN_BASE_URL : LOCAL_ADMIN_BASE_URL

  if (!configured) return fallback

  if (configured.startsWith('/') && !configured.startsWith('//')) {
    try {
      return new URL(configured, new URL(currentOrigin).origin).toString()
    } catch {
      return fallback
    }
  }

  if (!/^https?:\/\//i.test(configured)) return fallback

  try {
    const url = new URL(configured)
    return /^https?:$/.test(url.protocol) ? url.toString() : fallback
  } catch {
    return fallback
  }
}

/**
 * 构建 Blog 文章管理使用的跨入口 Admin SSO 地址。
 * @param adminBaseUrl KT Admin 绝对基址，默认遵循 Vite 环境契约。
 * @returns 不携带 token、指向 Admin SSO 启动页的顶层跳转地址。
 */
export function buildBlogAdminSsoUrl(adminBaseUrl = resolveBlogAdminBaseUrl()) {
  const url = new URL(adminBaseUrl)
  const query = new URLSearchParams({
    sso: '1',
    redirect: BLOG_ADMIN_MANAGEMENT_PATH,
  })

  url.search = ''
  url.hash = `${ADMIN_SSO_LOGIN_PATH}?${query.toString()}`
  return url.toString()
}

/**
 * 识别远端 Argon 主题数据仍可能返回的历史 Blog 管理入口。
 * @param href 已规范化的侧栏地址，可以是绝对地址或站内相对地址。
 * @returns 该地址是否为旧 WordPress 或站内 Blog 管理路由。
 */
export function isLegacyBlogManagementHref(href: string) {
  try {
    const url = new URL(href, 'https://blog.invalid/')
    const pathname = url.pathname.replace(/\/+$/g, '')
    const hashParts = url.hash.replace(/^#/, '').split('?')
    const hashPath = (hashParts[0] || '').replace(/\/+$/g, '')

    return [pathname, hashPath].some(
      (path) =>
        path === '/admin' ||
        path.startsWith('/admin/') ||
        path === '/wp-admin' ||
        path.startsWith('/wp-admin/'),
    )
  } catch {
    return false
  }
}
