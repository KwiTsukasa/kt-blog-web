import { nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildBlogAdminSsoUrl } from '@/factories/blogAdminSsoFactory';
import { useBlogTheme } from '@/hooks/useBlogTheme';

vi.mock('antdv-next', () => ({
  theme: {
    darkAlgorithm: {},
    defaultAlgorithm: {},
  },
}));

describe('useBlogTheme', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('applies WordPress Argon theme config to runtime theme state', async () => {
    const {
      applyWordpressThemeConfig,
      preferences,
      siteConfig,
      themeRootClass,
      wordpressThemeConfig,
    } = useBlogTheme();

    applyWordpressThemeConfig({
      argonConfig: {
        codeHighlight: {
          breakLine: true,
          enable: true,
          hideLinenumber: false,
          transparentLinenumber: true,
        },
        dateFormat: 'YMD',
        disablePjax: true,
        foldLongComments: true,
        foldLongShuoshuo: false,
        headroom: 'headroom',
        language: 'zh_CN',
        lazyload: {
          effect: 'fadeIn',
          threshold: 800,
        },
        pangu: 'true',
        pjaxAnimationDuration: 500,
        waterflowColumns: '3',
        wpPath: '/wp-content/themes/argon',
        zoomify: true,
      },
      backgroundDarkBrightness: 0.65,
      backgroundDarkImage: 'https://s3.kwitsukasa.top/images/bg-冬滚滚.png',
      backgroundDarkOpacity: 1,
      backgroundImage: 'https://s3.kwitsukasa.top/images/bg-冬滚滚.png',
      backgroundOpacity: 1,
      bodyClass: ['home', 'blog', 'wp-theme-argon'],
      darkmodeAutoSwitch: 'alwayson',
      enableCustomThemeColor: true,
      htmlClass: 'no-js triple-column immersion-color toolbar-blur use-serif use-big-shadow article-header-style-default',
      headerMenu: [
        {
          href: 'https://blog.kwitsukasa.top',
          label: '首页',
        },
      ],
      sidebarMenu: [
        {
          external: true,
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
        authorAvatar: 'http://s3.kwitsukasa.top/images/avatar-tsukasa-1.jpg',
        authorName: 'KwiTsukasa',
        description: '欢迎来到 KwiTsukasa 的小站',
        home: 'https://blog.kwitsukasa.top',
        title: 'KwiTsukasa的小站',
        url: 'https://blog.kwitsukasa.top',
      },
      themeCardRadius: '4',
      themeColor: '#c3a1ed',
      themeColorRgb: '195,161,237',
      themeVersion: '1.3.5',
    });
    await nextTick();

    expect(preferences.colorPrimary).toBe('#C3A1ED');
    expect(preferences.font).toBe('serif');
    expect(preferences.mode).toBe('dark');
    expect(preferences.radius).toBe(4);
    expect(preferences.shadow).toBe('big');
    expect(siteConfig.value).toMatchObject({
      authorAvatar: 'http://s3.kwitsukasa.top/images/avatar-tsukasa-1.jpg',
      authorName: 'KwiTsukasa',
      description: '欢迎来到 KwiTsukasa 的小站',
      headerMenu: [
        {
          external: false,
          href: '/',
          label: '首页',
        },
      ],
      headerMenuVisible: false,
      home: 'https://blog.kwitsukasa.top',
      sidebarMenu: [
        {
          external: false,
          href: '/',
          icon: 'fa-home',
          label: '首页',
        },
        {
          external: true,
          href: buildBlogAdminSsoUrl(),
          icon: 'fa-user',
          label: '管理',
        },
      ],
      title: 'KwiTsukasa的小站',
      url: 'https://blog.kwitsukasa.top',
    });
    expect(wordpressThemeConfig.value?.argonConfig?.codeHighlight?.enable).toBe(true);
    expect(wordpressThemeConfig.value?.argonConfig?.foldLongComments).toBe(true);
    expect(wordpressThemeConfig.value?.argonConfig?.lazyload?.threshold).toBe(800);
    expect(wordpressThemeConfig.value?.bodyClass).toEqual(['home', 'blog', 'wp-theme-argon']);
    expect(themeRootClass.value).toContain('kt-blog--triple-column');
    expect(themeRootClass.value).toContain('kt-blog--immersion-color');
    expect(themeRootClass.value).toContain('kt-blog--toolbar-blur');
    expect(themeRootClass.value).toContain('kt-blog--article-header-default');
    expect(themeRootClass.value).toContain('kt-blog--argon-1-3-5');
    expect(themeRootClass.value).toContain('kt-blog--font-serif');
    expect(themeRootClass.value).toContain('kt-blog--shadow-big');
    expect(document.querySelector('#kt-blog-theme-style')?.textContent).toContain('--themecolor: #C3A1ED;');
    expect(document.querySelector('#kt-blog-theme-style')?.textContent).toContain("url('https://s3.kwitsukasa.top/images/bg-冬滚滚.png')");
    expect(document.querySelector('#kt-blog-theme-style')?.textContent).toContain('--argon-background-dark-image: url(\'https://s3.kwitsukasa.top/images/bg-冬滚滚.png\'), url(\'/blog-assets/bg-donggungun.png\');');
    expect(document.querySelector('#kt-blog-theme-style')?.textContent).toContain('--argon-background-filter: brightness(0.65);');
    expect(document.querySelector('#kt-blog-theme-style')?.textContent).toContain('--argon-background-opacity: 1;');
    expect(document.querySelector('#kt-blog-theme-style')?.textContent).toContain('--argon-background-dark-opacity: 1;');
    expect(document.querySelector('#kt-blog-theme-style')?.textContent).toContain("url('http://s3.kwitsukasa.top/images/avatar-tsukasa-1.jpg')");
  });

  it('keeps toolbar menu hidden unless WordPress exposes an explicit visibility flag', async () => {
    const { applyWordpressThemeConfig, siteConfig } = useBlogTheme();

    applyWordpressThemeConfig({
      headerMenu: [
        {
          href: 'https://blog.kwitsukasa.top',
          label: '首页',
        },
      ],
      site: {
        home: 'https://blog.kwitsukasa.top',
      },
    });
    await nextTick();

    expect(siteConfig.value.headerMenu).toEqual([
      {
        external: false,
        href: '/',
        label: '首页',
      },
    ]);
    expect(siteConfig.value.headerMenuVisible).toBe(false);

    applyWordpressThemeConfig({
      headerMenu: [
        {
          href: 'https://blog.kwitsukasa.top/archives',
          label: '归档',
        },
      ],
      headerMenuVisible: 'true',
      site: {
        home: 'https://blog.kwitsukasa.top',
      },
    });
    await nextTick();

    expect(siteConfig.value.headerMenu).toEqual([
      {
        external: false,
        href: '/archives',
        label: '归档',
      },
    ]);
    expect(siteConfig.value.headerMenuVisible).toBe(true);
  });

  it('migrates same-site WordPress management without changing unrelated sidebar links', async () => {
    const { applyWordpressThemeConfig, siteConfig } = useBlogTheme();

    applyWordpressThemeConfig({
      sidebarMenu: [
        {
          href: 'https://blog.kwitsukasa.top/wp-admin/',
          icon: 'fa-user',
          label: '管理',
        },
        {
          external: true,
          href: 'https://github.com/KwiTsukasa',
          icon: 'fa-github',
          label: 'GitHub',
        },
      ],
      site: {
        home: 'https://blog.kwitsukasa.top',
      },
    });
    await nextTick();

    expect(siteConfig.value.sidebarMenu).toEqual([
      {
        external: true,
        href: buildBlogAdminSsoUrl(),
        icon: 'fa-user',
        label: '管理',
      },
      {
        external: true,
        href: 'https://github.com/KwiTsukasa',
        icon: 'fa-github',
        label: 'GitHub',
      },
    ]);
  });

  it('maps legacy Argon placeholder image config back to previous blog static assets', async () => {
    const { applyWordpressThemeConfig, siteConfig } = useBlogTheme();

    applyWordpressThemeConfig({
      backgroundDarkImage: '/argon/theme/img-2-1200x1000.jpg',
      backgroundImage: '/argon/theme/img-2-1200x1000.jpg',
      site: {
        authorAvatar: '/argon/theme/profile.jpg',
      },
    });
    await nextTick();

    const styleText = document.querySelector('#kt-blog-theme-style')?.textContent || '';
    expect(styleText).toContain("url('https://s3.kwitsukasa.top/images/bg-冬滚滚.png')");
    expect(styleText).toContain("url('/blog-assets/bg-donggungun.png')");
    expect(styleText).toContain("url('https://s3.kwitsukasa.top/images/avatar-tsukasa-1.jpg')");
    expect(styleText).toContain("url('/blog-assets/avatar-tsukasa-1.jpg')");
    expect(styleText).not.toContain('/argon/theme/');
    expect(siteConfig.value.authorAvatar).toBe('https://s3.kwitsukasa.top/images/avatar-tsukasa-1.jpg');
  });

  it('mirrors remote layout class switches instead of keeping stale defaults', async () => {
    const { applyWordpressThemeConfig, themeRootClass, wordpressThemeConfig } = useBlogTheme();

    applyWordpressThemeConfig({
      darkmodeAutoSwitch: 'alwaysoff',
      enableCustomThemeColor: false,
      htmlClass: 'article-header-style-full',
      site: {
        title: '无三栏布局',
      },
      themeColor: '#111111',
    });
    await nextTick();

    expect(themeRootClass.value).not.toContain('kt-blog--triple-column');
    expect(themeRootClass.value).not.toContain('kt-blog--immersion-color');
    expect(themeRootClass.value).not.toContain('kt-blog--toolbar-blur');
    expect(themeRootClass.value).not.toContain('kt-blog--font-serif');
    expect(themeRootClass.value).not.toContain('kt-blog--shadow-big');
    expect(themeRootClass.value).toContain('kt-blog--article-header-full');
    expect(themeRootClass.value).toContain('kt-blog--light');
    expect(wordpressThemeConfig.value?.site?.title).toBe('无三栏布局');
  });

  it('mirrors empty remote menus instead of keeping default menu items', async () => {
    const { applyWordpressThemeConfig, siteConfig } = useBlogTheme();

    applyWordpressThemeConfig({
      headerMenu: [],
      sidebarMenu: [],
      site: {
        title: '远端空菜单',
      },
    });
    await nextTick();

    expect(siteConfig.value.headerMenu).toEqual([]);
    expect(siteConfig.value.sidebarMenu).toEqual([]);
    expect(siteConfig.value.title).toBe('远端空菜单');
  });

  it('mirrors WordPress darkmodeAutoSwitch false, system and time modes', async () => {
    const { applyWordpressThemeConfig, preferences } = useBlogTheme();

    applyWordpressThemeConfig({
      darkmodeAutoSwitch: 'false',
    });
    await nextTick();
    expect(preferences.mode).toBe('light');

    let systemChangeHandler:
      | ((event: { matches: boolean }) => void)
      | undefined;
    const addEventListener = vi.fn(
      (_eventName: string, handler: (event: { matches: boolean }) => void) => {
        systemChangeHandler = handler;
      },
    );
    const removeEventListener = vi.fn();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        addEventListener,
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        removeEventListener,
        removeListener: vi.fn(),
      })),
    );
    applyWordpressThemeConfig({
      darkmodeAutoSwitch: 'system',
    });
    await nextTick();
    expect(preferences.mode).toBe('dark');
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    systemChangeHandler?.({ matches: false });
    await nextTick();
    expect(preferences.mode).toBe('light');

    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 5, 14, 0, 0));
    applyWordpressThemeConfig({
      darkmodeAutoSwitch: 'time',
    });
    await nextTick();
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(preferences.mode).toBe('light');

    vi.setSystemTime(new Date(2026, 5, 5, 22, 30, 0));
    applyWordpressThemeConfig({
      darkmodeAutoSwitch: 'time',
    });
    await nextTick();
    expect(preferences.mode).toBe('dark');
  });
});
