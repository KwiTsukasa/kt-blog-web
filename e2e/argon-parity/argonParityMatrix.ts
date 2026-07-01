import path from 'node:path';

export type ArgonPageState = 'bottom' | 'middle' | 'top';

export interface ArgonRouteCase {
  bodyClassHints: string[];
  expectedTexts: string[];
  kind: 'archive' | 'category' | 'home' | 'post' | 'search' | 'tag';
  livePath: string;
  localPath: string;
  routeKey: string;
  titlePattern: RegExp;
}

export interface ArgonViewportCase {
  height: number;
  name: string;
  width: number;
}

export interface ArgonInteractionCase {
  kind: 'external-link' | 'href-only' | 'modal' | 'route' | 'state-toggle';
  key: string;
  selector?: string;
}

export const LIVE_BLOG_ORIGIN = 'https://blog.kwitsukasa.top';
export const LOCAL_ARTIFACT_ROOT = path.resolve(
  process.cwd(),
  '..',
  '..',
  '.kt-workspace',
  'test-artifacts',
  'blog-argon-parity',
);

export const ARGON_PAGE_STATES: ArgonPageState[] = ['top', 'middle', 'bottom'];

export const ARGON_VIEWPORTS: ArgonViewportCase[] = [
  { height: 900, name: 'desktop-1440', width: 1440 },
  { height: 1080, name: 'desktop-1920', width: 1920 },
  { height: 812, name: 'mobile-375', width: 375 },
  { height: 844, name: 'mobile-390', width: 390 },
  { height: 932, name: 'mobile-430', width: 430 },
];

export const ARGON_ROUTE_CASES: ArgonRouteCase[] = [
  {
    bodyClassHints: ['home', 'blog', 'wp-theme-argon'],
    expectedTexts: ['KwiTsukasa的小站'],
    kind: 'home',
    livePath: '/',
    localPath: '/',
    routeKey: 'home',
    titlePattern: /^KwiTsukasa的小站/,
  },
  {
    bodyClassHints: ['search', 'search-results', 'wp-theme-argon'],
    expectedTexts: ['NAS', '搜索结果'],
    kind: 'search',
    livePath: '/?s=NAS',
    localPath: '/search?q=NAS',
    routeKey: 'search-NAS',
    titlePattern: /NAS.*搜索结果|搜索结果.*NAS/,
  },
  {
    bodyClassHints: ['search', 'search-no-results', 'wp-theme-argon'],
    expectedTexts: ['夏祭', '搜索结果'],
    kind: 'search',
    livePath: '/?s=%E5%A4%8F%E7%A5%AD',
    localPath: '/search?q=夏祭',
    routeKey: 'search-夏祭',
    titlePattern: /夏祭.*搜索结果|搜索结果.*夏祭/,
  },
  {
    bodyClassHints: ['archive', 'category', 'category-mqtt', 'wp-theme-argon'],
    expectedTexts: ['MQTT'],
    kind: 'category',
    livePath: '/?cat=4',
    localPath: '/category/mqtt',
    routeKey: 'category-4',
    titlePattern: /^MQTT/,
  },
  {
    bodyClassHints: ['archive', 'category', 'category-nas', 'wp-theme-argon'],
    expectedTexts: ['NAS'],
    kind: 'category',
    livePath: '/?cat=9',
    localPath: '/category/nas',
    routeKey: 'category-9',
    titlePattern: /^NAS/,
  },
  {
    bodyClassHints: ['archive', 'category', 'category-node', 'wp-theme-argon'],
    expectedTexts: ['Node'],
    kind: 'category',
    livePath: '/?cat=2',
    localPath: '/category/node',
    routeKey: 'category-2',
    titlePattern: /^Node/,
  },
  {
    bodyClassHints: ['archive', 'category', 'category-uncategorized', 'wp-theme-argon'],
    expectedTexts: ['public'],
    kind: 'category',
    livePath: '/?cat=1',
    localPath: '/category/public',
    routeKey: 'category-1',
    titlePattern: /^public/,
  },
  {
    bodyClassHints: ['archive', 'category', 'category-vue', 'wp-theme-argon'],
    expectedTexts: ['Vue'],
    kind: 'category',
    livePath: '/?cat=7',
    localPath: '/category/vue',
    routeKey: 'category-7',
    titlePattern: /^Vue/,
  },
  {
    bodyClassHints: ['archive', 'tag', 'tag-mqtt', 'wp-theme-argon'],
    expectedTexts: ['MQTT'],
    kind: 'tag',
    livePath: '/?tag=mqtt',
    localPath: '/tag/mqtt',
    routeKey: 'tag-mqtt',
    titlePattern: /^MQTT/,
  },
  {
    bodyClassHints: ['archive', 'tag', 'tag-nas', 'wp-theme-argon'],
    expectedTexts: ['NAS'],
    kind: 'tag',
    livePath: '/?tag=nas',
    localPath: '/tag/nas',
    routeKey: 'tag-nas',
    titlePattern: /^NAS/,
  },
  {
    bodyClassHints: ['archive', 'tag', 'tag-node', 'wp-theme-argon'],
    expectedTexts: ['Node'],
    kind: 'tag',
    livePath: '/?tag=node',
    localPath: '/tag/node',
    routeKey: 'tag-node',
    titlePattern: /^Node/,
  },
  {
    bodyClassHints: ['archive', 'tag', 'tag-vue', 'wp-theme-argon'],
    expectedTexts: ['Vue'],
    kind: 'tag',
    livePath: '/?tag=vue',
    localPath: '/tag/vue',
    routeKey: 'tag-vue',
    titlePattern: /^Vue/,
  },
  {
    bodyClassHints: ['single', 'single-post', 'postid-61', 'wp-theme-argon'],
    expectedTexts: ['QQBot NAS 接入记录'],
    kind: 'post',
    livePath: '/?p=61',
    localPath: '/post/qqbot-nas-access-record',
    routeKey: 'post-61',
    titlePattern: /QQBot NAS 接入记录/,
  },
  {
    bodyClassHints: ['single', 'single-post', 'postid-50', 'wp-theme-argon'],
    expectedTexts: ['飞牛 NAS Docker、Jenkins 与 k3d/K8s 一体化技术方案'],
    kind: 'post',
    livePath: '/?p=50',
    localPath: '/post/fnos-nas-docker-jenkins-k3d-k8s',
    routeKey: 'post-50',
    titlePattern: /飞牛 NAS Docker、Jenkins 与 k3d\/K8s 一体化技术方案/,
  },
  {
    bodyClassHints: ['single', 'single-post', 'postid-46', 'wp-theme-argon'],
    expectedTexts: ['腾讯云 Caddy 反向代理部署方案'],
    kind: 'post',
    livePath: '/?p=46',
    localPath: '/post/tencent-cloud-caddy-reverse-proxy',
    routeKey: 'post-46',
    titlePattern: /腾讯云 Caddy 反向代理部署方案/,
  },
  {
    bodyClassHints: ['single', 'single-post', 'postid-41', 'wp-theme-argon'],
    expectedTexts: ['VPS + 家宽NAS + WireGuard 公网IPV4方案'],
    kind: 'post',
    livePath: '/?p=41',
    localPath: '/post/vps-home-nas-wireguard-ipv4',
    routeKey: 'post-41',
    titlePattern: /VPS \+ 家宽NAS \+ WireGuard 公网IPV4方案/,
  },
  {
    bodyClassHints: ['single', 'single-post', 'postid-35', 'wp-theme-argon'],
    expectedTexts: ['OnlyOffice在线文档集成方案'],
    kind: 'post',
    livePath: '/?p=35',
    localPath: '/post/onlyoffice-online-docs-integration',
    routeKey: 'post-35',
    titlePattern: /OnlyOffice在线文档集成方案/,
  },
  {
    bodyClassHints: ['archive', 'date', 'wp-theme-argon'],
    expectedTexts: ['2026 年 6 月'],
    kind: 'archive',
    livePath: '/?m=202606',
    localPath: '/archives?month=202606',
    routeKey: 'archive-202606',
    titlePattern: /2026 年 6 月/,
  },
  {
    bodyClassHints: ['archive', 'date', 'wp-theme-argon'],
    expectedTexts: ['2026 年 5 月'],
    kind: 'archive',
    livePath: '/?m=202605',
    localPath: '/archives?month=202605',
    routeKey: 'archive-202605',
    titlePattern: /2026 年 5 月/,
  },
  {
    bodyClassHints: ['archive', 'date', 'wp-theme-argon'],
    expectedTexts: ['2025 年 10 月'],
    kind: 'archive',
    livePath: '/?m=202510',
    localPath: '/archives?month=202510',
    routeKey: 'archive-202510',
    titlePattern: /2025 年 10 月/,
  },
  {
    bodyClassHints: ['single', 'single-post', 'postid-20', 'wp-theme-argon'],
    expectedTexts: ['在项目中快速使用MQTT,以及topic详解'],
    kind: 'post',
    livePath: '/?p=20',
    localPath: '/post/mqtt-topic-guide',
    routeKey: 'post-20',
    titlePattern: /在项目中快速使用MQTT,以及topic详解/,
  },
  {
    bodyClassHints: ['single', 'single-post', 'postid-9', 'wp-theme-argon'],
    expectedTexts: ['使用Nest.js与TypeORM搭建Node服务'],
    kind: 'post',
    livePath: '/?p=9',
    localPath: '/post/nestjs-typeorm-node-service',
    routeKey: 'post-9',
    titlePattern: /使用Nest\.js与TypeORM搭建Node服务/,
  },
];

export const ARGON_INTERACTION_CASES: ArgonInteractionCase[] = [
  { kind: 'state-toggle', key: '#fabtn_toggle_blog_settings_popup', selector: '#fabtn_toggle_blog_settings_popup' },
  { kind: 'state-toggle', key: '#fabtn_toggle_sides', selector: '#fabtn_toggle_sides' },
  { kind: 'state-toggle', key: '#fabtn_back_to_top', selector: '#fabtn_back_to_top' },
  { kind: 'state-toggle', key: '#fabtn_reading_progress', selector: '#fabtn_reading_progress' },
  { kind: 'modal', key: '#leftbar_search_container', selector: '#leftbar_search_container' },
  { kind: 'modal', key: 'taxonomy-categories', selector: '[data-argon-taxonomy="categories"]' },
  { kind: 'modal', key: 'taxonomy-tags', selector: '[data-argon-taxonomy="tags"]' },
  { kind: 'modal', key: '#share_show', selector: '#share_show' },
  { kind: 'state-toggle', key: '#search_filter_post', selector: '#search_filter_post' },
  { kind: 'state-toggle', key: '#search_filter_page', selector: '#search_filter_page' },
  { kind: 'state-toggle', key: '#open_sidebar', selector: '#open_sidebar' },
  { kind: 'modal', key: '#sidebar_mask', selector: '#sidebar_mask' },
  { kind: 'modal', key: '#post_comment_content', selector: '#post_comment_content' },
  { kind: 'state-toggle', key: '#post_comment_send', selector: '#post_comment_send' },
];
