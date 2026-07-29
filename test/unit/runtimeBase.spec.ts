import { describe, expect, it } from 'vitest'

import { resolveBlogRuntimeAssetPath, resolveBlogRuntimeBase } from '@/router/runtimeBase'

describe('Blog runtime base', () => {
  it('uses the gateway subpath only when the current document is mounted below /blog', () => {
    expect(resolveBlogRuntimeBase('/')).toBe('/')
    expect(resolveBlogRuntimeBase('/post/hello')).toBe('/')
    expect(resolveBlogRuntimeBase('/blog')).toBe('/blog/')
    expect(resolveBlogRuntimeBase('/blog/')).toBe('/blog/')
    expect(resolveBlogRuntimeBase('/blog/assets/index.js')).toBe('/blog/')
    expect(resolveBlogRuntimeBase('/blogger')).toBe('/')
  })

  it('keeps local public assets inside the active Blog mount', () => {
    expect(resolveBlogRuntimeAssetPath('/blog-assets/avatar.png', '/')).toBe(
      '/blog-assets/avatar.png',
    )
    expect(resolveBlogRuntimeAssetPath('/blog-assets/avatar.png', '/blog/')).toBe(
      '/blog/blog-assets/avatar.png',
    )
  })
})
