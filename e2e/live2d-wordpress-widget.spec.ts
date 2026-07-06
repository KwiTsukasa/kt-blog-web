/// <reference lib="dom" />

import { expect, test, type Page, type Route } from '@playwright/test';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const LOCAL_MOC_ROOT = path.resolve(process.cwd(), '..', '..', '.kt-workspace', 'live2d-pio', 'runtime-publish', 'moc');
const CONTENT_TYPES = new Map([
  ['.json', 'application/json'],
  ['.moc', 'application/octet-stream'],
  ['.mtn', 'application/json'],
  ['.png', 'image/png'],
]);

test.skip(!existsSync(LOCAL_MOC_ROOT), 'local Pio MOC runtime package is required for widget parity e2e');

/**
 * Resolves a Blog Live2D API request into the local captured WordPress MOC package.
 * @param route Browser route whose request targets `/api/blog/live2d/pio/moc/**`.
 */
async function fulfillLocalMocAsset(route: Route) {
  const url = new URL(route.request().url());
  const relativeAssetPath = decodeURIComponent(url.pathname.replace('/api/blog/live2d/pio/moc/', ''));
  const filePath = path.resolve(LOCAL_MOC_ROOT, relativeAssetPath);
  if (!filePath.startsWith(LOCAL_MOC_ROOT) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    await route.fulfill({ body: 'not found', status: 404 });
    return;
  }

  await route.fulfill({
    body: readFileSync(filePath),
    contentType: CONTENT_TYPES.get(path.extname(filePath).toLowerCase()) ?? 'application/octet-stream',
    status: 200,
  });
}

/**
 * Routes the Pio MOC API to local release artifacts and records runtime console errors.
 * @param page Playwright page that will open Blog Web.
 * @param errors Mutable error list used by assertions after interactions complete.
 */
async function prepareLive2DPage(page: Page, errors: string[]) {
  await page.route('**/api/blog/live2d/pio/moc/**', fulfillLocalMocAsset);
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
}

/**
 * Verifies the restored WordPress Pio widget shell and toolbar interactions on desktop.
 * @param page Playwright page for the local Blog Web app.
 */
async function verifyDesktopWidgetParity({ page }: { page: Page }) {
  const errors: string[] = [];
  await prepareLive2DPage(page, errors);
  await page.setViewportSize({ height: 768, width: 1366 });
  await page.goto('/');

  const widget = page.locator('.waifu.kt-blog__live2d-widget');
  const canvas = page.locator('canvas#live2d.live2d.kt-blog__live2d-canvas');
  await expect(widget).toBeVisible();
  await expect(canvas).toHaveAttribute('width', '280');
  await expect(canvas).toHaveAttribute('height', '250');
  const widgetBox = await widget.boundingBox();
  expect(widgetBox).not.toBeNull();
  expect(Math.round(widgetBox?.x ?? -1)).toBe(0);
  expect(Math.round(768 - ((widgetBox?.y ?? 0) + (widgetBox?.height ?? 0)))).toBe(0);

  await expect(page.locator('.waifu-tool > span')).toHaveCount(8);
  await expect(page.locator('.waifu-tool')).toHaveCSS('opacity', '0');
  await widget.hover();
  await expect(page.locator('.waifu-tool')).toHaveCSS('opacity', '1');

  await page.evaluate(() => {
    const state = window as unknown as { __ktTextureClicks: number };
    state.__ktTextureClicks = 0;
    document.getElementById('live2d-texture-button')?.addEventListener('click', () => {
      state.__ktTextureClicks += 1;
    });
  });
  await page.locator('.waifu-tool .fui-chat').click();
  await expect(page.locator('.gptInput')).toHaveClass(/show/);
  await expect(page.locator('#live2dChatText')).toBeFocused();
  await page.locator('.waifu-tool .fui-eye').click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __ktTextureClicks: number }).__ktTextureClicks),
    )
    .toBe(1);
  await expect
    .poll(() =>
      page.evaluate(() => document.querySelector<HTMLCanvasElement>('canvas#live2d')?.toDataURL('image/png').length ?? 0),
    )
    .toBeGreaterThan(1000);
  await page.locator('.waifu-tool .fui-photo').click();
  await expect(page.locator('.waifu-tips')).toContainText('保存');
  await page.locator('.waifu-tool .fui-info-circle').click();
  await expect(page.locator('.waifu-tips')).toContainText('Pio');
  await page.locator('.waifu-tool .fui-cross').click();
  await expect(widget).toHaveCSS('display', 'none', { timeout: 2000 });
  expect(errors).toEqual([]);
}

/**
 * Verifies mobile viewports do not mount the WordPress runtime below the old plugin threshold.
 * @param page Playwright page for the local Blog Web app.
 */
async function verifyMobileSkipsWidget({ page }: { page: Page }) {
  const errors: string[] = [];
  await prepareLive2DPage(page, errors);
  await page.setViewportSize({ height: 720, width: 768 });
  await page.goto('/');

  await expect(page.locator('.waifu.kt-blog__live2d-widget')).toHaveCount(0);
  await expect(page.locator('canvas#live2d')).toHaveCount(0);
  expect(errors).toEqual([]);
}

test('WordPress Pio widget shell and toolbar interactions match the captured plugin', verifyDesktopWidgetParity);
test('WordPress Pio widget stays disabled at the captured mobile threshold', verifyMobileSkipsWidget);
