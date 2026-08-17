import { App as AntdApp, ConfigProvider } from 'antdv-next';
import { computed, defineComponent, onBeforeUnmount, onMounted, watch } from 'vue';
import { RouterView, type RouteLocationNormalizedLoaded, useRoute } from 'vue-router';

import {
  resolveBlogThemeConfigUrl,
  type WordpressArgonThemeConfig,
  useBlogTheme,
} from './hooks/useBlogTheme';

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
 * 读取路由元数据中的 Argon 页面类型，缺失时回退 home。
 * @param route - 用于推导页面类型或地址的当前路由。
 * @returns 读取到的路由元数据中的 Argon 页面类型，缺失时回退 home。
 */
function getArgonRouteKind(route: RouteLocationNormalizedLoaded) {
  return String(route.meta.argonKind || 'home');
}

/**
 * 把当前 Argon 页面类型拼成博客根节点修饰类。
 * @param route - 用于推导页面类型或地址的当前路由。
 * @returns 当前 Argon 页面类型对应的博客根节点修饰类。
 */
function getArgonRouteRootClass(route: RouteLocationNormalizedLoaded) {
  const kind = getArgonRouteKind(route);

  return `kt-blog--${kind}`;
}

/**
 * 清除上一路由遗留类，并按页面类型、明暗模式与滤镜同步 html 和 body 的 Argon 类。
 * @param route - 用于推导页面类型或地址的当前路由。
 * @param shouldUseDarkMode - 是否给文档根节点启用深色主题类。
 * @param filterMode - 决定 Argon 页面滤镜样式的主题模式。
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
 * 把 home、文章、分类、标签、归档或搜索路由映射为 WordPress Argon body 类集合。
 * @param route - 用于推导页面类型或地址的当前路由。
 * @returns 当前路由对应的 WordPress Argon body 类集合。
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
 * 优先应用页面内联主题配置，再请求远端配置覆盖；请求失败时保留本地默认主题。
 * @param applyWordpressThemeConfig - 把远端 WordPress 配置规范化并写入主题状态的函数。
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

  const primaryConfigUrl = resolveBlogThemeConfigUrl();

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
