/// <reference lib="dom" />

import { expect, test, type Page, type Route } from '@playwright/test'
import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const LOCAL_RUNTIME_ROOT = path.resolve(
  process.cwd(),
  '..',
  '..',
  '.kt-workspace',
  'live2d-pio',
  'runtime-publish',
)
const LOCAL_PIO_MOC_ROOT = path.resolve(LOCAL_RUNTIME_ROOT, 'moc')
const LOCAL_TIA_MOC_ROOT = path.resolve(LOCAL_RUNTIME_ROOT, 'tia', 'moc')
const LOCAL_BLOG_IMAGE_ROOT = path.resolve(process.cwd(), 'public', 'blog-assets')
const CONTENT_TYPES = new Map([
  ['.json', 'application/json'],
  ['.moc', 'application/octet-stream'],
  ['.mtn', 'application/json'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
])

test.skip(
  !existsSync(LOCAL_PIO_MOC_ROOT) || !existsSync(LOCAL_TIA_MOC_ROOT),
  'local Pio/Tia MOC runtime packages are required for widget parity e2e',
)

/**
 * Resolves the local MOC asset root for one Blog Live2D character key.
 * @param characterKey Character segment captured from `/api/blog/live2d/:character/moc/**`.
 * @returns Absolute local directory containing the matching MOC runtime assets, or null for unknown keys.
 */
function resolveLocalMocRoot(characterKey: string): string | null {
  if (characterKey === 'pio') {
    return LOCAL_PIO_MOC_ROOT
  }
  if (characterKey === 'tia') {
    return LOCAL_TIA_MOC_ROOT
  }
  return null
}

/**
 * Resolves external WordPress image URLs to local fallback assets so Live2D parity tests
 * do not depend on the object storage health of unrelated page chrome.
 * @param url Parsed request URL for a public blog image.
 * @returns Absolute local image path when the image has a tracked fallback, otherwise null.
 */
function resolveLocalBlogImagePath(url: URL): string | null {
  if (url.hostname !== 's3.kwitsukasa.top') {
    return null
  }
  if (url.pathname === '/images/avatar-tsukasa-1.jpg') {
    return path.resolve(LOCAL_BLOG_IMAGE_ROOT, 'avatar-tsukasa-1.jpg')
  }
  if (decodeURIComponent(url.pathname) === '/images/bg-冬滚滚.png') {
    return path.resolve(LOCAL_BLOG_IMAGE_ROOT, 'bg-donggungun.png')
  }
  return null
}

/**
 * Resolves a Blog Live2D API request into the local captured WordPress MOC package.
 * @param route Browser route whose request targets `/api/blog/live2d/:character/moc/**`.
 */
async function fulfillLocalMocAsset(route: Route) {
  const url = new URL(route.request().url())
  const match = url.pathname.match(/^\/api\/blog\/live2d\/([^/]+)\/moc\/(.+)$/)
  const localMocRoot = match ? resolveLocalMocRoot(match[1]) : null
  if (!localMocRoot) {
    await route.fulfill({ body: 'not found', status: 404 })
    return
  }
  const relativeAssetPath = decodeURIComponent(match?.[2] ?? '')
  const filePath = path.resolve(localMocRoot, relativeAssetPath)
  if (!filePath.startsWith(localMocRoot) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    await route.fulfill({ body: 'not found', status: 404 })
    return
  }

  await route.fulfill({
    body: readFileSync(filePath),
    contentType:
      CONTENT_TYPES.get(path.extname(filePath).toLowerCase()) ?? 'application/octet-stream',
    status: 200,
  })
}

/**
 * Fulfills captured WordPress chrome images from checked-in fallbacks during Live2D e2e.
 * @param route Browser route whose request targets the historical S3 image origin.
 */
async function fulfillLocalBlogImageAsset(route: Route) {
  const filePath = resolveLocalBlogImagePath(new URL(route.request().url()))
  if (!filePath || !filePath.startsWith(LOCAL_BLOG_IMAGE_ROOT) || !existsSync(filePath)) {
    await route.continue()
    return
  }

  await route.fulfill({
    body: readFileSync(filePath),
    contentType:
      CONTENT_TYPES.get(path.extname(filePath).toLowerCase()) ?? 'application/octet-stream',
    status: 200,
  })
}

/**
 * Preserves WebGL drawing-buffer pixels so the E2E can inspect a completed rendered frame.
 */
function installPreservedWebGLDrawingBuffer(): void {
  type CanvasContextGetter = (
    this: HTMLCanvasElement,
    contextId: string,
    options?: Record<string, unknown>,
  ) => unknown
  const originalGetContext = HTMLCanvasElement.prototype.getContext as unknown as CanvasContextGetter
  const canvasPrototype = HTMLCanvasElement.prototype as unknown as {
    getContext: CanvasContextGetter
  }

  /**
   * Delegates canvas context creation while enabling pixel retention only for WebGL contexts.
   * @param contextId Browser canvas context identifier.
   * @param options Caller-provided context attributes.
   * @returns Canvas rendering context returned by the browser.
   */
  canvasPrototype.getContext = function getContextWithPreservedBuffer(
    contextId: string,
    options?: Record<string, unknown>,
  ): unknown {
    const contextOptions =
      contextId === 'webgl' || contextId === 'experimental-webgl'
        ? { ...options, preserveDrawingBuffer: true }
        : options
    return originalGetContext.call(this, contextId, contextOptions)
  }
}

/**
 * Routes the Pio/Tia MOC API to local release artifacts and records runtime console errors.
 * @param page Playwright page that will open Blog Web.
 * @param errors Mutable error list used by assertions after interactions complete.
 * @param scriptRequests Mutable list that records old runtime script requests.
 * @param assetRequests Mutable list that records requested Live2D API asset paths.
 */
async function prepareLive2DPage(
  page: Page,
  errors: string[],
  scriptRequests: string[] = [],
  assetRequests: string[] = [],
) {
  await page.addInitScript(installPreservedWebGLDrawingBuffer)
  await page.route('https://s3.kwitsukasa.top/images/*', fulfillLocalBlogImageAsset)
  await page.route('**/api/blog/live2d/*/moc/**', fulfillLocalMocAsset)
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.pathname.startsWith('/api/blog/live2d/')) {
      assetRequests.push(url.pathname)
    }
    if (request.url().includes('/live2d/wordpress-moc/live2d.min.js')) {
      scriptRequests.push(request.url())
    }
  })
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text())
    }
  })
}

/**
 * Clicks one WordPress Live2D toolbar icon while keeping the hover-only toolbar expanded.
 * @param page Playwright page that owns the widget under test.
 * @param toolSelector CSS selector for the toolbar icon being exercised.
 */
async function clickLive2DToolbarIcon(page: Page, toolSelector: string) {
  const widget = page.locator('.waifu.kt-blog__live2d-widget')
  const toolbar = page.locator('.waifu-tool')
  const toolButton = toolbar.locator(toolSelector)

  await widget.hover()
  await expect(toolbar).toHaveCSS('opacity', '1')
  await expect(toolButton).toBeVisible()
  await toolButton.click({ force: true })
}

/**
 * Verifies the restored WordPress Pio widget shell and toolbar interactions on desktop.
 * @param page Playwright page for the local Blog Web app.
 */
async function verifyDesktopWidgetParity({ page }: { page: Page }) {
  const errors: string[] = []
  const scriptRequests: string[] = []
  const assetRequests: string[] = []
  await prepareLive2DPage(page, errors, scriptRequests, assetRequests)
  await page.setViewportSize({ height: 768, width: 1366 })
  await page.goto('/')

  const widget = page.locator('.waifu.kt-blog__live2d-widget')
  const canvas = page.locator('canvas#live2d.live2d.kt-blog__live2d-canvas')
  await expect(widget).toBeVisible()
  await expect(canvas).toHaveAttribute('width', '280')
  await expect(canvas).toHaveAttribute('height', '250')
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('kt-blog-live2d:model')))
    .toBe('pio')
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.querySelector<HTMLCanvasElement>('canvas#live2d')?.toDataURL('image/png')
            .length ?? 0,
      ),
    )
    .toBeGreaterThan(5000)
  const widgetBox = await widget.boundingBox()
  expect(widgetBox).not.toBeNull()
  expect(Math.round(widgetBox?.x ?? -1)).toBe(0)
  expect(Math.round(768 - ((widgetBox?.y ?? 0) + (widgetBox?.height ?? 0)))).toBe(0)

  await expect(page.locator('.waifu-tool > span')).toHaveCount(8)
  await expect(page.locator('.waifu-tool')).toHaveCSS('opacity', '0')
  await widget.hover()
  await expect(page.locator('.waifu-tool')).toHaveCSS('opacity', '1')
  await page.mouse.move(1180, 120)
  await clickLive2DToolbarIcon(page, '.fui-chat')
  await expect(page.locator('.gptInput')).toHaveClass(/show/)
  await expect(page.locator('#live2dChatText')).toBeFocused()
  await clickLive2DToolbarIcon(page, '.fui-user')
  const modelPicker = page.locator('.kt-blog__modal-host--open.kt-blog__live2d-picker-modal')
  await expect(modelPicker).toContainText('选择看板娘')
  await modelPicker.locator('.kt-blog__live2d-picker-option', { hasText: 'Tia' }).click()
  await expect(modelPicker).toHaveCount(0)
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('kt-blog-live2d:model')))
    .toBe('tia')
  await clickLive2DToolbarIcon(page, '.fui-eye')
  const texturePicker = page.locator('.kt-blog__modal-host--open.kt-blog__live2d-picker-modal')
  await expect(texturePicker).toContainText('选择服装')
  await texturePicker.locator('.kt-blog__live2d-picker-option').nth(1).click()
  await expect(texturePicker).toHaveCount(0)
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.querySelector<HTMLCanvasElement>('canvas#live2d')?.toDataURL('image/png')
            .length ?? 0,
      ),
    )
    .toBeGreaterThan(5000)
  await clickLive2DToolbarIcon(page, '.fui-photo')
  await expect(page.locator('.waifu-tips')).toContainText('保存')
  await clickLive2DToolbarIcon(page, '.fui-info-circle')
  await expect(page.locator('.waifu-tips')).toContainText('Pio')
  await clickLive2DToolbarIcon(page, '.fui-cross')
  await expect(widget).toHaveCSS('display', 'none', { timeout: 2000 })
  expect(
    assetRequests.some((requestPath) => requestPath === '/api/blog/live2d/pio/moc/index.json'),
  ).toBe(true)
  expect(
    assetRequests.some((requestPath) => requestPath === '/api/blog/live2d/tia/moc/index.json'),
  ).toBe(true)
  expect(
    assetRequests.some((requestPath) =>
      requestPath.startsWith('/api/blog/live2d/tia/moc/textures/'),
    ),
  ).toBe(true)
  expect(scriptRequests).toEqual([])
  expect(errors).toEqual([])
}

/**
 * Verifies mobile viewports do not mount the WordPress runtime below the old plugin threshold.
 * @param page Playwright page for the local Blog Web app.
 */
async function verifyMobileSkipsWidget({ page }: { page: Page }) {
  const errors: string[] = []
  await prepareLive2DPage(page, errors)
  await page.setViewportSize({ height: 720, width: 768 })
  await page.goto('/')

  await expect(page.locator('.waifu.kt-blog__live2d-widget')).toHaveCount(0)
  await expect(page.locator('canvas#live2d')).toHaveCount(0)
  expect(errors).toEqual([])
}

test(
  'WordPress Pio widget shell and toolbar interactions match the captured plugin',
  verifyDesktopWidgetParity,
)
test(
  'WordPress Pio widget stays disabled at the captured mobile threshold',
  verifyMobileSkipsWidget,
)
