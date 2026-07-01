import fs from 'node:fs/promises';
import path from 'node:path';

import { expect, type Page, type TestInfo } from '@playwright/test';

import {
  ARGON_PAGE_STATES,
  LIVE_BLOG_ORIGIN,
  LOCAL_ARTIFACT_ROOT,
  type ArgonPageState,
  type ArgonRouteCase,
} from './argonParityMatrix';

export interface ArgonRouteSnapshot {
  bodyClass: string;
  header: {
    backdropFilter: string;
    backgroundColor: string;
    height: number;
    top: number;
  } | null;
  htmlClass: string;
  leftbar: {
    text: string;
    visible: boolean;
    width: number;
  } | null;
  mainText: string;
  rightbar: {
    text: string;
    visible: boolean;
    width: number;
  } | null;
  rootClass: string;
  routeKey: string;
  scrollY: number;
  state: ArgonPageState;
  title: string;
}

/**
 * @param routeCase Argon route case whose WordPress query route should be opened.
 * @returns Absolute live WordPress URL for capture-only baseline checks.
 */
export function toLiveUrl(routeCase: ArgonRouteCase) {
  return new URL(routeCase.livePath, LIVE_BLOG_ORIGIN).toString();
}

/**
 * @param routeCase Argon route case whose local hash route should be opened.
 * @returns Local Vue hash route URL relative to Playwright `baseURL`.
 */
export function toLocalHashUrl(routeCase: ArgonRouteCase) {
  const normalizedLocalPath = routeCase.localPath.startsWith('/')
    ? routeCase.localPath
    : `/${routeCase.localPath}`;

  return `/#${normalizedLocalPath}`;
}

/**
 * @param page Playwright page that will navigate to the live WordPress route.
 * @param routeCase Route case selected from the captured live Argon matrix.
 */
export async function gotoLiveRoute(page: Page, routeCase: ArgonRouteCase) {
  await page.goto(toLiveUrl(routeCase), { waitUntil: 'domcontentloaded' });
  await waitForArgonPage(page);
}

/**
 * @param page Playwright page that will navigate to the local Vue route.
 * @param routeCase Route case selected from the Argon parity matrix.
 */
export async function gotoLocalRoute(page: Page, routeCase: ArgonRouteCase) {
  await page.goto(toLocalHashUrl(routeCase), { waitUntil: 'domcontentloaded' });
  await waitForArgonPage(page);
}

/**
 * @param page Browser page whose Argon root should be visible before assertions.
 */
export async function waitForArgonPage(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await expect(page.locator('.kt-blog, body.wp-theme-argon').first()).toBeVisible();
}

/**
 * @param page Browser page to position at the same logical scroll state used by live capture.
 * @param state Logical page state: top, middle, or bottom.
 */
export async function scrollToArgonState(page: Page, state: ArgonPageState) {
  if (state === 'top') {
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  if (state === 'middle') {
    await page.evaluate(() => window.scrollTo(0, Math.round(window.innerHeight * 0.65)));
  }
  if (state === 'bottom') {
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  }

  await page.waitForTimeout(180);
}

/**
 * @param page Browser page whose visual and semantic route state should be sampled.
 * @param routeCase Route case being captured; stored in artifact output for traceability.
 * @param state Logical scroll state being captured.
 * @returns Small JSON-serializable snapshot for comparing local output with live Argon behavior.
 */
export async function captureRouteSnapshot(
  page: Page,
  routeCase: ArgonRouteCase,
  state: ArgonPageState,
): Promise<ArgonRouteSnapshot> {
  await scrollToArgonState(page, state);

  return page.evaluate(
    ({ routeKey, stateName }) => {
      const root = document.querySelector<HTMLElement>('.kt-blog');
      const header = document.querySelector<HTMLElement>('.kt-blog__header-navbar, #navbar-main');
      const leftbar = document.querySelector<HTMLElement>('.kt-blog__sidebar, #leftbar');
      const rightbar = document.querySelector<HTMLElement>('.kt-blog__rightbar, #rightbar');
      const main = document.querySelector<HTMLElement>('.kt-blog__main, main');

      /**
       * @param element Optional element whose geometry and text should be summarized.
       * @returns A compact widget summary that is stable enough for parity diagnostics.
       */
      const captureWidget = (element: HTMLElement | null) => {
        if (!element) {
          return null;
        }

        const rect = element.getBoundingClientRect();

        return {
          text: element.innerText.replace(/\s+/g, ' ').slice(0, 220),
          visible: rect.width > 0 && rect.height > 0,
          width: Math.round(rect.width),
        };
      };

      const headerRect = header?.getBoundingClientRect();
      const headerStyle = header ? getComputedStyle(header) : null;

      return {
        bodyClass: document.body.className,
        header:
          header && headerRect && headerStyle
            ? {
                backdropFilter: headerStyle.backdropFilter,
                backgroundColor: headerStyle.backgroundColor,
                height: Math.round(headerRect.height),
                top: Math.round(headerRect.top),
              }
            : null,
        htmlClass: document.documentElement.className,
        leftbar: captureWidget(leftbar),
        mainText: (main?.innerText || document.body.innerText).replace(/\s+/g, ' ').slice(0, 500),
        rightbar: captureWidget(rightbar),
        rootClass: root?.className || '',
        routeKey,
        scrollY: Math.round(window.scrollY),
        state: stateName,
        title: document.title,
      };
    },
    {
      routeKey: routeCase.routeKey,
      stateName: state,
    },
  );
}

/**
 * @param page Local Blog Web page after route navigation.
 * @param routeCase Expected Argon route contract for the current local route.
 */
export async function expectLocalRouteContract(page: Page, routeCase: ArgonRouteCase) {
  const root = page.locator('.kt-blog');
  await expect(root).toBeVisible();
  await expect(root).toHaveClass(/kt-blog--wp-argon/);
  await expect(root).toHaveClass(new RegExp(`kt-blog--${routeCase.kind}`));

  await expect(page).toHaveTitle(routeCase.titlePattern);

  for (const text of routeCase.expectedTexts) {
    await expectVisibleBodyText(page, text);
  }

  await expect(page.locator('.kt-blog__header-navbar')).toBeVisible();
  await expect(page.locator('.kt-blog__main')).toBeVisible();
}

/**
 * @param page Local Blog Web page after route navigation.
 * @param text Text captured from the live route contract.
 */
async function expectVisibleBodyText(page: Page, text: string) {
  await expect
    .poll(() => page.evaluate((expectedText) => document.body.innerText.includes(expectedText), text))
    .toBe(true);
}

/**
 * @param page Local or live Blog page to capture across all top/middle/bottom states.
 * @param routeCase Route case being captured.
 * @returns Three route snapshots keyed by Argon logical page state.
 */
export async function captureAllRouteStates(page: Page, routeCase: ArgonRouteCase) {
  const snapshots: ArgonRouteSnapshot[] = [];

  for (const state of ARGON_PAGE_STATES) {
    snapshots.push(await captureRouteSnapshot(page, routeCase, state));
  }

  return snapshots;
}

/**
 * @param testInfo Playwright test metadata used to place artifacts under the project output folder.
 * @param name Stable artifact filename without extension.
 * @param payload JSON-serializable payload to write for later screenshot/metric comparison.
 */
export async function writeArgonArtifact(testInfo: TestInfo, name: string, payload: unknown) {
  const artifactDir = path.join(LOCAL_ARTIFACT_ROOT, testInfo.project.name, sanitizeArtifactName(testInfo.title));
  await fs.mkdir(artifactDir, { recursive: true });
  await fs.writeFile(path.join(artifactDir, `${name}.json`), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

/**
 * @param rawName Raw title or route key that may contain punctuation unsafe for filenames.
 * @returns Filesystem-safe artifact name segment.
 */
export function sanitizeArtifactName(rawName: string) {
  return rawName.replace(/[^\p{Letter}\p{Number}._-]+/gu, '-').replace(/^-+|-+$/g, '');
}
