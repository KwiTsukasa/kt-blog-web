import { App as AntdApp, ConfigProvider } from 'antdv-next';
import { computed, defineComponent, onBeforeUnmount, onMounted, watch } from 'vue';
import { RouterView, type RouteLocationNormalizedLoaded, useRoute } from 'vue-router';

import { type WordpressArgonThemeConfig, useBlogTheme } from './hooks/useBlogTheme';

declare global {
  interface Window {
    __KT_BLOG_THEME_CONFIG__?: WordpressArgonThemeConfig;
    __KT_BLOG_WORDPRESS_THEME_CONFIG__?: WordpressArgonThemeConfig;
  }
}

export default defineComponent({
  name: 'KtBlogApp',
  setup() {
    const route = useRoute();
    const { applyWordpressThemeConfig, isDarkTheme, preferences, themeConfig, themeRootClass } = useBlogTheme();
    const routeRootClass = computed(() => getArgonRouteRootClass(route));

    onMounted(() => {
      applyInitialBlogThemeConfig(applyWordpressThemeConfig);
    });

    watch(
      () => [routeRootClass.value, isDarkTheme.value, preferences.filter] as const,
      () => {
        mirrorArgonDocumentClasses(route, isDarkTheme.value, preferences.filter);
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      clearArgonDocumentClasses();
    });

    return () => (
      <ConfigProvider theme={themeConfig.value}>
        <AntdApp>
          <div
            class={[themeRootClass.value, routeRootClass.value]}
            data-argon-route-kind={getArgonRouteKind(route)}
          >
            <RouterView />
          </div>
        </AntdApp>
      </ConfigProvider>
    );
  },
});

/**
 * @param route 当前 Vue Router 路由，用于把 hash route 映射回 Argon 页面类型。
 * @returns Argon 页面类型，供根 class 和测试语义使用。
 */
function getArgonRouteKind(route: RouteLocationNormalizedLoaded) {
  return String(route.meta.argonKind || 'home');
}

/**
 * @param route 当前 Vue Router 路由，用于补齐 WordPress body class 的本地等价语义。
 * @returns `.kt-blog` 根节点上的页面语义 class。
 */
function getArgonRouteRootClass(route: RouteLocationNormalizedLoaded) {
  const kind = getArgonRouteKind(route);

  return `kt-blog--${kind}`;
}

/**
 * @param route 当前路由，用于把 Vue 页面状态同步成 WordPress Argon 的 html/body class 视角。
 * @param shouldUseDarkMode 当前主题是否处于暗色模式，决定是否写入 `html.darkmode`。
 * @param filterMode 当前滤镜模式，按 Argon 语义写到 `html.filter-*` 以保持 fixed 按钮参照视口。
 */
function mirrorArgonDocumentClasses(
  route: RouteLocationNormalizedLoaded,
  shouldUseDarkMode: boolean,
  filterMode: string,
) {
  clearArgonDocumentClasses();
  document.documentElement.classList.add(
    'triple-column',
    'immersion-color',
    'toolbar-blur',
    'article-header-style-default',
  );
  document.documentElement.classList.toggle('darkmode', shouldUseDarkMode);
  document.documentElement.classList.toggle('filter-sunset', filterMode === 'sunset');
  document.documentElement.classList.toggle('filter-darkness', filterMode === 'darkness');
  document.documentElement.classList.toggle('filter-grayscale', filterMode === 'grayscale');
  document.body.classList.add(...getArgonBodyClasses(route));
}

/**
 * 移除本地运行态写入的 Argon document class，避免卸载或测试切页后污染外部页面。
 */
function clearArgonDocumentClasses() {
  document.documentElement.classList.remove(
    'triple-column',
    'immersion-color',
    'toolbar-blur',
    'article-header-style-default',
    'darkmode',
    'filter-sunset',
    'filter-darkness',
    'filter-grayscale',
  );
  document.body.classList.remove(
    'home',
    'blog',
    'archive',
    'category',
    'search',
    'search-results',
    'search-no-results',
    'single',
    'single-post',
    'tag',
    'date',
    'wp-theme-argon',
    'leftbar-can-headroom',
  );
}

/**
 * @param route 当前路由，用于推导 WordPress body class 等价语义。
 * @returns 需要写入 `document.body` 的 Argon class 集合。
 */
function getArgonBodyClasses(route: RouteLocationNormalizedLoaded) {
  const kind = getArgonRouteKind(route);
  const classes = ['wp-theme-argon'];

  if (kind === 'home') {
    classes.push('home', 'blog');
  }
  if (kind === 'post') {
    classes.push('single', 'single-post');
  }
  if (kind === 'category') {
    classes.push('archive', 'category');
  }
  if (kind === 'tag') {
    classes.push('archive', 'tag');
  }
  if (kind === 'archive') {
    classes.push('archive', 'date');
  }
  if (kind === 'search') {
    classes.push('search', 'search-results');
  }

  return classes;
}

/**
 * @param applyWordpressThemeConfig 主题配置落地函数，负责把内联或接口返回的 Argon 配置写入运行态。
 */
async function applyInitialBlogThemeConfig(
  applyWordpressThemeConfig: (config: WordpressArgonThemeConfig) => void,
) {
  const inlineConfig =
    window.__KT_BLOG_THEME_CONFIG__ ||
    window.__KT_BLOG_WORDPRESS_THEME_CONFIG__;

  if (inlineConfig) {
    applyWordpressThemeConfig(inlineConfig);
  }

  const primaryConfigUrl =
    import.meta.env.VITE_BLOG_THEME_CONFIG_URL || '/api/blog/theme/config';
  if (!primaryConfigUrl) {
    return;
  }

  try {
    const response = await fetch(primaryConfigUrl);
    if (!response.ok) {
      return;
    }

    const payload = await response.json();

    applyWordpressThemeConfig(payload?.data || payload);
  } catch {
    // Theme config is progressive enhancement; local defaults keep the blog renderable.
  }
}
