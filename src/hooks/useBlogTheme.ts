import { theme } from 'antdv-next';
import { computed, reactive, watch } from 'vue';

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
const THEME_STYLE_ID = 'kt-blog-theme-style';
const BLOG_THEME_BLOCK_CLASS = 'kt-blog';
const ARGON_SANS_FONT_FAMILY =
  'Comfortaa, "Open Sans", -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimSun, sans-serif';
const ARGON_SERIF_FONT_FAMILY = 'Georgia, "Times New Roman", "Noto Serif SC", serif';
const ARGON_DEFAULT_COLOR_PRIMARY = '#6f5f89';
const ARGON_PRIMARY_SOFT = '#4a4058';
const ARGON_CARD_SHADOW = '0 2px 4px rgba(0, 0, 0, 0.075)';
const ARGON_DEFAULT_BACKGROUND = '/argon/theme/img-2-1200x1000.jpg';
const ARGON_DEFAULT_AUTHOR_AVATAR = '/argon/theme/profile.jpg';
const defaultHeaderMenu: BlogThemeMenuItem[] = [
  { href: '/', label: '首页' },
  { href: '/archives', label: '归档' },
  { href: '/category/nas', label: 'NAS' },
  { href: '/category/vue', label: 'Vue' },
  { href: '/category/node', label: 'Node' },
];
const defaultSidebarMenu: BlogThemeMenuItem[] = [
  { href: '/', icon: 'fa-home', label: '首页' },
  { href: '/category/node', icon: 'fa-user', label: '管理' },
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
  preferences.filter !== 'off' && `${BLOG_THEME_BLOCK_CLASS}--filter-${preferences.filter}`,
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
  const primaryDark = shadeHexColor(currentPreferences.colorPrimary, -18);
  const primaryDark2 = shadeHexColor(currentPreferences.colorPrimary, -30);
  const fontFamily = getThemeFontFamily(currentPreferences.font);
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
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', currentPreferences.colorPrimary);
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color-rgb"]')
    ?.setAttribute('content', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);

  updateThemeStyle(`
:root {
  --kt-blog-scrollbar-track: ${palette.scrollbarTrack};
  --kt-blog-scrollbar-thumb: ${palette.scrollbarThumb};
  --kt-blog-scrollbar-thumb-hover: ${palette.scrollbarThumbHover};
  --kt-blog-scrollbar-size: 10px;
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
  --themecolor: ${currentPreferences.colorPrimary};
  --themecolor-R: ${primaryRgb.r};
  --themecolor-G: ${primaryRgb.g};
  --themecolor-B: ${primaryRgb.b};
  --themecolor-H: ${primaryHsl.h};
  --themecolor-S: ${primaryHsl.s};
  --themecolor-L: ${primaryHsl.l};
  --themecolor-dark0: hsl(${primaryHsl.h}, ${primaryHsl.s}%, ${Math.max(primaryHsl.l - 2.5, 0)}%);
  --themecolor-dark: ${primaryDark};
  --themecolor-dark2: ${primaryDark2};
  --themecolor-dark3: hsl(${primaryHsl.h}, ${primaryHsl.s}%, ${Math.max(primaryHsl.l - 15, 0)}%);
  --themecolor-light: hsl(${primaryHsl.h}, ${primaryHsl.s}%, ${Math.min(primaryHsl.l + 10, 100)}%);
  --themecolor-gradient: linear-gradient(150deg, var(--themecolor-light) 15%, var(--themecolor) 70%, var(--themecolor-dark0) 94%);
  --themecolor-rgbstr: ${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b};
  --color-darkmode-toolbar: ${palette.toolbarRgb};
  --argon-page: ${palette.page};
  --argon-card: ${palette.card};
  --argon-card-deep: ${palette.cardDeep};
  --argon-card-soft: ${palette.cardSoft};
  --argon-card-overlay-weak: ${palette.cardOverlayWeak};
  --argon-card-overlay-strong: ${palette.cardOverlayStrong};
  --argon-control: ${palette.control};
  --argon-control-soft: ${palette.controlSoft};
  --argon-pill: ${palette.pill};
  --argon-text: ${palette.text};
  --argon-muted: ${palette.muted};
  --argon-title: ${palette.title};
  --argon-border: ${palette.border};
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
  let styleElement = document.querySelector<HTMLStyleElement>(`#${THEME_STYLE_ID}`);
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = THEME_STYLE_ID;
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
    card: `hsl(${h}, ${baseSaturation + 2}%, 18%)`,
    cardDeep: `hsl(${h}, ${baseSaturation + 2}%, 18%)`,
    cardOverlayStrong: `hsla(${h}, ${baseSaturation + 6}%, 16%, 0.72)`,
    cardOverlayWeak: `rgba(${r}, ${g}, ${b}, 0.1)`,
    cardSoft: `hsl(${h}, ${baseSaturation + 2}%, 20%)`,
    control: `hsl(${h}, ${baseSaturation + 12}%, 28%)`,
    controlSoft: `hsl(${h}, ${baseSaturation + 10}%, 24%)`,
    faint: 'rgba(238, 238, 238, 0.34)',
    meta: 'rgba(238, 238, 238, 0.68)',
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
    title: `hsl(${h}, ${textSaturation}%, 86%)`,
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
 * @param hexColor 目标颜色十六进制字符串。
 * @param percent 明暗调整百分比，负数变暗，正数变亮。
 * @returns 调整后的十六进制颜色。
 */
function shadeHexColor(hexColor: string, percent: number) {
  const { b, g, r } = hexToRgb(hexColor);
  const adjust = (channel: number) => {
    const nextChannel = Math.round(channel + (percent / 100) * 255);
    return Math.max(0, Math.min(255, nextChannel)).toString(16).padStart(2, '0');
  };

  return `#${adjust(r)}${adjust(g)}${adjust(b)}`;
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
