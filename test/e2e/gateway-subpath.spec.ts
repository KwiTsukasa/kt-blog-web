import { expect, test } from '@playwright/test'

const BLOG_PREFIX = '/blog/'
const API_PREFIX = '/api/'
const LOCAL_ORIGIN = 'http://localhost:4173'
const STATIC_FILE_PATTERN = /\.(?:css|gif|ico|jpe?g|js|mjs|png|svg|ttf|woff2?)$/i
const WORDPRESS_REQUEST_PATTERN = /(?:wordpress|wp-json|wp-content|:48088)/i
const GATEWAY_ARTICLE = {
  authorName: 'KT Gateway',
  contentHtml: '<p>Gateway subpath smoke</p>',
  date: '2026-07-29T00:00:00.000Z',
  excerptText: 'Gateway subpath smoke',
  id: 1,
  slug: 'gateway-subpath-smoke',
  title: {
    rendered: 'Gateway Subpath Smoke',
  },
}

test('runs one production build below the gateway Blog prefix without escaping it', async ({
  page,
}) => {
  const apiRequests: string[] = []
  const emittedResourceRequests: string[] = []
  const escapedSameOriginRequests: string[] = []
  const forbiddenFallbackRequests: string[] = []

  page.on('request', (request) => {
    const url = new URL(request.url())
    const isApiRequest = url.pathname.startsWith(API_PREFIX)
    const isWordPressRequest = WORDPRESS_REQUEST_PATTERN.test(
      `${url.host}${url.pathname}`,
    )

    if (isWordPressRequest || (url.origin !== LOCAL_ORIGIN && isApiRequest)) {
      forbiddenFallbackRequests.push(url.toString())
      return
    }

    if (url.origin !== LOCAL_ORIGIN) return

    if (isApiRequest) {
      apiRequests.push(url.pathname)
      return
    }

    if (['font', 'image', 'script', 'stylesheet'].includes(request.resourceType())) {
      emittedResourceRequests.push(url.pathname)
      if (!url.pathname.startsWith(BLOG_PREFIX)) {
        escapedSameOriginRequests.push(url.pathname)
      }
    }
  })

  await page.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const isApiRequest = url.pathname.startsWith(API_PREFIX)
    const isWordPressRequest = WORDPRESS_REQUEST_PATTERN.test(
      `${url.host}${url.pathname}`,
    )

    if (isWordPressRequest || (url.origin !== LOCAL_ORIGIN && isApiRequest)) {
      await route.abort('blockedbyclient')
      return
    }

    if (url.origin === LOCAL_ORIGIN && isApiRequest) {
      if (url.pathname.endsWith('/index.json')) {
        await route.fulfill({
          body: JSON.stringify({
            model: 'model.moc',
            motions: {},
            textures: [],
          }),
          contentType: 'application/json',
          status: 200,
        })
        return
      }

      if (url.pathname.endsWith('.moc')) {
        await route.fulfill({
          body: '',
          contentType: 'application/octet-stream',
          status: 200,
        })
        return
      }

      await route.fulfill({
        body: JSON.stringify({
          data: url.pathname.includes('/article/public/list')
            ? { list: [GATEWAY_ARTICLE], total: 1 }
            : url.pathname.includes('/article/public/detail')
              ? GATEWAY_ARTICLE
              : {},
        }),
        contentType: 'application/json',
        status: 200,
      })
      return
    }

    if (
      url.origin === LOCAL_ORIGIN &&
      url.pathname.startsWith(BLOG_PREFIX) &&
      STATIC_FILE_PATTERN.test(url.pathname)
    ) {
      const rootAssetUrl = new URL(`${url.pathname.slice('/blog'.length)}${url.search}`, url.origin)
      const response = await route.fetch({ url: rootAssetUrl.toString() })
      await route.fulfill({ response })
      return
    }

    await route.continue()
  })

  await page.goto('/blog/#/')
  await expect(page.locator('main .kt-blog__post-title').first()).toHaveText(
    GATEWAY_ARTICLE.title.rendered,
  )
  await expect
    .poll(() => apiRequests.includes('/api/blog/article/public/list'))
    .toBe(true)

  const emittedIndexReferences = await page
    .locator(
      'link[rel~="icon"], link[rel="apple-touch-icon"], meta[name="msapplication-TileImage"], script[type="module"], link[rel="stylesheet"]',
    )
    .evaluateAll((elements) =>
      elements
        .map(
          (element) =>
            element.getAttribute('href') ||
            element.getAttribute('src') ||
            element.getAttribute('content'),
        )
        .filter((value): value is string => Boolean(value)),
    )

  expect(emittedIndexReferences.length).toBeGreaterThan(0)
  expect(emittedIndexReferences.every((value) => value.startsWith('./'))).toBe(true)

  await page.locator('.kt-blog__post-title').first().click()
  await expect(page).toHaveURL(/\/blog\/#\/post\//)
  await expect.poll(() => apiRequests.some((path) => path.includes('/blog/live2d/'))).toBe(true)

  expect(emittedResourceRequests.some((path) => /\.js$/i.test(path))).toBe(true)
  expect(emittedResourceRequests.some((path) => /\.css$/i.test(path))).toBe(true)
  expect(escapedSameOriginRequests).toEqual([])
  expect(forbiddenFallbackRequests).toEqual([])
})
