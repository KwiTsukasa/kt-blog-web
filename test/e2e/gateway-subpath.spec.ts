import { expect, test } from '@playwright/test'

const BLOG_PREFIX = '/blog/'
const API_PREFIX = '/api/'
const STATIC_FILE_PATTERN = /\.(?:css|gif|ico|jpe?g|js|mjs|png|svg|ttf|woff2?)$/i

test('runs one production build below the gateway Blog prefix without escaping it', async ({
  page,
}) => {
  const apiRequests: string[] = []
  const emittedResourceRequests: string[] = []
  const escapedSameOriginRequests: string[] = []

  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.origin !== 'http://localhost:4173') return

    if (url.pathname.startsWith(API_PREFIX)) {
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

    if (url.pathname.startsWith(API_PREFIX)) {
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
          data: url.pathname.includes('/article/public/list') ? { list: [], total: 0 } : {},
        }),
        contentType: 'application/json',
        status: 200,
      })
      return
    }

    if (
      url.origin === 'http://localhost:4173' &&
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
  await expect(page.locator('main .kt-blog__post-title').first()).toBeVisible()

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
})
