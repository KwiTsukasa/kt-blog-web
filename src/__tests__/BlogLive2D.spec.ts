import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';

import BlogLive2D from '@/components/blog/BlogLive2D';
import type { Live2DResolvedState, Live2DTSRuntime } from '@/components/blog/live2d/runtime/live2dRuntimeTypes';

const runtimeMocks = vi.hoisted(() => {
  const initialState = {
    modelKey: 'pio',
    settings: {
      baseUrl: '/api/blog/live2d/pio/moc/',
      hitAreas: {},
      model: 'pio.moc',
      motions: {},
      textures: ['textures/default-costume.png', 'textures/bikini-costume-blue.png'],
      url: '/api/blog/live2d/pio/moc/index.json',
    },
    textureIndex: 0,
  };
  const runtime = {
    destroy: vi.fn(),
    getState: vi.fn(() => initialState),
    mount: vi.fn(() => Promise.resolve(initialState)),
    previewTexture: vi.fn((textureIndex: number) =>
      Promise.resolve({
        ...initialState,
        textureIndex,
      }),
    ),
    switchModel: vi.fn((modelKey: string) =>
      Promise.resolve({
        ...initialState,
        modelKey,
        settings: {
          ...initialState.settings,
          baseUrl: `/api/blog/live2d/${modelKey}/moc/`,
          url: `/api/blog/live2d/${modelKey}/moc/index.json`,
        },
      }),
    ),
    switchTexture: vi.fn((textureIndex: number) =>
      Promise.resolve({
        ...initialState,
        textureIndex,
      }),
    ),
  };
  return {
    createLive2DTSRuntime: vi.fn(() => runtime),
    runtime,
  };
});

vi.mock('@/components/blog/live2d/runtime/live2dTsRuntime', () => ({
  createLive2DTSRuntime: runtimeMocks.createLive2DTSRuntime,
}));

vi.mock('@/components/blog/BlogModal', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue');
  return {
    default: vue.defineComponent({
      name: 'MockBlogModal',
      props: {
        className: {
          type: String,
          default: '',
        },
        open: {
          type: Boolean,
          default: false,
        },
        title: {
          type: String,
          required: true,
        },
      },
      emits: ['close'],
      /**
       * Renders only the visible modal content needed by component tests.
       * @param props Modal props forwarded by BlogLive2DPickerModal.
       * @param emit Emits close events from the mocked close button.
       * @param slots Picker content rendered inside the mocked modal.
       * @returns Mock modal render function.
       */
      setup(props, { emit, slots }) {
        return () =>
          props.open
            ? vue.h('section', { class: ['mock-blog-modal', props.className] }, [
                vue.h('h2', props.title),
                vue.h('button', { class: 'mock-blog-modal__close', onClick: () => emit('close') }, '关闭'),
                slots.default?.(),
                slots.footer ? vue.h('footer', { class: 'mock-blog-modal__footer' }, slots.footer()) : null,
              ])
            : null;
      },
    }),
  };
});

/**
 * Casts the mocked runtime factory return value to the runtime contract used by the component.
 * @returns Mocked runtime handle.
 */
function mockedRuntime(): Live2DTSRuntime {
  return runtimeMocks.runtime as unknown as Live2DTSRuntime;
}

/**
 * Mounts BlogLive2D in a desktop viewport and waits for async runtime mount.
 * @returns Mounted component wrapper.
 */
async function mountDesktopLive2D() {
  vi.stubGlobal('innerWidth', 1280);
  const wrapper = mount(BlogLive2D, { attachTo: document.body });
  await flushPromises();
  return wrapper;
}

describe('BlogLive2D', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    runtimeMocks.createLive2DTSRuntime.mockClear();
    Object.values(runtimeMocks.runtime).forEach((value) => {
      if (typeof value === 'function' && 'mockClear' in value) {
        value.mockClear();
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('keeps the WordPress-style widget disabled below the desktop breakpoint', async () => {
    vi.stubGlobal('innerWidth', 768);

    mount(BlogLive2D);
    await flushPromises();

    expect(runtimeMocks.createLive2DTSRuntime).not.toHaveBeenCalled();
    expect(document.querySelector('.waifu.kt-blog__live2d-widget')).toBeNull();
  });

  it('mounts the TypeScript runtime without appending the old WordPress script', async () => {
    const appendChild = vi.spyOn(document.body, 'appendChild');

    await mountDesktopLive2D();

    const appendedScripts = appendChild.mock.calls
      .map(([node]) => node)
      .filter((node): node is HTMLScriptElement => node instanceof HTMLScriptElement)
      .map((script) => script.src);
    expect(runtimeMocks.createLive2DTSRuntime).toHaveBeenCalledTimes(1);
    expect(mockedRuntime().mount).toHaveBeenCalledTimes(1);
    expect(appendedScripts.some((src) => src.includes('/live2d/wordpress-moc/live2d.min.js'))).toBe(false);
  });

  it('opens a model picker modal and selects Tia through the direct runtime API', async () => {
    const wrapper = await mountDesktopLive2D();

    document.querySelector<HTMLElement>('.waifu-tool .fui-user')?.click();
    await flushPromises();

    const modal = document.querySelector('.mock-blog-modal.kt-blog__live2d-picker-modal');
    expect(modal?.textContent).toContain('选择看板娘');
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.kt-blog__live2d-picker-option'));
    const tiaButton = buttons.find((button) => button.textContent?.includes('Tia'));
    tiaButton?.click();
    await flushPromises();

    expect(mockedRuntime().switchModel).toHaveBeenCalledWith('tia');
    expect(document.querySelector('.mock-blog-modal.kt-blog__live2d-picker-modal')).toBeNull();
    wrapper.unmount();
  });

  it('keeps the model picker open and reports a stable error when switching fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    runtimeMocks.runtime.switchModel.mockRejectedValueOnce(new Error('missing tia asset'));
    const wrapper = await mountDesktopLive2D();

    document.querySelector<HTMLElement>('.waifu-tool .fui-user')?.click();
    await flushPromises();
    const tiaButton = Array.from(document.querySelectorAll<HTMLButtonElement>('.kt-blog__live2d-picker-option')).find(
      (button) => button.textContent?.includes('Tia'),
    );
    tiaButton?.click();
    await flushPromises();

    const modal = document.querySelector('.mock-blog-modal.kt-blog__live2d-picker-modal');
    expect(mockedRuntime().switchModel).toHaveBeenCalledWith('tia');
    expect(modal).not.toBeNull();
    expect(modal?.textContent).toContain('Live2D 切换失败，请稍后重试。');
    expect(warn).toHaveBeenCalledWith('[KT Blog] Live2D model switch failed.', expect.any(Error));
    wrapper.unmount();
  });

  it('previews a Chinese-named costume before committing it through the direct runtime API', async () => {
    const wrapper = await mountDesktopLive2D();

    document.querySelector<HTMLElement>('.waifu-tool .fui-eye')?.click();
    await flushPromises();

    const modal = document.querySelector('.mock-blog-modal.kt-blog__live2d-picker-modal');
    expect(modal?.textContent).toContain('选择服装');
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.kt-blog__live2d-picker-option'));
    const secondTextureButton = buttons.find((button) => button.textContent?.includes('天蓝色比基尼'));
    secondTextureButton?.click();
    await flushPromises();

    expect(mockedRuntime().previewTexture).toHaveBeenCalledWith(1);
    expect(mockedRuntime().switchTexture).not.toHaveBeenCalled();
    expect(document.querySelector('.mock-blog-modal.kt-blog__live2d-picker-modal')?.textContent).toContain(
      '正在预览：天蓝色比基尼',
    );
    const confirmButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
      button.textContent?.includes('使用此服装'),
    );
    confirmButton?.click();
    await flushPromises();

    expect(mockedRuntime().switchTexture).toHaveBeenCalledWith(1);
    expect(document.querySelector('.mock-blog-modal.kt-blog__live2d-picker-modal')).toBeNull();
    wrapper.unmount();
  });

  it('restores the committed costume when a preview is cancelled', async () => {
    const wrapper = await mountDesktopLive2D();

    document.querySelector<HTMLElement>('.waifu-tool .fui-eye')?.click();
    await flushPromises();
    const previewButton = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.kt-blog__live2d-picker-option'),
    ).find((button) => button.textContent?.includes('天蓝色比基尼'));
    previewButton?.click();
    await flushPromises();
    document.querySelector<HTMLButtonElement>('.mock-blog-modal__close')?.click();
    await flushPromises();

    expect(mockedRuntime().previewTexture).toHaveBeenNthCalledWith(1, 1);
    expect(mockedRuntime().previewTexture).toHaveBeenNthCalledWith(2, 0);
    expect(mockedRuntime().switchTexture).not.toHaveBeenCalled();
    expect(document.querySelector('.mock-blog-modal.kt-blog__live2d-picker-modal')).toBeNull();
    wrapper.unmount();
  });

  it('keeps the texture picker open when the runtime rejects a costume preview', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    runtimeMocks.runtime.previewTexture.mockRejectedValueOnce(new Error('Live2D texture index is out of range.'));
    const wrapper = await mountDesktopLive2D();

    document.querySelector<HTMLElement>('.waifu-tool .fui-eye')?.click();
    await flushPromises();
    const secondTextureButton = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.kt-blog__live2d-picker-option'),
    ).find((button) => button.textContent?.includes('天蓝色比基尼'));
    secondTextureButton?.click();
    await flushPromises();

    const modal = document.querySelector('.mock-blog-modal.kt-blog__live2d-picker-modal');
    expect(mockedRuntime().previewTexture).toHaveBeenCalledWith(1);
    expect(modal).not.toBeNull();
    expect(modal?.textContent).toContain('服装切换失败，当前模型没有这个服装。');
    expect(warn).toHaveBeenCalledWith('[KT Blog] Live2D texture preview failed.', expect.any(Error));
    wrapper.unmount();
  });

  it('cleans up widget controller and runtime on unmount', async () => {
    const wrapper = await mountDesktopLive2D();

    wrapper.unmount();

    expect(mockedRuntime().destroy).toHaveBeenCalledTimes(1);
  });
});
