import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import router from '../router';

vi.mock('antdv-next', async () => {
  const { defineComponent, h } = await import('vue');
  const createSlotStub = (name: string) =>
    defineComponent({
      name,
      setup(_, { slots }) {
        return () => h('div', slots.default?.());
      },
    });
  const Checkbox = createSlotStub('AntdCheckbox') as any;
  Checkbox.Group = createSlotStub('AntdCheckboxGroup');

  return {
    App: createSlotStub('AntdApp'),
    Avatar: createSlotStub('AntdAvatar'),
    Button: createSlotStub('AntdButton'),
    Card: defineComponent({
      name: 'AntdCard',
      setup(_, { slots }) {
        return () => h('section', [slots.title?.(), slots.default?.()]);
      },
    }),
    Checkbox,
    ColorPicker: createSlotStub('AntdColorPicker'),
    ConfigProvider: createSlotStub('AntdConfigProvider'),
    Divider: createSlotStub('AntdDivider'),
    Empty: createSlotStub('AntdEmpty'),
    Form: createSlotStub('AntdForm'),
    Input: createSlotStub('AntdInput'),
    Modal: defineComponent({
      name: 'AntdModal',
      props: {
        open: Boolean,
      },
      setup(props, { slots }) {
        return () => (props.open ? h('div', [slots.default?.()]) : null);
      },
    }),
    Pagination: createSlotStub('AntdPagination'),
    Progress: createSlotStub('AntdProgress'),
    Space: createSlotStub('AntdSpace'),
    Statistic: defineComponent({
      name: 'AntdStatistic',
      props: {
        title: String,
        value: [String, Number],
      },
      setup(props) {
        return () => h('div', [props.title, props.value]);
      },
    }),
    Switch: createSlotStub('AntdSwitch'),
    Tag: createSlotStub('AntdTag'),
    TextArea: createSlotStub('AntdTextArea'),
    theme: {
      darkAlgorithm: {},
      defaultAlgorithm: {},
    },
  };
});

vi.mock('@antdv-next/icons', async () => {
  const { defineComponent, h } = await import('vue');
  const icon = defineComponent({
    name: 'IconStub',
    setup() {
      return () => h('span');
    },
  });

  return {
    AppstoreOutlined: icon,
    ArrowRightOutlined: icon,
    BellOutlined: icon,
    BgColorsOutlined: icon,
    BookOutlined: icon,
    CalendarOutlined: icon,
    CloudServerOutlined: icon,
    CommentOutlined: icon,
    EyeOutlined: icon,
    FileTextOutlined: icon,
    FireOutlined: icon,
    FolderOpenOutlined: icon,
    GithubOutlined: icon,
    HistoryOutlined: icon,
    LinkOutlined: icon,
    MenuOutlined: icon,
    QqOutlined: icon,
    ReadOutlined: icon,
    SafetyCertificateOutlined: icon,
    SearchOutlined: icon,
    SettingOutlined: icon,
    ShareAltOutlined: icon,
    TagOutlined: icon,
    TagsOutlined: icon,
    UserOutlined: icon,
    VerticalAlignTopOutlined: icon,
    WechatOutlined: icon,
    WeiboOutlined: icon,
  };
});

describe('App', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('mounts renders properly', async () => {
    await router.push('/');
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('KwiTsukasa的小站');
  });

  it('renders Argon header without hidden navigation containers', async () => {
    await router.push('/');
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.find('.kt-blog__header-collapse').exists()).toBe(false);
    expect(wrapper.find('.kt-blog__header-navbar .kt-blog__header-nav').exists()).toBe(false);
    expect(wrapper.find('.kt-blog__header-navbar .navbar-nav').exists()).toBe(false);
  });

  it('loads local blog theme config by default', async () => {
    const fetchMock = vi.fn((url: string | URL | Request) => {
      const target = `${url}`;
      const body = target.includes('/api/blog/theme/config')
        ? {
            data: {
              backgroundDarkBrightness: 0.65,
              backgroundDarkImage:
                'https://s3.kwitsukasa.top/images/bg-冬滚滚.png',
              backgroundDarkOpacity: 1,
              backgroundImage:
                'https://s3.kwitsukasa.top/images/bg-冬滚滚.png',
              backgroundOpacity: 1,
              darkmodeAutoSwitch: 'alwayson',
              enableCustomThemeColor: true,
              headerMenu: [
                {
                  href: 'https://blog.kwitsukasa.top',
                  label: '首页',
                },
              ],
              htmlClass: [
                'triple-column',
                'immersion-color',
                'toolbar-blur',
                'article-header-style-default',
              ],
              sidebarMenu: [
                {
                  href: 'https://blog.kwitsukasa.top',
                  icon: 'fa-home',
                  label: '首页',
                },
                {
                  external: true,
                  href: 'http://blog.kwitsukasa.top/wp-admin/',
                  icon: 'fa-user',
                  label: '管理',
                },
              ],
              site: {
                authorAvatar:
                  'http://s3.kwitsukasa.top/images/avatar-tsukasa-1.jpg',
                authorName: 'KwiTsukasa',
                home: 'https://blog.kwitsukasa.top',
                title: '接口博客',
                url: 'https://blog.kwitsukasa.top',
              },
              themeCardRadius: 6,
              themeColor: '#c3a1ed',
              themeVersion: '1.3.5',
            },
          }
        : {
            data: {
              list: [],
              total: 0,
            },
          };

      return Promise.resolve(
        new Response(JSON.stringify(body), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    await router.push('/');
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });
    await flushPromises();
    await nextTick();

    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/blog/theme/config');
    expect(wrapper.find('.kt-blog').classes()).toEqual(
      expect.arrayContaining([
        'kt-blog--triple-column',
        'kt-blog--immersion-color',
        'kt-blog--toolbar-blur',
        'kt-blog--article-header-default',
        'kt-blog--argon-1-3-5',
        'kt-blog--dark',
      ]),
    );
    expect(wrapper.text()).toContain('接口博客');
    expect(wrapper.text()).toContain('KwiTsukasa');
    expect(wrapper.text()).toContain('管理');
    const styleText =
      document.querySelector('#kt-blog-theme-style')?.textContent || '';
    expect(styleText).toContain('--themecolor: #C3A1ED;');
    expect(styleText).toContain('--radius: 6px;');
    expect(styleText).toContain(
      "--argon-background-dark-image: url('https://s3.kwitsukasa.top/images/bg-冬滚滚.png'), url('/blog-assets/bg-donggungun.png');",
    );
    expect(styleText).toContain(
      "--argon-author-avatar: url('http://s3.kwitsukasa.top/images/avatar-tsukasa-1.jpg'), url('/blog-assets/avatar-tsukasa-1.jpg');",
    );
  });

  it('keeps local defaults without requesting WordPress theme fallback', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('', {
        status: 404,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await router.push('/');
    await router.isReady();

    mount(App, {
      global: {
        plugins: [router],
      },
    });
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/blog/theme/config');
  });

  it('can load WordPress migration theme config through env override', async () => {
    vi.stubEnv('VITE_BLOG_THEME_CONFIG_URL', '/api/wordpress/theme/config');
    const fetchMock = vi.fn((url: string | URL | Request) => {
      const target = `${url}`;
      const body = target.includes('/api/wordpress/theme/config')
        ? {
            code: 0,
            data: {
              backgroundDarkBrightness: 0.5,
              backgroundDarkImage:
                'https://s3.kwitsukasa.top/images/wp-dark.png',
              backgroundDarkOpacity: 0.9,
              backgroundImage: 'https://s3.kwitsukasa.top/images/wp-light.png',
              backgroundOpacity: 0.8,
              darkmodeAutoSwitch: 'alwaysoff',
              enableCustomThemeColor: true,
              headerMenu: [
                {
                  href: 'https://blog.kwitsukasa.top',
                  label: '首页',
                },
              ],
              htmlClass:
                'triple-column immersion-color toolbar-blur article-header-style-full use-serif',
              sidebarMenu: [
                {
                  href: 'https://blog.kwitsukasa.top',
                  icon: 'fa-home',
                  label: '首页',
                },
                {
                  external: true,
                  href: 'http://blog.kwitsukasa.top/wp-admin/',
                  icon: 'fa-user',
                  label: '管理',
                },
              ],
              site: {
                authorAvatar:
                  'http://s3.kwitsukasa.top/images/wp-avatar.jpg',
                authorName: 'WordPress 作者',
                home: 'https://blog.kwitsukasa.top',
                title: 'WordPress 主题接口',
                url: 'https://blog.kwitsukasa.top',
              },
              themeCardRadius: 10,
              themeColor: '#4f46e5',
              themeVersion: '1.3.5',
            },
            message: 'ok',
          }
        : {
            code: 0,
            data: {
              list: [],
              total: 0,
            },
            message: 'ok',
          };

      return Promise.resolve(
        new Response(JSON.stringify(body), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    await router.push('/');
    await router.isReady();

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });
    await flushPromises();
    await nextTick();

    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/wordpress/theme/config');
    expect(fetchMock.mock.calls.map((item) => `${item[0]}`)).not.toContain(
      '/api/blog/theme/config',
    );
    expect(wrapper.find('.kt-blog').classes()).toEqual(
      expect.arrayContaining([
        'kt-blog--triple-column',
        'kt-blog--immersion-color',
        'kt-blog--toolbar-blur',
        'kt-blog--article-header-full',
        'kt-blog--argon-1-3-5',
        'kt-blog--light',
        'kt-blog--font-serif',
      ]),
    );
    expect(wrapper.text()).toContain('WordPress 主题接口');
    expect(wrapper.text()).toContain('WordPress 作者');
    expect(wrapper.text()).toContain('管理');

    const styleText =
      document.querySelector('#kt-blog-theme-style')?.textContent || '';
    expect(styleText).toContain('--themecolor: #4F46E5;');
    expect(styleText).toContain('--radius: 10px;');
    expect(styleText).toContain('--argon-background-opacity: 0.8;');
    expect(styleText).toContain(
      "--argon-background-dark-image: url('https://s3.kwitsukasa.top/images/wp-dark.png'), url('/blog-assets/bg-donggungun.png');",
    );
    expect(styleText).toContain(
      "--argon-author-avatar: url('http://s3.kwitsukasa.top/images/wp-avatar.jpg'), url('/blog-assets/avatar-tsukasa-1.jpg');",
    );
  });
});
