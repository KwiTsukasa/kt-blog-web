import { App as AntdApp, ConfigProvider } from 'antdv-next';
import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';

import { useBlogTheme } from './hooks/useBlogTheme';

export default defineComponent({
  name: 'KtBlogApp',
  setup() {
    const { themeConfig, themeRootClass } = useBlogTheme();

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
