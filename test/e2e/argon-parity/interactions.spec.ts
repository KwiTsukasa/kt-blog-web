import { expect, test, type Page, type Route, type TestInfo } from '@playwright/test'
import { readFile } from 'node:fs/promises'

import {
  ARGON_INTERACTION_CASES,
  ARGON_ROUTE_CASES,
  type ArgonInteractionCase,
} from './argonParityMatrix'
import {
  captureAllRouteStates,
  gotoLocalRoute,
  waitForArgonPage,
  writeArgonArtifact,
} from './argonParityHelpers'

interface PageFixture {
  page: Page
}

const BACKEND_BASE_CODEBLOCK_ARTICLE = {
  authorName: 'KwiTsukasa',
  categoriesResolved: [
    {
      name: 'public',
      slug: 'public',
    },
  ],
  contentHtml: `<h2 class="wp-block-heading" id="header-id-1">后端代码块运行时</h2>
<pre class="wp-block-code hljs-codeblock"><code class="hljs typescript">const a = 1;
const b = a + 1;</code></pre>`,
  date: '2026-07-01T16:40:00.000Z',
  excerptText: '后端只生成基础 Argon 代码块，Blog Web 运行时补齐行号和控制条。',
  id: 909001,
  modified: '2026-07-01T16:40:00.000Z',
  slug: 'backend-codeblock-runtime',
  tagsResolved: [],
  title: {
    rendered: '后端代码块运行时',
  },
}

/**
 * Registers representative Argon interaction checks against the local Vue implementation.
 */
function registerLocalInteractionSuite() {
  for (const interactionCase of ARGON_INTERACTION_CASES) {
    test(
      `local interaction surface exists: ${interactionCase.key}`,
      createInteractionSurfaceTest(interactionCase),
    )
  }

  test('local settings panel mutates Argon theme state', createSettingsMutationTest())
  test('local search flow reaches a result route', createSearchFlowTest())
  test('local taxonomy modals expose captured category and tag chips', createTaxonomyModalTest())
  test(
    'local blog modal delegates motion to antdv-next while keeping Blog theme tokens',
    createBlogModalThemeMotionSourceTest(),
  )
  test(
    'local Blog animation and DOM contracts are centralized in factories',
    createBlogFactoryContractSourceTest(),
  )
  test('local mobile sidebar toggles like Argon leftbar', createMobileSidebarTest())
  test('local post page exposes share, comments, and reading progress', createPostInteractionTest())
  test('local post codeblocks match Argon hljs layout', createPostCodeblockSurfaceTest())
  test(
    'local post codeblock controls match Argon runtime toggles',
    createPostCodeblockControlBehaviorTest(),
  )
  test(
    'local post upgrades backend-generated base Argon codeblocks at runtime',
    createBackendBaseCodeblockRuntimeTest(),
  )
  test(
    'local post codeblock copy exposes Argon toast feedback',
    createPostCodeblockCopyFeedbackTest(),
  )
  test(
    'local post links match live WordPress Argon inline semantics',
    createPostInlineLinkSurfaceTest(),
  )
  test(
    'local post fancybox wrappers open live Argon lightbox shell',
    createPostFancyboxRuntimeTest(),
  )
  test(
    'local post image placeholders match Argon lazyload geometry',
    createPostImagePlaceholderSurfaceTest(),
  )
  test('local post separators match live WordPress Argon surface', createPostSeparatorSurfaceTest())
  test(
    'local header container matches live Argon navbar geometry',
    createHeaderContainerSurfaceTest(),
  )
  test(
    'local sidebar menu items match live Argon menu surface and admin target',
    createSidebarMenuSurfaceTest(),
  )
  test(
    'local sidebar overview keeps Argon tab-pane structure without archive navigation',
    createSidebarOverviewSurfaceTest(),
  )
  test('local post sidebar tabs switch catalog and overview panes', createPostSidebarTabTest())
  test(
    'local post sidebar tabs fade between catalog and overview panes',
    createPostSidebarTabFadeTest(),
  )
  test(
    'local post sidebar tab fade keeps Argon class-frame timing',
    createPostSidebarClassFrameSourceTest(),
  )
  test(
    'local replaceable Argon DOM behavior avoids native id selectors',
    createReplaceableDomRefSourceTest(),
  )
  test(
    'local sidebar search button matches Argon button interaction surface',
    createSidebarSearchButtonTest(),
  )
  test(
    'local floating action buttons match Argon fixed surface and filter positioning',
    createFloatingActionSurfaceTest(),
  )
  test(
    'local post share button matches Argon primary hover surface',
    createPostShareButtonSurfaceTest(),
  )
  test(
    'local post navigation matches Argon card-body-free layout',
    createPostNavigationSurfaceTest(),
  )
  test('local rightbar archive links preserve month targets', createRightbarArchiveLinkTest())
  test(
    'local article card link hover and target semantics match Argon',
    createArticleCardLinkInteractionTest(),
  )
}

/**
 * @param interactionCase Interaction selector captured from the live Argon surface.
 * @returns Playwright test body that verifies the same local control is present and actionable.
 */
function createInteractionSurfaceTest(interactionCase: ArgonInteractionCase) {
  /**
   * @param fixtures Playwright page fixture used to open the local home page.
   */
  return async function runInteractionSurfaceTest({ page }: PageFixture) {
    await gotoLocalRoute(page, getInteractionRouteCase(interactionCase))
    await prepareInteractionSurface(page, interactionCase)

    const selector = interactionCase.selector || interactionCase.key
    const control = page.locator(selector).first()

    await expect(control).toBeVisible()
    await expect(control).toBeEnabled()
  }
}

/**
 * @param interactionCase Interaction key from the Argon capture classification.
 * @returns Route where the control naturally exists in the local Vue app.
 */
function getInteractionRouteCase(interactionCase: ArgonInteractionCase) {
  if (
    interactionCase.key === '#share_show' ||
    interactionCase.key === '#fabtn_reading_progress' ||
    interactionCase.key === '#post_comment_content' ||
    interactionCase.key === '#post_comment_send'
  ) {
    return ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'post-50')!
  }

  if (interactionCase.key.startsWith('#search_filter_')) {
    return ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'search-NAS')!
  }

  return ARGON_ROUTE_CASES[0]
}

/**
 * @param page Browser page currently opened on the route returned by `getInteractionRouteCase`.
 * @param interactionCase Interaction whose natural visible state may require scrolling.
 */
async function prepareInteractionSurface(page: Page, interactionCase: ArgonInteractionCase) {
  if (interactionCase.key === '#open_sidebar' || interactionCase.key === '#sidebar_mask') {
    await page.setViewportSize({ height: 844, width: 390 })
    return
  }

  if (
    interactionCase.key === '#fabtn_back_to_top' ||
    interactionCase.key === '#fabtn_reading_progress'
  ) {
    await page.evaluate(() =>
      window.scrollTo(0, Math.round(document.documentElement.scrollHeight * 0.45)),
    )
    await page.waitForTimeout(220)
  }
}

/**
 * @returns Playwright test body that opens settings and verifies theme class/CSS-variable changes.
 */
function createSettingsMutationTest() {
  /**
   * @param fixtures Playwright page fixture used to mutate local Blog theme controls.
   * @param testInfo Metadata used to persist post-mutation snapshots under `.kt-workspace`.
   */
  return async function runSettingsMutationTest({ page }: PageFixture, testInfo: TestInfo) {
    const homeRoute = ARGON_ROUTE_CASES[0]
    await gotoLocalRoute(page, homeRoute)

    await page.locator('#fabtn_toggle_blog_settings_popup').click()
    await expect(page.locator('#blog_settings_popup, .kt-blog__settings-panel')).toBeVisible()

    await page.locator('#blog_setting_font_serif').click()
    await expect(page.locator('.kt-blog')).toHaveClass(/kt-blog--font-serif/)

    await page.locator('#blog_setting_shadow_big').click()
    await expect(page.locator('.kt-blog')).toHaveClass(/kt-blog--shadow-big/)

    await page.locator('#blog_setting_filter_grayscale').click()
    await expect(page.locator('html')).toHaveClass(/filter-grayscale/)
    await expect(page.locator('.kt-blog')).not.toHaveClass(/kt-blog--filter-grayscale/)

    await writeArgonArtifact(
      testInfo,
      'settings-mutated',
      await captureAllRouteStates(page, homeRoute),
    )
  }
}

/**
 * @returns Playwright test body that covers top/left search semantics and no-result state.
 */
function createSearchFlowTest() {
  /**
   * @param fixtures Playwright page fixture used to submit a local Argon search.
   * @param testInfo Metadata used to persist search-route snapshots under `.kt-workspace`.
   */
  return async function runSearchFlowTest({ page }: PageFixture, testInfo: TestInfo) {
    const searchRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'search-NAS')!
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0])

    await page.locator('#leftbar_search_container').click()
    await page.locator('#leftbar_search_input').fill('NAS')
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL(/\/#\/search\?q=NAS/)
    await expect(page.getByText('NAS', { exact: false }).first()).toBeVisible()

    await writeArgonArtifact(testInfo, 'search-NAS', await captureAllRouteStates(page, searchRoute))
  }
}

/**
 * @returns Playwright test body that checks the leftbar search control id belongs to the visible button, not a wrapper.
 */
function createSidebarSearchButtonTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect leftbar search behavior.
   */
  return async function runSidebarSearchButtonTest({ page }: PageFixture) {
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0])

    const searchButton = page.locator('#leftbar_search_container')
    await expect(searchButton).toHaveJSProperty('tagName', 'BUTTON')
    await expect(searchButton).toBeVisible()
    await expect(searchButton).toHaveCSS('cursor', 'pointer')

    const buttonBox = await searchButton.boundingBox()
    expect(Math.round(buttonBox?.height ?? 0)).toBe(30)
    expect(Math.round(buttonBox?.width ?? 0)).toBeLessThan(230)

    await searchButton.click()
    const searchInput = page
      .locator('#leftbar_search_input input, input#leftbar_search_input')
      .first()
    await expect(searchInput).toBeFocused()
  }
}

/**
 * @returns Playwright test body that checks Argon's fixed floating button geometry and filter stability.
 */
function createFloatingActionSurfaceTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect floating button and settings panel geometry.
   */
  return async function runFloatingActionSurfaceTest({ page }: PageFixture) {
    await page.setViewportSize({ height: 900, width: 1440 })
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0])

    const actions = page.locator('.kt-blog__float-actions')
    const settingsButton = page.locator('#fabtn_toggle_blog_settings_popup')
    const filterButton = page.locator('#blog_setting_filter_grayscale')
    const settingsPanel = page.locator('#blog_settings_popup')
    const themeRoot = page.locator('.kt-blog')

    await expect(actions).toHaveCSS('position', 'fixed')
    await expect(actions).toHaveCSS('right', '20px')
    await expect(actions).toHaveCSS('bottom', '35px')
    await expect(actions).toHaveCSS('z-index', '1000')
    await expect(actions).toHaveCSS('pointer-events', 'auto')
    await expectViewportOffset(actions, { bottom: 35, right: 20 })

    await expect(settingsButton).toBeVisible()
    await expectRect(settingsButton, { height: 42, width: 42 })
    await expect(settingsButton).toHaveCSS('padding', '0px')
    await expect(settingsButton).toHaveCSS('transform', 'none')

    await settingsButton.hover()
    await expect(settingsButton).toHaveCSS('transform', 'none')

    await settingsButton.click()
    await expect(settingsPanel).toBeVisible()
    await expectViewportOffset(settingsPanel, { bottom: 35, right: 85 })
    await expectRect(filterButton, { height: 50, width: 50 })
    await expect(filterButton).toHaveCSS('background-color', 'rgba(200, 200, 200, 0.8)')
    await expect(filterButton).toHaveCSS('white-space', 'nowrap')

    await filterButton.click()
    await expect(page.locator('html')).toHaveClass(/filter-grayscale/)
    await expect(themeRoot).toHaveCSS('filter', 'none')
    await expect(page.locator('html')).toHaveCSS('filter', 'grayscale(1)')
    await expectViewportOffset(actions, { bottom: 35, right: 20 })
    await expectViewportOffset(settingsPanel, { bottom: 35, right: 85 })

    await page.evaluate(() => window.scrollTo(0, 700))
    await page.waitForTimeout(250)
    await expectViewportOffset(actions, { bottom: 35, right: 20 })
    await expectViewportOffset(settingsPanel, { bottom: 35, right: 85 })
  }
}

/**
 * @returns Playwright test body that verifies the post share opener keeps Argon's button dimensions and hover motion.
 */
function createPostShareButtonSurfaceTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect the post share button.
   */
  return async function runPostShareButtonSurfaceTest({ page }: PageFixture) {
    const postRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'post-61')!
    await gotoLocalRoute(page, postRoute)

    const shareButton = page.locator('#share_show')
    await expect(shareButton).toBeVisible()
    const buttonBox = await shareButton.boundingBox()
    expect(Math.round(buttonBox?.width ?? 0)).toBe(50)
    expect(Math.round(buttonBox?.height ?? 0)).toBe(36)

    await shareButton.hover()
    await expect
      .poll(async () => shareButton.evaluate((element) => getComputedStyle(element).transform))
      .not.toBe('none')
  }
}

/**
 * @returns Playwright test body that verifies post previous/next navigation keeps Argon's native structure.
 */
function createPostNavigationSurfaceTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect a post with both previous and next links.
   */
  return async function runPostNavigationSurfaceTest({ page }: PageFixture) {
    const postRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'post-50')!
    await page.setViewportSize({ height: 900, width: 1440 })
    await gotoLocalRoute(page, postRoute)

    const navigation = page.locator('.post-navigation')
    const previousItem = page.locator('.post-navigation-pre')
    const nextItem = page.locator('.post-navigation-next')
    const previousLabel = previousItem.locator('.page-navigation-extra-text')
    const nextLabel = nextItem.locator('.page-navigation-extra-text')
    const previousLink = previousItem.locator('a')

    await expect(navigation).toHaveCSS('padding', '25px 25px 30px')
    await expect(navigation).toHaveCSS('min-height', '0px')
    await expect(navigation).toHaveCSS('position', 'relative')
    await expect(navigation).toHaveCSS('border-top-width', '1px')
    await expectRect(navigation, { height: 132 })
    await expect(page.locator('.post-navigation > .post-navigation-item')).toHaveCount(2)
    await expect(previousItem).toHaveCSS('min-height', '0px')
    await expect(nextItem).toHaveCSS('min-height', '0px')
    await expect(previousItem).toHaveCSS('display', 'inline-block')
    await expect(nextItem).toHaveCSS('text-align', 'right')
    await expect(previousLabel).toHaveCSS('font-size', '22px')
    await expect(previousLabel).toHaveCSS('line-height', '33px')
    await expect(previousLabel).toHaveCSS('margin-bottom', '15px')
    await expect(previousLabel).toHaveCSS('opacity', '0.85')
    await expect(previousLabel.locator('i')).toHaveCSS('margin-right', '10px')
    await expect(nextLabel.locator('i')).toHaveCSS('margin-left', '10px')
    await expect(page.locator('#comments > .card-body')).toBeVisible()
    await expect(page.locator('#post_comment > .card-body')).toBeVisible()
    await expectLeftEdgesToMatch(previousItem, previousLink)
  }
}

/**
 * @returns Playwright test body that verifies rightbar archive links keep the captured month filter.
 */
function createRightbarArchiveLinkTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect rightbar archive hrefs.
   */
  return async function runRightbarArchiveLinkTest({ page }: PageFixture) {
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0])

    const juneArchive = page.locator('#rightbar').getByRole('link', { name: '2026 年 6 月' })
    await expect(juneArchive).toBeVisible()
    await expect(juneArchive).toHaveAttribute('href', /month=202606/)
  }
}

/**
 * @returns Playwright test body that verifies article title/category/tag link interaction parity.
 */
function createArticleCardLinkInteractionTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect the first article card.
   */
  return async function runArticleCardLinkInteractionTest({ page }: PageFixture) {
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0])

    const title = page.locator('.kt-blog__post-title').first()
    const titleColorBefore = await title.evaluate((element) => getComputedStyle(element).color)
    await title.hover()
    await expect
      .poll(async () => title.evaluate((element) => getComputedStyle(element).color))
      .not.toBe(titleColorBefore)

    const category = page.locator('.kt-blog__post-meta a').first()
    await expect(category).toHaveAttribute('target', '_blank')

    const tag = page.locator('.kt-blog__post-tags a').first()
    await expect(tag).toHaveAttribute('target', '_blank')
    await expect(tag).toHaveCSS('font-weight', '600')
  }
}

/**
 * @returns Playwright test body that keeps modal motion simple and delegates open/close animation to antdv-next.
 */
function createBlogModalThemeMotionSourceTest() {
  return async function runBlogModalThemeMotionSourceTest() {
    const modalSource = await readFile(
      new URL('../../src/components/blog/dialogs/BlogModal.tsx', import.meta.url),
      'utf8',
    )
    const modalStyle = await readFile(
      new URL('../../src/styles/modal.scss', import.meta.url),
      'utf8',
    )

    expect(modalSource).not.toMatch(/\bTransition\b/)
    expect(modalSource).not.toContain('kt-blog__modal-transition-root')
    expect(modalSource).not.toContain('footer={null}')
    expect(modalSource).toContain('kt-blog__modal-header')
    expect(modalSource).toContain('kt-blog__modal-content')
    expect(modalSource).toContain('kt-blog__modal-footer')
    expect(modalSource).toContain('footer={modalFooter}')
    expect(modalSource).toContain('slots.footer')
    expect(modalStyle).not.toContain('__modal-enter-active')
    expect(modalStyle).not.toContain('__modal-leave-active')
    expect(modalStyle).not.toContain('padding: 18px 22px')
    expect(modalStyle).not.toContain('padding: 20px 22px 24px')
    expect(modalStyle).not.toContain('__taxonomy-modal &__modal-body')
    expect(modalStyle).not.toContain('&__taxonomy-modal .ant-modal-body')
    expect(modalSource).toContain('centered')
    expect(modalStyle).toContain('max-height: min(80vh, calc(100vh - 32px))')
    expect(modalStyle).toContain('flex-direction: column')
    expect(modalStyle).toContain('padding: 0')
    expect(modalStyle).toContain('padding: 16px 20px')
    expect(modalStyle).toContain('min-height: 160px')
    expect(modalStyle).toContain('padding: 12px')
    expect(modalStyle).toContain('padding: 8px')
    expect(modalStyle).toContain('overflow-y: auto')
    expect(modalStyle).toContain('background: var(--color-widgets)')
    expect(modalStyle).toContain('color: var(--argon-text)')
    expect(modalStyle).toContain('background: var(--themecolor)')
  }
}

/**
 * @returns Playwright source-level test body that keeps Argon animation timing and DOM/ref ids routed through factories.
 */
function createBlogFactoryContractSourceTest() {
  return async function runBlogFactoryContractSourceTest() {
    const animationFactory = await readFile(
      new URL('../../src/factories/blogAnimationFactory.ts', import.meta.url),
      'utf8',
    )
    const domFactory = await readFile(
      new URL('../../src/factories/blogDomFactory.ts', import.meta.url),
      'utf8',
    )
    const sidebarSource = await readFile(
      new URL('../../src/components/blog/layout/BlogSidebar.tsx', import.meta.url),
      'utf8',
    )
    const layoutSource = await readFile(
      new URL('../../src/components/blog/layout/BlogLayout.tsx', import.meta.url),
      'utf8',
    )
    const floatActionsSource = await readFile(
      new URL('../../src/components/blog/layout/BlogFloatActions.tsx', import.meta.url),
      'utf8',
    )
    const shareSource = await readFile(
      new URL('../../src/components/blog/content/BlogShare.tsx', import.meta.url),
      'utf8',
    )
    const postPageSource = await readFile(
      new URL('../../src/views/blog/PostPage.tsx', import.meta.url),
      'utf8',
    )
    const argonEffectsSource = await readFile(
      new URL('../../src/hooks/useArgonEffects.ts', import.meta.url),
      'utf8',
    )
    const domRefsSource = await readFile(
      new URL('../../src/hooks/useBlogDomRefs.ts', import.meta.url),
      'utf8',
    )

    expect(animationFactory).toContain('BLOG_ANIMATION_TIMING_MS')
    expect(animationFactory).toContain('BLOG_SCROLL_GEOMETRY')
    expect(animationFactory).toContain('createBlogFrameScheduler')
    expect(animationFactory).toContain('requestBlogFrame')
    expect(domFactory).toContain('BLOG_DOM_IDS')
    expect(domFactory).toContain('blogDomId')
    expect(domFactory).toContain('blogDomAnchor')
    expect(domFactory).toContain('createBlogElementRef')

    for (const source of [
      sidebarSource,
      layoutSource,
      floatActionsSource,
      shareSource,
      postPageSource,
      argonEffectsSource,
      domRefsSource,
    ]) {
      expect(`${source}\n`).toMatch(/@\/factories\/blog(?:Animation|Dom)Factory/)
    }

    expect(sidebarSource).not.toMatch(
      /const ARGON_CATALOG_(?:MANUAL_LOCK_MS|OFFSET|SCROLL_EXTRA|NORMAL_ANIMATION_MS)\s*=/,
    )
    expect(sidebarSource).not.toContain('window.requestAnimationFrame')
    expect(sidebarSource).not.toContain('setTimeout(() =>')
    expect(layoutSource).not.toMatch(
      /id="(?:banner|banner_container|content|sidebar_mask|primary|main|footer)"/,
    )
    expect(floatActionsSource).not.toMatch(
      /id="(?:fabtn_toggle_sides|fabtn_back_to_top|fabtn_toggle_blog_settings_popup|fabtn_reading_progress|blog_settings_popup)"/,
    )
    expect(floatActionsSource).not.toContain('}, 300)')
    expect(shareSource).not.toMatch(/id="(?:share_container|share_show|share)"/)
    expect(postPageSource).not.toMatch(
      /id="(?:post_content|comments|post_comment|post_comment_content|post_comment_send)"/,
    )
    expect(argonEffectsSource).not.toContain('duration = 800')
    expect(argonEffectsSource).not.toContain('scrollTop < 30')
    expect(domRefsSource).toContain('createBlogElementRef')
  }
}

/**
 * @returns Playwright test body that checks sidebar stats open local taxonomy modals with captured terms.
 */
function createTaxonomyModalTest() {
  /**
   * @param fixtures Playwright page fixture used to open and close taxonomy modals.
   */
  return async function runTaxonomyModalTest({ page }: PageFixture) {
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0])

    await page.locator('[data-argon-taxonomy="categories"]').click()
    const categoriesModal = page.locator('.kt-blog__taxonomy-modal--categories')
    const categoriesPanel = categoriesModal.locator('.ant-modal')
    const categoriesMask = categoriesModal.locator('.ant-modal-mask')
    await expect(categoriesModal.locator('.kt-blog__modal-wrap')).toBeVisible()
    await expectRect(categoriesPanel, { width: 500 })
    await expect
      .poll(() => categoriesPanel.evaluate((element) => getComputedStyle(element).transform))
      .toBe('none')
    const categoriesPanelBox = await categoriesPanel.boundingBox()
    const expectedCenteredTop =
      (page.viewportSize()!.height - (categoriesPanelBox?.height ?? 0)) / 2
    expect(Math.abs((categoriesPanelBox?.y ?? 0) - expectedCenteredTop)).toBeLessThanOrEqual(16)
    const categoriesContent = categoriesModal.locator('.ant-modal-container')
    const categoriesBody = categoriesModal.locator('.ant-modal-body')
    const categoriesFooter = categoriesModal.locator('.ant-modal-footer')
    await expect(categoriesModal.locator('.ant-modal-header .kt-blog__modal-header')).toBeVisible()
    await expect(categoriesModal.locator('.ant-modal-body .kt-blog__modal-content')).toBeVisible()
    await expect(categoriesFooter).toHaveCount(0)
    await expect(categoriesModal.locator('.ant-modal-header')).toHaveCSS('padding', '16px 20px')
    await expect(categoriesContent).toHaveCSS('padding', '0px')
    await expect(categoriesModal.locator('.ant-modal-header')).toHaveCSS('width', '500px')
    await expect(categoriesBody).toHaveCSS('width', '500px')
    await expect(categoriesBody).toHaveCSS('min-height', '160px')
    await expect(categoriesBody).toHaveCSS('padding', '12px')
    await expect(categoriesContent).toHaveCSS('display', 'flex')
    await expect(categoriesContent).toHaveCSS('flex-direction', 'column')
    const modalContentMaxHeight = await categoriesContent.evaluate((element) => {
      const maxHeight = getComputedStyle(element).maxHeight

      return maxHeight.endsWith('px') ? Number.parseFloat(maxHeight) : 0
    })
    expect(modalContentMaxHeight).toBeLessThanOrEqual(page.viewportSize()!.height * 0.8)
    await expect(categoriesBody).toHaveCSS('overflow-y', 'auto')
    await expect(categoriesMask).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.16)')
    await expect(categoriesModal.locator('.kt-blog__tag').first()).toHaveCSS('height', '26px')
    await expect(categoriesModal.locator('.kt-blog__tag').first()).toHaveCSS('padding', '5px 10px')

    const categoryChips = await categoriesModal
      .locator('.kt-blog__tag')
      .evaluateAll((items) =>
        items.map((item) => item.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean),
      )
    expect(categoryChips).toEqual(['MQTT 1', 'NAS 3', 'Node 1', 'public 1', 'Vue 2'])

    await page.mouse.click(20, 20)
    await expect(categoriesModal.locator('.kt-blog__modal-wrap')).toBeHidden()
    await page.locator('[data-argon-taxonomy="categories"]').click()

    await page.keyboard.press('Escape')
    await expect(categoriesModal.locator('.kt-blog__modal-wrap')).toBeHidden()
    await page.locator('[data-argon-taxonomy="tags"]').click()
    const tagsModal = page.locator('.kt-blog__taxonomy-modal--tags')
    await expect(tagsModal.locator('.kt-blog__modal-wrap')).toBeVisible()
    const tagLabels = await tagsModal
      .locator('.kt-blog__tag')
      .evaluateAll((items) =>
        items.map((item) => item.textContent?.replace(/\d+$/u, '').trim()).filter(Boolean),
      )

    expect(tagLabels).toEqual(['MQTT', 'NAS', 'Node', 'Vue'])
    await expect(tagsModal).not.toContainText('NestJS')
    await page.keyboard.press('Escape')
    await expect(tagsModal.locator('.kt-blog__modal-wrap')).toBeHidden()
  }
}

/**
 * @param locator Element whose rounded bounding box should match captured live geometry.
 * @param expected Expected geometry fields; omitted fields are not checked.
 */
async function expectRect(
  locator: ReturnType<Page['locator']>,
  expected: Partial<{ height: number; width: number; x: number; y: number }>,
) {
  for (const [field, value] of Object.entries(expected) as Array<[keyof typeof expected, number]>) {
    await expect
      .poll(
        async () => {
          const box = await locator.boundingBox()

          return Math.round(box?.[field] ?? 0)
        },
        { message: `rect.${field}` },
      )
      .toBe(value)
  }
}

/**
 * @param locator Element whose pseudo-element computed style should be read from the browser.
 * @param pseudo CSS pseudo-element name such as `::before`.
 * @param property Camel-case computed style property to read.
 * @returns Browser-computed pseudo-element style value.
 */
async function readPseudoStyle(
  locator: ReturnType<Page['locator']>,
  pseudo: '::after' | '::before',
  property: keyof CSSStyleDeclaration,
) {
  return locator.evaluate(
    (element, args) => String(getComputedStyle(element, args.pseudo)[args.property]),
    { property, pseudo },
  )
}

/**
 * @param locator Element whose viewport offsets should stay fixed like the live Argon controls.
 * @param expected Expected right/bottom distance from the layout viewport edge in pixels.
 */
async function expectViewportOffset(
  locator: ReturnType<Page['locator']>,
  expected: Partial<{ bottom: number; right: number }>,
) {
  for (const [field, value] of Object.entries(expected) as Array<[keyof typeof expected, number]>) {
    await expect
      .poll(
        async () =>
          locator.evaluate((element, offsetField) => {
            const rect = element.getBoundingClientRect()

            return Math.round(
              offsetField === 'right'
                ? document.documentElement.clientWidth - rect.right
                : document.documentElement.clientHeight - rect.bottom,
            )
          }, field),
        { message: `viewport.${field}` },
      )
      .toBe(value)
  }
}

/**
 * @param reference Element whose left edge is the expected Argon alignment anchor.
 * @param target Element whose left edge should align to the same x coordinate.
 */
async function expectLeftEdgesToMatch(
  reference: ReturnType<Page['locator']>,
  target: ReturnType<Page['locator']>,
) {
  await expect
    .poll(
      async () => {
        const [referenceBox, targetBox] = await Promise.all([
          reference.boundingBox(),
          target.boundingBox(),
        ])

        return Math.round((targetBox?.x ?? 0) - (referenceBox?.x ?? 0))
      },
      { message: 'rect.leftDelta' },
    )
    .toBe(0)
}

/**
 * @returns Playwright test body that validates the mobile Argon leftbar open and mask close flow.
 */
function createMobileSidebarTest() {
  /**
   * @param fixtures Playwright page fixture used to check mobile-only sidebar geometry.
   */
  return async function runMobileSidebarTest({ page }: PageFixture) {
    await page.setViewportSize({ height: 844, width: 390 })
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0])

    await expect(page.locator('#open_sidebar')).toBeVisible()
    await expect(page.locator('html')).not.toHaveClass(/leftbar-opened/)
    await expect(page.locator('#leftbar')).toHaveCSS('left', '-300px')

    await page.locator('#open_sidebar').click()
    await expect(page.locator('html')).toHaveClass(/leftbar-opened/)
    await expect(page.locator('#leftbar')).toHaveCSS('left', '0px')
    await expect(page.locator('#sidebar_mask')).toHaveCSS('opacity', '1')

    await page.mouse.click(370, 120)
    await expect(page.locator('html')).not.toHaveClass(/leftbar-opened/)
    await expect(page.locator('#leftbar')).toHaveCSS('left', '-300px')
  }
}

/**
 * @returns Playwright test body that validates post-only controls seen in the live Argon capture.
 */
function createPostInteractionTest() {
  /**
   * @param fixtures Playwright page fixture used to open a representative post page.
   * @param testInfo Metadata used to persist post interaction snapshots under `.kt-workspace`.
   */
  return async function runPostInteractionTest({ page }: PageFixture, testInfo: TestInfo) {
    const postRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'post-50')!
    await gotoLocalRoute(page, postRoute)

    await page.evaluate(() =>
      window.scrollTo(0, Math.round(document.documentElement.scrollHeight * 0.45)),
    )
    await page.waitForTimeout(220)
    await expect(page.locator('#fabtn_reading_progress')).toBeVisible()

    await page.locator('#share_show').click()
    await expect(page.locator('#share, .kt-blog__share')).toBeVisible()
    await expect(page.locator('#share_copy_link')).toBeVisible()
    await expect(page.locator('#share_show')).toHaveCSS('opacity', '0')
    await expect(page.locator('.kt-blog__share-link')).toHaveCount(9)

    await page
      .locator('#post_comment_content, .kt-blog__comment-textarea')
      .first()
      .fill('Argon parity smoke')
    await expect(page.locator('#post_comment_send, .kt-blog__comment-submit').first()).toBeVisible()
    await expect(page.locator('#post_comment_captcha')).toBeVisible()
    await expect(page.locator('#post_comment_link')).toHaveCount(0)
    await expect(page.locator('#post_comment_toggle_extra_input')).toHaveCount(0)
    await expect(page.locator('#comment_post_use_markdown')).toBeVisible()
    await expect(page.locator('#comment_emotion_btn')).toBeVisible()
    await expect(page.locator('#post_comment form')).toHaveClass(/ant-form/)
    await expect(page.locator('#post_comment_content')).toHaveClass(/ant-input/)
    await expectVisibleFontAwesomeIcon(page, '#comment_emotion_btn i')
    await expectVisibleFontAwesomeIcon(page, '#post_comment_send i')
    await expect(page.locator('#comment_emotion_btn')).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    )
    await expect(page.locator('#comment_emotion_btn')).toHaveCSS('box-shadow', 'none')
    await expect(page.locator('#comment_emotion_btn i')).toHaveCSS('font-size', '25px')
    await expectRect(page.locator('#post_comment_content'), { height: 80 })
    await expectRect(page.locator('#post_comment_name'), { height: 46 })
    await expectRect(page.locator('#post_comment_send'), { height: 43, width: 100 })
    await expect(page.locator('#post_comment_send')).toHaveCSS('border-radius', '4px')

    await writeArgonArtifact(
      testInfo,
      'post-50-interactions',
      await captureAllRouteStates(page, postRoute),
    )
  }
}

/**
 * @returns Playwright test body that verifies WordPress separator blocks use the live Argon divider surface.
 */
function createPostSeparatorSurfaceTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect a post containing real WordPress separator blocks.
   */
  return async function runPostSeparatorSurfaceTest({ page }: PageFixture) {
    const postRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'post-46')!
    await gotoLocalRoute(page, postRoute)

    const separator = page.locator('#post_content hr.wp-block-separator').first()

    await expect(separator).toHaveCount(1)
    await expect(separator).toHaveCSS('display', 'block')
    await expect(separator).toHaveCSS('margin', '32px 0px')
    await expect(separator).toHaveCSS('border-top-width', '1px')
    await expect(separator).toHaveCSS('border-top-style', 'solid')
    await expect(separator).toHaveCSS('border-top-color', 'rgb(71, 63, 82)')
    await expect(separator).toHaveCSS('border-bottom-width', '0px')
    await expectRect(separator, { height: 1 })
  }
}

/**
 * @returns Playwright test body that checks WordPress lazyload image placeholders keep live Argon dimensions.
 */
function createPostImagePlaceholderSurfaceTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect a post containing WordPress image figures.
   */
  return async function runPostImagePlaceholderSurfaceTest({ page }: PageFixture) {
    const postRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'post-20')!
    await gotoLocalRoute(page, postRoute)

    const figure = page.locator('#post_content figure.wp-block-image').first()
    const wrapper = figure.locator('.fancybox-wrapper').first()
    const image = figure.locator('img.lazyload').first()

    await expect(figure).toHaveCSS('margin', '48px 0px')
    await expectRect(figure, { height: 500 })
    await expectRect(wrapper, { height: 500 })
    await expectRect(image, { height: 500 })
    await expect(image).toHaveCSS('display', 'inline')
    await expect(image).toHaveCSS('vertical-align', 'bottom')
    await expect(image).toHaveCSS('background-color', 'rgb(60, 54, 67)')
  }
}

/**
 * @returns Playwright test body that verifies Argon's codeblock control buttons mutate the same runtime classes.
 */
function createPostCodeblockControlBehaviorTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect and click rendered highlight.js controls.
   */
  return async function runPostCodeblockControlBehaviorTest({ page }: PageFixture) {
    const postRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'post-61')!
    await gotoLocalRoute(page, postRoute)

    const pre = page
      .locator('#post_content pre.hljs-codeblock, #post_content pre.wp-block-code.hljs-codeblock')
      .first()
    const code = pre.locator('code').first()
    const lineNumber = pre.locator('.hljs-ln-numbers').first()
    const lineCode = pre.locator('.hljs-ln-code').first()

    await pre.locator('.hljs-control-toggle-break-line').click()
    await expect(pre).toHaveClass(/hljs-break-line/)
    await expect(code).toHaveCSS('white-space', 'pre')
    await expect(lineCode).toHaveCSS('white-space', 'break-spaces')
    await expect(lineCode).toHaveCSS('line-break', 'anywhere')
    expect(
      await pre
        .locator('.hljs-control-toggle-break-line')
        .evaluate((element) => getComputedStyle(element, '::before').content),
    ).toBe('"关闭折行"')

    await pre.locator('.hljs-control-toggle-linenumber').click()
    await expect(pre).toHaveClass(/hljs-hide-linenumber/)
    await expect(lineNumber).toHaveCSS('display', 'block')
    await expect(lineNumber).toHaveCSS('opacity', '0')
    await expect(lineCode).toHaveCSS('padding-left', '4px')
    expect(
      await pre
        .locator('.hljs-control-toggle-linenumber')
        .evaluate((element) => getComputedStyle(element, '::before').content),
    ).toBe('"显示行号"')

    await pre.locator('.hljs-control-fullscreen').click()
    await expect(pre).toHaveClass(/hljs-codeblock-fullscreen/)
    await expect(page.locator('html')).toHaveClass(/codeblock-fullscreen/)
    await expect(pre).toHaveCSS('position', 'fixed')
    await expect(pre).toHaveCSS('z-index', '10000')
    await expect(pre).toHaveCSS('padding', '0px')
    await expect(code).toHaveCSS('position', 'absolute')
    await expect(code).toHaveCSS('border-radius', '0px')
    expect(
      await pre
        .locator('.hljs-control-fullscreen')
        .evaluate((element) => getComputedStyle(element, '::before').content),
    ).toBe('"退出全屏"')

    await pre.locator('.hljs-control-fullscreen').click()
    await expect(pre).not.toHaveClass(/hljs-codeblock-fullscreen/)
    await expect(page.locator('html')).not.toHaveClass(/codeblock-fullscreen/)
  }
}

/**
 * @returns Playwright test body that verifies backend-generated base codeblocks are upgraded on page bind.
 */
function createBackendBaseCodeblockRuntimeTest() {
  /**
   * @param fixtures Playwright page fixture used to intercept the public article API and render a base codeblock.
   */
  return async function runBackendBaseCodeblockRuntimeTest({ page }: PageFixture) {
    await page.route('**/api/blog/article/public/list**', fulfillBackendBaseCodeblockArticleList)
    await page.route(
      '**/api/blog/article/public/detail**',
      fulfillBackendBaseCodeblockArticleDetail,
    )
    await page.goto('/#/post/backend-codeblock-runtime', { waitUntil: 'domcontentloaded' })
    await waitForArgonPage(page)

    const pre = page
      .locator('#post_content pre.hljs-codeblock, #post_content pre.wp-block-code.hljs-codeblock')
      .first()
    const lineCodes = pre.locator('.hljs-ln-code')

    await expect(page.getByText('后端代码块运行时').first()).toBeVisible()
    await expect(pre).toBeVisible()
    await expect(pre.locator('table.hljs-ln')).toHaveCount(1)
    await expect(pre.locator('table.hljs-ln > tbody > tr')).toHaveCount(2)
    await expect(pre.locator(':scope > .hljs-control')).toHaveCount(1)
    await expect(pre.locator('.hljs-control-btn')).toHaveCount(4)
    await expect(lineCodes.nth(0)).toHaveText('const a = 1;')
    await expect(lineCodes.nth(0)).toHaveAttribute('data-line-number', '1')
    await expect(lineCodes.nth(1)).toHaveText('const b = a + 1;')
    await expect(lineCodes.nth(1)).toHaveAttribute('data-line-number', '2')

    await pre.locator('.hljs-control-toggle-break-line').click()
    await expect(pre).toHaveClass(/hljs-break-line/)
    await pre.locator('.hljs-control-toggle-linenumber').click()
    await expect(pre).toHaveClass(/hljs-hide-linenumber/)
  }
}

/**
 * @returns Playwright test body that verifies code copy produces Argon's toast-style user feedback.
 */
function createPostCodeblockCopyFeedbackTest() {
  /**
   * @param fixtures Playwright page fixture used to grant clipboard permission and click the copied code control.
   */
  return async function runPostCodeblockCopyFeedbackTest({ page }: PageFixture) {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    const postRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'post-61')!
    await gotoLocalRoute(page, postRoute)

    const pre = page
      .locator('#post_content pre.hljs-codeblock, #post_content pre.wp-block-code.hljs-codeblock')
      .first()

    await pre.locator('.hljs-control-copy').click()
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    const normalizedClipboardText = clipboardText.replace(/\r\n/g, '\n')
    expect(normalizedClipboardText.startsWith('Admin QQBot 账号页\n  -> 扫码新增 / 更新登录')).toBe(
      true,
    )
    expect(normalizedClipboardText).not.toContain('1 Admin QQBot 账号页')
    await expect(page.locator('.iziToast-wrapper.iziToast-wrapper-topRight')).toBeVisible()
    await expect(page.locator('.iziToast.shadow')).toContainText('复制成功')
    await expect(page.locator('.iziToast.shadow')).toContainText('代码已复制到剪贴板')
    await expect(page.locator('.iziToast.shadow')).toHaveCSS(
      'background-color',
      'rgb(45, 206, 137)',
    )
  }
}

/**
 * @param route Intercepted Blog article list request from the local Vue app.
 */
async function fulfillBackendBaseCodeblockArticleList(route: Route) {
  await route.fulfill({
    contentType: 'application/json',
    json: {
      code: 0,
      data: {
        list: [BACKEND_BASE_CODEBLOCK_ARTICLE],
        total: 1,
      },
      msg: 'ok',
    },
  })
}

/**
 * @param route Intercepted Blog article detail request from the local Vue app.
 */
async function fulfillBackendBaseCodeblockArticleDetail(route: Route) {
  await route.fulfill({
    contentType: 'application/json',
    json: {
      code: 0,
      data: BACKEND_BASE_CODEBLOCK_ARTICLE,
      msg: 'ok',
    },
  })
}

/**
 * @returns Playwright test body that verifies inline WordPress links inherit Argon's live color and hover underline.
 */
function createPostInlineLinkSurfaceTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect a post with raw WordPress anchor links.
   */
  return async function runPostInlineLinkSurfaceTest({ page }: PageFixture) {
    const postRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'post-9')!
    await gotoLocalRoute(page, postRoute)

    const link = page.locator('#post_content p a[href]').first()

    await expect(link).toHaveCSS('color', 'rgb(222, 204, 245)')
    await expect(link).toHaveCSS('text-decoration-line', 'none')
    await expect(link).toHaveCSS('border-bottom-width', '0px')
    await expect(link).toHaveCSS('overflow-wrap', 'break-word')
    await link.hover()
    await expect(link).toHaveCSS('color', 'rgb(195, 161, 237)')
    expect(await link.evaluate((element) => getComputedStyle(element, '::before').transform)).toBe(
      'matrix(1, 0, 0, 1, 0, 0)',
    )
  }
}

/**
 * @returns Playwright test body that checks Argon image wrappers open the Fancybox runtime shell.
 */
function createPostFancyboxRuntimeTest() {
  /**
   * @param fixtures Playwright page fixture used to click WordPress image wrappers inside rendered post content.
   */
  return async function runPostFancyboxRuntimeTest({ page }: PageFixture) {
    const postRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'post-20')!
    await gotoLocalRoute(page, postRoute)

    const wrapper = page.locator('#post_content .fancybox-wrapper[href]').first()
    await wrapper.click()

    await expect(page.locator('body')).toHaveClass(/fancybox-active/)
    await expect(page.locator('body')).toHaveClass(/compensate-for-scrollbar/)
    await expect(page.locator('.fancybox-container.fancybox-is-open')).toBeVisible()
    await expect(page.locator('.fancybox-toolbar')).toBeVisible()
    await expect(page.locator('.fancybox-button--close')).toBeVisible()
    await expect(page.locator('.fancybox-stage')).toBeVisible()

    await page.locator('.fancybox-button--close').click()
    await expect(page.locator('.fancybox-container')).toHaveCount(0)
    await expect(page.locator('body')).not.toHaveClass(/fancybox-active/)
  }
}

/**
 * @returns Playwright test body that verifies WordPress `hljs-codeblock` HTML keeps Argon's nested layout.
 */
function createPostCodeblockSurfaceTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect a post with rendered highlight.js line tables.
   */
  return async function runPostCodeblockSurfaceTest({ page }: PageFixture) {
    const postRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'post-61')!
    await gotoLocalRoute(page, postRoute)

    const pre = page
      .locator('#post_content pre.hljs-codeblock, #post_content pre.wp-block-code.hljs-codeblock')
      .first()
    const code = pre.locator('code').first()
    const table = pre.locator('table.hljs-ln').first()
    const lineNumber = pre.locator('.hljs-ln-numbers').first()
    const lineNumberInner = lineNumber.locator('.hljs-ln-n').first()
    const lineCode = pre.locator('.hljs-ln-code').first()
    const secondLineNumber = pre.locator('.hljs-ln-numbers').nth(1)
    const secondLineNumberInner = secondLineNumber.locator('.hljs-ln-n').first()
    const secondLineCode = pre.locator('.hljs-ln-code').nth(1)
    const control = pre.locator('.hljs-control').first()
    const lineNumberButton = pre.locator('.hljs-control-toggle-linenumber').first()

    await expect(pre).toHaveCSS('position', 'relative')
    await expect(pre).toHaveCSS('margin', '0px 0px 16px')
    expect(await readPseudoStyle(pre, '::before', 'display')).toBe('block')
    expect(await readPseudoStyle(pre, '::before', 'width')).toBe('54px')
    expect(await readPseudoStyle(pre, '::before', 'height')).toBe('14px')
    expect(await readPseudoStyle(pre, '::before', 'top')).toBe('22px')
    expect(await readPseudoStyle(pre, '::before', 'left')).toBe('20px')
    expect(await readPseudoStyle(pre, '::before', 'backgroundImage')).toContain(
      'data:image/svg+xml',
    )
    await expect(code).toHaveCSS('display', 'block')
    await expect(code).toHaveCSS('margin', '15px 0px')
    await expect(code).toHaveCSS('padding', '55px 20px 22px')
    await expect(code).toHaveCSS('border-radius', '8px')
    await expect(code).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0.2) 0px 5px 20px 0px')
    await expect(code).toHaveCSS('background-color', 'rgb(40, 44, 52)')
    await expect(code).toHaveCSS('color', 'rgb(171, 178, 191)')
    await expect(code).toHaveCSS('font-size', '16px')
    await expect(code).toHaveCSS('line-height', '24px')
    await expect(table).toHaveCSS('display', 'table')
    await expect(table).toHaveCSS('margin', '0px')
    await expect(table).toHaveCSS('white-space', 'pre')
    await expect(lineNumber).toHaveCSS('display', 'block')
    await expect(lineNumber).toHaveCSS('position', 'absolute')
    await expect(lineNumber).toHaveCSS('padding', '0px 12px 0px 0px')
    await expect(lineNumber).toHaveCSS('border-top-width', '0px')
    await expect(lineNumber).toHaveAttribute('data-line-number', '1')
    await expect(lineNumberInner).toHaveAttribute('data-line-number', '1')
    expect(await readPseudoStyle(lineNumberInner, '::before', 'content')).toBe('"1"')
    await expectRect(lineNumber, { height: 24 })
    await expect(lineCode).toHaveCSS('padding-left', '30px')
    await expect(lineCode).toHaveAttribute('data-line-number', '1')
    await expect(lineCode).toHaveCSS('border-top-width', '0px')
    await expect(secondLineNumber).toHaveAttribute('data-line-number', '2')
    await expect(secondLineNumberInner).toHaveAttribute('data-line-number', '2')
    expect(await readPseudoStyle(secondLineNumberInner, '::before', 'content')).toBe('"2"')
    await expect(secondLineCode).toHaveAttribute('data-line-number', '2')
    await expect(control).toHaveCSS('position', 'absolute')
    await expect(control).toHaveCSS('top', '16px')
    await expect(control).toHaveCSS('right', '20px')
    await expect(control).toHaveCSS('display', 'block')
    await expect(control).toHaveCSS('opacity', '0')
    await expect(lineNumberButton).toHaveCSS('width', '12px')
    await expect(lineNumberButton).toHaveCSS('margin-left', '15px')
    await expect(lineNumberButton).toHaveCSS('opacity', '0.8')
    expect(await readPseudoStyle(lineNumberButton, '::before', 'content')).toBe('"隐藏行号"')
    expect(await readPseudoStyle(lineNumberButton, '::before', 'top')).toBe('22px')
    expect(await readPseudoStyle(lineNumberButton, '::before', 'width')).toBe('92px')

    await pre.hover()
    await expect(control).toHaveCSS('opacity', '0.4')
    await lineNumberButton.hover()
    await expect(control).toHaveCSS('opacity', '1')
    await expect(lineNumberButton).toHaveCSS('opacity', '0.5')
    expect(await readPseudoStyle(lineNumberButton, '::before', 'opacity')).toBe('1')
    expect(await readPseudoStyle(lineNumberButton, '::before', 'top')).toBe('25px')
  }
}

/**
 * @returns Playwright test body that keeps the top navbar container aligned with the live Argon Bootstrap layout.
 */
function createHeaderContainerSurfaceTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect the desktop navbar.
   */
  return async function runHeaderContainerSurfaceTest({ page }: PageFixture) {
    await page.setViewportSize({ height: 900, width: 1440 })
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0])

    const navbar = page.locator('#navbar-main')
    const container = page.locator('.kt-blog__header-container')

    await expect(navbar).toHaveCSS('padding', '16px')
    await expect(navbar).toHaveCSS('height', '78px')
    await expect(container).toHaveClass(/container/)
    await expect(container).toHaveCSS('padding', '0px 15px')
    await expect(container).toHaveCSS('width', '1200px')
    await expectRect(container, { height: 46, width: 1200 })
  }
}

/**
 * @returns Playwright test body that checks leftbar menu items against the live Argon item surface.
 */
function createSidebarMenuSurfaceTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect the home leftbar menu.
   */
  return async function runSidebarMenuSurfaceTest({ page }: PageFixture) {
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0])

    const menu = page.locator('.kt-blog__sidebar-menu')
    const firstItem = menu.locator('> li').first()
    const homeLink = firstItem.locator('> a')
    const homeIcon = homeLink.locator('> i')
    const adminLink = menu.getByRole('link', { name: '管理' })

    await expect(menu).toHaveClass(/leftbar-menu/)
    await expect(firstItem).toHaveClass(/leftbar-menu-item/)
    await expect(firstItem).not.toHaveClass(/current/)
    await expect(homeLink).not.toHaveClass(/router-link-active|router-link-exact-active/)
    await expect(homeLink).toHaveCSS('display', 'block')
    await expect(homeLink).toHaveCSS('padding', '0px 20px')
    await expect(homeLink).toHaveCSS('height', '36px')
    await expect(homeLink).toHaveCSS('line-height', '36px')
    await expect(homeLink).toHaveCSS('font-size', '14px')
    await expect(homeLink).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(homeLink).toHaveCSS('transition', 'background 0.2s ease-in-out')
    await expect(homeIcon).toHaveCSS('display', 'inline-block')
    await expect(homeIcon).toHaveCSS('width', '15px')
    await expect(homeIcon).toHaveCSS('margin-right', '8px')
    await expect(adminLink).toHaveAttribute(
      'href',
      'http://localhost:5999/#/auth/login?sso=1&redirect=%2Fblog%2Farticle',
    )
  }
}

/**
 * @returns Playwright test body that verifies the home leftbar overview matches Argon's non-navigating site-state card.
 */
function createSidebarOverviewSurfaceTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect the home sidebar overview card.
   */
  return async function runSidebarOverviewSurfaceTest({ page }: PageFixture) {
    await gotoLocalRoute(page, ARGON_ROUTE_CASES[0])

    const overviewInner = page.locator('#leftbar_part2_inner')
    const hiddenTabs = page.locator('#leftbar_part2_inner > .nav-wrapper')
    const overviewPane = page.locator('#leftbar_tab_overview')
    const postCountLink = page.locator('.site-state-posts a')
    const beforeUrl = page.url()

    await expect(overviewInner).toHaveClass(/card-body/)
    await expectRect(overviewInner, { height: 252, width: 250 })
    await expect(overviewInner).toHaveCSS('padding', '10px')
    await expect(overviewInner).toHaveCSS('overflow-y', 'auto')
    await expect(hiddenTabs).toHaveCount(1)
    await expect(hiddenTabs).toHaveCSS('display', 'none')
    await expect(page.locator('#leftbar_part2_inner > div > .tab-content')).toHaveCount(1)
    await expect(
      page.locator('#leftbar_part2_inner > .kt-blog__sidebar-overview-content'),
    ).toHaveCount(0)
    await expect(overviewPane).toHaveClass(/tab-pane/)
    await expect(overviewPane).toHaveClass(/fade/)
    await expect(overviewPane).toHaveClass(/text-center/)
    await expect(overviewPane).toHaveClass(/active/)
    await expect(overviewPane).toHaveCSS('transition', 'opacity 0.15s linear')
    await expect(overviewPane).toHaveCSS('text-align', 'center')
    await expect(page.locator('#leftbar_overview_author_image')).toHaveClass(/rounded-circle/)
    await expect(page.locator('#leftbar_overview_author_image')).toHaveClass(/shadow-sm/)
    await expectRect(page.locator('#leftbar_overview_author_image'), { height: 100, width: 100 })
    await expect(page.locator('#leftbar_overview_author_name')).toHaveCSS('margin', '15px 0px 8px')
    await expect(page.locator('.site-state')).toHaveCSS('width', '210px')
    await expect(postCountLink).not.toHaveAttribute('href')
    await expect(postCountLink).toHaveCSS('cursor', 'default')

    await postCountLink.click({ force: true })
    await page.waitForTimeout(250)
    expect(page.url()).toBe(beforeUrl)
  }
}

/**
 * @returns Playwright test body that checks the post leftbar overview/catalog tabs are real controls.
 */
function createPostSidebarTabTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect post sidebar panes.
   */
  return async function runPostSidebarTabTest({ page }: PageFixture) {
    const postRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'post-50')!
    await gotoLocalRoute(page, postRoute)
    const mainBoxBefore = await page.locator('.kt-blog__main').boundingBox()

    const tabLabels = await page
      .locator('.kt-blog__sidebar-tabs [id^="leftbar_tab_"]')
      .evaluateAll((tabs) => tabs.map((tab) => tab.textContent?.replace(/\s+/g, ' ').trim()))
    expect(tabLabels).toEqual(['文章目录', '站点概览'])
    await expect(page.locator('.kt-blog__sidebar-tabs')).toHaveCSS('padding', '5px 0px 16px')
    await expect(page.locator('#leftbar_tab_catalog_btn')).toHaveCSS('font-size', '13px')
    await expect(page.locator('#leftbar_tab_catalog_btn')).toHaveCSS('border-bottom-width', '1px')
    await expect(page.locator('#leftbar_tab_catalog_btn')).toHaveAttribute('data-toggle', 'tab')
    await expect(page.locator('#leftbar_tab_catalog_btn')).toHaveAttribute('no-pjax', '')
    await expect(page.locator('#leftbar_tab_catalog')).toHaveCSS(
      'transition',
      'opacity 0.15s linear',
    )
    await expect(page.locator('#leftbar_tab_overview')).toHaveCSS(
      'transition',
      'opacity 0.15s linear',
    )
    await expect(page.locator('#leftbar_tab_overview')).toHaveCSS('opacity', '0')

    await expect(page.locator('#leftbar_tab_catalog')).toBeVisible()
    await expect(page.locator('#leftbar_tab_overview')).toBeHidden()
    await expect(page.locator('#leftbar_tab_catalog_btn')).toHaveClass(
      /kt-blog__sidebar-tab--active/,
    )
    await expect(page.locator('#leftbar_catalog .index-link')).toHaveCount(37)
    await expect(page.locator('#leftbar_catalog .index-link').nth(0)).toHaveText('1. 方案摘要')
    await expect(page.locator('#leftbar_catalog .index-link').nth(1)).toHaveText('2. 建设目标')
    await expect(page.locator('#leftbar_catalog .index-link').nth(2)).toHaveText('2.1 业务目标')
    await expect(page.locator('#leftbar_catalog .index-link').nth(3)).toHaveText('2.2 技术目标')
    await expect(page.locator('#leftbar_catalog .index-link').nth(4)).toHaveText('3. 总体架构')
    await expect(page.locator('#leftbar_catalog .index-link').first()).toHaveAttribute(
      'href',
      '#header-id-1',
    )
    await expect(page.locator('#leftbar_catalog .index-subItem-box').first()).toHaveCSS(
      'display',
      'none',
    )
    await expect(page.locator('#leftbar_catalog .index-link').first()).toHaveCSS(
      'font-size',
      '15px',
    )
    await expect(page.locator('#leftbar_catalog .index-link').first()).toHaveCSS(
      'padding',
      '4px 8px',
    )
    await expect(page.locator('#leftbar_catalog .index-link').first()).toHaveCSS(
      'border-left-width',
      '3px',
    )
    await expect(page.locator('#post_content')).toHaveCSS('line-height', '28.8px')
    await expect(page.locator('#post_content p').first()).toHaveCSS('line-height', '28.8px')
    await expect(page.locator('#header-id-2')).toHaveCSS('font-size', '26px')
    await expect(page.locator('#header-id-2')).toHaveCSS('line-height', '39px')
    await expect(page.locator('#header-id-2')).toHaveCSS('color', 'rgb(238, 238, 238)')
    await expect(page.locator('#header-id-2')).toHaveCSS('margin-top', '18px')
    await expect(page.locator('#header-id-2')).toHaveCSS('margin-bottom', '15px')
    await expect(page.locator('#post_content h3').first()).toHaveCSS('line-height', '33px')
    await expect(page.locator('#post_content h3').first()).toHaveCSS('color', 'rgb(238, 238, 238)')
    await expect(page.locator('#post_content strong').first()).toHaveCSS('font-weight', '600')
    await expect(page.locator('#post_content ul').first()).toHaveCSS('margin', '0px 0px 16px')
    await expect(page.locator('#post_content ul').first()).toHaveCSS('padding-left', '40px')
    await expect(page.locator('#post_content .wp-block-preformatted').first()).toHaveCSS(
      'background-color',
      'rgb(60, 54, 67)',
    )
    await expect(page.locator('#post_content .wp-block-preformatted').first()).toHaveCSS(
      'border-radius',
      '3px',
    )
    await expect(page.locator('#post_content .wp-block-preformatted').first()).toHaveCSS(
      'font-size',
      '14px',
    )
    await expect(page.locator('#post_content .wp-block-preformatted').first()).toHaveCSS(
      'line-height',
      '19.25px',
    )
    await expect(page.locator('#post_content .wp-block-preformatted').first()).toHaveCSS(
      'padding',
      '14px',
    )
    await expect(page.locator('#post_content .wp-block-preformatted').first()).toHaveCSS(
      'border-top-width',
      '1px',
    )
    await expect(page.locator('#post_content p code').first()).toHaveCSS('padding', '2px 5px')
    await expect(page.locator('#post_content p code').first()).toHaveCSS('border-top-width', '1px')
    await expect(page.locator('#post_content p code').first()).toHaveCSS(
      'background-color',
      'rgb(60, 54, 67)',
    )
    await expect(page.locator('#post_content p code').first()).toHaveCSS('border-radius', '3px')
    await expect(page.locator('#post_content p code').first()).toHaveCSS('white-space', 'normal')
    await expect(page.locator('#post_content figure.wp-block-table').first()).toHaveCSS(
      'margin',
      '48px 0px',
    )
    await expect(page.locator('#post_content figure.wp-block-table').first()).toHaveCSS(
      'overflow-x',
      'auto',
    )
    await expect(page.locator('#post_content figure.wp-block-table table').first()).toHaveCSS(
      'display',
      'table',
    )
    await expect(page.locator('#post_content figure.wp-block-table table').first()).toHaveCSS(
      'table-layout',
      'fixed',
    )
    await expect(page.locator('#post_content figure.wp-block-table table').first()).toHaveCSS(
      'white-space',
      'normal',
    )
    await expect(page.locator('#post_content figure.wp-block-table table').first()).toHaveCSS(
      'word-break',
      'break-word',
    )
    await expect(page.locator('#post_content figure.wp-block-table th').first()).toHaveCSS(
      'padding',
      '8px',
    )
    await expect(page.locator('#post_content figure.wp-block-table th').first()).toHaveCSS(
      'text-align',
      'left',
    )
    await expect(page.locator('#post_content figure.wp-block-table th').first()).toHaveCSS(
      'vertical-align',
      'top',
    )
    await expect(page.locator('#post_content figure.wp-block-table td').first()).toHaveCSS(
      'padding',
      '8px',
    )
    await expect(page.locator('#post_content figure.wp-block-table td').first()).toHaveCSS(
      'vertical-align',
      'top',
    )
    const postContentStats = await page.locator('#post_content').evaluate((element) => {
      const secondHeading = document.querySelector('#header-id-2')

      return {
        header2OffsetTop: Math.round(
          (secondHeading?.getBoundingClientRect().top ?? 0) + window.scrollY,
        ),
        textLength: element.textContent?.trim().length ?? 0,
      }
    })
    expect(postContentStats.textLength).toBeGreaterThan(9000)
    expect(postContentStats.header2OffsetTop).toBeGreaterThan(900)

    const secondHeadingActiveBoundary = await page.locator('#header-id-2').evaluate((element) => {
      const ARGON_CATALOG_OFFSET = 80

      return Math.ceil(element.getBoundingClientRect().top + window.scrollY - ARGON_CATALOG_OFFSET)
    })
    await page.evaluate(
      (scrollTop) => window.scrollTo(0, scrollTop - 1),
      secondHeadingActiveBoundary,
    )
    await expect
      .poll(
        () =>
          page
            .locator('#leftbar_catalog .index-item.current > .index-link')
            .evaluate((element) => element.textContent?.trim()),
        { message: 'catalog keeps the previous heading before the Argon activation boundary' },
      )
      .toBe('1. 方案摘要')
    await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), secondHeadingActiveBoundary)
    await expect
      .poll(
        () =>
          page
            .locator('#leftbar_catalog .index-item.current > .index-link')
            .evaluate((element) => element.textContent?.trim()),
        { message: 'catalog switches at the Argon activation boundary' },
      )
      .toBe('2. 建设目标')
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect
      .poll(
        () =>
          page
            .locator('#leftbar_catalog .index-item.current > .index-link')
            .evaluate((element) => element.textContent?.trim()),
        { message: 'catalog returns to the first heading after scrolling back to top' },
      )
      .toBe('1. 方案摘要')

    const beforeClickHash = await page.evaluate(() => window.location.hash)
    const beforeClickScrollY = await page.evaluate(() => window.scrollY)
    await page.locator('#leftbar_catalog .index-link').nth(1).click()
    await expect(page.locator('#leftbar_catalog .index-item.current > .index-link')).toHaveText(
      '2. 建设目标',
    )
    await expect(page.locator('#leftbar_catalog .index-subItem-box').first()).toHaveCSS(
      'display',
      'block',
    )
    await page.waitForTimeout(100)
    const slideHeightAt100ms = await page
      .locator('#leftbar_catalog .index-subItem-box')
      .first()
      .evaluate((element) => Math.round(element.getBoundingClientRect().height))
    expect(slideHeightAt100ms).toBeGreaterThan(15)
    expect(slideHeightAt100ms).toBeLessThan(61)
    await expect
      .poll(
        () =>
          page.locator('#leftbar_catalog .index-item.current > .index-link').evaluate((element) => {
            const probe = document.createElement('span')
            probe.style.color = document.documentElement.classList.contains('darkmode')
              ? 'var(--themecolor-light)'
              : 'var(--themecolor)'
            document.querySelector('.kt-blog')?.append(probe)
            const expectedColor = getComputedStyle(probe).color
            probe.remove()

            return `${getComputedStyle(element).color}|${expectedColor}`
          }),
        { message: 'catalog current color reaches Argon theme color after transition' },
      )
      .toBe(
        await page.locator('#leftbar_catalog .index-item.current > .index-link').evaluate(() => {
          const probe = document.createElement('span')
          probe.style.color = document.documentElement.classList.contains('darkmode')
            ? 'var(--themecolor-light)'
            : 'var(--themecolor)'
          document.querySelector('.kt-blog')?.append(probe)
          const expectedColor = getComputedStyle(probe).color
          probe.remove()

          return `${expectedColor}|${expectedColor}`
        }),
      )
    expect(await page.evaluate(() => window.location.hash)).toBe(beforeClickHash)
    await expect
      .poll(() => page.evaluate(() => window.scrollY), {
        message: 'catalog click scrolls the document',
      })
      .toBeGreaterThan(beforeClickScrollY + 850)
    await expect
      .poll(() =>
        page
          .locator('#header-id-2')
          .evaluate((element) => Math.round(element.getBoundingClientRect().top)),
      )
      .toBeLessThan(120)
    await page.waitForTimeout(450)
    await page.evaluate(() =>
      window.scrollTo(0, Math.round(document.documentElement.scrollHeight * 0.75)),
    )
    await expect
      .poll(
        () =>
          page
            .locator('#leftbar_catalog .index-item.current > .index-link')
            .evaluate((element) => element.textContent?.trim()),
        { message: 'catalog current follows document scroll' },
      )
      .toBe('13. 安全边界')
    await expect(page.locator('#leftbar_catalog .index-subItem-box').first()).toHaveCSS(
      'display',
      'none',
    )

    await page.locator('#leftbar_tab_overview_btn').click()
    await expect(page.locator('#leftbar_tab_catalog')).toHaveCSS('opacity', '0')
    await expect(page.locator('#leftbar_tab_overview')).toHaveCSS('opacity', '1')
    await expect(page.locator('#leftbar_tab_overview')).toBeVisible()
    await expect(page.locator('#leftbar_tab_catalog')).toBeHidden()
    await expect(page.locator('#leftbar_tab_overview_btn')).toHaveClass(
      /kt-blog__sidebar-tab--active/,
    )
    await expect(page.locator('.kt-blog__site-stats')).toHaveCSS('display', 'block')
    await expect(page.locator('.kt-blog__site-stats')).toHaveCSS('white-space', 'nowrap')
    await expect(page.locator('.kt-blog__site-stats-item').nth(1)).toHaveCSS(
      'border-left-width',
      '1px',
    )
    await expect(page.locator('.kt-blog__site-stats-count').first()).toHaveCSS('font-size', '16px')
    await expect(page.locator('.kt-blog__site-stats-name').first()).toHaveCSS('font-size', '13px')

    const mainBoxAfter = await page.locator('.kt-blog__main').boundingBox()
    expect(Math.round(mainBoxAfter?.width ?? 0)).toBe(Math.round(mainBoxBefore?.width ?? 0))
  }
}

/**
 * @returns Playwright test body that keeps the sidebar tab fade on Argon's active/show class-frame timing.
 */
function createPostSidebarClassFrameSourceTest() {
  return async function runPostSidebarClassFrameSourceTest() {
    const source = await readFile(
      new URL('../../src/components/blog/layout/BlogSidebar.tsx', import.meta.url),
      'utf8',
    )

    expect(source).toContain('visiblePaneTab')
    expect(source).toContain('shownPaneTab')
    expect(source).toContain('tabFadeFrame')
    expect(source).toContain('requestBlogFrame')
    expect(source).toContain('@/factories/blogAnimationFactory')
    expect(source).not.toContain('kt-blog__sidebar-tab-pane')
    expect(source).not.toMatch(/\bTransition\b/)
    expect(source).not.toContain('vShow')
  }
}

/**
 * @returns Playwright test body that prevents replaceable Argon behavior from regressing to native id queries.
 */
function createReplaceableDomRefSourceTest() {
  return async function runReplaceableDomRefSourceTest() {
    const sidebarSource = await readFile(
      new URL('../../src/components/blog/layout/BlogSidebar.tsx', import.meta.url),
      'utf8',
    )
    const postPageSource = await readFile(
      new URL('../../src/views/blog/PostPage.tsx', import.meta.url),
      'utf8',
    )
    const commentsStyle = await readFile(
      new URL('../../src/styles/searchComments.scss', import.meta.url),
      'utf8',
    )

    expect(sidebarSource).toContain('ref={props.part1Ref}')
    expect(sidebarSource).toContain('ref={props.part2Ref}')
    expect(sidebarSource).toContain('ref={registerCatalogRef}')
    expect(postPageSource).toContain('ref={registerPostContentRef}')
    expect(`${sidebarSource}\n${postPageSource}`).not.toMatch(
      /document\.(?:getElementById|querySelector(?:All)?)\([^)]*['"]#?(?:leftbar|post_content|post_comment)/,
    )
    expect(commentsStyle).not.toContain('#post_comment_send')
    expect(commentsStyle).not.toContain('#comment_emotion_btn')
  }
}

/**
 * @returns Playwright test body that verifies Argon's tab-pane fade has a real intermediate opacity frame.
 */
function createPostSidebarTabFadeTest() {
  /**
   * @param fixtures Playwright page fixture used to inspect post sidebar tab animation timing.
   */
  return async function runPostSidebarTabFadeTest({ page }: PageFixture) {
    const postRoute = ARGON_ROUTE_CASES.find((routeCase) => routeCase.routeKey === 'post-50')!
    await gotoLocalRoute(page, postRoute)

    const overviewPane = page.locator('#leftbar_tab_overview')
    await expect(overviewPane).toHaveCSS('opacity', '0')

    await page.locator('#leftbar_tab_overview_btn').click()
    await page.waitForTimeout(70)

    const switchingOpacity = await overviewPane.evaluate((element) =>
      Number(getComputedStyle(element).opacity),
    )
    expect(switchingOpacity).toBeGreaterThan(0)
    expect(switchingOpacity).toBeLessThan(1)

    await expect(overviewPane).toHaveCSS('opacity', '1')
    await expect(overviewPane).toBeVisible()
  }
}

/**
 * @param page Browser page containing a FontAwesome `<i>` element.
 * @param selector CSS selector for the icon element whose pseudo content must render.
 */
async function expectVisibleFontAwesomeIcon(page: Page, selector: string) {
  await expect
    .poll(
      () =>
        page.locator(selector).evaluate((element) => {
          const rect = element.getBoundingClientRect()
          const beforeContent = getComputedStyle(element, '::before').content

          return rect.height > 0 && beforeContent !== 'none' && beforeContent !== '""'
        }),
      { message: `${selector} renders FontAwesome pseudo content` },
    )
    .toBe(true)
}

test.describe('Argon local interaction parity', registerLocalInteractionSuite)
