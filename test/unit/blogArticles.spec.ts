import { describe, expect, it } from 'vitest';

import { resolveLocalBlogApiUrl } from '@/api/blogArticles';

const fallbackUrl = '/api/blog/article/public/list';
const unsafeFallbackUrl = '/api/blog/__fallback__';

describe('resolveLocalBlogApiUrl', () => {
  it.each([
    '/api/blog/%2fapi/wordpress/list',
    '/api/blog/%5capi%5cwordpress%5clist',
    '/api/blog/%252fapi%252fwordpress%252flist',
    '/api/blog/%252e%252e%252fwordpress/list',
    '/api/blog/%2e%2e/wordpress/list',
    '/api/blog/../wordpress/list',
    '/api/blog//article/public/list',
    '/api/blogger/article/public/list',
    '/api/blog\\article\\public\\list',
    '//legacy.example.com/api/blog/article/public/list',
    'https://legacy.example.com/api/blog/article/public/list',
    '/api/blog/article/public/list#fragment',
    '/api/blog/article/public/list?preview=1#',
    '/api/blog/article/.\t./public/list',
    '/api/blog/article/.\n./public/list',
    '/api/blog/\u0000article/public/list',
    '/api/blog/article /public/list',
    '/api/blog/article/\u007f/public/list',
  ])('rejects unsafe configured path %s', (configuredUrl) => {
    expect(resolveLocalBlogApiUrl(configuredUrl, unsafeFallbackUrl)).toBe(
      unsafeFallbackUrl,
    );
  });

  it('preserves a safe local Blog path and query', () => {
    expect(
      resolveLocalBlogApiUrl(
        '/api/blog/article/public/list?preview=1&locale=zh-CN',
        fallbackUrl,
      ),
    ).toBe('/api/blog/article/public/list?preview=1&locale=zh-CN');
  });
});
