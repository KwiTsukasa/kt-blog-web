import process from 'node:process';

import { expect, test, type Page, type TestInfo } from '@playwright/test';

import {
  ARGON_ROUTE_CASES,
  ARGON_VIEWPORTS,
  type ArgonRouteCase,
} from './argonParityMatrix';
import {
  captureAllRouteStates,
  gotoLiveRoute,
  writeArgonArtifact,
} from './argonParityHelpers';

interface PageFixture {
  page: Page;
}

/**
 * Registers live WordPress baseline tests that ensure the external Argon reference is still reachable.
 */
function registerLiveBaselineSuite() {
  test.skip(process.env.ARGON_SKIP_LIVE === '1', 'Live Argon baseline capture is disabled by ARGON_SKIP_LIVE.');

  for (const routeCase of ARGON_ROUTE_CASES) {
    test(`live baseline exposes ${routeCase.routeKey}`, createLiveBaselineTest(routeCase));
  }
}

/**
 * Registers viewport smoke tests for the live Argon home page.
 */
function registerLiveViewportSuite() {
  test.skip(process.env.ARGON_SKIP_LIVE === '1', 'Live Argon viewport capture is disabled by ARGON_SKIP_LIVE.');

  for (const viewport of ARGON_VIEWPORTS) {
    test(`live home viewport ${viewport.name}`, createLiveViewportTest(viewport));
  }
}

/**
 * @param routeCase Captured WordPress route whose title/body semantics should remain stable.
 * @returns Playwright test body that captures compact live snapshots for this route.
 */
function createLiveBaselineTest(routeCase: ArgonRouteCase) {
  /**
   * @param fixtures Playwright page fixture used to visit the live WordPress route.
   * @param testInfo Metadata used to write parity baseline artifacts under `.kt-workspace`.
   */
  return async function runLiveBaselineTest({ page }: PageFixture, testInfo: TestInfo) {
    await gotoLiveRoute(page, routeCase);

    await expect(page).toHaveTitle(routeCase.titlePattern);

    const bodyClass = await page.evaluate(() => document.body.className);
    for (const bodyClassHint of routeCase.bodyClassHints) {
      expect(bodyClass).toContain(bodyClassHint);
    }

    for (const text of routeCase.expectedTexts) {
      await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
    }

    await writeArgonArtifact(testInfo, routeCase.routeKey, await captureAllRouteStates(page, routeCase));
  };
}

/**
 * @param viewport Browser viewport dimensions selected from the Argon capture matrix.
 * @returns Playwright test body that captures live home geometry for this viewport.
 */
function createLiveViewportTest(viewport: (typeof ARGON_VIEWPORTS)[number]) {
  /**
   * @param fixtures Playwright page fixture whose viewport is resized before capture.
   * @param testInfo Metadata used to write viewport evidence under `.kt-workspace`.
   */
  return async function runLiveViewportTest({ page }: PageFixture, testInfo: TestInfo) {
    await page.setViewportSize({ height: viewport.height, width: viewport.width });

    const homeRoute = ARGON_ROUTE_CASES[0];
    await gotoLiveRoute(page, homeRoute);

    const snapshot = await captureAllRouteStates(page, homeRoute);
    await writeArgonArtifact(testInfo, viewport.name, snapshot);

    expect(snapshot[0]?.leftbar?.visible ?? true).toBe(viewport.width >= 768);
  };
}

test.describe('Argon live WordPress baseline', registerLiveBaselineSuite);
test.describe('Argon live viewport baseline', registerLiveViewportSuite);

