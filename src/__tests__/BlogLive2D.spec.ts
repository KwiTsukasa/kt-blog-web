import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import BlogLive2D from '@/components/blog/BlogLive2D';
import {
  DEFAULT_WORDPRESS_LIVE2D_MODEL_ENTRY,
  DEFAULT_WORDPRESS_LIVE2D_SCRIPT,
  DEFAULT_WORDPRESS_LIVE2D_SETTINGS,
  mountWordPressLive2DRuntime,
} from '@/components/blog/live2d/wordpressRuntimeBridge';

describe('mountWordPressLive2DRuntime', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    delete window.InitLive2D;
    delete window.LAppDefine;
    delete window.LAppLive2DManager;
    vi.restoreAllMocks();
  });

  it('loads the WordPress Cubism2 MOC runtime once and keeps the SPA singleton mounted', async () => {
    const initLive2D = vi.fn();
    const originalAppendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      const element = originalAppendChild(node);
      if (element instanceof HTMLScriptElement) {
        window.InitLive2D = initLive2D;
        window.LAppLive2DManager = function LAppLive2DManager() {};
        window.LAppLive2DManager.prototype.tapEvent = vi.fn();
        element.onload?.(new Event('load'));
      }
      return element;
    });

    await mountWordPressLive2DRuntime();
    await mountWordPressLive2DRuntime();

    const runtimeScript = document.querySelector('script#kt-blog-pio-wordpress-live2d-runtime');
    expect(runtimeScript?.getAttribute('src')).toBe(DEFAULT_WORDPRESS_LIVE2D_SCRIPT);
    expect(document.querySelectorAll('script#kt-blog-pio-wordpress-live2d-runtime')).toHaveLength(1);
    expect(document.querySelectorAll('.waifu.kt-blog__live2d-widget')).toHaveLength(1);
    expect(document.querySelectorAll('canvas#live2d.live2d.kt-blog__live2d-canvas')).toHaveLength(1);
    expect(initLive2D).toHaveBeenCalledTimes(1);
    expect(window.LAppDefine).toMatchObject(DEFAULT_WORDPRESS_LIVE2D_SETTINGS);
    expect(window.LAppDefine?.MODELS).toEqual([[DEFAULT_WORDPRESS_LIVE2D_MODEL_ENTRY]]);
  });

  it('coalesces concurrent WordPress runtime script loads before calling InitLive2D', async () => {
    const initLive2D = vi.fn();
    const runtimeScripts: HTMLScriptElement[] = [];
    const originalAppendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      const element = originalAppendChild(node);
      if (element instanceof HTMLScriptElement) {
        runtimeScripts.push(element);
      }
      return element;
    });

    const firstMount = mountWordPressLive2DRuntime();
    const secondMount = mountWordPressLive2DRuntime();
    await Promise.resolve();

    expect(document.querySelectorAll('script#kt-blog-pio-wordpress-live2d-runtime')).toHaveLength(1);
    expect(document.querySelectorAll('.waifu.kt-blog__live2d-widget')).toHaveLength(1);
    expect(document.querySelectorAll('canvas#live2d.live2d.kt-blog__live2d-canvas')).toHaveLength(1);

    window.InitLive2D = initLive2D;
    window.LAppLive2DManager = function LAppLive2DManager() {};
    window.LAppLive2DManager.prototype.tapEvent = vi.fn();
    expect(runtimeScripts).toHaveLength(1);
    runtimeScripts[0]?.onload?.(new Event('load'));

    await Promise.all([firstMount, secondMount]);

    expect(initLive2D).toHaveBeenCalledTimes(1);
    expect(window.LAppDefine?.MODELS).toEqual([[DEFAULT_WORDPRESS_LIVE2D_MODEL_ENTRY]]);
  });

  it('maps WordPress Pio custom hit areas to source motion groups', async () => {
    const initLive2D = vi.fn();
    const originalTapEvent = vi.fn(() => false);
    const startRandomMotion = vi.fn();
    const originalAppendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      const element = originalAppendChild(node);
      if (element instanceof HTMLScriptElement) {
        window.InitLive2D = initLive2D;
        window.LAppLive2DManager = function LAppLive2DManager() {};
        window.LAppLive2DManager.prototype.tapEvent = originalTapEvent;
        element.onload?.(new Event('load'));
      }
      return element;
    });

    await mountWordPressLive2DRuntime();

    const tapEvent = window.LAppLive2DManager?.prototype.tapEvent;
    const manager = {
      models: [
        {
          modelSetting: {
            json: {
              hit_areas_custom: {
                body_x: [-0.3, -0.25] as [number, number],
                body_y: [0.3, -0.9] as [number, number],
                head_x: [-0.35, 0.6] as [number, number],
                head_y: [0.19, -0.2] as [number, number],
              },
            },
          },
          startRandomMotion,
        },
      ],
    };

    expect(tapEvent?.call(manager, 0, 0)).toBe(true);
    expect(startRandomMotion).toHaveBeenLastCalledWith('flick_head', 2);
    expect(tapEvent?.call(manager, -0.275, -0.3)).toBe(true);
    expect(startRandomMotion).toHaveBeenLastCalledWith('tap_body', 2);
    expect(tapEvent?.call(manager, 0.9, 0.9)).toBe(false);
    expect(originalTapEvent).toHaveBeenCalledWith(0.9, 0.9);
  });
});

describe('BlogLive2D', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    delete window.InitLive2D;
    delete window.LAppDefine;
    delete window.LAppLive2DManager;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('does not load the WordPress runtime below the WordPress waifu min width', async () => {
    vi.stubGlobal('innerWidth', 768);
    const appendChild = vi.spyOn(document.body, 'appendChild');

    mount(BlogLive2D);
    await flushPromises();

    expect(appendChild).not.toHaveBeenCalled();
    expect(document.querySelector('canvas#live2d')).toBeNull();
  });

  it('mounts the WordPress Cubism2 MOC runtime in a WordPress-style widget shell', async () => {
    vi.stubGlobal('innerWidth', 1280);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame');
    const initLive2D = vi.fn();
    const originalAppendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      const element = originalAppendChild(node);
      if (element instanceof HTMLScriptElement) {
        window.InitLive2D = initLive2D;
        window.LAppLive2DManager = function LAppLive2DManager() {};
        window.LAppLive2DManager.prototype.tapEvent = vi.fn();
        element.onload?.(new Event('load'));
      }
      return element;
    });

    const wrapper = mount(BlogLive2D);
    await flushPromises();

    const widget = document.querySelector('.waifu.kt-blog__live2d-widget');
    const canvas = document.querySelector('canvas#live2d.live2d.kt-blog__live2d-canvas') as HTMLCanvasElement | null;
    const tools = Array.from(document.querySelectorAll('.waifu-tool > span')).map((node) => node.className);
    expect(wrapper.find('canvas#live2d').exists()).toBe(false);
    expect(widget).not.toBeNull();
    expect(canvas).not.toBeNull();
    expect(canvas?.width).toBe(DEFAULT_WORDPRESS_LIVE2D_SETTINGS.canvasSize.width);
    expect(canvas?.height).toBe(DEFAULT_WORDPRESS_LIVE2D_SETTINGS.canvasSize.height);
    expect(tools).toEqual([
      'fui-home',
      'fui-chat',
      'fui-bot',
      'fui-eye',
      'fui-user',
      'fui-photo',
      'fui-info-circle',
      'fui-cross',
    ]);
    expect(document.querySelector('.gptInput #live2dChatText')).not.toBeNull();
    expect(document.querySelector('.gptInput #live2dSend')).not.toBeNull();
    expect(document.querySelector('.gptInput #live2dSendClose')).not.toBeNull();
    expect(document.getElementById('live2d-texture-button')).not.toBeNull();
    expect(window.LAppDefine?.canvasSize).toEqual({ width: 280, height: 250 });
    expect(window.LAppDefine?.IS_START_TEXURE_CHANGE).toBe(true);
    expect(window.LAppDefine?.TEXURE_BUTTON_ID).toBe('live2d-texture-button');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(initLive2D).toHaveBeenCalledTimes(1);
    expect(canvas?.style.transform).toBe('');
    expect(requestFrame).not.toHaveBeenCalled();

    wrapper.unmount();
  });

  it('reuses the page-level WordPress runtime after route component remounts', async () => {
    vi.stubGlobal('innerWidth', 1280);
    const initLive2D = vi.fn();
    const originalAppendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      const element = originalAppendChild(node);
      if (element instanceof HTMLScriptElement) {
        window.InitLive2D = initLive2D;
        window.LAppLive2DManager = function LAppLive2DManager() {};
        window.LAppLive2DManager.prototype.tapEvent = vi.fn();
        element.onload?.(new Event('load'));
      }
      return element;
    });

    const firstWrapper = mount(BlogLive2D);
    await flushPromises();
    firstWrapper.unmount();
    const secondWrapper = mount(BlogLive2D);
    await flushPromises();

    expect(document.querySelectorAll('.waifu.kt-blog__live2d-widget')).toHaveLength(1);
    expect(document.querySelectorAll('canvas#live2d.live2d.kt-blog__live2d-canvas')).toHaveLength(1);
    expect(document.querySelectorAll('script#kt-blog-pio-wordpress-live2d-runtime')).toHaveLength(1);
    expect(initLive2D).toHaveBeenCalledTimes(1);

    secondWrapper.unmount();
  });
});
