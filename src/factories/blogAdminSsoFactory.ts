interface BlogAdminEnvironment {
  PROD?: boolean
  VITE_KT_ADMIN_BASE_URL?: string
}

const LOCAL_ADMIN_BASE_URL = 'http://localhost:5999/'
const PRODUCTION_ADMIN_BASE_URL = 'https://admin.kwitsukasa.top/'
const ADMIN_SSO_LOGIN_PATH = '/auth/login'

export const BLOG_ADMIN_MANAGEMENT_PATH = '/blog/article'

/**
 * Resolves the KT Admin origin used by the Blog management entry.
 * @param env Vite environment values; a configured HTTP(S) URL wins over the local/production default.
 * @returns Absolute KT Admin base URL.
 */
export function resolveBlogAdminBaseUrl(env: BlogAdminEnvironment = import.meta.env) {
  const configured = env.VITE_KT_ADMIN_BASE_URL?.trim()
  const fallback = env.PROD ? PRODUCTION_ADMIN_BASE_URL : LOCAL_ADMIN_BASE_URL

  if (!configured) return fallback

  try {
    const url = new URL(configured)
    return /^https?:$/.test(url.protocol) ? url.toString() : fallback
  } catch {
    return fallback
  }
}

/**
 * Builds the cross-site Admin SSO bootstrap URL for Blog article management.
 * @param adminBaseUrl Absolute KT Admin base URL; defaults to the Vite environment contract.
 * @returns Token-free top-level navigation URL targeting the Admin SSO bootstrap.
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
 * Detects the legacy WordPress dashboard destination that remote Argon theme data may still expose.
 * @param href Normalized sidebar destination, absolute or site-relative.
 * @returns Whether the destination is the WordPress administration root or one of its descendants.
 */
export function isLegacyWordpressAdminHref(href: string) {
  try {
    const pathname = new URL(href, 'https://blog.invalid/').pathname.replace(/\/+$/g, '')
    return pathname === '/wp-admin' || pathname.startsWith('/wp-admin/')
  } catch {
    return false
  }
}
