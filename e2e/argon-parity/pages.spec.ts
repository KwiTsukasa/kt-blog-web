import { expect, test, type Page, type TestInfo } from '@playwright/test';

import {
  ARGON_ROUTE_CASES,
  ARGON_VIEWPORTS,
  type ArgonRouteCase,
  type ArgonViewportCase,
} from './argonParityMatrix';
import {
  captureAllRouteStates,
  expectLocalRouteContract,
  gotoLocalRoute,
  writeArgonArtifact,
} from './argonParityHelpers';

interface PageFixture {
  page: Page;
}

/**
 * Registers the full route matrix against the local Vue implementation.
 */
function registerLocalRouteSuite() {
  for (const routeCase of ARGON_ROUTE_CASES) {
    test(`local route matches Argon contract: ${routeCase.routeKey}`, createLocalRouteTest(routeCase));
  }
}

/**
 * Registers layout geometry checks for representative desktop and mobile viewports.
 */
function registerLocalLayoutSuite() {
  for (const viewport of ARGON_VIEWPORTS) {
    test(`local home layout matches Argon viewport: ${viewport.name}`, createLocalLayoutTest(viewport));
  }
}

/**
 * Registers negative checks for local features that must stay disabled because live WordPress does not expose them.
 */
function registerLocalFeatureParitySuite() {
  test('local home does not expose WordPress-disabled feature entries', createHomeDisabledFeatureTest());
  test('local home sidebar geometry matches live Argon leftbar card', createHomeSidebarGeometryTest());
  test('local home sidebar colors follow live Argon theme variables across modes', createHomeSidebarThemeTest());
  test('local header stays fixed while leftbar follows live no-headroom scroll behavior', createNoHeadroomScrollTest());
  test('local header search and footer theme surfaces match live Argon', createHeaderSearchFooterThemeTest());
  test('local desktop routes do not create a horizontal scrollbar', createNoHorizontalOverflowTest());
  test('local archive page-info cards match live Argon width and semantics', createPageInfoGeometryTest());
  test('local rightbar and term archive counts match live Argon data semantics', createRightbarTermDataSemanticsTest());
  test('local search page keeps the live Argon result surface without an extra form', createSearchDisabledFeatureTest());
  test('local newest post does not create circular next links or recommendation blocks', createNewestPostFeatureTest());
  test('local post bottom sections keep live Argon order and compact share row', createPostBottomOrderTest());
}

/**
 * @param routeCase Local route case that should expose the same semantic page as the live Argon route.
 * @returns Playwright test body that records local snapshots and checks route-level parity.
 */
function createLocalRouteTest(routeCase: ArgonRouteCase) {
  /**
   * @param fixtures Playwright page fixture used to open the local hash route.
   * @param testInfo Metadata used to persist route snapshots under `.kt-workspace`.
   */
  return async function runLocalRouteTest({ page }: PageFixture, testInfo: TestInfo) {
    await gotoLocalRoute(page, routeCase);
    await writeArgonArtifact(testInfo, routeCase.routeKey, await captureAllRouteStates(page, routeCase));
    await expectLocalRouteContract(page, routeCase);
  };
}

/**
 * @param viewport Viewport dimensions used by the live Argon capture matrix.
 * @returns Playwright test body that validates local layout regions do not collapse or drift.
 */
function createLocalLayoutTest(viewport: ArgonViewportCase) {
  /**
   * @param fixtures Playwright page fixture used to inspect responsive geometry.
   * @param testInfo Metadata used to persist geometry snapshots under `.kt-workspace`.
   */
  return async function runLocalLayoutTest({ page }: PageFixture, testInfo: TestInfo) {
    const homeRoute = ARGON_ROUTE_CASES[0];
    await page.setViewportSize({ height: viewport.height, width: viewport.width });
    await gotoLocalRoute(page, homeRoute);

    const snapshot = await captureAllRouteStates(page, homeRoute);
    await writeArgonArtifact(testInfo, viewport.name, snapshot);

    const main = page.locator('.kt-blog__main');
    const header = page.locator('.kt-blog__header-navbar');
    await expect(main).toBeVisible();
    await expect(header).toBeVisible();

    const mainBox = await main.boundingBox();
    const sidebarBox = await page.locator('.kt-blog__sidebar').boundingBox();
    const rightbarBox = await page.locator('.kt-blog__rightbar').boundingBox();

    expect(mainBox?.width ?? 0).toBeGreaterThan(viewport.width >= 768 ? 700 : 300);
    if (viewport.width >= 1200) {
      expect(sidebarBox?.width ?? 0).toBeGreaterThanOrEqual(240);
      expect(rightbarBox?.width ?? 0).toBeGreaterThanOrEqual(240);
    }
  };
}

/**
 * @returns Playwright body that checks homepage-only disabled feature entries and required semantic icons.
 */
function createHomeDisabledFeatureTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect the local homepage.
   */
  return async function runHomeDisabledFeatureTest({ page }: PageFixture) {
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0]);

    await expect(page.locator('#leftbar_tab_catalog_btn')).toHaveCount(0);
    await expect(page.locator('#leftbar_tab_overview_btn')).toHaveCount(1);
    await expect(page.locator('#leftbar_part2_inner > .nav-wrapper')).toHaveCSS('display', 'none');
    await expect(page.locator('.kt-blog__sidebar-overview-title')).toHaveCount(0);
    await expect(page.locator('.kt-blog__header-nav--hover .kt-blog__header-nav-link')).toHaveCount(0);
    await expect(page.locator('.kt-blog__sidebar-menu-icon.fa-solid.fa-home')).toBeVisible();
    await expect(page.locator('.kt-blog__sidebar-menu-icon.fa-solid.fa-user')).toBeVisible();
    await expect(page.locator('.kt-blog__float-action--theme')).toHaveCount(0);
    await expect(page.locator('.kt-blog__float-action--comment')).toHaveCount(0);
    await expect(page.locator('#leftbar_tab_overview')).toContainText('4 标签');
    await expect(page.locator('#rightbar')).toContainText('您尚未收到任何评论。');
    await expect(page.locator('body')).not.toContainText('KT Admin 发表在');
    await expect(page.locator('body')).not.toContainText('NestJS');
  };
}

/**
 * @returns Playwright body that pins the live desktop leftbar geometry for the first sidebar stack.
 */
function createHomeSidebarGeometryTest() {
  /**
   * @param fixtures Playwright page fixture used to measure the local homepage sidebar.
   */
  return async function runHomeSidebarGeometryTest({ page }: PageFixture) {
    await page.setViewportSize({ height: 900, width: 1440 });
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0]);

    const leftbar = page.locator('#leftbar');
    const firstPanel = page.locator('.kt-blog__sidebar-panel--menu');
    const banner = page.locator('.kt-blog__sidebar-banner');
    const menu = page.locator('.kt-blog__sidebar-menu');
    const search = page.locator('.kt-blog__sidebar-search');
    const searchButton = page.locator('#leftbar_search_container');
    const overview = page.locator('.kt-blog__sidebar-panel--overview');
    const firstMenuLink = page.locator('.kt-blog__sidebar-menu-item a').first();
    const bannerTitle = page.locator('.kt-blog__sidebar-banner-title');

    await expect(leftbar).toBeVisible();
    await expectRect(leftbar, { height: 492, width: 280, x: 5 });
    await expectRect(firstPanel, { height: 230, width: 250 });
    await expectRect(banner, { height: 78, width: 250 });
    await expect(banner).toHaveCSS('display', 'block');
    await expectRect(bannerTitle, { height: 30, width: 202 });
    await expect(bannerTitle).toHaveCSS('display', 'block');
    await expect(bannerTitle).toHaveCSS('font-size', '20px');
    await expect(bannerTitle).toHaveCSS('font-weight', '400');
    await expectRect(menu, { height: 72, width: 250 });
    await expect(menu).toHaveCSS('margin', '10px 0px 16px');
    await expectRect(firstMenuLink, { height: 36 });
    await expectRect(search, { height: 54, width: 250 });
    await expect(search).toHaveCSS('padding', '0px 24px 24px');
    await expectRect(searchButton, { height: 30, width: 202 });
    await expect(searchButton).toHaveCSS('padding', '4px 8px');
    await expectRect(overview, { height: 252, width: 250 });
  };
}

/**
 * @returns Playwright body that locks the current live site's no-headroom scroll behavior.
 */
function createNoHeadroomScrollTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect header and leftbar scroll states.
   */
  return async function runNoHeadroomScrollTest({ page }: PageFixture) {
    await page.setViewportSize({ height: 900, width: 1440 });
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0]);

    const header = page.locator('#navbar-main');
    const overviewPanel = page.locator('.kt-blog__sidebar-panel--overview');

    await expectRect(header, { height: 78, y: 0 });
    await expect(header).toHaveClass(/kt-blog__header-navbar--ontop/);
    await expect(header).toHaveCSS('transform', 'none');

    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(450);

    await expect(header).not.toHaveClass(/kt-blog__header-navbar--ontop/);
    await expectRect(header, { height: 62, y: 0 });
    await expect(header).toHaveCSS('transform', 'none');
    await expect(overviewPanel).toHaveClass(/kt-blog__sidebar-panel--sticky/);
    await expect(overviewPanel).toHaveCSS('position', 'fixed');
    await expect(overviewPanel).toHaveCSS('top', '80px');
    await expectRect(overviewPanel, { y: 90 });

    await page.evaluate(() => window.scrollTo(0, 520));
    await page.waitForTimeout(80);
    await expect(overviewPanel).not.toHaveClass(/kt-blog__sidebar-panel--sticky/);
    await expect(overviewPanel).toHaveCSS('position', 'relative');
    const unstuckTransform = await overviewPanel.evaluate((element) => getComputedStyle(element).transform);
    expect(unstuckTransform).toBe('none');
    await expectRect(overviewPanel, { width: 250, x: 25 });
  };
}

/**
 * @returns Playwright body that pins the live Argon navbar search sizing and footer theme colors.
 */
function createHeaderSearchFooterThemeTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect desktop header and footer theme states.
   */
  return async function runHeaderSearchFooterThemeTest({ page }: PageFixture) {
    await page.setViewportSize({ height: 900, width: 1440 });
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0]);

    const search = page.locator('.kt-blog__header-search');
    const searchGroup = search.locator('.kt-blog__input-group');
    const searchAddon = search.locator('.kt-blog__input-addon');
    const searchInput = search.locator('.kt-blog__header-search-input');
    const footer = page.locator('#footer');
    const footerInfo = page.locator('#footer > *').first();

    await expectRect(search, { height: 46, width: 40 });
    await expectRect(searchGroup, { height: 46, width: 40 });
    await expectRect(searchAddon, { height: 46, width: 40 });
    await expectRect(searchInput, { height: 46, width: 0 });
    await expect(searchInput).toHaveCSS('font-size', '14px');

    await search.click();
    await expectRect(search, { height: 46, width: 240 });
    await expectRect(searchGroup, { height: 46, width: 240 });
    await expectRect(searchAddon, { height: 46, width: 40 });
    await expectRect(searchInput, { height: 46, width: 200 });
    await expect(searchInput).toHaveCSS('padding', '10px 12px 10px 0px');

    await expect(footer).toHaveCSS('display', 'flex');
    await expect(footer).toHaveCSS('flex-direction', 'column');
    await expect(footer).toHaveCSS('position', 'relative');
    await expect(footer).toHaveCSS('float', 'right');
    await expect(footer).toHaveCSS('line-height', '28.8px');
    await expect(footer).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expectBackgroundColorToMatchCssVariable(page, footer, '--color-foreground');
    await expectRect(footerInfo, { height: 29, width: 790 });
    await expect(footerInfo).toHaveCSS('font-weight', '400');
    await expect(footerInfo).toHaveCSS('line-height', '28.8px');
    await expect(footerInfo).toHaveCSS('color', 'rgb(255, 255, 255)');

    await page.locator('#fabtn_toggle_blog_settings_popup').click();
    await page.locator('.kt-blog__settings-theme-switch').click();
    await expect(page.locator('html')).not.toHaveClass(/darkmode/);
    await expect(footer).toHaveCSS('background-image', /linear-gradient/);
    await expect(footer).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(footerInfo).toHaveCSS('font-weight', '400');
    await expect(footerInfo).toHaveCSS('color', 'rgb(255, 255, 255)');
  };
}

/**
 * @returns Playwright body that verifies the sidebar follows Argon theme variables instead of fixed colors.
 */
function createHomeSidebarThemeTest() {
  /**
   * @param fixtures Playwright page fixture used to toggle local theme settings.
   */
  return async function runHomeSidebarThemeTest({ page }: PageFixture) {
    await page.setViewportSize({ height: 900, width: 1440 });
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0]);

    const banner = page.locator('.kt-blog__sidebar-banner');
    const bannerTitle = page.locator('.kt-blog__sidebar-banner-title');
    const firstPanel = page.locator('.kt-blog__sidebar-panel--menu');
    const searchButton = page.locator('#leftbar_search_container');

    await expect(page.locator('html')).toHaveClass(/darkmode/);
    await expectBackgroundColorToMatchCssVariable(page, firstPanel, '--color-foreground');
    await expectBackgroundColorToMatchCssVariable(page, banner, '--color-widgets');
    await expectBackgroundColorToMatchCssVariable(page, searchButton, '--color-border-on-foreground-deeper');
    await expect(banner).toHaveCSS('background-image', 'none');
    await expect(bannerTitle).toHaveCSS('color', 'rgb(255, 255, 255)');

    await page.locator('#fabtn_toggle_blog_settings_popup').click();
    await page.locator('.kt-blog__settings-theme-switch').click();
    await expect(page.locator('html')).not.toHaveClass(/darkmode/);
    await expectBackgroundColorToMatchCssVariable(page, firstPanel, '--color-foreground');
    await expectBackgroundColorToMatchCssVariable(page, searchButton, '--color-border-on-foreground-deeper');
    await expect(banner).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(banner).toHaveCSS('background-image', /linear-gradient/);
    await expect(bannerTitle).toHaveCSS('color', 'rgb(255, 255, 255)');

    const defaultGradient = await banner.evaluate((element) =>
      getComputedStyle(element).backgroundImage,
    );
    await page.locator('[aria-label="主题色 #5e72e4"]').click();
    await expectCssVariable(page, '--themecolor', '#5E72E4');
    await expect(banner).not.toHaveCSS('background-image', defaultGradient);
    await expect(banner).toHaveCSS('background-image', /linear-gradient/);
  };
}

/**
 * @returns Playwright body that guards against root 100vw overflow on Windows scrollbar layouts.
 */
function createNoHorizontalOverflowTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect document and body scroll geometry.
   */
  return async function runNoHorizontalOverflowTest({ page }: PageFixture) {
    const routesToCheck = ARGON_ROUTE_CASES.filter((routeCase) =>
      ['home', 'category-9', 'search-NAS', 'post-61'].includes(routeCase.routeKey),
    );

    await page.setViewportSize({ height: 1000, width: 1440 });

    for (const routeCase of routesToCheck) {
      await gotoLocalRoute(page, routeCase);

      await expect
        .poll(() =>
          page.evaluate(
            () =>
              document.body.scrollWidth <= document.body.clientWidth
              && document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        )
        .toBe(true);
    }
  };
}

/**
 * @returns Playwright body that pins rightbar theme variables and WordPress term/month counts.
 */
function createRightbarTermDataSemanticsTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect rightbar widgets and term routes.
   */
  return async function runRightbarTermDataSemanticsTest({ page }: PageFixture) {
    await page.setViewportSize({ height: 1000, width: 1440 });
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0]);

    await expect(page.locator('#rightbar > .kt-blog__rightbar-widget')).toHaveCount(4);
    await expect(page.locator('#rightbar')).toHaveCSS('padding', '0px');
    await expectRect(page.locator('#rightbar > .kt-blog__rightbar-widget').first(), {
      height: 372,
      width: 250,
      x: 1165,
    });
    await expectBackgroundColorToMatchCssVariable(
      page,
      page.locator('#rightbar > .kt-blog__rightbar-widget').first(),
      '--color-foreground',
    );
    await expect(page.locator('.kt-blog__rightbar-title').first()).toHaveCSS('font-weight', '400');
    await expect(page.locator('.kt-blog__rightbar-list-item').first()).toHaveCSS('margin-bottom', '5px');

    await gotoLocalRoute(page, ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'category-7')!);
    await expect(page.locator('.kt-blog__page-info-meta')).toContainText('2 篇文章');
    await expect(page.locator('#post-35')).toBeVisible();
    await expect(page.locator('#post-20')).toBeVisible();

    await gotoLocalRoute(page, ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'archive-202606')!);
    await expect(page.locator('.kt-blog__page-info-meta')).toContainText('1 篇文章');
    await expect(page.locator('.kt-blog__timeline-card')).toHaveCount(0);
    await expect(page.locator('#post-61')).toContainText('QQBot NAS 接入记录');
  };
}

/**
 * @returns Playwright body that checks page-info cards use live Argon full-width archive semantics.
 */
function createPageInfoGeometryTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect search, term, and archive page-info cards.
   */
  return async function runPageInfoGeometryTest({ page }: PageFixture) {
    const categoryRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'category-9')!;
    const tagRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'tag-nas')!;
    const archiveRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'archive-202605')!;
    const searchRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'search-NAS')!;

    await page.setViewportSize({ height: 1000, width: 1440 });

    await gotoLocalRoute(page, categoryRoute);
    await assertArchivePageInfo(page, '分类： NAS', '3 篇文章');
    await expect(page.locator('.kt-blog__page-info-description')).toHaveCount(0);

    await gotoLocalRoute(page, tagRoute);
    await assertArchivePageInfo(page, '标签： NAS', '3 篇文章');
    await expect(page.locator('.kt-blog__page-info-description')).toHaveCount(0);

    await gotoLocalRoute(page, archiveRoute);
    await assertArchivePageInfo(page, '月度归档： 2026 年 5 月', '3 篇文章');
    await expect(page.locator('.kt-blog__page-info-description')).toHaveCount(0);

    await gotoLocalRoute(page, searchRoute);
    await assertPageInfoCardGeometry(page, 173);
    const searchChildren = await page.locator('.kt-blog__page-info-body > *').evaluateAll((children) =>
      children.map((child) => ({
        className: String((child as HTMLElement).className || ''),
        tagName: child.tagName,
        text: child.textContent?.replace(/\s+/g, ' ').trim(),
      })),
    );

    expect(searchChildren.map((child) => child.className)).toEqual([
      'kt-blog__page-info-title',
      'kt-blog__page-info-lead',
      'kt-blog__search-filters',
      'kt-blog__page-info-meta',
    ]);
    await expect(page.locator('.kt-blog__page-info-title')).toHaveCSS('display', 'inline-block');
    await expect(page.locator('.kt-blog__page-info-lead')).toHaveCSS('display', 'inline-block');
  };
}

/**
 * @returns Playwright body that keeps the search result page aligned with the live WordPress surface.
 */
function createSearchDisabledFeatureTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect the local search result route.
   */
  return async function runSearchDisabledFeatureTest({ page }: PageFixture) {
    const searchRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'search-NAS')!;
    await gotoLocalRoute(page, searchRoute);

    await expect(page.locator('.kt-blog__page-search-form')).toHaveCount(0);
    await expect(page.locator('#search_filter_post')).toBeVisible();
    await expect(page.locator('#search_filter_page')).toBeVisible();

    await page.goto('/#/search?q=NAS&post_type=page', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toHaveClass(/search-no-results/);
    await expect(page.locator('body')).not.toHaveClass(/search-results/);
    await expect(page.locator('.kt-blog__page-info-meta')).toContainText('0 个结果');
    await expect(page.locator('.kt-blog__post--preview')).toHaveCount(0);
    await expect(page.locator('.ant-empty')).toHaveCount(0);
    await expect(page.locator('.kt-blog__search-no-results')).toContainText('没有搜索结果');
    await expect(page.locator('.kt-blog__search-no-results')).toContainText('返回上一页');
  };
}

/**
 * @returns Playwright body that checks the newest post follows WordPress navigation and block availability.
 */
function createNewestPostFeatureTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect the newest local post route.
   */
  return async function runNewestPostFeatureTest({ page }: PageFixture) {
    const newestPostRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'post-61')!;
    await gotoLocalRoute(page, newestPostRoute);

    await expect(page.locator('#leftbar_tab_catalog_btn')).toBeVisible();
    await expect(page.locator('#leftbar_tab_overview_btn')).toBeVisible();
    await expect(page.locator('.kt-blog__related-posts')).toHaveCount(0);
    await expect(page.locator('.kt-blog__post-navigation')).toContainText('上一篇');
    await expect(page.locator('.kt-blog__post-navigation')).not.toContainText('下一篇');
  };
}

/**
 * @returns Playwright body that checks post bottom sections follow live WordPress order.
 */
function createPostBottomOrderTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect the newest post bottom cards.
   */
  return async function runPostBottomOrderTest({ page }: PageFixture) {
    const newestPostRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'post-61')!;
    await page.setViewportSize({ height: 1100, width: 1440 });
    await gotoLocalRoute(page, newestPostRoute);

    const order = await page.locator('#main > article, #share_container, #comments, #post_comment, .kt-blog__post-navigation, #footer')
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const element = node as HTMLElement;
          if (element.matches('article')) return 'article';
          if (element.id === 'share_container') return 'share';
          if (element.id === 'comments') return 'comments';
          if (element.id === 'post_comment') return 'commentForm';
          if (element.classList.contains('kt-blog__post-navigation')) return 'navigation';
          if (element.id === 'footer') return 'footer';

          return 'unknown';
        }),
      );

    expect(order).toEqual(['article', 'share', 'comments', 'commentForm', 'navigation', 'footer']);
    await expectRect(page.locator('#share_container'), { height: 38, width: 830 });
    await expectRect(page.locator('#comments'), { height: 74, width: 830 });
    await expectRect(page.locator('#post_comment'), { height: 369, width: 830 });

    const commentFormBox = await page.locator('#post_comment').boundingBox();
    const navigationBox = await page.locator('.kt-blog__post-navigation').boundingBox();
    expect(Math.round(navigationBox?.y ?? 0)).toBeGreaterThan(
      Math.round((commentFormBox?.y ?? 0) + (commentFormBox?.height ?? 0)),
    );
  };
}

/**
 * @param locator Element whose rounded viewport rect should match exact live Argon geometry.
 * @param expected Live Argon rectangle values to assert; omitted fields are ignored.
 */
async function expectRect(
  locator: ReturnType<Page['locator']>,
  expected: Partial<{ height: number; width: number; x: number; y: number }>,
) {
  for (const [field, value] of Object.entries(expected) as Array<[keyof typeof expected, number]>) {
    await expect
      .poll(
        async () => {
          const box = await locator.boundingBox();

          return Math.round(box?.[field] ?? 0);
        },
        { message: `rect.${field}` },
      )
      .toBe(value);
  }
}

/**
 * @param page Browser page whose document root exposes Argon CSS variables.
 * @param variableName CSS custom property name expected on the body/root theme channel.
 * @param expectedValue Expected trimmed CSS variable value.
 */
async function expectCssVariable(page: Page, variableName: string, expectedValue: string) {
  const actualValue = await readCssVariable(page, variableName);

  expect(actualValue).toBe(expectedValue);
}

/**
 * @param page Browser page whose document root exposes Argon CSS variables.
 * @param locator Element whose computed background color should consume the CSS variable.
 * @param variableName CSS custom property holding the expected background color.
 */
async function expectBackgroundColorToMatchCssVariable(
  page: Page,
  locator: ReturnType<Page['locator']>,
  variableName: string,
) {
  const expectedColor = await resolveCssColorVariable(page, variableName);
  expect(expectedColor, `${variableName} should be present`).not.toBe('');

  await expect(locator).toHaveCSS('background-color', expectedColor);
}

/**
 * @param page Browser page whose Argon variables may live on body or document root.
 * @param variableName CSS custom property name to read.
 * @returns Trimmed CSS variable value after resolving body first and root second.
 */
async function readCssVariable(page: Page, variableName: string) {
  return page.evaluate((name) => {
    const bodyValue = getComputedStyle(document.body).getPropertyValue(name).trim();
    const rootValue = getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    return bodyValue || rootValue;
  }, variableName);
}

/**
 * @param page Browser page whose Argon variables should be resolved by the CSS engine.
 * @param variableName CSS custom property name to resolve as a background color.
 * @returns Browser-computed color string, such as `rgb(47, 43, 51)`.
 */
async function resolveCssColorVariable(page: Page, variableName: string) {
  return page.evaluate((name) => {
    const probe = document.createElement('div');
    probe.style.position = 'fixed';
    probe.style.pointerEvents = 'none';
    probe.style.backgroundColor = `var(${name})`;
    document.body.appendChild(probe);
    const resolvedColor = getComputedStyle(probe).backgroundColor;
    probe.remove();

    return resolvedColor;
  }, variableName);
}

/**
 * @param page Browser page positioned on a local category, tag, or month archive route.
 * @param title Expected live Argon archive title text.
 * @param meta Expected live Argon result-count text.
 */
async function assertArchivePageInfo(page: Page, title: string, meta: string) {
  await expect(page.locator('.kt-blog__page-info-title')).toHaveText(title);
  await expect(page.locator('.kt-blog__page-info-meta')).toContainText(meta);
  await assertPageInfoCardGeometry(page, 133);
  await expect(page.locator('.kt-blog__page-info-title')).toHaveCSS('font-size', '28px');
  await expect(page.locator('.kt-blog__page-info-meta')).toHaveCSS('display', 'block');
}

/**
 * @param page Browser page positioned on a route with a page-info card.
 * @param height Expected live Argon card height for this page-info variant.
 */
async function assertPageInfoCardGeometry(page: Page, height: number) {
  await expectRect(page.locator('.kt-blog__page-info-wrap'), { height, width: 1430, x: 5 });
  await expectRect(page.locator('.kt-blog__page-info'), { height, width: 1390, x: 25 });
  await expect(page.locator('.kt-blog__page-info-wrap')).toHaveCSS('margin-bottom', '30px');
  await expect(page.locator('.kt-blog__page-info')).toHaveCSS('margin', '0px 20px');
  await expect(page.locator('.kt-blog__page-info-body')).toHaveCSS('padding', '24px');
}

test.describe('Argon local route parity', registerLocalRouteSuite);
test.describe('Argon local responsive layout parity', registerLocalLayoutSuite);
test.describe('Argon local disabled feature parity', registerLocalFeatureParitySuite);
