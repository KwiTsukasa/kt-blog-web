import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchBlogLive2DManifest } from '@/api/live2dManifest';
import BlogLive2D from '@/components/blog/BlogLive2D';
import { mountOfficialPioRuntime } from '@/components/blog/live2d/officialRuntimeBridge';
import { createBlogLive2DIdleAnimator } from '@/factories/blogAnimationFactory';

const pioManifest = {
  character: 'pio',
  desktopOnly: true,
  fallback: null,
  model3: '/api/blog/live2d/pio/v1/pio.model3.json',
  runtimeScript: '/api/blog/live2d/pio/v1/pio-runtime.js',
  version: 'v1',
} as const;

describe('fetchBlogLive2DManifest', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('accepts only the Pio manifest without fallback model chains', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(pioManifest), { status: 200 })),
    );

    const manifest = await fetchBlogLive2DManifest('/manifest.json');

    expect(manifest.character).toBe('pio');
    expect(manifest.fallback).toBeNull();
    expect(manifest.model3).toBe('/api/blog/live2d/pio/v1/pio.model3.json');
  });

  it('rejects non-Pio or fallback manifests before runtime loading', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              ...pioManifest,
              character: 'haru',
              fallback: 'https://cdn.example.com/model.json',
            }),
            { status: 200 },
          ),
      ),
    );

    await expect(fetchBlogLive2DManifest('/manifest.json')).rejects.toThrow(
      'Only Pio Live2D manifest is allowed.',
    );
  });

  it('rejects malformed manifest payloads before runtime loading', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(null), { status: 200 })),
    );

    await expect(fetchBlogLive2DManifest('/manifest.json')).rejects.toThrow(
      'Only Pio Live2D manifest is allowed.',
    );
  });
});

describe('mountOfficialPioRuntime', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    delete window.KtPioLive2D;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('loads official runtime script once and mounts with the manifest model URL', async () => {
    const destroy = vi.fn();
    const runtime = {
      mount: vi.fn(async () => ({ destroy })),
    };
    const originalAppendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      const element = originalAppendChild(node);
      if (element instanceof HTMLScriptElement) {
        window.KtPioLive2D = runtime;
        element.onload?.(new Event('load'));
      }
      return element;
    });

    const canvas = document.createElement('canvas');
    await mountOfficialPioRuntime(canvas, pioManifest);
    await mountOfficialPioRuntime(canvas, pioManifest);

    expect(document.querySelectorAll('script#kt-blog-pio-live2d-runtime')).toHaveLength(1);
    expect(runtime.mount).toHaveBeenCalledTimes(2);
    expect(runtime.mount).toHaveBeenCalledWith({
      canvas,
      model3: '/api/blog/live2d/pio/v1/pio.model3.json',
    });
  });

  it('coalesces concurrent runtime script loads before mounting', async () => {
    const runtime = {
      mount: vi.fn(async () => ({ destroy: vi.fn() })),
    };
    const runtimeScripts: HTMLScriptElement[] = [];
    const originalAppendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      const element = originalAppendChild(node);
      if (element instanceof HTMLScriptElement) {
        runtimeScripts.push(element);
      }
      return element;
    });

    const firstCanvas = document.createElement('canvas');
    const secondCanvas = document.createElement('canvas');
    const firstMount = mountOfficialPioRuntime(firstCanvas, pioManifest);
    const secondMount = mountOfficialPioRuntime(secondCanvas, pioManifest);
    await Promise.resolve();

    expect(document.querySelectorAll('script#kt-blog-pio-live2d-runtime')).toHaveLength(1);

    window.KtPioLive2D = runtime;
    expect(runtimeScripts).toHaveLength(1);
    runtimeScripts[0]?.onload?.(new Event('load'));

    await Promise.all([firstMount, secondMount]);

    expect(runtime.mount).toHaveBeenCalledTimes(2);
    expect(runtime.mount).toHaveBeenNthCalledWith(1, {
      canvas: firstCanvas,
      model3: '/api/blog/live2d/pio/v1/pio.model3.json',
    });
    expect(runtime.mount).toHaveBeenNthCalledWith(2, {
      canvas: secondCanvas,
      model3: '/api/blog/live2d/pio/v1/pio.model3.json',
    });
  });
});

describe('BlogLive2D', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('does not fetch the manifest below the desktop viewport', async () => {
    vi.stubGlobal('innerWidth', 1199);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    mount(BlogLive2D);
    await flushPromises();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(document.querySelector('#live2d')).toBeNull();
  });

  it('mounts Pio runtime on desktop and destroys it when unmounted', async () => {
    vi.stubGlobal('innerWidth', 1280);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(pioManifest), { status: 200 })),
    );
    const frames: FrameRequestCallback[] = [];
    const cancelFrame = vi.fn();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(cancelFrame);
    const destroy = vi.fn();
    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      const element = Node.prototype.appendChild.call(document.body, node);
      if (element instanceof HTMLScriptElement) {
        window.KtPioLive2D = {
          mount: vi.fn(async () => ({ destroy })),
        };
        element.onload?.(new Event('load'));
      }
      return element;
    });

    const wrapper = mount(BlogLive2D);
    await flushPromises();

    const canvas = wrapper.find('canvas#live2d');
    expect(canvas.exists()).toBe(true);
    expect(window.KtPioLive2D?.mount).toHaveBeenCalledWith({
      canvas: canvas.element,
      model3: '/api/blog/live2d/pio/v1/pio.model3.json',
    });
    frames.shift()?.(1000);

    expect((canvas.element as HTMLCanvasElement).style.transform).toContain('translate3d');

    wrapper.unmount();

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(cancelFrame).toHaveBeenCalled();
  });
});

describe('createBlogLive2DIdleAnimator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the Pio canvas visibly moving between animation frames', () => {
    const frames: FrameRequestCallback[] = [];
    const cancelFrame = vi.fn();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(cancelFrame);
    const canvas = document.createElement('canvas');
    canvas.style.transform = 'translateX(1px)';

    const handle = createBlogLive2DIdleAnimator(canvas);
    frames.shift()?.(1000);
    const firstTransform = canvas.style.transform;
    frames.shift()?.(2200);
    const secondTransform = canvas.style.transform;

    expect(firstTransform).not.toBe('translateX(1px)');
    expect(secondTransform).not.toBe(firstTransform);

    handle.destroy();

    expect(canvas.style.transform).toBe('translateX(1px)');
    expect(cancelFrame).toHaveBeenCalled();
  });
});
