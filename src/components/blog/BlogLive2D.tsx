import { defineComponent, onBeforeUnmount, onMounted } from 'vue';

import { WORDPRESS_WAIFU_MIN_WIDTH } from './live2d/wordpressWidgetConfig';
import {
  mountWordPressLive2DRuntime,
  type WordPressLive2DRuntimeHandle,
} from './live2d/wordpressRuntimeBridge';

export default defineComponent({
  name: 'BlogLive2D',
  /**
   * Owns the Pio canvas lifecycle and defers drawing to the WordPress-exported runtime.
   * @returns Render function that only creates the canvas on desktop viewports.
   */
  setup() {
    const isDesktop = window.innerWidth > WORDPRESS_WAIFU_MIN_WIDTH;
    let disposed = false;
    let runtimeHandle: WordPressLive2DRuntimeHandle | null = null;

    onMounted(async () => {
      if (!isDesktop) {
        return;
      }

      try {
        const mountedHandle = await mountWordPressLive2DRuntime();
        if (disposed) {
          mountedHandle.destroy();
          return;
        }
        runtimeHandle = mountedHandle;
      } catch (error: unknown) {
        console.warn('[KT Blog] Pio Live2D unavailable.', error);
      }
    });

    onBeforeUnmount(() => {
      disposed = true;
      runtimeHandle?.destroy();
      runtimeHandle = null;
    });

    return () => null;
  },
});
