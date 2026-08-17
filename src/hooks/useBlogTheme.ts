import { theme } from 'antdv-next'
import { computed, reactive, watch } from 'vue'

import { resolveLocalBlogApiUrl } from '@/api/blogArticles'
import {
  PREVIOUS_BLOG_AUTHOR_AVATAR,
  PREVIOUS_BLOG_BACKGROUND_IMAGE,
  LOCAL_BLOG_AUTHOR_AVATAR,
  LOCAL_BLOG_BACKGROUND_IMAGE,
  resolveBlogStaticAsset,
  unwrapBlogCssImage,
} from '@/data/blogStaticAssets'
import { createBlogMotionCssVariables } from '@/factories/blogAnimationFactory'
import { buildBlogAdminSsoUrl, isLegacyBlogManagementHref } from '@/factories/blogAdminSsoFactory'
import {
  BLOG_META_NAMES,
  blogDomId,
  blogDomSelector,
  blogMetaSelector,
} from '@/factories/blogDomFactory'

export type BlogThemeMode = 'dark' | 'light'
export type BlogFontMode = 'sans' | 'serif'
export type BlogShadowMode = 'small' | 'big'
export type BlogFilterMode = 'off' | 'sunset' | 'darkness' | 'grayscale'

export interface BlogThemePreferences {
  colorPrimary: string
  filter: BlogFilterMode
  font: BlogFontMode
  mode: BlogThemeMode
  radius: number
  shadow: BlogShadowMode
}

export interface BlogThemeMenuItem {
  external?: boolean
  href: string
  icon?: string
  label: string
}

export interface WordpressArgonThemeConfig {
  argonConfig?: {
    codeHighlight?: {
      breakLine?: boolean
      enable?: boolean
      hideLinenumber?: boolean
      transparentLinenumber?: boolean
    }
    dateFormat?: string
    disablePjax?: boolean
    foldLongComments?: boolean
    foldLongShuoshuo?: boolean
    headroom?: boolean | string
    language?: string
    lazyload?: {
      effect?: string
      threshold?: number
    }
    pangu?: string
    pjaxAnimationDuration?: number
    waterflowColumns?: number | string
    wpPath?: string
    zoomify?: boolean
  }
  backgroundDarkBrightness?: number | string
  backgroundDarkImage?: string
  backgroundDarkOpacity?: number | string
  backgroundImage?: string
  backgroundOpacity?: number | string
  bodyClass?: string | string[]
  darkmodeAutoSwitch?: 'alwaysoff' | 'alwayson' | 'system' | 'time' | string
  enableCustomThemeColor?: boolean
  headerMenu?: BlogThemeMenuItem[]
  headerMenuVisible?: boolean | string
  htmlClass?: string | string[]
  site?: {
    authorAvatar?: string
    authorName?: string
    description?: string
    home?: string
    title?: string
    url?: string
  }
  sidebarMenu?: BlogThemeMenuItem[]
  themeCardRadius?: number | string
  themeColor?: string
  themeColorRgb?: string
  themeVersion?: string
  [key: string]: unknown
}

interface BlogRuntimeThemeConfig {
  articleHeaderStyle: 'default' | string
  backgroundDarkBrightness: number
  backgroundDarkImage: string
  backgroundDarkOpacity: number
  backgroundImage: string
  backgroundOpacity: number
  bodyClass: string[]
  headerMenu: BlogThemeMenuItem[]
  headerMenuVisible: boolean
  siteAuthorAvatar: string
  htmlClass: string[]
  immersionColor: boolean
  siteAuthorName: string
  siteDescription: string
  siteHome: string
  siteTitle: string
  siteUrl: string
  sidebarMenu: BlogThemeMenuItem[]
  themeVersion: string
  toolbarBlur: boolean
  tripleColumn: boolean
  wordpressThemeConfig: WordpressArgonThemeConfig | null
}

const STORAGE_KEY = 'KT_BLOG_THEME_PREFERENCES'
const BLOG_THEME_CONFIG_URL = '/api/blog/theme/config'
const BLOG_THEME_BLOCK_CLASS = 'kt-blog'
const ARGON_SANS_FONT_FAMILY =
  'Comfortaa, "Open Sans", -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimSun, sans-serif'
const ARGON_SERIF_FONT_FAMILY = 'Georgia, "Times New Roman", "Noto Serif SC", serif'
const ARGON_DEFAULT_COLOR_PRIMARY = '#c3a1ed'
const ARGON_PRIMARY_SOFT = '#4a4058'
const ARGON_CARD_SHADOW = '0 2px 4px rgba(0, 0, 0, 0.075)'
const ARGON_DEFAULT_BACKGROUND = PREVIOUS_BLOG_BACKGROUND_IMAGE
const ARGON_DEFAULT_AUTHOR_AVATAR = PREVIOUS_BLOG_AUTHOR_AVATAR
const defaultHeaderMenu: BlogThemeMenuItem[] = []
const defaultSidebarMenu: BlogThemeMenuItem[] = [
  { href: '/', icon: 'fa-home', label: '首页' },
  { external: true, href: buildBlogAdminSsoUrl(), icon: 'fa-user', label: '管理' },
]

const defaultPreferences: BlogThemePreferences = {
  colorPrimary: ARGON_DEFAULT_COLOR_PRIMARY,
  filter: 'off',
  font: 'sans',
  mode: 'dark',
  radius: 4,
  shadow: 'small',
}

const preferences = reactive<BlogThemePreferences>(loadPreferences())
const runtimeConfig = reactive<BlogRuntimeThemeConfig>({
  articleHeaderStyle: 'default',
  backgroundDarkBrightness: 0.65,
  backgroundDarkImage: ARGON_DEFAULT_BACKGROUND,
  backgroundDarkOpacity: 1,
  backgroundImage: ARGON_DEFAULT_BACKGROUND,
  backgroundOpacity: 1,
  bodyClass: ['home', 'blog', 'wp-theme-argon'],
  headerMenu: [...defaultHeaderMenu],
  headerMenuVisible: false,
  htmlClass: ['triple-column', 'immersion-color', 'toolbar-blur', 'article-header-style-default'],
  immersionColor: true,
  siteAuthorAvatar: ARGON_DEFAULT_AUTHOR_AVATAR,
  siteAuthorName: 'KwiTsukasa',
  siteDescription: '',
  siteHome: '',
  siteTitle: 'KwiTsukasa的小站',
  siteUrl: '',
  sidebarMenu: [...defaultSidebarMenu],
  themeVersion: '',
  toolbarBlur: true,
  tripleColumn: true,
  wordpressThemeConfig: null,
})
let themeWatcherReady = false
let systemThemeMediaQuery: MediaQueryList | null = null
let systemThemeChangeHandler: ((event: MediaQueryList | MediaQueryListEvent) => void) | null = null

const isDarkTheme = computed(() => preferences.mode === 'dark')
const siteConfig = computed(() => ({
  authorAvatar: runtimeConfig.siteAuthorAvatar,
  authorName: runtimeConfig.siteAuthorName,
  description: runtimeConfig.siteDescription,
  headerMenu: runtimeConfig.headerMenu,
  headerMenuVisible: runtimeConfig.headerMenuVisible,
  home: runtimeConfig.siteHome,
  sidebarMenu: runtimeConfig.sidebarMenu,
  title: runtimeConfig.siteTitle,
  url: runtimeConfig.siteUrl,
}))
const wordpressThemeConfig = computed(() => runtimeConfig.wordpressThemeConfig)
const themeRootClass = computed(() =>
  [
    BLOG_THEME_BLOCK_CLASS,
    `${BLOG_THEME_BLOCK_CLASS}--wp-argon`,
    `${BLOG_THEME_BLOCK_CLASS}--home`,
    `${BLOG_THEME_BLOCK_CLASS}--blog`,
    runtimeConfig.tripleColumn && `${BLOG_THEME_BLOCK_CLASS}--triple-column`,
    runtimeConfig.immersionColor && `${BLOG_THEME_BLOCK_CLASS}--immersion-color`,
    runtimeConfig.toolbarBlur && `${BLOG_THEME_BLOCK_CLASS}--toolbar-blur`,
    `${BLOG_THEME_BLOCK_CLASS}--article-header-${runtimeConfig.articleHeaderStyle}`,
    runtimeConfig.themeVersion &&
      `${BLOG_THEME_BLOCK_CLASS}--argon-${runtimeConfig.themeVersion.replace(/\./g, '-')}`,
    `${BLOG_THEME_BLOCK_CLASS}--${preferences.mode}`,
    preferences.font === 'serif' && `${BLOG_THEME_BLOCK_CLASS}--font-serif`,
    preferences.shadow === 'big' && `${BLOG_THEME_BLOCK_CLASS}--shadow-big`,
    isThemeColorTooDark(preferences.colorPrimary) && `${BLOG_THEME_BLOCK_CLASS}--theme-too-dark`,
  ]
    .filter(Boolean)
    .join(' '),
)

const themeConfig = computed(() => {
  const palette = createThemePalette(preferences.colorPrimary, preferences.mode)

  return {
    algorithm: (() => {
      if (isDarkTheme.value) {
        return theme.darkAlgorithm
      }
      return theme.defaultAlgorithm
    })(),
    components: {
      Button: {
        borderRadius: preferences.radius,
        colorPrimary: preferences.colorPrimary,
        controlHeightLG: 42,
      },
      Checkbox: {
        colorPrimary: preferences.colorPrimary,
      },
      Input: {
        activeBorderColor: preferences.colorPrimary,
        hoverBorderColor: preferences.colorPrimary,
      },
      Modal: {
        borderRadiusLG: preferences.radius,
        colorBgElevated: palette.card,
      },
      Switch: {
        colorPrimary: preferences.colorPrimary,
      },
    },
    token: {
      borderRadius: preferences.radius,
      colorBgBase: palette.page,
      colorBgContainer: palette.card,
      colorBorder: palette.border,
      colorPrimary: preferences.colorPrimary,
      colorText: palette.text,
      colorTextSecondary: palette.muted,
      fontFamily: getThemeFontFamily(preferences.font),
    },
  }
})

/**
 * 把博客明暗模式写入响应式主题偏好。
 * @param nextMode - 写入 `preferences.mode` 的`nextMode`。
 */
function setThemeMode(nextMode: BlogThemeMode) {
  preferences.mode = nextMode
}

/**
 * 把无衬线或衬线字体模式写入响应式主题偏好。
 * @param nextFont - 写入 `preferences.font` 的`nextFont`。
 */
function setFontMode(nextFont: BlogFontMode) {
  preferences.font = nextFont
}

/**
 * 把卡片阴影强度写入响应式主题偏好。
 * @param nextShadow - 写入 `preferences.shadow` 的`nextShadow`。
 */
function setShadowMode(nextShadow: BlogShadowMode) {
  preferences.shadow = nextShadow
}

/**
 * 把 Argon 视觉滤镜模式写入响应式主题偏好。
 * @param nextFilter - 写入 `preferences.filter` 的`nextFilter`。
 */
function setFilterMode(nextFilter: BlogFilterMode) {
  preferences.filter = nextFilter
}

/**
 * 把卡片圆角像素值写入响应式主题偏好。
 * @param nextRadius - 写入 `preferences.radius` 的`nextRadius`。
 */
function setRadius(nextRadius: number) {
  preferences.radius = nextRadius
}

/**
 * 把主题十六进制颜色写入响应式主题偏好。
 * @param nextColor - 写入 `preferences.colorPrimary` 的`nextColor`。
 */
function setPrimaryColor(nextColor: string) {
  preferences.colorPrimary = nextColor
}

/**
 * 规范化 WordPress Argon 类名、菜单、颜色、圆角与背景配置，仅用有效远端值更新运行主题。
 * @param config - 控制可选分支与运行参数的配置对象。
 */
function applyWordpressThemeConfig(config: WordpressArgonThemeConfig) {
  const nextHtmlClass = normalizeClassList(config.htmlClass)
  const nextBodyClass = normalizeClassList(config.bodyClass)
  const nextBackgroundDarkBrightness = normalizePositiveNumber(config.backgroundDarkBrightness)
  const nextBackgroundDarkOpacity = normalizeOpacity(config.backgroundDarkOpacity)
  const nextBackgroundOpacity = normalizeOpacity(config.backgroundOpacity)
  const nextColor = normalizeHexColor(config.themeColor)
  const nextRadius = normalizeRadius(config.themeCardRadius)
  const hasRemoteHtmlClass = nextHtmlClass.length > 0

  runtimeConfig.wordpressThemeConfig = config

  if (nextHtmlClass.length) {
    runtimeConfig.htmlClass = nextHtmlClass
  } else {
    runtimeConfig.htmlClass = runtimeConfig.htmlClass
  }
  if (nextBodyClass.length) {
    runtimeConfig.bodyClass = nextBodyClass
  } else {
    runtimeConfig.bodyClass = runtimeConfig.bodyClass
  }
  if (Array.isArray(config.headerMenu)) {
    runtimeConfig.headerMenu = normalizeMenuItems(
      config.headerMenu,
      config.site?.home || config.site?.url || runtimeConfig.siteHome || runtimeConfig.siteUrl,
    )
  }
  runtimeConfig.headerMenuVisible = normalizeHeaderMenuVisible(config)
  if (hasRemoteHtmlClass) {
    runtimeConfig.tripleColumn = nextHtmlClass.includes('triple-column')
  } else {
    runtimeConfig.tripleColumn = runtimeConfig.tripleColumn
  }
  if (hasRemoteHtmlClass) {
    runtimeConfig.immersionColor = nextHtmlClass.includes('immersion-color')
  } else {
    runtimeConfig.immersionColor = runtimeConfig.immersionColor
  }
  if (hasRemoteHtmlClass) {
    runtimeConfig.toolbarBlur = nextHtmlClass.includes('toolbar-blur')
  } else {
    runtimeConfig.toolbarBlur = runtimeConfig.toolbarBlur
  }
  runtimeConfig.articleHeaderStyle =
    getArticleHeaderStyle(nextHtmlClass) ||
    (() => {
      if (hasRemoteHtmlClass) {
        return 'default'
      }
      return runtimeConfig.articleHeaderStyle
    })()
  if (typeof nextBackgroundDarkBrightness === 'number') {
    runtimeConfig.backgroundDarkBrightness = nextBackgroundDarkBrightness
  } else {
    runtimeConfig.backgroundDarkBrightness = runtimeConfig.backgroundDarkBrightness
  }
  runtimeConfig.backgroundDarkImage =
    normalizeCssImage(config.backgroundDarkImage) || runtimeConfig.backgroundDarkImage
  if (typeof nextBackgroundDarkOpacity === 'number') {
    runtimeConfig.backgroundDarkOpacity = nextBackgroundDarkOpacity
  } else {
    runtimeConfig.backgroundDarkOpacity = runtimeConfig.backgroundDarkOpacity
  }
  runtimeConfig.backgroundImage =
    normalizeCssImage(config.backgroundImage) || runtimeConfig.backgroundImage
  if (typeof nextBackgroundOpacity === 'number') {
    runtimeConfig.backgroundOpacity = nextBackgroundOpacity
  } else {
    runtimeConfig.backgroundOpacity = runtimeConfig.backgroundOpacity
  }
  runtimeConfig.siteAuthorAvatar =
    normalizeThemeAsset(config.site?.authorAvatar) || runtimeConfig.siteAuthorAvatar
  runtimeConfig.siteDescription = config.site?.description ?? runtimeConfig.siteDescription
  runtimeConfig.siteAuthorName = config.site?.authorName || runtimeConfig.siteAuthorName
  runtimeConfig.siteHome = config.site?.home || runtimeConfig.siteHome
  runtimeConfig.siteTitle = config.site?.title || runtimeConfig.siteTitle
  runtimeConfig.siteUrl = config.site?.url || runtimeConfig.siteUrl
  if (Array.isArray(config.sidebarMenu)) {
    runtimeConfig.sidebarMenu = normalizeSidebarMenuItems(
      config.sidebarMenu,
      config.site?.home || config.site?.url || runtimeConfig.siteHome || runtimeConfig.siteUrl,
    )
  }
  runtimeConfig.themeVersion = config.themeVersion || runtimeConfig.themeVersion

  if (nextColor && config.enableCustomThemeColor !== false) {
    preferences.colorPrimary = nextColor
  }

  if (hasRemoteHtmlClass) {
    if (nextHtmlClass.includes('use-serif')) {
      preferences.font = 'serif'
    } else {
      preferences.font = 'sans'
    }
    if (nextHtmlClass.includes('use-big-shadow')) {
      preferences.shadow = 'big'
    } else {
      preferences.shadow = 'small'
    }
  }

  if (typeof nextRadius === 'number') {
    preferences.radius = nextRadius
  }

  syncSystemThemeMode(config)
  const nextMode = getModeFromWordpressConfig(config)
  if (nextMode) {
    preferences.mode = nextMode
  }
}

/**
 * 把环境配置的主题接口地址解析为同源 Blog API URL；未配置时使用内置主题路径。
 * @param configuredUrl - 配置中声明的博客主题接口地址；未提供时使用 `import.meta.env.VITE_BLOG_THEME_CONFIG_URL`。
 * @returns 同源主题配置 API URL 或内置路径兜底。
 */
export function resolveBlogThemeConfigUrl(
  configuredUrl = import.meta.env.VITE_BLOG_THEME_CONFIG_URL,
) {
  return resolveLocalBlogApiUrl(configuredUrl, BLOG_THEME_CONFIG_URL)
}

/**
 * 确保全局主题监听已注册，并暴露偏好、运行配置、Antdv token 与更新函数。
 * @returns 博客主题偏好、明暗模式、站点配置及其更新操作，包含 `isDarkTheme`、`preferences`、`applyWordpressThemeConfig`、`siteConfig`、`setFilterMode` 等字段。
 */
export function useBlogTheme() {
  ensureThemeWatcher()

  return {
    isDarkTheme,
    preferences,
    applyWordpressThemeConfig,
    siteConfig,
    setFilterMode,
    setFontMode,
    setPrimaryColor,
    setRadius,
    setShadowMode,
    setThemeMode,
    themeConfig,
    themeRootClass,
    wordpressThemeConfig,
  }
}

/**
 * 从 localStorage 合并主题偏好；服务端、缺少记录或解析失败时回退默认配置。
 * @returns localStorage 与默认值合并后的主题偏好；读取失败时使用默认配置。
 */
function loadPreferences(): BlogThemePreferences {
  if (typeof window === 'undefined') {
    return { ...defaultPreferences }
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY)
    if (!rawValue) {
      return { ...defaultPreferences }
    }

    return {
      ...defaultPreferences,
      ...JSON.parse(rawValue),
    }
  } catch {
    return { ...defaultPreferences }
  }
}

/**
 * 全局主题监听仅注册一次，并把偏好变化同步为 CSS 变量与 localStorage 持久值。
 */
function ensureThemeWatcher() {
  if (themeWatcherReady) {
    return
  }

  themeWatcherReady = true
  watch(
    () => ({
      preferences: { ...preferences },
      runtimeConfig: { ...runtimeConfig },
    }),
    ({ preferences: currentPreferences }) => {
      if (typeof document === 'undefined') {
        return
      }

      applyCssVariables(currentPreferences)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPreferences))
    },
    {
      deep: true,
      immediate: true,
    },
  )
}

/**
 * 根据主题偏好与 WordPress 运行配置生成 Argon CSS 变量、背景图层和浏览器主题色。
 * @param currentPreferences - 包含 `currentPreferences.colorPrimary`、`currentPreferences.mode`、`currentPreferences.font`、`currentPreferences.radius` 字段的`currentPreferences`对象。
 */
function applyCssVariables(currentPreferences: BlogThemePreferences) {
  const primaryRgb = hexToRgb(currentPreferences.colorPrimary)
  const palette = createThemePalette(currentPreferences.colorPrimary, currentPreferences.mode)
  const fontFamily = getThemeFontFamily(currentPreferences.font)
  const argonColorVariables = createArgonColorVariables(primaryRgb, currentPreferences.mode)
  const backgroundImage = appendCssImageFallback(
    normalizeCssImage(
      (() => {
        if (currentPreferences.mode === 'dark') {
          return runtimeConfig.backgroundDarkImage || runtimeConfig.backgroundImage
        }
        return runtimeConfig.backgroundImage
      })(),
    ) || `url('${ARGON_DEFAULT_BACKGROUND}')`,
    LOCAL_BLOG_BACKGROUND_IMAGE,
  )
  const backgroundOpacity = (() => {
    if (currentPreferences.mode === 'dark') {
      return runtimeConfig.backgroundDarkOpacity
    }
    return runtimeConfig.backgroundOpacity
  })()

  const primaryHsl = rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b)
  const rootThemeVariables = `
  --themecolor: ${currentPreferences.colorPrimary};
  --themecolor-R: ${primaryRgb.r};
  --themecolor-G: ${primaryRgb.g};
  --themecolor-B: ${primaryRgb.b};
  --themecolor-H: ${primaryHsl.h};
  --themecolor-S: ${primaryHsl.s};
  --themecolor-L: ${primaryHsl.l};
  --themecolor-dark0: ${formatArgonThemeHsl(primaryHsl, -2.5)};
  --themecolor-dark: ${formatArgonThemeHsl(primaryHsl, -5)};
  --themecolor-dark2: ${formatArgonThemeHsl(primaryHsl, -10)};
  --themecolor-dark3: ${formatArgonThemeHsl(primaryHsl, -15)};
  --themecolor-light: ${formatArgonThemeHsl(primaryHsl, 10)};
  --themecolor-gradient: linear-gradient(150deg, var(--themecolor-light) 15%, var(--themecolor) 70%, var(--themecolor-dark0) 94%);
  --themecolor-rgbstr: ${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b};
  --argon-page: var(--color-background);
  --argon-card: var(--color-foreground);
  --argon-card-deep: var(--color-foreground);
  --argon-card-soft: var(--color-widgets);
  --argon-card-overlay-weak: ${palette.cardOverlayWeak};
  --argon-card-overlay-strong: ${palette.cardOverlayStrong};
  --argon-control: var(--color-border-on-foreground-deeper);
  --argon-control-soft: var(--color-widgets);
  --argon-pill: var(--color-widgets-disabled);
  --argon-text: ${palette.text};
  --argon-muted: ${palette.muted};
  --argon-title: ${palette.title};
  --argon-border: var(--color-border);
  --argon-meta: ${palette.meta};
  --argon-widget-text: ${palette.widgetText};
  --argon-subtle: ${palette.subtle};
  --argon-faint: ${palette.faint};
  --argon-placeholder: ${palette.placeholder};
  --argon-scrollbar-track: var(--kt-blog-scrollbar-track);
  --argon-scrollbar-thumb: var(--kt-blog-scrollbar-thumb);
  --argon-scrollbar-thumb-hover: var(--kt-blog-scrollbar-thumb-hover);
  --argon-scrollbar-thin-thumb: ${palette.scrollbarThinThumb};
  --argon-scrollbar-size: var(--kt-blog-scrollbar-size);
`

  ensureThemeMetaElement(BLOG_META_NAMES.themeColor).setAttribute(
    'content',
    currentPreferences.colorPrimary,
  )
  ensureThemeMetaElement(BLOG_META_NAMES.themeColorRgb).setAttribute(
    'content',
    `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`,
  )

  updateThemeStyle(`
:root {
  --kt-blog-scrollbar-track: ${palette.scrollbarTrack};
  --kt-blog-scrollbar-thumb: ${palette.scrollbarThumb};
  --kt-blog-scrollbar-thumb-hover: ${palette.scrollbarThumbHover};
  --kt-blog-scrollbar-size: 10px;
${rootThemeVariables}
${serializeCssVariables(argonColorVariables.root)}
}

body.wp-theme-argon {
${serializeCssVariables(argonColorVariables.current)}
}

.${BLOG_THEME_BLOCK_CLASS} {
  --radius: ${currentPreferences.radius}px;
  --card-radius: ${currentPreferences.radius}px;
  --argon-background-image: ${backgroundImage};
  --argon-background-light-image: ${appendCssImageFallback(normalizeCssImage(runtimeConfig.backgroundImage) || `url('${ARGON_DEFAULT_BACKGROUND}')`, LOCAL_BLOG_BACKGROUND_IMAGE)};
  --argon-background-dark-image: ${appendCssImageFallback(normalizeCssImage(runtimeConfig.backgroundDarkImage) || backgroundImage, LOCAL_BLOG_BACKGROUND_IMAGE)};
  --argon-background-filter: ${(() => {
    if (currentPreferences.mode === 'dark') {
      return `brightness(${runtimeConfig.backgroundDarkBrightness})`
    }
    return 'none'
  })()};
  --argon-background-opacity: ${backgroundOpacity};
  --argon-background-light-opacity: ${runtimeConfig.backgroundOpacity};
  --argon-background-dark-opacity: ${runtimeConfig.backgroundDarkOpacity};
  --argon-author-avatar: ${appendCssImageFallback(normalizeCssImage(runtimeConfig.siteAuthorAvatar) || `url('${ARGON_DEFAULT_AUTHOR_AVATAR}')`, LOCAL_BLOG_AUTHOR_AVATAR)};
  --argon-font-family: ${fontFamily};
  --argon-shadow: ${ARGON_CARD_SHADOW};
  --argon-primary-soft: ${ARGON_PRIMARY_SOFT};
${createBlogMotionCssVariables()}
${rootThemeVariables}
}
`)
}

/**
 * 按字体模式返回 Argon 使用的衬线或无衬线字体栈。
 * @param font - 决定博客采用衬线或无衬线字体栈的模式。
 * @returns  Argon 使用的衬线或无衬线字体栈。
 */
function getThemeFontFamily(font: BlogFontMode) {
  if (font === 'serif') {
    return ARGON_SERIF_FONT_FAMILY
  }
  return ARGON_SANS_FONT_FAMILY
}

/**
 * 复用或创建主题 style 元素，并用规范化后的动态 CSS 替换其内容。
 * @param cssText - 待写入主题样式元素的动态 CSS 文本。
 */
function updateThemeStyle(cssText: string) {
  let styleElement = document.querySelector<HTMLStyleElement>(blogDomSelector('themeStyle'))
  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = blogDomId('themeStyle')
    document.head.appendChild(styleElement)
  }

  styleElement.textContent = cssText.trim()
}

/**
 * 根据主色与明暗模式生成页面、卡片、文本、边框和滚动条色板。
 * @param colorPrimary - 生成 Argon 色板的主题主色。
 * @param mode - 用于选择主题、请求或解析分支的模式。
 * @returns 页面、卡片、文本、边框和滚动条色板。
 */
function createThemePalette(colorPrimary: string, mode: BlogThemeMode) {
  const { b, g, r } = hexToRgb(colorPrimary)
  const { h, s } = rgbToHsl(r, g, b)

  if (mode === 'light') {
    const paleSaturation = Math.min(Math.max(Math.round(s * 0.38), 16), 42)

    return {
      border: 'rgba(15, 23, 42, 0.1)',
      card: `hsl(${h}, ${paleSaturation}%, 98%)`,
      cardDeep: `hsl(${h}, ${paleSaturation}%, 96%)`,
      cardOverlayStrong: 'rgba(15, 23, 42, 0.56)',
      cardOverlayWeak: 'rgba(15, 23, 42, 0.08)',
      cardSoft: `hsl(${h}, ${paleSaturation}%, 94%)`,
      control: `hsl(${h}, ${Math.min(paleSaturation + 8, 52)}%, 88%)`,
      controlSoft: `hsl(${h}, ${Math.min(paleSaturation + 6, 50)}%, 92%)`,
      faint: 'rgba(23, 32, 51, 0.28)',
      meta: 'rgba(23, 32, 51, 0.56)',
      muted: '#5b6472',
      page: '#f7f8fb',
      pill: `hsl(${h}, ${Math.min(paleSaturation + 10, 56)}%, 90%)`,
      placeholder: 'rgba(23, 32, 51, 0.42)',
      scrollbarThinThumb: 'rgba(0, 0, 0, 0.2)',
      scrollbarThumb: 'rgba(0, 0, 0, 0.25)',
      scrollbarThumbHover: `rgba(${r}, ${g}, ${b}, 0.7)`,
      scrollbarTrack: 'transparent',
      subtle: 'rgba(23, 32, 51, 0.48)',
      text: '#172033',
      title: '#263146',
      toolbarRgb: '111, 95, 137',
      widgetText: 'rgba(23, 32, 51, 0.66)',
    }
  }

  const baseSaturation = Math.min(Math.max(Math.round(s * 0.22), 8), 24)
  const textSaturation = Math.min(Math.max(Math.round(s * 0.42), 24), 70)
  const mutedSaturation = Math.min(Math.max(Math.round(s * 0.16), 12), 32)

  return {
    border: 'rgba(255, 255, 255, 0.06)',
    card: '#2f2b33',
    cardDeep: '#2f2b33',
    cardOverlayStrong: `hsla(${h}, ${baseSaturation + 6}%, 16%, 0.72)`,
    cardOverlayWeak: `rgba(${r}, ${g}, ${b}, 0.1)`,
    cardSoft: '#2f2b33',
    control: `hsl(${h}, ${baseSaturation + 12}%, 28%)`,
    controlSoft: `hsl(${h}, ${baseSaturation + 10}%, 24%)`,
    faint: 'rgba(238, 238, 238, 0.34)',
    meta: '#eeeeee',
    muted: `hsl(${h}, ${mutedSaturation}%, 72%)`,
    page: `hsl(${h}, ${baseSaturation}%, 14%)`,
    pill: `hsl(${h}, ${baseSaturation + 12}%, 26%)`,
    placeholder: 'rgba(238, 238, 238, 0.45)',
    scrollbarThinThumb: 'rgba(255, 255, 255, 0.2)',
    scrollbarThumb: 'rgba(255, 255, 255, 0.25)',
    scrollbarThumbHover: `rgba(${r}, ${g}, ${b}, 0.7)`,
    scrollbarTrack: 'transparent',
    subtle: 'rgba(238, 238, 238, 0.6)',
    text: '#eeeeee',
    title: '#deccf5',
    toolbarRgb: `${r}, ${g}, ${b}`,
    widgetText: 'rgba(238, 238, 238, 0.66)',
  }
}

/**
 * 把三位或六位十六进制颜色展开为 RGB 三通道数值。
 * @param hexColor - 待转换为 RGB 通道的十六进制颜色。
 * @returns 十六进制颜色对应的红、绿、蓝通道数值，包含 `b`、`g`、`r` 等字段。
 */
function hexToRgb(hexColor: string) {
  const normalized = hexColor.replace('#', '')
  const value = (() => {
    if (normalized.length === 3) {
      return normalized
        .split('')
        .map((item) => item + item)
        .join('')
    }
    return normalized.padEnd(6, '0').slice(0, 6)
  })()

  return {
    b: Number.parseInt(value.slice(4, 6), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    r: Number.parseInt(value.slice(0, 2), 16),
  }
}

/**
 * 按名称复用主题 meta 标签，缺失时创建并挂到 document head。
 * @param name - 用于定位或命名目标资源的名称。
 * @returns 名称匹配的既有或新建 meta 元素。
 */
function ensureThemeMetaElement(name: string) {
  let metaElement = document.querySelector<HTMLMetaElement>(blogMetaSelector(name))
  if (!metaElement) {
    metaElement = document.createElement('meta')
    metaElement.name = name
    document.head.appendChild(metaElement)
  }

  return metaElement
}

/**
 * 把 0 至 255 的 RGB 通道换算为整数 HSL；灰色输入的色相和饱和度为零。
 * @param r - 用于计算 `r / 255` 的`r`。
 * @param g - 用于计算 `g / 255` 的`g`。
 * @param b - 参与当前比较或计算的右侧值。
 * @returns 由 RGB 换算并取整的色相、饱和度与亮度。
 */
function rgbToHsl(r: number, g: number, b: number) {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const lightness = (max + min) / 2

  if (max === min) {
    return { h: 0, l: Math.round(lightness * 100), s: 0 }
  }

  const delta = max - min
  const saturation = (() => {
    if (lightness > 0.5) {
      return delta / (2 - max - min)
    }
    return delta / (max + min)
  })()
  const hue = (() => {
    if (max === red) {
      return (
        (green - blue) / delta +
        (() => {
          if (green < blue) {
            return 6
          }
          return 0
        })()
      )
    }
    if (max === green) {
      return (blue - red) / delta + 2
    }
    return (red - green) / delta + 4
  })()

  return {
    h: Math.round(hue * 60),
    l: Math.round(lightness * 100),
    s: Math.round(saturation * 100),
  }
}

/**
 * 根据主题主色生成 Argon 根级默认变量，并按明暗模式选择当前 body 变量。
 * @param primaryRgb - 主题主色的 RGB 通道值。
 * @param mode - 用于选择主题、请求或解析分支的模式。
 * @returns  Argon 根级默认变量，包含 `current`、`root` 等字段。
 */
function createArgonColorVariables(primaryRgb: ReturnType<typeof hexToRgb>, mode: BlogThemeMode) {
  const root = {
    '--color-background': '#f4f5f7',
    '--color-border': '#dce0e5',
    '--color-border-on-foreground': '#f3f3f3',
    '--color-border-on-foreground-deeper': '#eee',
    '--color-darkmode-banner': '',
    '--color-darkmode-toolbar': '',
    '--color-foreground': '#fff',
    '--color-shade-70': formatArgonShadeChannels(primaryRgb, 0.7),
    '--color-shade-75': formatArgonShadeChannels(primaryRgb, 0.75),
    '--color-shade-80': formatArgonShadeChannels(primaryRgb, 0.8),
    '--color-shade-82': formatArgonShadeChannels(primaryRgb, 0.82),
    '--color-shade-86': formatArgonShadeChannels(primaryRgb, 0.86),
    '--color-shade-90': formatArgonShadeChannels(primaryRgb, 0.9),
    '--color-shade-94': formatArgonShadeChannels(primaryRgb, 0.94),
    '--color-shade-96': formatArgonShadeChannels(primaryRgb, 0.96),
    '--color-text-deeper': '#212529',
    '--color-tint-82': formatArgonTintChannels(primaryRgb, 0.82),
    '--color-widgets': '#fff',
    '--color-widgets-disabled': '#e9ecef',
  }

  const light = {
    '--color-background': formatArgonTintRgb(primaryRgb, 0.86),
    '--color-border': formatArgonTintRgb(primaryRgb, 0.78),
    '--color-border-on-foreground': formatArgonTintRgb(primaryRgb, 0.86),
    '--color-border-on-foreground-deeper': formatArgonTintRgb(primaryRgb, 0.8),
    '--color-darkmode-banner': '',
    '--color-darkmode-toolbar': '',
    '--color-foreground': formatArgonTintRgb(primaryRgb, 0.92),
    '--color-text-deeper': formatArgonShadeRgb(primaryRgb, 0.82),
    '--color-widgets': formatArgonTintRgb(primaryRgb, 0.95),
    '--color-widgets-disabled': formatArgonTintRgb(primaryRgb, 0.86),
  }
  const dark = {
    '--color-background': formatArgonShadeRgb(primaryRgb, 0.94),
    '--color-border': formatArgonShadeRgb(primaryRgb, 0.8),
    '--color-border-on-foreground': formatArgonShadeRgb(primaryRgb, 0.82),
    '--color-border-on-foreground-deeper': formatArgonShadeRgb(primaryRgb, 0.75),
    '--color-darkmode-banner': formatArgonShadeRgb(primaryRgb, 0.96),
    '--color-darkmode-toolbar': formatArgonShadeChannels(primaryRgb, 0.9),
    '--color-foreground': formatArgonShadeRgb(primaryRgb, 0.9),
    '--color-text-deeper': formatArgonTintRgb(primaryRgb, 0.82),
    '--color-widgets': formatArgonShadeRgb(primaryRgb, 0.86),
    '--color-widgets-disabled': formatArgonShadeRgb(primaryRgb, 0.82),
  }

  return {
    current: (() => {
      if (mode === 'dark') {
        return dark
      }
      return light
    })(),
    root,
  }
}

/**
 * 把 CSS 自定义属性映射序列化为逐行声明文本。
 * @param variables - 待序列化为 CSS 声明的自定义属性映射。
 * @returns 逐行声明文本。
 */
function serializeCssVariables(variables: Record<string, string>) {
  return Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')
}

/**
 * 按亮度偏移生成受 0% 至 100% 边界限制的 Argon HSL 表达式。
 * @param hsl - 包含 `hsl.h`、`hsl.s`、`hsl.l` 字段的`hsl`对象。
 * @param lightnessDelta - 生成 HSL 主题色时采用的亮度偏移量。
 * @returns 受 0% 至 100% 边界限制的 Argon HSL 表达式。
 */
function formatArgonThemeHsl(hsl: ReturnType<typeof rgbToHsl>, lightnessDelta: number) {
  const direction = (() => {
    if (lightnessDelta >= 0) {
      return '+'
    }
    return '-'
  })()
  const boundary = (() => {
    if (lightnessDelta >= 0) {
      return '100%'
    }
    return '0%'
  })()
  const clampFunction = (() => {
    if (lightnessDelta >= 0) {
      return 'min'
    }
    return 'max'
  })()
  const delta = Math.abs(lightnessDelta)

  return `hsl(${hsl.h}, calc(${hsl.s} * 1%), ${clampFunction}(calc(${hsl.l} * 1% ${direction} ${delta}%), ${boundary}))`
}

/**
 * 按深色混合比例生成适合 rgb 函数的三通道 calc 列表。
 * @param primaryRgb - 主题主色的 RGB 通道值。
 * @param ratio - 颜色通道混合时采用的比例。
 * @returns 适合 rgb 函数的三通道 calc 列表。
 */
function formatArgonShadeChannels(primaryRgb: ReturnType<typeof hexToRgb>, ratio: number) {
  return [
    formatArgonShadeChannel(primaryRgb.r, ratio),
    formatArgonShadeChannel(primaryRgb.g, ratio),
    formatArgonShadeChannel(primaryRgb.b, ratio),
  ].join(',\n    ')
}

/**
 * 按浅色混合比例生成适合 rgb 函数的三通道 calc 列表。
 * @param primaryRgb - 主题主色的 RGB 通道值。
 * @param ratio - 颜色通道混合时采用的比例。
 * @returns 适合 rgb 函数的三通道 calc 列表。
 */
function formatArgonTintChannels(primaryRgb: ReturnType<typeof hexToRgb>, ratio: number) {
  return [
    formatArgonTintChannel(primaryRgb.r, ratio),
    formatArgonTintChannel(primaryRgb.g, ratio),
    formatArgonTintChannel(primaryRgb.b, ratio),
  ].join(',\n    ')
}

/**
 * 把主题 RGB 与深色比例格式化为完整的 rgb calc 表达式。
 * @param primaryRgb - 主题主色的 RGB 通道值。
 * @param ratio - 颜色通道混合时采用的比例。
 * @returns 完整的 rgb calc 表达式。
 */
function formatArgonShadeRgb(primaryRgb: ReturnType<typeof hexToRgb>, ratio: number) {
  return `rgb(${formatArgonShadeChannels(primaryRgb, ratio)})`
}

/**
 * 把主题 RGB 与浅色比例格式化为完整的 rgb calc 表达式。
 * @param primaryRgb - 主题主色的 RGB 通道值。
 * @param ratio - 颜色通道混合时采用的比例。
 * @returns 完整的 rgb calc 表达式。
 */
function formatArgonTintRgb(primaryRgb: ReturnType<typeof hexToRgb>, ratio: number) {
  return `rgb(${formatArgonTintChannels(primaryRgb, ratio)})`
}

/**
 * 把单个颜色通道按比例混入 Argon 深色基准值 30。
 * @param channel - 待混合或格式化的单个颜色通道值。
 * @param ratio - 颜色通道混合时采用的比例。
 * @returns 按比例混入深色基准值的单通道 calc 表达式。
 */
function formatArgonShadeChannel(channel: number, ratio: number) {
  return `calc(30 * ${ratio} + ${channel} * (1 - ${ratio}))`
}

/**
 * 把单个颜色通道按比例混入白色基准值 255。
 * @param channel - 待混合或格式化的单个颜色通道值。
 * @param ratio - 颜色通道混合时采用的比例。
 * @returns 按比例混入白色基准值的单通道 calc 表达式。
 */
function formatArgonTintChannel(channel: number, ratio: number) {
  return `calc(${channel} + (255 - ${channel}) * ${ratio})`
}

/**
 * 按加权 RGB 通道计算主题色灰度。
 * @param r - 用于计算 `r * 0.299` 的`r`。
 * @param g - 用于计算 `g * 0.587` 的`g`。
 * @param b - 参与当前比较或计算的右侧值。
 * @returns 主题色 RGB 通道的加权灰度值。
 */
function getGray(r: number, g: number, b: number) {
  return r * 0.299 + g * 0.587 + b * 0.114
}

/**
 * 主题色通过加权 RGB 灰度与 50 阈值比较，决定是否应用过暗修饰类。
 * @param hexColor - 用于计算加权灰度的十六进制主题色。
 * @returns 颜色灰度低于 50 时返回 true，否则返回 false。
 */
function isThemeColorTooDark(hexColor: string) {
  const { b, g, r } = hexToRgb(hexColor)

  return getGray(r, g, b) < 50
}

/**
 * 递归展平类名数组，按空白拆分文本并过滤空类名。
 * @param value - 待校验、转换或写入的原始值；省略时按 undefined 的缺省分支处理。
 * @returns 规范化后的样式类列表。
 */
function normalizeClassList(value?: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeClassList(item))
  }

  return String(value || '')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

/**
 * 把三位十六进制颜色展开为六位并统一大写，非法或空颜色返回空串。
 * @param value - 待校验、转换或写入的原始值；省略时按 undefined 的缺省分支处理。
 * @returns 规范化后的`HexColor`；没有可展示内容时返回空字符串。
 */
function normalizeHexColor(value?: string) {
  if (!value) return ''
  const normalized = value.trim()

  if (/^#[0-9a-f]{6}$/i.test(normalized)) return normalized.toUpperCase()
  if (/^#[0-9a-f]{3}$/i.test(normalized)) {
    return `#${normalized
      .slice(1)
      .split('')
      .map((item) => item + item)
      .join('')}`.toUpperCase()
  }

  return ''
}

/**
 * 将圆角转换为不小于零的数值，空值或非有限数返回 null。
 * @param value - 待校验、转换或写入的原始值；省略时按 undefined 的缺省分支处理。
 * @returns 不小于零的数值；空值分支返回 null。
 */
function normalizeRadius(value?: number | string) {
  if (value === undefined || value === null || value === '') return null
  const numericValue = Number(value)

  if (Number.isFinite(numericValue)) {
    return Math.max(0, numericValue)
  }
  return null
}

/**
 * 将透明度转换并限制在零到一，空值或非有限数返回 null。
 * @param value - 待校验、转换或写入的原始值；省略时按 undefined 的缺省分支处理。
 * @returns 规范化后的`Opacity`；空值分支返回 null。
 */
function normalizeOpacity(value?: number | string) {
  if (value === undefined || value === null || value === '') return null
  const numericValue = Number(value)

  if (Number.isFinite(numericValue)) {
    return Math.min(Math.max(numericValue, 0), 1)
  }
  return null
}

/**
 * 将主题数值转换并限制为非负数，空值或非有限数返回 null。
 * @param value - 待校验、转换或写入的原始值；省略时按 undefined 的缺省分支处理。
 * @returns 规范化后的`PositiveNumber`；空值分支返回 null。
 */
function normalizePositiveNumber(value?: number | string) {
  if (value === undefined || value === null || value === '') return null
  const numericValue = Number(value)

  if (Number.isFinite(numericValue)) {
    return Math.max(0, numericValue)
  }
  return null
}

/**
 * 按多个兼容字段解析顶部菜单显隐开关；未明确启用时返回 false。
 * @param config - 控制可选分支与运行参数的配置对象。
 * @returns 兼容字段共同决定的顶部菜单显隐状态。
 */
function normalizeHeaderMenuVisible(config: WordpressArgonThemeConfig) {
  const rawValue =
    config.headerMenuVisible ??
    config.toolbarMenuVisible ??
    config.showHeaderMenu ??
    config.showToolbarMenu

  return normalizeBooleanFlag(rawValue) === true
}

/**
 * 兼容 boolean 与 WordPress 常用开关字符串；无法识别时返回 undefined。
 * @param value - 待校验、转换或写入的原始值。
 * @returns 兼容 WordPress 开关文本的布尔值；无法识别时为 undefined。
 */
function normalizeBooleanFlag(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on', 'show', 'visible', 'enabled'].includes(normalized)) {
    return true
  }

  if (['0', 'false', 'no', 'off', 'hide', 'hidden', 'disabled'].includes(normalized)) {
    return false
  }

  return undefined
}

/**
 * 把有效远程或站内主题资源规范化为 CSS url；无效地址返回空字符串。
 * @param value - 待校验、转换或写入的原始值；省略时按 undefined 的缺省分支处理。
 * @returns  CSS url；没有可展示内容时返回空字符串。
 */
function normalizeCssImage(value?: string) {
  const normalized = resolveBlogStaticAsset(value, '')

  if (normalized.startsWith('url(')) return normalized
  if (/^https?:\/\//i.test(normalized) || normalized.startsWith('/')) {
    return `url('${normalized.replace(/'/g, "\\'")}')`
  }

  return ''
}

/**
 * 背景图仅在本地兜底有效且首选值尚未包含它时追加第二图层。
 * @param primaryCssImage - 保留在第一层并用于去重的 CSS 背景图值。
 * @param localFallback - 需先规范化，且仅在非空时作为第二图层的本地地址。
 * @returns 包含不重复兜底图层的 CSS 图片列表；兜底无效或已存在时原样返回首选值。
 */
function appendCssImageFallback(primaryCssImage: string, localFallback: string) {
  const fallbackCssImage = normalizeCssImage(localFallback)

  if (!fallbackCssImage || primaryCssImage.includes(fallbackCssImage)) {
    return primaryCssImage
  }

  return `${primaryCssImage}, ${fallbackCssImage}`
}

/**
 * 替换旧演示资源并保留有效远程或站内地址；无效地址返回空字符串。
 * @param value - 待校验、转换或写入的原始值；省略时按 undefined 的缺省分支处理。
 * @returns 规范化后的主题资源；没有可展示内容时返回空字符串。
 */
function normalizeThemeAsset(value?: string) {
  const asset = resolveBlogStaticAsset(unwrapBlogCssImage(value), '')

  if (/^https?:\/\//i.test(asset) || asset.startsWith('/')) {
    return asset
  }
  return ''
}

/**
 * 裁剪菜单标签与链接、丢弃空项，规范化同站地址并标记外部链接。
 * @param items - 待依次处理的条目集合。
 * @param siteHome - 解析站内相对链接使用的站点首页地址；未提供时使用 `''`。
 * @returns 裁剪后的菜单标签与链接、丢弃空项，规范化同站地址并标记外部链接。
 */
function normalizeMenuItems(items: BlogThemeMenuItem[], siteHome = ''): BlogThemeMenuItem[] {
  return items.reduce<BlogThemeMenuItem[]>((result, item) => {
    const label = `${item.label || ''}`.trim()
    const href = normalizeMenuHref(`${item.href || ''}`.trim(), siteHome)

    if (!label || !href) return result

    const isInternalHref = href.startsWith('/') && !href.startsWith('//')
    result.push({
      external: !isInternalHref && (item.external || /^https?:\/\//i.test(href)),
      href,
      ...(() => {
        if (item.icon) {
          return { icon: item.icon }
        }
        return {}
      })(),
      label,
    })

    return result
  }, [])
}

/**
 * 归一化侧边栏项目，并把历史管理入口迁移到 KT Admin SSO。
 * @param items - 待依次处理的条目集合。
 * @param siteHome - 解析站内相对链接使用的站点首页地址；未提供时使用 `''`。
 * @returns 迁移历史管理入口后的侧边栏菜单项。
 */
function normalizeSidebarMenuItems(items: BlogThemeMenuItem[], siteHome = ''): BlogThemeMenuItem[] {
  return normalizeMenuItems(items, siteHome).map((item) => {
    if (isLegacyBlogManagementHref(item.href)) {
      return {
        ...item,
        external: true,
        href: buildBlogAdminSsoUrl(),
      }
    }
    return item
  })
}

/**
 * 把站点首页和站内绝对链接改写为前端路由，站外或无关地址保持原样。
 * @param href - 待规范化或导航的链接地址。
 * @param siteHome - 解析站内相对链接使用的站点首页地址；未提供时使用 `''`。
 * @returns 前端路由；没有可展示内容时返回空字符串。
 */
function normalizeMenuHref(href: string, siteHome = '') {
  if (!href) return ''
  const normalizedSiteHome = siteHome.replace(/\/+$/g, '')

  if (normalizedSiteHome && href.replace(/\/+$/g, '') === normalizedSiteHome) {
    return '/'
  }

  if (normalizedSiteHome && href.startsWith(`${normalizedSiteHome}/`)) {
    return href.slice(normalizedSiteHome.length) || '/'
  }

  return href
}

/**
 * 按 HTML darkmode 类与 WordPress 自动切换配置选择深色、浅色、系统或时间模式，未配置时返回空串。
 * @param config - 控制可选分支与运行参数的配置对象。
 * @returns 读取到的`ModeFromWordpressConfig`；没有可展示内容时返回空字符串。
 */
function getModeFromWordpressConfig(config: WordpressArgonThemeConfig): BlogThemeMode | '' {
  const htmlClass = normalizeClassList(config.htmlClass)
  const switchMode = `${config.darkmodeAutoSwitch || ''}`.toLowerCase()

  if (htmlClass.includes('darkmode')) return 'dark'
  if (switchMode === 'alwayson') return 'dark'
  if (switchMode === 'alwaysoff' || switchMode === 'false') return 'light'
  if (switchMode === 'system') return getSystemThemeMode()
  if (switchMode === 'time') return getTimeThemeMode()

  return ''
}

/**
 * 把 prefers-color-scheme 映射为 dark 或 light；服务端或不支持 matchMedia 时返回空串。
 * @returns 读取到的`SystemThemeMode`；没有可展示内容时返回空字符串。
 */
function getSystemThemeMode(): BlogThemeMode | '' {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return ''
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

/**
 * 系统自动模式启用时通过 `matchMedia` 监听明暗偏好；其他模式或非浏览器环境不注册监听。
 * @param config - 提供 `darkmodeAutoSwitch` 策略的 WordPress Argon 主题配置。
 */
function syncSystemThemeMode(config: WordpressArgonThemeConfig) {
  stopSystemThemeModeSync()
  if (
    `${config.darkmodeAutoSwitch || ''}`.toLowerCase() !== 'system' ||
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return
  }

  systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemThemeChangeHandler = (event) => {
    if (event.matches) {
      preferences.mode = 'dark'
    } else {
      preferences.mode = 'light'
    }
  }

  if (typeof systemThemeMediaQuery.addEventListener === 'function') {
    systemThemeMediaQuery.addEventListener('change', systemThemeChangeHandler)
  } else {
    systemThemeMediaQuery.addListener(systemThemeChangeHandler)
  }
}

/**
 * 解除系统配色变化监听，并清空媒体查询与处理器引用。
 */
function stopSystemThemeModeSync() {
  if (!systemThemeMediaQuery || !systemThemeChangeHandler) {
    return
  }

  if (typeof systemThemeMediaQuery.removeEventListener === 'function') {
    systemThemeMediaQuery.removeEventListener('change', systemThemeChangeHandler)
  } else {
    systemThemeMediaQuery.removeListener(systemThemeChangeHandler)
  }

  systemThemeMediaQuery = null
  systemThemeChangeHandler = null
}

/**
 * 时间策略根据本地小时在 22:00 至 07:00 返回深色，其余时段返回浅色。
 * @returns 当前时段对应的 `dark` 或 `light` 主题模式。
 */
function getTimeThemeMode(): BlogThemeMode {
  const hour = new Date().getHours()

  if (hour < 7 || hour >= 22) {
    return 'dark'
  }
  return 'light'
}

/**
 * 从文章 HTML 类名中提取 article-header-style 前缀后的样式值；未配置时返回空字符串。
 * @param htmlClass - 用于恢复 WordPress Argon 页面类的 HTML 类名列表。
 * @returns  article-header-style 前缀后的样式值；没有可展示内容时返回空字符串。
 */
function getArticleHeaderStyle(htmlClass: string[]) {
  const prefix = 'article-header-style-'
  const className = htmlClass.find((item) => item.startsWith(prefix))

  return className?.slice(prefix.length) || ''
}
