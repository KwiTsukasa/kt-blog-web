interface BlogAdminEnvironment {
  PROD?: boolean
  VITE_KT_ADMIN_BASE_URL?: string
}

const LOCAL_ADMIN_BASE_URL = 'http://localhost:5999/'
const PRODUCTION_ADMIN_BASE_URL = 'https://admin.kwitsukasa.top/'
const ADMIN_SSO_LOGIN_PATH = '/auth/login'

export const BLOG_ADMIN_MANAGEMENT_PATH = '/blog/article'

/**
 * 管理端基址根据环境配置解析相对或 HTTP(S) 地址，空值、协议错误和无效 URL 回退部署默认值。
 * @param env - 提供生产标记及可选 KT Admin 地址的前端环境。
 * @param currentOrigin - 相对管理地址解析时使用的当前站点来源；服务端缺省为空。
 * @returns 可用于跨入口导航的绝对管理端 URL。
 */
export function resolveBlogAdminBaseUrl(
  env: BlogAdminEnvironment = import.meta.env,
  currentOrigin = (() => {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.location.origin
  })(),
) {
  const configured = env.VITE_KT_ADMIN_BASE_URL?.trim()
  const fallback = (() => {
    if (env.PROD) {
      return PRODUCTION_ADMIN_BASE_URL
    }
    return LOCAL_ADMIN_BASE_URL
  })()

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
    if (/^https?:$/.test(url.protocol)) {
      return url.toString()
    }
    return fallback
  } catch {
    return fallback
  }
}

/**
 * 文章管理地址把 SSO 标记与固定回跳路由写入 Admin hash 登录页，并丢弃基址原查询参数。
 * @param adminBaseUrl - 管理端绝对基址，省略时按当前环境解析。
 * @returns 登录成功后跳转文章管理页的 Admin SSO URL。
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
 * @param href - 待规范化或导航的链接地址。
 * @returns 链接是否指向需要迁移的旧 Blog 管理入口；URL 无效时为 false。
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
