import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';

import { fetchBlogLive2DManifest } from '@/api/live2dManifest';
import {
  BLOG_VIEWPORT_GEOMETRY,
  createBlogLive2DIdleAnimator,
  type BlogLive2DIdleAnimatorHandle,
} from '@/factories/blogAnimationFactory';
import { blogDomId } from '@/factories/blogDomFactory';

import { mountOfficialPioRuntime } from './live2d/officialRuntimeBridge';
import type { KtPioLive2DRuntimeHandle } from './live2d/types';

const LIVE2D_MANIFEST_URL = import.meta.env.VITE_BLOG_LIVE2D_MANIFEST_URL || '/api/blog/live2d/pio/v2/manifest.json';

export default defineComponent({
  name: 'BlogLive2D',
  /**
   * Owns the Pio canvas lifecycle and defers all drawing to the official runtime bridge.
   * @returns Render function that only creates the canvas on desktop viewports.
   */
  setup() {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const isDesktop = window.innerWidth >= BLOG_VIEWPORT_GEOMETRY.live2dDesktopMinWidthPx;
    let disposed = false;
    let idleAnimatorHandle: BlogLive2DIdleAnimatorHandle | null = null;
    let runtimeHandle: KtPioLive2DRuntimeHandle | null = null;

    onMounted(async () => {
      if (!isDesktop || !canvasRef.value) {
        return;
      }

      try {
        const manifest = await fetchBlogLive2DManifest(LIVE2D_MANIFEST_URL);
        const mountedHandle = await mountOfficialPioRuntime(canvasRef.value, manifest);
        if (disposed) {
          mountedHandle.destroy();
          return;
        }
        runtimeHandle = mountedHandle;
        if (!manifest.wordpressParity) {
          idleAnimatorHandle = createBlogLive2DIdleAnimator(canvasRef.value, {
            enableIdleMotion: !manifest.motionGroups?.Idle,
          });
        }
      } catch (error: unknown) {
        console.warn('[KT Blog] Pio Live2D unavailable.', error);
      }
    });

    onBeforeUnmount(() => {
      disposed = true;
      idleAnimatorHandle?.destroy();
      idleAnimatorHandle = null;
      runtimeHandle?.destroy();
      runtimeHandle = null;
    });

    return () =>
      isDesktop ? (
        <canvas id={blogDomId('live2dCanvas')} ref={canvasRef} class="kt-blog__live2d-canvas" />
      ) : null;
  },
});
