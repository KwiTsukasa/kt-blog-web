import { shallowRef, type ComponentPublicInstance, type Ref } from 'vue'

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
  live2dSend: 'live2dSend',
  live2dSendClose: 'live2dSendClose',
  live2dTextureButton: 'live2d-texture-button',
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
} as const

export const BLOG_META_NAMES = {
  themeColor: 'theme-color',
  themeColorRgb: 'theme-color-rgb',
} as const

export type BlogDomIdKey = keyof typeof BLOG_DOM_IDS

/**
 * 按语义键读取集中维护的博客 DOM 标识。
 * @param key - 用于在当前映射或缓存中定位记录的键。
 * @returns 语义键对应的博客 DOM 标识。
 */
export function blogDomId(key: BlogDomIdKey) {
  return BLOG_DOM_IDS[key]
}

/**
 * 读取博客 DOM 标识并转换为 ID 选择器。
 * @param key - 用于在当前映射或缓存中定位记录的键。
 * @returns 读取到的博客 DOM 标识并转换为 ID 选择器。
 */
export function blogDomSelector(key: BlogDomIdKey) {
  return blogDomSelectorFromId(blogDomId(key))
}

/**
 * 把博客 DOM 标识转成可用于查询元素的 ID 选择器。
 * @param id - 用于定位目标记录的唯一标识。
 * @returns 带井号前缀的博客 DOM ID 选择器。
 */
export function blogDomSelectorFromId(id: string) {
  return `#${id}`
}

/**
 * 按语义键读取集中维护的博客 DOM 标识，并转换为页面跳转使用的井号锚点。
 * @param key - 用于在当前映射或缓存中定位记录的键。
 * @returns 语义键指向的井号前缀页面锚点。
 */
export function blogDomAnchor(key: BlogDomIdKey) {
  return blogDomAnchorFromId(blogDomId(key))
}

/**
 * 把博客 DOM 标识转成可用于链接跳转的井号锚点。
 * @param id - 用于定位目标记录的唯一标识。
 * @returns 带井号前缀的博客 DOM 锚点。
 */
export function blogDomAnchorFromId(id: string) {
  return `#${id}`
}

/**
 * 按文章标识生成卡片 DOM 标识。
 * @param articleId - 用于定位文章的标识。
 * @returns 卡片 DOM 标识。
 */
export function blogPostCardId(articleId: number | string) {
  return `post-${articleId}`
}

/**
 * 按段落序号生成文章段落 DOM 标识。
 * @param index - 目标条目在有序集合中的位置。
 * @returns 文章段落 DOM 标识。
 */
export function blogPostParagraphId(index: number) {
  return `post_paragraph_${index}`
}

/**
 * 按标题序号生成文章目录锚点标识。
 * @param index - 目标条目在有序集合中的位置。
 * @returns 文章目录锚点标识。
 */
export function blogGeneratedHeadingId(index: number) {
  return `header-id-${index}`
}

/**
 * 按设置模式生成过滤器 DOM 标识。
 * @param filterMode - 拼入设置过滤器 DOM 标识的模式。
 * @returns 过滤器 DOM 标识。
 */
export function blogSettingsFilterId(filterMode: string) {
  return `blog_setting_filter_${filterMode}`
}

/**
 * 按文章类型生成搜索过滤器 DOM 标识。
 * @param postType - 拼入搜索过滤器 DOM 标识的文章类型。
 * @returns 搜索过滤器 DOM 标识。
 */
export function blogSearchFilterId(postType: string) {
  return `search_filter_${postType}`
}

/**
 * 按 meta 名称生成属性选择器。
 * @param name - 用于定位或命名目标资源的名称。
 * @returns 属性选择器。
 */
export function blogMetaSelector(name: string) {
  return `meta[name="${name}"]`
}

/**
 * 按集中维护的 DOM 标识读取博客元素，未命中时返回 null。
 * @param id - 用于定位目标记录的唯一标识。
 * @returns 集中 DOM 标识对应的博客元素；未命中时为 null。
 */
export function getBlogElementById<T extends HTMLElement = HTMLElement>(id: string) {
  return document.getElementById(id) as T | null
}

/**
 * DOM 引用通过 shallowRef 只跟踪节点身份，初始未挂载状态保持为 null。
 * @returns 接受指定 HTMLElement 子类型或 null 的浅层 Vue 引用。
 */
export function createBlogElementRef<T extends HTMLElement = HTMLElement>() {
  return shallowRef<T | null>(null)
}

/**
 * 创建初值为 null、用于保存可聚焦组件实例的浅层 Vue 引用。
 * @returns 新建的初值为 null、用于保存可聚焦组件实例的浅层 Vue 引用。
 */
export function createBlogFocusableRef<T = unknown>() {
  return shallowRef<T | null>(null)
}

/**
 * 仅在输入是 HTMLElement 时保留该 DOM 对象，组件实例或空值返回 null。
 * @param target - 待更新、比较或导航到的目标。
 * @returns 转换后的`BlogHTMLElement`；空值分支返回 null。
 */
export function toBlogHTMLElement(target: Element | ComponentPublicInstance | null) {
  if (target instanceof HTMLElement) {
    return target
  }
  return null
}

/**
 * 只把有效 HTMLElement 写入博客 DOM 引用，其他目标写入 null。
 * @param targetRef - 包含 `targetRef.value` 字段的`targetRef`对象。
 * @param target - 待更新、比较或导航到的目标。
 */
export function assignBlogElementRef(
  targetRef: Ref<HTMLElement | null>,
  target: Element | ComponentPublicInstance | null,
) {
  targetRef.value = toBlogHTMLElement(target)
}
