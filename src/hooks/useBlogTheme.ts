import { theme } from 'antdv-next';
import { computed, reactive, watch } from 'vue';

import { createBlogMotionCssVariables } from '@/factories/blogAnimationFactory';
import { BLOG_META_NAMES, blogDomId, blogDomSelector, blogMetaSelector } from '@/factories/blogDomFactory';

export type BlogThemeMode = 'dark' | 'light';
export type BlogFontMode = 'sans' | 'serif';
export type BlogShadowMode = 'small' | 'big';
export type BlogFilterMode = 'off' | 'sunset' | 'darkness' | 'grayscale';

export interface BlogThemePreferences {
  colorPrimary: string;
  filter: BlogFilterMode;
  font: BlogFontMode;
  mode: BlogThemeMode;
  radius: number;
  shadow: BlogShadowMode;
}

export interface BlogThemeMenuItem {
  external?: boolean;
  href: string;
  icon?: string;
  label: string;
}

export interface WordpressArgonThemeConfig {
  argonConfig?: {
    codeHighlight?: {
      breakLine?: boolean;
      enable?: boolean;
      hideLinenumber?: boolean;
      transparentLinenumber?: boolean;
    };
    dateFormat?: string;
    disablePjax?: boolean;
    foldLongComments?: boolean;
    foldLongShuoshuo?: boolean;
    headroom?: boolean | string;
    language?: string;
    lazyload?: {
      effect?: string;
      threshold?: number;
    };
    pangu?: string;
    pjaxAnimationDuration?: number;
    waterflowColumns?: number | string;
    wpPath?: string;
    zoomify?: boolean;
  };
  backgroundDarkBrightness?: number | string;
  backgroundDarkImage?: string;
  backgroundDarkOpacity?: number | string;
  backgroundImage?: string;
  backgroundOpacity?: number | string;
  bodyClass?: string | string[];
  darkmodeAutoSwitch?: 'alwaysoff' | 'alwayson' | 'system' | 'time' | string;
  enableCustomThemeColor?: boolean;
  headerMenu?: BlogThemeMenuItem[];
  htmlClass?: string | string[];
  site?: {
    authorAvatar?: string;
    authorName?: string;
    description?: string;
    home?: string;
    title?: string;
    url?: string;
  };
  sidebarMenu?: BlogThemeMenuItem[];
  themeCardRadius?: number | string;
  themeColor?: string;
  themeColorRgb?: string;
  themeVersion?: string;
  [key: string]: unknown;
}

interface BlogRuntimeThemeConfig {
  articleHeaderStyle: 'default' | string;
  backgroundDarkBrightness: number;
  backgroundDarkImage: string;
  backgroundDarkOpacity: number;
  backgroundImage: string;
  backgroundOpacity: number;
  bodyClass: string[];
  headerMenu: BlogThemeMenuItem[];
  siteAuthorAvatar: string;
  htmlClass: string[];
  immersionColor: boolean;
  siteAuthorName: string;
  siteDescription: string;
  siteHome: string;
  siteTitle: string;
  siteUrl: string;
  sidebarMenu: BlogThemeMenuItem[];
  themeVersion: string;
  toolbarBlur: boolean;
  tripleColumn: boolean;
  wordpressThemeConfig: WordpressArgonThemeConfig | null;
}

const STORAGE_KEY = 'KT_BLOG_THEME_PREFERENCES';
const BLOG_THEME_BLOCK_CLASS = 'kt-blog';
const ARGON_SANS_FONT_FAMILY =
  'Comfortaa, "Open Sans", -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimSun, sans-serif';
const ARGON_SERIF_FONT_FAMILY = 'Georgia, "Times New Roman", "Noto Serif SC", serif';
const ARGON_DEFAULT_COLOR_PRIMARY = '#c3a1ed';
const ARGON_PRIMARY_SOFT = '#4a4058';
const ARGON_CARD_SHADOW = '0 2px 4px rgba(0, 0, 0, 0.075)';
const ARGON_DEFAULT_BACKGROUND = 'https://s3.kwitsukasa.top/images/bg-冬滚滚.png';
const ARGON_DEFAULT_AUTHOR_AVATAR = 'https://s3.kwitsukasa.top/images/avatar-tsukasa-1.jpg';
const defaultHeaderMenu: BlogThemeMenuItem[] = [];
const defaultSidebarMenu: BlogThemeMenuItem[] = [
  { href: '/', icon: 'fa-home', label: '首页' },
  { external: true, href: 'http://blog.kwitsukasa.top/wp-admin/', icon: 'fa-user', label: '管理' },
];

const defaultPreferences: BlogThemePreferences = {
  colorPrimary: ARGON_DEFAULT_COLOR_PRIMARY,
  filter: 'off',
  font: 'sans',
  mode: 'dark',
  radius: 4,
  shadow: 'small',
};

const preferences = reactive<BlogThemePreferences>(loadPreferences());
const runtimeConfig = reactive<BlogRuntimeThemeConfig>({
  articleHeaderStyle: 'default',
  backgroundDarkBrightness: 0.65,
  backgroundDarkImage: ARGON_DEFAULT_BACKGROUND,
  backgroundDarkOpacity: 1,
  backgroundImage: ARGON_DEFAULT_BACKGROUND,
  backgroundOpacity: 1,
  bodyClass: ['home', 'blog', 'wp-theme-argon'],
  headerMenu: [...defaultHeaderMenu],
  htmlClass: [
    'triple-column',
    'immersion-color',
    'toolbar-blur',
    'article-header-style-default',
  ],
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
});
let themeWatcherReady = false;
let systemThemeMediaQuery: MediaQueryList | null = null;
let systemThemeChangeHandler:
  | ((event: MediaQueryList | MediaQueryListEvent) => void)
  | null = null;

const isDarkTheme = computed(() => preferences.mode === 'dark');
const siteConfig = computed(() => ({
  authorAvatar: runtimeConfig.siteAuthorAvatar,
  authorName: runtimeConfig.siteAuthorName,
  description: runtimeConfig.siteDescription,
  headerMenu: runtimeConfig.headerMenu,
  home: runtimeConfig.siteHome,
  sidebarMenu: runtimeConfig.sidebarMenu,
  title: runtimeConfig.siteTitle,
  url: runtimeConfig.siteUrl,
}));
const wordpressThemeConfig = computed(() => runtimeConfig.wordpressThemeConfig);
const themeRootClass = computed(() => [
  BLOG_THEME_BLOCK_CLASS,
  `${BLOG_THEME_BLOCK_CLASS}--wp-argon`,
  `${BLOG_THEME_BLOCK_CLASS}--home`,
  `${BLOG_THEME_BLOCK_CLASS}--blog`,
  runtimeConfig.tripleColumn && `${BLOG_THEME_BLOCK_CLASS}--triple-column`,
  runtimeConfig.immersionColor && `${BLOG_THEME_BLOCK_CLASS}--immersion-color`,
  runtimeConfig.toolbarBlur && `${BLOG_THEME_BLOCK_CLASS}--toolbar-blur`,
  `${BLOG_THEME_BLOCK_CLASS}--article-header-${runtimeConfig.articleHeaderStyle}`,
  runtimeConfig.themeVersion && `${BLOG_THEME_BLOCK_CLASS}--argon-${runtimeConfig.themeVersion.replace(/\./g, '-')}`,
  `${BLOG_THEME_BLOCK_CLASS}--${preferences.mode}`,
  preferences.font === 'serif' && `${BLOG_THEME_BLOCK_CLASS}--font-serif`,
  preferences.shadow === 'big' && `${BLOG_THEME_BLOCK_CLASS}--shadow-big`,
  isThemeColorTooDark(preferences.colorPrimary) && `${BLOG_THEME_BLOCK_CLASS}--theme-too-dark`,
].filter(Boolean).join(' '));

const themeConfig = computed(() => {
  const palette = createThemePalette(preferences.colorPrimary, preferences.mode);

  return {
    algorithm: isDarkTheme.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
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
  };
});

/**
 * @param nextMode 目标主题模式，和 Argon 的 darkmode/lightmode 类保持一致。
 */
function setThemeMode(nextMode: BlogThemeMode) {
  preferences.mode = nextMode;
}

/**
 * @param nextFont 目标字体模式，sans 对应 Argon 默认无衬线，serif 对应 use-serif。
 */
function setFontMode(nextFont: BlogFontMode) {
  preferences.font = nextFont;
}

/**
 * @param nextShadow 阴影强度，big 会启用 Argon 的 use-big-shadow 类。
 */
function setShadowMode(nextShadow: BlogShadowMode) {
  preferences.shadow = nextShadow;
}

/**
 * @param nextFilter Argon 视觉滤镜名称，off 会移除全部滤镜类。
 */
function setFilterMode(nextFilter: BlogFilterMode) {
  preferences.filter = nextFilter;
}

/**
 * @param nextRadius 卡片圆角像素值，同步到 CSS 变量和 antdv-next token。
 */
function setRadius(nextRadius: number) {
  preferences.radius = nextRadius;
}

/**
 * @param nextColor 主题色十六进制值，同步 Argon toolbar 和 antdv-next 组件色。
 */
function setPrimaryColor(nextColor: string) {
  preferences.colorPrimary = nextColor;
}

function applyWordpressThemeConfig(config: WordpressArgonThemeConfig) {
  const nextHtmlClass = normalizeClassList(config.htmlClass);
  const nextBodyClass = normalizeClassList(config.bodyClass);
  const nextBackgroundDarkBrightness = normalizePositiveNumber(config.backgroundDarkBrightness);
  const nextBackgroundDarkOpacity = normalizeOpacity(config.backgroundDarkOpacity);
  const nextBackgroundOpacity = normalizeOpacity(config.backgroundOpacity);
  const nextColor = normalizeHexColor(config.themeColor);
  const nextRadius = normalizeRadius(config.themeCardRadius);
  const hasRemoteHtmlClass = nextHtmlClass.length > 0;

  runtimeConfig.wordpressThemeConfig = config;

  runtimeConfig.htmlClass = nextHtmlClass.length ? nextHtmlClass : runtimeConfig.htmlClass;
  runtimeConfig.bodyClass = nextBodyClass.length ? nextBodyClass : runtimeConfig.bodyClass;
  if (Array.isArray(config.headerMenu)) {
    runtimeConfig.headerMenu = normalizeMenuItems(
      config.headerMenu,
      config.site?.home || config.site?.url || runtimeConfig.siteHome || runtimeConfig.siteUrl,
    );
  }
  runtimeConfig.tripleColumn = hasRemoteHtmlClass
    ? nextHtmlClass.includes('triple-column')
    : runtimeConfig.tripleColumn;
  runtimeConfig.immersionColor = hasRemoteHtmlClass
    ? nextHtmlClass.includes('immersion-color')
    : runtimeConfig.immersionColor;
  runtimeConfig.toolbarBlur = hasRemoteHtmlClass
    ? nextHtmlClass.includes('toolbar-blur')
    : runtimeConfig.toolbarBlur;
  runtimeConfig.articleHeaderStyle =
    getArticleHeaderStyle(nextHtmlClass) ||
    (hasRemoteHtmlClass ? 'default' : runtimeConfig.articleHeaderStyle);
  runtimeConfig.backgroundDarkBrightness =
    typeof nextBackgroundDarkBrightness === 'number'
      ? nextBackgroundDarkBrightness
      : runtimeConfig.backgroundDarkBrightness;
  runtimeConfig.backgroundDarkImage = normalizeCssImage(config.backgroundDarkImage) || runtimeConfig.backgroundDarkImage;
  runtimeConfig.backgroundDarkOpacity =
    typeof nextBackgroundDarkOpacity === 'number'
      ? nextBackgroundDarkOpacity
      : runtimeConfig.backgroundDarkOpacity;
  runtimeConfig.backgroundImage = normalizeCssImage(config.backgroundImage) || runtimeConfig.backgroundImage;
  runtimeConfig.backgroundOpacity =
    typeof nextBackgroundOpacity === 'number'
      ? nextBackgroundOpacity
      : runtimeConfig.backgroundOpacity;
  runtimeConfig.siteAuthorAvatar =
    normalizeThemeAsset(config.site?.authorAvatar) || runtimeConfig.siteAuthorAvatar;
  runtimeConfig.siteDescription = config.site?.description ?? runtimeConfig.siteDescription;
  runtimeConfig.siteAuthorName = config.site?.authorName || runtimeConfig.siteAuthorName;
  runtimeConfig.siteHome = config.site?.home || runtimeConfig.siteHome;
  runtimeConfig.siteTitle = config.site?.title || runtimeConfig.siteTitle;
  runtimeConfig.siteUrl = config.site?.url || runtimeConfig.siteUrl;
  if (Array.isArray(config.sidebarMenu)) {
    runtimeConfig.sidebarMenu = normalizeMenuItems(
      config.sidebarMenu,
      config.site?.home || config.site?.url || runtimeConfig.siteHome || runtimeConfig.siteUrl,
    );
  }
  runtimeConfig.themeVersion = config.themeVersion || runtimeConfig.themeVersion;

  if (nextColor && config.enableCustomThemeColor !== false) {
    preferences.colorPrimary = nextColor;
  }

  if (hasRemoteHtmlClass) {
    preferences.font = nextHtmlClass.includes('use-serif') ? 'serif' : 'sans';
    preferences.shadow = nextHtmlClass.includes('use-big-shadow') ? 'big' : 'small';
  }

  if (typeof nextRadius === 'number') {
    preferences.radius = nextRadius;
  }

  syncSystemThemeMode(config);
  const nextMode = getModeFromWordpressConfig(config);
  if (nextMode) {
    preferences.mode = nextMode;
  }
}

/**
 * @returns 当前 Blog Web 的主题偏好、Antdv token 配置与偏好更新函数。
 */
export function useBlogTheme() {
  ensureThemeWatcher();

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
  };
}

/**
 * @returns localStorage 中的主题偏好；解析失败时回退到默认 Argon 深色方案。
 */
function loadPreferences(): BlogThemePreferences {
  if (typeof window === 'undefined') {
    return { ...defaultPreferences };
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return { ...defaultPreferences };
    }

    return {
      ...defaultPreferences,
      ...JSON.parse(rawValue),
    };
  } catch {
    return { ...defaultPreferences };
  }
}

/**
 * 注册一次全局主题监听，复用 kt-template-admin 的“偏好 -> CSS 变量 -> Antdv token”链路。
 */
function ensureThemeWatcher() {
  if (themeWatcherReady) {
    return;
  }

  themeWatcherReady = true;
  watch(
    () => ({
      preferences: { ...preferences },
      runtimeConfig: { ...runtimeConfig },
    }),
    ({ preferences: currentPreferences }) => {
      if (typeof document === 'undefined') {
        return;
      }

      applyCssVariables(currentPreferences);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPreferences));
    },
    {
      deep: true,
      immediate: true,
    },
  );
}

/**
 * @param currentPreferences 当前主题偏好，用于生成命名空间内的 CSS 变量。
 */
function applyCssVariables(currentPreferences: BlogThemePreferences) {
  const primaryRgb = hexToRgb(currentPreferences.colorPrimary);
  const palette = createThemePalette(currentPreferences.colorPrimary, currentPreferences.mode);
  const fontFamily = getThemeFontFamily(currentPreferences.font);
  const argonColorVariables = createArgonColorVariables(primaryRgb, currentPreferences.mode);
  const backgroundImage =
    normalizeCssImage(
      currentPreferences.mode === 'dark'
        ? runtimeConfig.backgroundDarkImage || runtimeConfig.backgroundImage
        : runtimeConfig.backgroundImage,
    ) || `url('${ARGON_DEFAULT_BACKGROUND}')`;
  const backgroundOpacity =
    currentPreferences.mode === 'dark'
      ? runtimeConfig.backgroundDarkOpacity
      : runtimeConfig.backgroundOpacity;

  const primaryHsl = rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);
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
`;

  ensureThemeMetaElement(BLOG_META_NAMES.themeColor).setAttribute('content', currentPreferences.colorPrimary);
  ensureThemeMetaElement(BLOG_META_NAMES.themeColorRgb).setAttribute('content', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);

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
  --argon-background-light-image: ${normalizeCssImage(runtimeConfig.backgroundImage) || `url('${ARGON_DEFAULT_BACKGROUND}')`};
  --argon-background-dark-image: ${normalizeCssImage(runtimeConfig.backgroundDarkImage) || backgroundImage};
  --argon-background-filter: ${currentPreferences.mode === 'dark' ? `brightness(${runtimeConfig.backgroundDarkBrightness})` : 'none'};
  --argon-background-opacity: ${backgroundOpacity};
  --argon-background-light-opacity: ${runtimeConfig.backgroundOpacity};
  --argon-background-dark-opacity: ${runtimeConfig.backgroundDarkOpacity};
  --argon-author-avatar: ${normalizeCssImage(runtimeConfig.siteAuthorAvatar) || `url('${ARGON_DEFAULT_AUTHOR_AVATAR}')`};
  --argon-font-family: ${fontFamily};
  --argon-shadow: ${ARGON_CARD_SHADOW};
  --argon-primary-soft: ${ARGON_PRIMARY_SOFT};
${createBlogMotionCssVariables()}
${rootThemeVariables}
}
`);
}

/**
 * @param font 当前字体模式。
 * @returns Argon 主题使用的完整字体栈。
 */
function getThemeFontFamily(font: BlogFontMode) {
  return font === 'serif' ? ARGON_SERIF_FONT_FAMILY : ARGON_SANS_FONT_FAMILY;
}

/**
 * @param cssText 主题动态变量，文档滚动条使用 :root 变量，业务样式仍收敛在 .kt-blog。
 */
function updateThemeStyle(cssText: string) {
  let styleElement = document.querySelector<HTMLStyleElement>(blogDomSelector('themeStyle'));
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = blogDomId('themeStyle');
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = cssText.trim();
}

/**
 * @param colorPrimary 当前主题色。
 * @param mode 明暗模式。
 * @returns Argon 容器、标题、弱文本和边框使用的派生色板。
 */
function createThemePalette(colorPrimary: string, mode: BlogThemeMode) {
  const { b, g, r } = hexToRgb(colorPrimary);
  const { h, s } = rgbToHsl(r, g, b);

  if (mode === 'light') {
    const paleSaturation = Math.min(Math.max(Math.round(s * 0.38), 16), 42);

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
    };
  }

  const baseSaturation = Math.min(Math.max(Math.round(s * 0.22), 8), 24);
  const textSaturation = Math.min(Math.max(Math.round(s * 0.42), 24), 70);
  const mutedSaturation = Math.min(Math.max(Math.round(s * 0.16), 12), 32);

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
  };
}

/**
 * @param hexColor 目标颜色十六进制字符串。
 * @returns RGB 三通道数值。
 */
function hexToRgb(hexColor: string) {
  const normalized = hexColor.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((item) => item + item)
          .join('')
      : normalized.padEnd(6, '0').slice(0, 6);

  return {
    b: Number.parseInt(value.slice(4, 6), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    r: Number.parseInt(value.slice(0, 2), 16),
  };
}

/**
 * @param name Meta 标签名称，Argon 用它同步浏览器主题色。
 * @returns 现有或新建的 meta 元素，保证后续主题应用不会因为缺标签而静默失效。
 */
function ensureThemeMetaElement(name: string) {
  let metaElement = document.querySelector<HTMLMetaElement>(blogMetaSelector(name));
  if (!metaElement) {
    metaElement = document.createElement('meta');
    metaElement.name = name;
    document.head.appendChild(metaElement);
  }

  return metaElement;
}

/**
 * @param r 红色通道。
 * @param g 绿色通道。
 * @param b 蓝色通道。
 * @returns HSL 色相、饱和度和亮度，用于复现 Argon 原生主题变量。
 */
function rgbToHsl(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return { h: 0, l: Math.round(lightness * 100), s: 0 };
  }

  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  const hue =
    max === red
      ? (green - blue) / delta + (green < blue ? 6 : 0)
      : max === green
        ? (blue - red) / delta + 2
        : (red - green) / delta + 4;

  return {
    h: Math.round(hue * 60),
    l: Math.round(lightness * 100),
    s: Math.round(saturation * 100),
  };
}

/**
 * @param primaryRgb 当前主题色 RGB，Argon 用它派生 immersion-color 明暗色阶。
 * @param mode 当前明暗模式，决定 body 上暴露亮色 tint 变量还是暗色 shade 变量。
 * @returns root 默认变量和 body 当前变量，供 CSS 继承链模拟 WordPress Argon。
 */
function createArgonColorVariables(
  primaryRgb: ReturnType<typeof hexToRgb>,
  mode: BlogThemeMode,
) {
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
  };

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
  };
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
  };

  return {
    current: mode === 'dark' ? dark : light,
    root,
  };
}

/**
 * @param variables CSS custom property map generated for the current Argon theme.
 * @returns Multiline CSS declarations ready to inject into the singleton theme style.
 */
function serializeCssVariables(variables: Record<string, string>) {
  return Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
}

/**
 * @param hsl 当前主题色 HSL，来源于 `--themecolor`。
 * @param lightnessDelta Argon 原生亮度偏移；正数生成 light，负数生成 dark 阶梯。
 * @returns 复刻 WordPress Argon `--themecolor-light/dark*` 的 HSL calc 表达式。
 */
function formatArgonThemeHsl(
  hsl: ReturnType<typeof rgbToHsl>,
  lightnessDelta: number,
) {
  const direction = lightnessDelta >= 0 ? '+' : '-';
  const boundary = lightnessDelta >= 0 ? '100%' : '0%';
  const clampFunction = lightnessDelta >= 0 ? 'min' : 'max';
  const delta = Math.abs(lightnessDelta);

  return `hsl(${hsl.h}, calc(${hsl.s} * 1%), ${clampFunction}(calc(${hsl.l} * 1% ${direction} ${delta}%), ${boundary}))`;
}

/**
 * @param primaryRgb 当前主题色 RGB。
 * @param ratio Argon shade 系数，越接近 1 越贴近深色基准 30。
 * @returns 可作为 `rgb()` 通道列表使用的 shade calc 表达式。
 */
function formatArgonShadeChannels(primaryRgb: ReturnType<typeof hexToRgb>, ratio: number) {
  return [
    formatArgonShadeChannel(primaryRgb.r, ratio),
    formatArgonShadeChannel(primaryRgb.g, ratio),
    formatArgonShadeChannel(primaryRgb.b, ratio),
  ].join(',\n    ');
}

/**
 * @param primaryRgb 当前主题色 RGB。
 * @param ratio Argon tint 系数，越接近 1 越贴近白色基准 255。
 * @returns 可作为 `rgb()` 通道列表使用的 tint calc 表达式。
 */
function formatArgonTintChannels(primaryRgb: ReturnType<typeof hexToRgb>, ratio: number) {
  return [
    formatArgonTintChannel(primaryRgb.r, ratio),
    formatArgonTintChannel(primaryRgb.g, ratio),
    formatArgonTintChannel(primaryRgb.b, ratio),
  ].join(',\n    ');
}

/**
 * @param primaryRgb 当前主题色 RGB。
 * @param ratio Argon shade 系数。
 * @returns 完整 `rgb(...)` shade 表达式。
 */
function formatArgonShadeRgb(primaryRgb: ReturnType<typeof hexToRgb>, ratio: number) {
  return `rgb(${formatArgonShadeChannels(primaryRgb, ratio)})`;
}

/**
 * @param primaryRgb 当前主题色 RGB。
 * @param ratio Argon tint 系数。
 * @returns 完整 `rgb(...)` tint 表达式。
 */
function formatArgonTintRgb(primaryRgb: ReturnType<typeof hexToRgb>, ratio: number) {
  return `rgb(${formatArgonTintChannels(primaryRgb, ratio)})`;
}

/**
 * @param channel 当前主题色单通道值。
 * @param ratio Argon shade 系数。
 * @returns 单个深色通道 calc 表达式，基准值 30 来自 Argon immersion-color 算法。
 */
function formatArgonShadeChannel(channel: number, ratio: number) {
  return `calc(30 * ${ratio} + ${channel} * (1 - ${ratio}))`;
}

/**
 * @param channel 当前主题色单通道值。
 * @param ratio Argon tint 系数。
 * @returns 单个浅色通道 calc 表达式，基准值 255 来自 Argon immersion-color 算法。
 */
function formatArgonTintChannel(channel: number, ratio: number) {
  return `calc(${channel} + (255 - ${channel}) * ${ratio})`;
}

/**
 * @param r 红色通道。
 * @param g 绿色通道。
 * @param b 蓝色通道。
 * @returns Argon 用于判断主题色是否过暗的灰度值。
 */
function getGray(r: number, g: number, b: number) {
  return r * 0.299 + g * 0.587 + b * 0.114;
}

/**
 * @param hexColor 当前主题色。
 * @returns 主题色是否过暗，用于根节点 modifier。
 */
function isThemeColorTooDark(hexColor: string) {
  const { b, g, r } = hexToRgb(hexColor);

  return getGray(r, g, b) < 50;
}

function normalizeClassList(value?: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeClassList(item));
  }

  return String(value || '')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeHexColor(value?: string) {
  if (!value) return '';
  const normalized = value.trim();

  if (/^#[0-9a-f]{6}$/i.test(normalized)) return normalized.toUpperCase();
  if (/^#[0-9a-f]{3}$/i.test(normalized)) {
    return `#${normalized
      .slice(1)
      .split('')
      .map((item) => item + item)
      .join('')}`.toUpperCase();
  }

  return '';
}

function normalizeRadius(value?: number | string) {
  if (value === undefined || value === null || value === '') return null;
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? Math.max(0, numericValue) : null;
}

function normalizeOpacity(value?: number | string) {
  if (value === undefined || value === null || value === '') return null;
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? Math.min(Math.max(numericValue, 0), 1)
    : null;
}

function normalizePositiveNumber(value?: number | string) {
  if (value === undefined || value === null || value === '') return null;
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? Math.max(0, numericValue) : null;
}

function normalizeCssImage(value?: string) {
  if (!value) return '';
  const normalized = value.trim();

  if (normalized.startsWith('url(')) return normalized;
  if (/^https?:\/\//i.test(normalized) || normalized.startsWith('/')) {
    return `url('${normalized.replace(/'/g, "\\'")}')`;
  }

  return '';
}

function normalizeThemeAsset(value?: string) {
  if (!value) return '';
  const normalized = value.trim();
  const cssImage = /^url\((.*)\)$/i.exec(normalized)?.[1]?.trim();
  const asset = cssImage
    ? cssImage.replace(/^['"]|['"]$/g, '')
    : normalized;

  return /^https?:\/\//i.test(asset) || asset.startsWith('/') ? asset : '';
}

function normalizeMenuItems(items: BlogThemeMenuItem[], siteHome = ''): BlogThemeMenuItem[] {
  return items.reduce<BlogThemeMenuItem[]>((result, item) => {
    const label = `${item.label || ''}`.trim();
    const href = normalizeMenuHref(`${item.href || ''}`.trim(), siteHome);

    if (!label || !href) return result;

    const isInternalHref = href.startsWith('/') && !href.startsWith('//');
    result.push({
      external: !isInternalHref && (item.external || /^https?:\/\//i.test(href)),
      href,
      ...(item.icon ? { icon: item.icon } : {}),
      label,
    });

    return result;
  }, []);
}

function normalizeMenuHref(href: string, siteHome = '') {
  if (!href) return '';
  const normalizedSiteHome = siteHome.replace(/\/+$/g, '');

  if (normalizedSiteHome && href.replace(/\/+$/g, '') === normalizedSiteHome) {
    return '/';
  }

  if (normalizedSiteHome && href.startsWith(`${normalizedSiteHome}/`)) {
    return href.slice(normalizedSiteHome.length) || '/';
  }

  return href;
}

function getModeFromWordpressConfig(config: WordpressArgonThemeConfig): BlogThemeMode | '' {
  const htmlClass = normalizeClassList(config.htmlClass);
  const switchMode = `${config.darkmodeAutoSwitch || ''}`.toLowerCase();

  if (htmlClass.includes('darkmode')) return 'dark';
  if (switchMode === 'alwayson') return 'dark';
  if (switchMode === 'alwaysoff' || switchMode === 'false') return 'light';
  if (switchMode === 'system') return getSystemThemeMode();
  if (switchMode === 'time') return getTimeThemeMode();

  return '';
}

function getSystemThemeMode(): BlogThemeMode | '' {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return '';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function syncSystemThemeMode(config: WordpressArgonThemeConfig) {
  stopSystemThemeModeSync();
  if (
    `${config.darkmodeAutoSwitch || ''}`.toLowerCase() !== 'system' ||
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return;
  }

  systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemThemeChangeHandler = (event) => {
    preferences.mode = event.matches ? 'dark' : 'light';
  };

  if (typeof systemThemeMediaQuery.addEventListener === 'function') {
    systemThemeMediaQuery.addEventListener('change', systemThemeChangeHandler);
  } else {
    systemThemeMediaQuery.addListener(systemThemeChangeHandler);
  }
}

function stopSystemThemeModeSync() {
  if (!systemThemeMediaQuery || !systemThemeChangeHandler) {
    return;
  }

  if (typeof systemThemeMediaQuery.removeEventListener === 'function') {
    systemThemeMediaQuery.removeEventListener(
      'change',
      systemThemeChangeHandler,
    );
  } else {
    systemThemeMediaQuery.removeListener(systemThemeChangeHandler);
  }

  systemThemeMediaQuery = null;
  systemThemeChangeHandler = null;
}

function getTimeThemeMode(): BlogThemeMode {
  const hour = new Date().getHours();

  return hour < 7 || hour >= 22 ? 'dark' : 'light';
}

function getArticleHeaderStyle(htmlClass: string[]) {
  const prefix = 'article-header-style-';
  const className = htmlClass.find((item) => item.startsWith(prefix));

  return className?.slice(prefix.length) || '';
}
