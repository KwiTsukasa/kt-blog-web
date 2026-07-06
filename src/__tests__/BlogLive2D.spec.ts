import { flushPromises, mount } from '@vue/test-utils';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import BlogLive2D from '@/components/blog/BlogLive2D';
import {
  DEFAULT_WORDPRESS_LIVE2D_MODEL_ENTRY,
  DEFAULT_WORDPRESS_LIVE2D_SCRIPT,
  DEFAULT_WORDPRESS_LIVE2D_SETTINGS,
  DEFAULT_WORDPRESS_LIVE2D_TIA_MODEL_ENTRY,
  mountWordPressLive2DRuntime,
} from '@/components/blog/live2d/wordpressRuntimeBridge';

interface DeferredValue<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

/**
 * Creates a promise whose resolver stays in the test so toolbar loading guards can be checked before metadata arrives.
 * @returns Promise and resolver pair controlled by the active unit test.
 */
function createDeferredValue<T>(): DeferredValue<T> {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

describe('mountWordPressLive2DRuntime', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    delete window.InitLive2D;
    delete window.LAppDefine;
    delete window.LAppLive2DManager;
    delete window.dragMgr;
    delete window.transformViewX;
    delete window.transformViewY;
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
    expect(window.LAppDefine?.MODELS).toEqual([
      [DEFAULT_WORDPRESS_LIVE2D_MODEL_ENTRY],
      [DEFAULT_WORDPRESS_LIVE2D_TIA_MODEL_ENTRY],
    ]);
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
    expect(window.LAppDefine?.MODELS).toEqual([
      [DEFAULT_WORDPRESS_LIVE2D_MODEL_ENTRY],
      [DEFAULT_WORDPRESS_LIVE2D_TIA_MODEL_ENTRY],
    ]);
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

  it('tracks page-level pointer movement instead of limiting look-at to the widget canvas', async () => {
    const setPoint = vi.fn();
    const originalTapEvent = vi.fn();
    const originalAppendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      const element = originalAppendChild(node);
      if (element instanceof HTMLScriptElement) {
        window.InitLive2D = vi.fn(() => {
          window.dragMgr = { setPoint };
          window.transformViewX = vi.fn((deviceX: number) => deviceX / 100);
          window.transformViewY = vi.fn((deviceY: number) => deviceY / 100);
        });
        window.LAppLive2DManager = function LAppLive2DManager() {};
        window.LAppLive2DManager.prototype.tapEvent = originalTapEvent;
        element.onload?.(new Event('load'));
      }
      return element;
    });

    await mountWordPressLive2DRuntime();
    const canvas = document.querySelector<HTMLCanvasElement>('canvas#live2d');
    expect(canvas).not.toBeNull();
    vi.spyOn(canvas!, 'getBoundingClientRect').mockReturnValue({
      bottom: 768,
      height: 250,
      left: 0,
      right: 280,
      top: 518,
      width: 280,
      x: 0,
      y: 518,
      toJSON: () => ({}),
    });

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 960, clientY: 260 }));

    expect(setPoint).toHaveBeenCalledWith(9.6, -2.58);
    expect(originalTapEvent).not.toHaveBeenCalled();
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
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ textures: ['textures/default-costume.png', 'textures/witch-costume.png'] }),
      ok: true,
    });
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
    expect(document.getElementById('kt-blog-pio-change')).not.toBeNull();
    expect(document.getElementById('live2d-texture-button')).not.toBeNull();
    expect(window.LAppDefine?.canvasSize).toEqual({ width: 280, height: 250 });
    expect(window.LAppDefine?.IS_BIND_BUTTON).toBe(true);
    expect(window.LAppDefine?.IS_START_TEXURE_CHANGE).toBe(true);
    expect(window.LAppDefine?.BUTTON_ID).toBe('kt-blog-pio-change');
    expect(window.LAppDefine?.TEXURE_BUTTON_ID).toBe('live2d-texture-button');
    expect(window.LAppDefine?.MODELS).toEqual([
      [DEFAULT_WORDPRESS_LIVE2D_MODEL_ENTRY],
      [DEFAULT_WORDPRESS_LIVE2D_TIA_MODEL_ENTRY],
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(DEFAULT_WORDPRESS_LIVE2D_MODEL_ENTRY, { credentials: 'same-origin' });
    expect(initLive2D).toHaveBeenCalledTimes(1);
    expect(canvas?.style.transform).toBe('');
    expect(requestFrame).not.toHaveBeenCalled();

    wrapper.unmount();
  });

  it('does not trigger the destructive legacy texture reload when only one texture is available', async () => {
    vi.stubGlobal('innerWidth', 1280);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ textures: ['textures/default-costume.png'] }),
        ok: true,
      }),
    );
    const originalAppendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      const element = originalAppendChild(node);
      if (element instanceof HTMLScriptElement) {
        window.InitLive2D = vi.fn();
        window.LAppLive2DManager = function LAppLive2DManager() {};
        window.LAppLive2DManager.prototype.tapEvent = vi.fn();
        element.onload?.(new Event('load'));
      }
      return element;
    });

    mount(BlogLive2D);
    await flushPromises();
    const hiddenTextureButton = document.getElementById('live2d-texture-button') as HTMLButtonElement;
    const hiddenClick = vi.fn();
    hiddenTextureButton.addEventListener('click', hiddenClick);

    document.querySelector<HTMLElement>('.waifu-tool .fui-eye')?.click();

    expect(hiddenClick).not.toHaveBeenCalled();
    expect(document.querySelector('.waifu-tips')?.textContent).toContain('只有一套');
  });

  it('switches to the Tia model through the hidden WordPress model button and lazy-loads its texture count', async () => {
    vi.stubGlobal('innerWidth', 1280);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ textures: ['textures/default-costume.png', 'textures/witch-costume.png'] }),
        ok: true,
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ textures: ['textures/default-costume.png'] }),
        ok: true,
      });
    vi.stubGlobal('fetch', fetchMock);
    const originalAppendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      const element = originalAppendChild(node);
      if (element instanceof HTMLScriptElement) {
        window.InitLive2D = vi.fn();
        window.LAppLive2DManager = function LAppLive2DManager() {};
        window.LAppLive2DManager.prototype.tapEvent = vi.fn();
        element.onload?.(new Event('load'));
      }
      return element;
    });

    mount(BlogLive2D);
    await flushPromises();
    const hiddenModelButton = document.getElementById('kt-blog-pio-change') as HTMLButtonElement;
    const hiddenTextureButton = document.getElementById('live2d-texture-button') as HTMLButtonElement;
    const hiddenModelClick = vi.fn();
    const hiddenTextureClick = vi.fn();
    hiddenModelButton.addEventListener('click', hiddenModelClick);
    hiddenTextureButton.addEventListener('click', hiddenTextureClick);

    document.querySelector<HTMLElement>('.waifu-tool .fui-user')?.click();
    await flushPromises();
    document.querySelector<HTMLElement>('.waifu-tool .fui-eye')?.click();

    expect(hiddenModelClick).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(DEFAULT_WORDPRESS_LIVE2D_TIA_MODEL_ENTRY, { credentials: 'same-origin' });
    expect(hiddenTextureClick).not.toHaveBeenCalled();
    expect(document.querySelector('.waifu-tips')?.textContent).toContain('只有一套');
  });

  it('keeps texture switching disabled while the next model metadata is still loading', async () => {
    vi.stubGlobal('innerWidth', 1280);
    const tiaModelResponse = createDeferredValue<{
      json: () => Promise<{ textures: string[] }>;
      ok: boolean;
    }>();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ textures: ['textures/default-costume.png', 'textures/witch-costume.png'] }),
        ok: true,
      })
      .mockReturnValueOnce(tiaModelResponse.promise);
    vi.stubGlobal('fetch', fetchMock);
    const originalAppendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      const element = originalAppendChild(node);
      if (element instanceof HTMLScriptElement) {
        window.InitLive2D = vi.fn();
        window.LAppLive2DManager = function LAppLive2DManager() {};
        window.LAppLive2DManager.prototype.tapEvent = vi.fn();
        element.onload?.(new Event('load'));
      }
      return element;
    });

    mount(BlogLive2D);
    await flushPromises();
    const hiddenTextureButton = document.getElementById('live2d-texture-button') as HTMLButtonElement;
    const hiddenTextureClick = vi.fn();
    hiddenTextureButton.addEventListener('click', hiddenTextureClick);

    document.querySelector<HTMLElement>('.waifu-tool .fui-user')?.click();
    document.querySelector<HTMLElement>('.waifu-tool .fui-eye')?.click();

    expect(hiddenTextureClick).not.toHaveBeenCalled();
    expect(document.querySelector('.waifu-tips')?.textContent).toContain('服装信息读取中');

    tiaModelResponse.resolve({
      json: () => Promise.resolve({ textures: ['textures/default-costume.png'] }),
      ok: true,
    });
    await flushPromises();
  });

  it('does not trigger texture switching while the legacy model button is loading a model', async () => {
    vi.stubGlobal('innerWidth', 1280);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ textures: ['textures/default-costume.png', 'textures/witch-costume.png'] }),
        ok: true,
      }),
    );
    const originalAppendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      const element = originalAppendChild(node);
      if (element instanceof HTMLScriptElement) {
        window.InitLive2D = vi.fn();
        window.LAppLive2DManager = function LAppLive2DManager() {};
        window.LAppLive2DManager.prototype.tapEvent = vi.fn();
        element.onload?.(new Event('load'));
      }
      return element;
    });

    mount(BlogLive2D);
    await flushPromises();
    const hiddenModelButton = document.getElementById('kt-blog-pio-change') as HTMLButtonElement;
    const hiddenTextureButton = document.getElementById('live2d-texture-button') as HTMLButtonElement;
    const hiddenTextureClick = vi.fn();
    hiddenModelButton.disabled = true;
    hiddenTextureButton.addEventListener('click', hiddenTextureClick);

    document.querySelector<HTMLElement>('.waifu-tool .fui-eye')?.click();

    expect(hiddenTextureClick).not.toHaveBeenCalled();
    expect(document.querySelector('.waifu-tips')?.textContent).toContain('模型正在切换中');
  });

  it('starts manual costume switching from the first variant and loops back to the default texture', () => {
    const runtimeSource = readFileSync(resolve(process.cwd(), 'public/live2d/wordpress-moc/live2d.min.js'), 'utf-8');

    expect(runtimeSource).toContain('this.countOfTexure = 0');
    expect(runtimeSource).not.toContain('this.countOfTexure = -1');
    expect(runtimeSource).toMatch(
      /if \(no >= thisRef\.modelSetting\.getTextureNum\(\)\) \{\s*motionModel\.countOfTexure = 0;\s*no = 0\s*\}/,
    );
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
