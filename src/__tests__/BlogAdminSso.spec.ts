import { describe, expect, it } from 'vitest'

import {
  BLOG_ADMIN_MANAGEMENT_PATH,
  buildBlogAdminSsoUrl,
  isLegacyWordpressAdminHref,
  resolveBlogAdminBaseUrl,
} from '@/factories/blogAdminSsoFactory'

describe('Blog Admin SSO URL factory', () => {
  it('builds a cross-site Admin login bootstrap without exposing a token', () => {
    const href = buildBlogAdminSsoUrl('https://admin.kwitsukasa.top/')
    const url = new URL(href)
    const hashUrl = new URL(url.hash.slice(1), url.origin)

    expect(url.origin).toBe('https://admin.kwitsukasa.top')
    expect(hashUrl.pathname).toBe('/auth/login')
    expect(hashUrl.searchParams.get('sso')).toBe('1')
    expect(hashUrl.searchParams.get('redirect')).toBe(BLOG_ADMIN_MANAGEMENT_PATH)
    expect(href).not.toMatch(/token|credential/i)
  })

  it('uses the configured Admin origin and safe local/production fallbacks', () => {
    expect(
      resolveBlogAdminBaseUrl({
        PROD: true,
        VITE_KT_ADMIN_BASE_URL: 'https://admin.example.com/base/',
      }),
    ).toBe('https://admin.example.com/base/')
    expect(resolveBlogAdminBaseUrl({ PROD: true })).toBe('https://admin.kwitsukasa.top/')
    expect(resolveBlogAdminBaseUrl({ PROD: false })).toBe('http://localhost:5999/')
  })

  it('identifies only legacy WordPress management destinations', () => {
    expect(isLegacyWordpressAdminHref('http://blog.kwitsukasa.top/wp-admin/')).toBe(true)
    expect(isLegacyWordpressAdminHref('/wp-admin')).toBe(true)
    expect(isLegacyWordpressAdminHref('https://blog.kwitsukasa.top/post/wp-admin-migration')).toBe(
      false,
    )
    expect(isLegacyWordpressAdminHref('https://example.com/manage')).toBe(false)
  })
})
