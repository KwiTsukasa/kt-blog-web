import fs from 'node:fs/promises';
import path from 'node:path';

import { expect, test, type Browser, type Page } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

import { LIVE_BLOG_ORIGIN, LOCAL_ARTIFACT_ROOT } from './argonParityMatrix';
import { sanitizeArtifactName } from './argonParityHelpers';

interface ArgonVisualCase {
  height: number;
  livePath: string;
  localPath: string;
  maxMismatchRatio: number;
  name: string;
  width: number;
}

interface ArgonVisualMetrics {
  articleCount: number;
  articleRect: null | RectLike;
  leftbarRect: null | RectLike;
  rightbarRect: null | RectLike;
  scrollHeight: number;
}

interface RectLike {
  height: number;
  width: number;
  x: number;
  y: number;
}

const VISUAL_CASES: ArgonVisualCase[] = [
  {
    height: 900,
    livePath: '/',
    localPath: '/',
    maxMismatchRatio: 0.08,
    name: 'home-desktop-first-viewport',
    width: 1440,
  },
  {
    height: 1080,
    livePath: '/',
    localPath: '/',
    maxMismatchRatio: 0.08,
    name: 'home-wide-first-viewport',
    width: 1920,
  },
  {
    height: 844,
    livePath: '/',
    localPath: '/',
    maxMismatchRatio: 0.1,
    name: 'home-mobile-first-viewport',
    width: 390,
  },
];

test.describe('Argon visual parity', () => {
  for (const visualCase of VISUAL_CASES) {
    test(`local first viewport matches live Argon: ${visualCase.name}`, async ({ browser }, testInfo) => {
      const livePage = await newVisualPage(browser, visualCase);
      const localPage = await newVisualPage(browser, visualCase);

      await gotoVisualTarget(livePage, new URL(visualCase.livePath, LIVE_BLOG_ORIGIN).toString());
      await gotoVisualTarget(localPage, `/#${visualCase.localPath}`);

      const artifactDir = await ensureVisualArtifactDir(testInfo.project.name, visualCase.name);
      const liveScreenshot = await livePage.screenshot();
      const localScreenshot = await localPage.screenshot();
      const diff = compareScreenshots(liveScreenshot, localScreenshot);
      const liveMetrics = await captureVisualMetrics(livePage);
      const localMetrics = await captureVisualMetrics(localPage);

      await fs.writeFile(path.join(artifactDir, 'live.png'), liveScreenshot);
      await fs.writeFile(path.join(artifactDir, 'local.png'), localScreenshot);
      await fs.writeFile(path.join(artifactDir, 'diff.png'), diff.diffPng);
      await fs.writeFile(
        path.join(artifactDir, 'metrics.json'),
        `${JSON.stringify({ diff: diff.summary, live: liveMetrics, local: localMetrics }, null, 2)}\n`,
        'utf8',
      );

      await livePage.context().close();
      await localPage.context().close();

      expect.soft(localMetrics.articleCount, 'local article count should match live first page density').toBe(
        liveMetrics.articleCount,
      );
      expectRectNear(localMetrics.articleRect, liveMetrics.articleRect, visualCase.width >= 1000 ? 8 : 10, 'article');
      expectRectNear(localMetrics.leftbarRect, liveMetrics.leftbarRect, visualCase.width >= 1000 ? 8 : 20, 'leftbar');

      if (visualCase.width >= 1000) {
        expectRectNear(localMetrics.rightbarRect, liveMetrics.rightbarRect, 8, 'rightbar');
      } else {
        expect.soft(localMetrics.rightbarRect?.width ?? 0, 'mobile rightbar should stay hidden like live Argon').toBe(0);
      }

      expect(diff.summary.mismatchRatio).toBeLessThanOrEqual(visualCase.maxMismatchRatio);
    });
  }
});

/**
 * @param browser Playwright browser used to isolate live and local pages with identical viewport settings.
 * @param visualCase Visual parity case carrying the fixed viewport used for both pages.
 * @returns New page with HTTPS errors ignored for the live WordPress baseline.
 */
async function newVisualPage(browser: Browser, visualCase: ArgonVisualCase) {
  const context = await browser.newContext({
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
    viewport: {
      height: visualCase.height,
      width: visualCase.width,
    },
  });

  return context.newPage();
}

/**
 * @param page Browser page to navigate and stabilize before screenshot capture.
 * @param url Absolute live URL or local hash URL used for parity capture.
 */
async function gotoVisualTarget(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.waitForTimeout(1200);
}

/**
 * @param page Live or local Argon page to sample for visual geometry diagnostics.
 * @returns Geometry metrics that explain a visual diff without relying only on pixels.
 */
async function captureVisualMetrics(page: Page): Promise<ArgonVisualMetrics> {
  return page.evaluate(() => {
    /**
     * @param element Optional DOM element whose viewport rect should be rounded for stable JSON output.
     * @returns Rounded rectangle or null when the element is missing.
     */
    const rectOf = (element: Element | null) => {
      if (!element) {
        return null;
      }

      const rect = element.getBoundingClientRect();

      return {
        height: Math.round(rect.height),
        width: Math.round(rect.width),
        x: Math.round(rect.x),
        y: Math.round(rect.y),
      };
    };

    return {
      articleCount: document.querySelectorAll('article').length,
      articleRect: rectOf(document.querySelector('article')),
      leftbarRect: rectOf(document.querySelector('#leftbar')),
      rightbarRect: rectOf(document.querySelector('#rightbar')),
      scrollHeight: document.documentElement.scrollHeight,
    };
  });
}

/**
 * @param liveScreenshot PNG screenshot captured from live WordPress Argon.
 * @param localScreenshot PNG screenshot captured from local Vue implementation.
 * @returns Pixel diff artifact and mismatch summary for the current viewport.
 */
function compareScreenshots(liveScreenshot: Buffer, localScreenshot: Buffer) {
  const liveImage = PNG.sync.read(liveScreenshot);
  const localImage = PNG.sync.read(localScreenshot);
  const width = Math.min(liveImage.width, localImage.width);
  const height = Math.min(liveImage.height, localImage.height);
  const liveCrop = cropImage(liveImage, width, height);
  const localCrop = cropImage(localImage, width, height);
  const diffImage = new PNG({ height, width });
  const mismatchPixels = pixelmatch(liveCrop.data, localCrop.data, diffImage.data, width, height, {
    threshold: 0.12,
  });
  const totalPixels = width * height;

  return {
    diffPng: PNG.sync.write(diffImage),
    summary: {
      height,
      mismatchPixels,
      mismatchRatio: mismatchPixels / totalPixels,
      totalPixels,
      width,
    },
  };
}

/**
 * @param actual Local rectangle sampled from the Vue implementation.
 * @param expected Live Argon rectangle sampled from WordPress.
 * @param tolerance Allowed CSS-pixel drift for browser/font/scrollbar differences.
 * @param label Human-readable region label used in assertion messages.
 */
function expectRectNear(actual: null | RectLike, expected: null | RectLike, tolerance: number, label: string) {
  expect.soft(actual, `${label} rect should exist locally`).not.toBeNull();
  expect.soft(expected, `${label} rect should exist in live baseline`).not.toBeNull();

  if (!actual || !expected) {
    return;
  }

  for (const field of ['x', 'y', 'width', 'height'] as const) {
    expect
      .soft(Math.abs(actual[field] - expected[field]), `${label}.${field} should be within ${tolerance}px`)
      .toBeLessThanOrEqual(tolerance);
  }
}

/**
 * @param source Source PNG that may be larger than the shared comparison rectangle.
 * @param width Shared comparison width.
 * @param height Shared comparison height.
 * @returns New PNG containing only the top-left shared viewport area.
 */
function cropImage(source: PNG, width: number, height: number) {
  const target = new PNG({ height, width });

  for (let y = 0; y < height; y += 1) {
    const sourceStart = (y * source.width) << 2;
    const sourceEnd = sourceStart + (width << 2);
    const targetStart = (y * width) << 2;
    source.data.copy(target.data, targetStart, sourceStart, sourceEnd);
  }

  return target;
}

/**
 * @param projectName Playwright project name so artifacts stay separated by browser profile.
 * @param caseName Visual case key.
 * @returns Directory used for screenshot and diff artifacts.
 */
async function ensureVisualArtifactDir(projectName: string, caseName: string) {
  const artifactDir = path.join(
    LOCAL_ARTIFACT_ROOT,
    'visual',
    sanitizeArtifactName(projectName),
    sanitizeArtifactName(caseName),
  );
  await fs.mkdir(artifactDir, { recursive: true });

  return artifactDir;
}
