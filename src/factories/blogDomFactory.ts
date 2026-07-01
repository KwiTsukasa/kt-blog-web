import { shallowRef, type ComponentPublicInstance, type Ref } from 'vue';

export const BLOG_DOM_IDS = {
  banner: 'banner',
  bannerContainer: 'banner_container',
  blogSettingsPopup: 'blog_settings_popup',
  commentEmotionButton: 'comment_emotion_btn',
  commentPostUseMarkdown: 'comment_post_use_markdown',
  comments: 'comments',
  content: 'content',
  floatBackToTop: 'fabtn_back_to_top',
  floatReadingProgress: 'fabtn_reading_progress',
  floatSettingsToggle: 'fabtn_toggle_blog_settings_popup',
  floatToggleSides: 'fabtn_toggle_sides',
  footer: 'footer',
  headerNavbar: 'navbar-main',
  leftbar: 'leftbar',
  leftbarCatalog: 'leftbar_catalog',
  leftbarCatalogTab: 'leftbar_tab_catalog',
  leftbarCatalogTabButton: 'leftbar_tab_catalog_btn',
  leftbarOverviewAuthorImage: 'leftbar_overview_author_image',
  leftbarOverviewAuthorName: 'leftbar_overview_author_name',
  leftbarOverviewTab: 'leftbar_tab_overview',
  leftbarOverviewTabButton: 'leftbar_tab_overview_btn',
  leftbarPart1: 'leftbar_part1',
  leftbarPart1Menu: 'leftbar_part1_menu',
  leftbarPart2: 'leftbar_part2',
  leftbarPart2Inner: 'leftbar_part2_inner',
  leftbarSearchContainer: 'leftbar_search_container',
  leftbarSearchInput: 'leftbar_search_input',
  live2dCanvas: 'live2d',
  live2dChatText: 'live2dChatText',
  live2dFallback: 'kt-blog-live2d-fallback',
  live2dSend: 'live2dSend',
  live2dSendClose: 'live2dSendClose',
  live2dStyle: 'waifu_css-css',
  main: 'main',
  openSidebar: 'open_sidebar',
  postArticleTitle: 'post_article_title',
  postComment: 'post_comment',
  postCommentCaptcha: 'post_comment_captcha',
  postCommentContent: 'post_comment_content',
  postCommentEmail: 'post_comment_email',
  postCommentName: 'post_comment_name',
  postCommentSend: 'post_comment_send',
  postContent: 'post_content',
  primary: 'primary',
  rightbar: 'rightbar',
  shareContainer: 'share_container',
  shareCopyLink: 'share_copy_link',
  sharePanel: 'share',
  shareShow: 'share_show',
  sidebarMask: 'sidebar_mask',
  settingsFontSansSerif: 'blog_setting_font_sans_serif',
  settingsFontSerif: 'blog_setting_font_serif',
  settingsShadowBig: 'blog_setting_shadow_big',
  settingsShadowSmall: 'blog_setting_shadow_small',
  themeStyle: 'kt-blog-theme-style',
} as const;

export const BLOG_META_NAMES = {
  themeColor: 'theme-color',
  themeColorRgb: 'theme-color-rgb',
} as const;

export const BLOG_LIVE2D_SCRIPT_IDS = {
  live2dV1Core: 'live2dv1core-js',
  live2dV2Core: 'live2dv2core-js',
  live2dV2Sdk: 'live2dv2sdk-js',
  live2dWeb: 'live2dweb-js',
} as const;

export type BlogDomIdKey = keyof typeof BLOG_DOM_IDS;

/**
 * @param key Semantic key for a stable Argon-compatible DOM id.
 * @returns Concrete DOM id string used by markup, source tests, and Argon compatibility hooks.
 */
export function blogDomId(key: BlogDomIdKey) {
  return BLOG_DOM_IDS[key];
}

/**
 * @param key Semantic key for a stable Argon-compatible DOM id.
 * @returns CSS id selector for document queries that cannot yet be replaced by a Vue ref.
 */
export function blogDomSelector(key: BlogDomIdKey) {
  return blogDomSelectorFromId(blogDomId(key));
}

/**
 * @param id Existing DOM id from WordPress, upstream plugins, or generated Argon content.
 * @returns CSS id selector for legacy ids that are externally defined but still queried by app code.
 */
export function blogDomSelectorFromId(id: string) {
  return `#${id}`;
}

/**
 * @param key Semantic key for a stable Argon-compatible DOM id.
 * @returns Hash href pointing at the matching local DOM id.
 */
export function blogDomAnchor(key: BlogDomIdKey) {
  return blogDomAnchorFromId(blogDomId(key));
}

/**
 * @param id Existing DOM id from WordPress or generated Argon catalog content.
 * @returns Hash href without resolving it through the browser URL.
 */
export function blogDomAnchorFromId(id: string) {
  return `#${id}`;
}

/**
 * @param articleId Local article id mirrored as Argon's `post-{id}` card anchor.
 * @returns Stable article card DOM id.
 */
export function blogPostCardId(articleId: number | string) {
  return `post-${articleId}`;
}

/**
 * @param index One-based paragraph index in fallback article content.
 * @returns Stable fallback paragraph DOM id.
 */
export function blogPostParagraphId(index: number) {
  return `post_paragraph_${index}`;
}

/**
 * @param index One-based heading index produced for WordPress content without preserved heading ids.
 * @returns Stable heading id matching Argon's captured `header-id-N` convention.
 */
export function blogGeneratedHeadingId(index: number) {
  return `header-id-${index}`;
}

/**
 * @param filterMode Blog filter preference value rendered in the settings panel.
 * @returns Stable settings filter button id.
 */
export function blogSettingsFilterId(filterMode: string) {
  return `blog_setting_filter_${filterMode}`;
}

/**
 * @param postType WordPress search result type rendered in the filter checkbox row.
 * @returns Stable search filter checkbox id.
 */
export function blogSearchFilterId(postType: string) {
  return `search_filter_${postType}`;
}

/**
 * @param name Meta tag name controlled by the Blog theme runtime.
 * @returns CSS selector for the matching meta tag.
 */
export function blogMetaSelector(name: string) {
  return `meta[name="${name}"]`;
}

/**
 * @param id Concrete DOM id, often from generated WordPress heading anchors.
 * @returns Matching HTMLElement when it exists in the current document.
 */
export function getBlogElementById<T extends HTMLElement = HTMLElement>(id: string) {
  return document.getElementById(id) as T | null;
}

/**
 * @returns Shallow Vue ref for DOM nodes whose identity, not deep fields, drives layout side effects.
 */
export function createBlogElementRef<T extends HTMLElement = HTMLElement>() {
  return shallowRef<T | null>(null);
}

/**
 * @returns Shallow Vue ref for focusable component instances such as antdv-next inputs.
 */
export function createBlogFocusableRef<T = unknown>() {
  return shallowRef<T | null>(null);
}

/**
 * @param target Vue ref callback payload from native elements or component instances.
 * @returns Native HTMLElement only when the callback payload is a real DOM element.
 */
export function toBlogHTMLElement(target: Element | ComponentPublicInstance | null) {
  return target instanceof HTMLElement ? target : null;
}

/**
 * @param targetRef Layout-owned HTMLElement ref that cross-component effects read from.
 * @param target Vue ref callback payload emitted by TSX render functions.
 */
export function assignBlogElementRef(targetRef: Ref<HTMLElement | null>, target: Element | ComponentPublicInstance | null) {
  targetRef.value = toBlogHTMLElement(target);
}
