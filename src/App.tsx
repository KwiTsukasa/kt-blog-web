import { App as AntdApp, ConfigProvider } from 'antdv-next';
import { defineComponent, onMounted } from 'vue';
import { RouterView } from 'vue-router';

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
    const { applyWordpressThemeConfig, themeConfig, themeRootClass } = useBlogTheme();

    onMounted(() => {
      applyInitialBlogThemeConfig(applyWordpressThemeConfig);
    });

    return () => (
      <ConfigProvider theme={themeConfig.value}>
        <AntdApp>
          <div class={themeRootClass.value}>
            <RouterView />
          </div>
        </AntdApp>
      </ConfigProvider>
    );
  },
});

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
