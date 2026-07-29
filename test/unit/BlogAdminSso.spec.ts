import { describe, expect, it } from 'vitest'

import {
  BLOG_ADMIN_MANAGEMENT_PATH,
  buildBlogAdminSsoUrl,
  isLegacyBlogManagementHref,
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

  it('resolves the gateway Admin path against the current dynamic origin', () => {
    const origin = 'https://nas4.kwitsukasa.top:45123'
    const adminBaseUrl = resolveBlogAdminBaseUrl(
      {
        PROD: true,
        VITE_KT_ADMIN_BASE_URL: '/admin/',
      },
      origin,
    )

    expect(adminBaseUrl).toBe(`${origin}/admin/`)
    expect(buildBlogAdminSsoUrl(adminBaseUrl)).toBe(
      `${origin}/admin/#/auth/login?sso=1&redirect=%2Fblog%2Farticle`,
    )
  })

  it('identifies legacy WordPress and in-site management destinations', () => {
    expect(isLegacyBlogManagementHref('http://blog.kwitsukasa.top/wp-admin/')).toBe(true)
    expect(isLegacyBlogManagementHref('/wp-admin')).toBe(true)
    expect(isLegacyBlogManagementHref('#/admin')).toBe(true)
    expect(isLegacyBlogManagementHref('https://blog.kwitsukasa.top/#/admin/settings')).toBe(true)
    expect(isLegacyBlogManagementHref('/admin')).toBe(true)
    expect(isLegacyBlogManagementHref('https://blog.kwitsukasa.top/post/wp-admin-migration')).toBe(
      false,
    )
    expect(isLegacyBlogManagementHref('https://example.com/manage')).toBe(false)
  })
})
