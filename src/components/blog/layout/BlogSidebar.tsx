import { SearchOutlined } from '@antdv-next/icons'
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  type ComponentPublicInstance,
  type PropType,
  type Ref,
  ref,
  watch,
} from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import {
  getArticleCatalogHeadings,
  type BlogArticle,
  type BlogCategory,
  type BlogTag,
} from '@/data/blog'
import {
  BLOG_ANIMATION_TIMING_MS,
  BLOG_SCROLL_GEOMETRY,
  cancelBlogFrame,
  clearBlogDelay,
  easeOutExpo,
  easeOutQuad,
  requestBlogFrame,
  runAfterBlogDelay,
} from '@/factories/blogAnimationFactory'
import {
  blogDomAnchor,
  blogDomAnchorFromId,
  blogDomId,
  blogGeneratedHeadingId,
  createBlogElementRef,
  createBlogFocusableRef,
  getBlogElementById,
  toBlogHTMLElement,
} from '@/factories/blogDomFactory'
import { useBlogDomRefs } from '@/hooks/useBlogDomRefs'
import { useBlogEventBus } from '@/hooks/useBlogEventBus'
import { useBlogTheme } from '@/hooks/useBlogTheme'

import { BlogButton, BlogInput } from '../ui/antdvComponents'

interface ArgonCatalogNode {
  children: ArgonCatalogNode[]
  element: HTMLHeadingElement
  level: number
  parent: ArgonCatalogNode | null
  topHeight: number
}

const catalogListSlideFrames = new WeakMap<HTMLUListElement, number>()
const elementScrollFrames = new WeakMap<HTMLElement, number>()
let windowScrollFrame = 0

type SidebarTabKey = 'catalog' | 'overview'

export default defineComponent({
  name: 'BlogSidebar',
  props: {
    categories: {
      type: Array as PropType<BlogCategory[]>,
      required: true,
    },
    tags: {
      type: Array as PropType<BlogTag[]>,
      required: true,
    },
    articles: {
      type: Array as PropType<BlogArticle[]>,
      required: true,
    },
    part1Ref: {
      type: Object as PropType<Ref<HTMLElement | null>>,
      required: true,
    },
    part2Ref: {
      type: Object as PropType<Ref<HTMLElement | null>>,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const eventBus = useBlogEventBus()
    const { postContentRef } = useBlogDomRefs()
    const { siteConfig } = useBlogTheme()
    const activeTab = ref<SidebarTabKey>('catalog')
    const visiblePaneTab = ref<SidebarTabKey>('catalog')
    const shownPaneTab = ref<SidebarTabKey | null>('catalog')
    const keyword = ref('')
    const leftbarSearchOpen = ref(false)
    const leftbarSearchInputRef = createBlogFocusableRef<any>()
    const catalogRef = createBlogElementRef<HTMLElement>()
    const currentArticle = computed(() =>
      props.articles.find((item) => item.slug === String(route.params.slug ?? '')),
    )
    const shouldShowPostCatalogTabs = computed(
      () => route.name === 'BlogPost' && getArticleCatalogHeadings(currentArticle.value).length > 0,
    )
    let catalogGeneration = 0
    let cleanupCatalog: (() => void) | null = null
    let tabFadeFrame = 0

    /*
     * Cancels a queued tab fade frame when the route changes or the sidebar unmounts.
     */
    const cancelTabFadeFrame = () => {
      if (!tabFadeFrame) {
        return
      }

      cancelBlogFrame(tabFadeFrame)
      tabFadeFrame = 0
    }

    /*
     * Switches tab panes without animation for route resets where Argon lands directly on the default tab.
     *
     * @param tab Tab pane that should be displayed and fully shown immediately.
     */
    const setSidebarTabImmediately = (tab: SidebarTabKey) => {
      cancelTabFadeFrame()
      activeTab.value = tab
      visiblePaneTab.value = tab
      shownPaneTab.value = tab
    }

    /*
     * Switches tab panes with Bootstrap's fade timing: display the pane first, then add `show` next frame.
     *
     * @param tab Tab pane requested by the user through the Argon-compatible tab controls.
     */
    const activateSidebarTabWithFade = (tab: SidebarTabKey) => {
      if (activeTab.value === tab && visiblePaneTab.value === tab && shownPaneTab.value === tab) {
        return
      }

      cancelTabFadeFrame()
      activeTab.value = tab
      visiblePaneTab.value = tab
      shownPaneTab.value = null
      tabFadeFrame = requestBlogFrame(() => {
        tabFadeFrame = 0
        shownPaneTab.value = tab
      })
    }

    /*
     * Restores Argon's post sidebar default: post pages open on catalog, non-post pages keep overview.
     *
     * @param hasCatalog Whether the current route renders a single post with heading anchors.
     */
    const resetSidebarTabForRoute = (hasCatalog: boolean) => {
      setSidebarTabImmediately(
        (() => {
          if (hasCatalog) {
            return 'catalog'
          }
          return 'overview'
        })(),
      )
    }

    /*
     * Activates the post catalog tab without letting Argon's hash-like tab anchor change the current route.
     *
     * @param event Browser click event emitted by the tab control; prevented because tab state is Vue-owned.
     */
    const showCatalogTab = (event: MouseEvent) => {
      event.preventDefault()
      activateSidebarTabWithFade('catalog')
    }

    /*
     * Activates the site overview tab without turning the Bootstrap-compatible href into navigation.
     *
     * @param event Browser click event emitted by the tab control; prevented because tab state is Vue-owned.
     */
    const showOverviewTab = (event: MouseEvent) => {
      event.preventDefault()
      activateSidebarTabWithFade('overview')
    }

    /*
     * Registers the catalog root so the Argon headIndex-compatible runtime can render into the leftbar container.
     *
     * @param target Catalog root element from Vue's ref callback; null when unmounted.
     */
    const registerCatalogRef = (target: Element | ComponentPublicInstance | null) => {
      catalogRef.value = toBlogHTMLElement(target)
    }

    /*
     * Destroys the current catalog runtime and clears generated DOM so stale post headings cannot leak routes.
     */
    const destroyArgonCatalog = () => {
      catalogGeneration += 1
      cleanupCatalog?.()
      cleanupCatalog = null
      if (catalogRef.value) {
        catalogRef.value.innerHTML = ''
      }
    }

    /*
     * Rebuilds the catalog from real post headings after Vue has rendered the post body.
     *
     * @param hasCatalog Whether the current route should expose Argon's post catalog tab.
     */
    const rebuildArgonCatalog = (hasCatalog: boolean) => {
      const generation = catalogGeneration + 1
      catalogGeneration = generation
      cleanupCatalog?.()
      cleanupCatalog = null
      if (catalogRef.value) {
        catalogRef.value.innerHTML = ''
      }
      if (!hasCatalog) {
        return
      }

      nextTick(() => {
        if (
          generation !== catalogGeneration ||
          !catalogRef.value ||
          !postContentRef.value ||
          !shouldShowPostCatalogTabs.value
        ) {
          return
        }

        cleanupCatalog = mountArgonHeadIndex(
          catalogRef.value,
          postContentRef.value,
          props.part2Ref.value,
        )
      })
    }

    watch(
      [
        shouldShowPostCatalogTabs,
        () => currentArticle.value?.id,
        () => currentArticle.value?.contentHtml,
        postContentRef,
      ],
      ([hasCatalog]) => {
        resetSidebarTabForRoute(hasCatalog)
        rebuildArgonCatalog(hasCatalog)
      },
      { flush: 'post', immediate: true },
    )

    onBeforeUnmount(() => {
      cancelTabFadeFrame()
      destroyArgonCatalog()
    })

    /*
     * @param target antdv-next Input 组件实例或原生 input 节点。
     */
    const focusInput = (target: any) => {
      target?.focus?.()
      target?.input?.focus?.()
    }

    /*
     * 使用左栏搜索框内容进入本地搜索结果页，对齐 WordPress `?s=` 的用户路径。
     */
    const submitSearch = () => {
      const query = keyword.value.trim()
      if (!query) {
        return
      }

      router.push({
        name: 'BlogSearch',
        query: { q: query },
      })
    }

    return () => (
      <aside id={blogDomId('leftbar')} class="kt-blog__sidebar" role="complementary">
        <div
          id={blogDomId('leftbarPart1')}
          ref={props.part1Ref}
          class="kt-blog__sidebar-panel kt-blog__sidebar-panel--menu kt-blog__card widget widget_search card bg-white shadow-sm border-0"
        >
          <div class="kt-blog__sidebar-banner kt-blog__card-body">
            <span class="kt-blog__sidebar-banner-title">{siteConfig.value.title}</span>
          </div>

          <ul id={blogDomId('leftbarPart1Menu')} class="kt-blog__sidebar-menu leftbar-menu">
            {siteConfig.value.sidebarMenu.map((item) => (
              <li key={item.label} class="kt-blog__sidebar-menu-item leftbar-menu-item">
                {(() => {
                  if (item.external) {
                    return (
                      <a href={item.href}>
                        <i
                          aria-hidden="true"
                          class={[
                            'kt-blog__sidebar-menu-icon',
                            'fa-solid',
                            item.icon || 'fa-circle',
                          ]}
                          data-icon={item.icon || 'fa-circle'}
                        />
                        {item.label}
                      </a>
                    )
                  }
                  return (
                    <RouterLink activeClass="" exactActiveClass="" to={item.href}>
                      <i
                        aria-hidden="true"
                        class={['kt-blog__sidebar-menu-icon', 'fa-solid', item.icon || 'fa-circle']}
                        data-icon={item.icon || 'fa-circle'}
                      />
                      {item.label}
                    </RouterLink>
                  )
                })()}
              </li>
            ))}
          </ul>

          <div
            class={[
              'kt-blog__sidebar-search kt-blog__card-body',
              leftbarSearchOpen.value && 'kt-blog__sidebar-search--open',
            ]}
          >
            <BlogButton
              id={blogDomId('leftbarSearchContainer')}
              class="kt-blog__sidebar-search-trigger kt-blog__button kt-blog__button--secondary kt-blog__button--small kt-blog__button--block"
              onClick={() => {
                leftbarSearchOpen.value = true
                nextTick(() => focusInput(leftbarSearchInputRef.value))
              }}
            >
              <SearchOutlined />
              搜索
            </BlogButton>
            <BlogInput
              id={blogDomId('leftbarSearchInput')}
              ref={leftbarSearchInputRef}
              placeholder="搜索什么..."
              class="kt-blog__sidebar-search-input kt-blog__input"
              autocomplete="off"
              v-model:value={keyword.value}
              onBlur={() => {
                leftbarSearchOpen.value = false
              }}
              onKeydown={(event: KeyboardEvent) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  submitSearch()
                }
              }}
            />
          </div>
        </div>

        <div
          id={blogDomId('leftbarPart2')}
          ref={props.part2Ref}
          class="kt-blog__sidebar-panel kt-blog__sidebar-panel--overview kt-blog__card widget widget_search card bg-white shadow-sm border-0"
        >
          <div
            id={blogDomId('leftbarPart2Inner')}
            class="kt-blog__sidebar-overview kt-blog__card-body card-body"
          >
            <div
              class={[
                'kt-blog__sidebar-tabs nav-wrapper',
                !shouldShowPostCatalogTabs.value && 'kt-blog__sidebar-tabs--single',
              ]}
            >
              <ul class="kt-blog__sidebar-tab-list nav nav-pills nav-fill" role="tablist">
                {(() => {
                  if (shouldShowPostCatalogTabs.value) {
                    return (
                      <li class="kt-blog__sidebar-tab-item nav-item sidebar-tab-switcher">
                        <BlogButton
                          id={blogDomId('leftbarCatalogTabButton')}
                          class={[
                            'kt-blog__sidebar-tab',
                            activeTab.value === 'catalog' &&
                              'kt-blog__sidebar-tab--active active show',
                          ]}
                          aria-controls={blogDomId('leftbarCatalogTab')}
                          aria-selected={String(activeTab.value === 'catalog')}
                          data-toggle="tab"
                          href={blogDomAnchor('leftbarCatalogTab')}
                          no-pjax=""
                          onClick={showCatalogTab}
                          role="tab"
                          type="link"
                        >
                          文章目录
                        </BlogButton>
                      </li>
                    )
                  }
                  return null
                })()}
                <li class="kt-blog__sidebar-tab-item nav-item sidebar-tab-switcher">
                  <BlogButton
                    id={blogDomId('leftbarOverviewTabButton')}
                    class={[
                      'kt-blog__sidebar-tab',
                      (!shouldShowPostCatalogTabs.value || activeTab.value === 'overview') &&
                        'kt-blog__sidebar-tab--active active show',
                    ]}
                    aria-controls={blogDomId('leftbarOverviewTab')}
                    aria-selected={String(
                      !shouldShowPostCatalogTabs.value || activeTab.value === 'overview',
                    )}
                    data-toggle="tab"
                    href={blogDomAnchor('leftbarOverviewTab')}
                    no-pjax=""
                    onClick={showOverviewTab}
                    role="tab"
                    type="link"
                  >
                    站点概览
                  </BlogButton>
                </li>
              </ul>
            </div>
            <div>
              <div class="kt-blog__sidebar-tab-content tab-content">
                {(() => {
                  if (shouldShowPostCatalogTabs.value) {
                    return (
                      <div
                        id={blogDomId('leftbarCatalogTab')}
                        class={[
                          'kt-blog__sidebar-overview-panel kt-blog__sidebar-catalog-panel tab-pane fade',
                          visiblePaneTab.value === 'catalog' && 'active',
                          shownPaneTab.value === 'catalog' && 'show',
                        ]}
                        role="tabpanel"
                      >
                        <div
                          id={blogDomId('leftbarCatalog')}
                          ref={registerCatalogRef}
                          class="kt-blog__sidebar-catalog"
                        />
                      </div>
                    )
                  }
                  return null
                })()}
                <div
                  id={blogDomId('leftbarOverviewTab')}
                  class={[
                    'kt-blog__sidebar-overview-panel tab-pane fade text-center',
                    (!shouldShowPostCatalogTabs.value || visiblePaneTab.value === 'overview') &&
                      'active',
                    (!shouldShowPostCatalogTabs.value || shownPaneTab.value === 'overview') &&
                      'show',
                  ]}
                  role="tabpanel"
                >
                  <div class="kt-blog__sidebar-author-image">
                    <div
                      id={blogDomId('leftbarOverviewAuthorImage')}
                      class="kt-blog__sidebar-author-avatar rounded-circle shadow-sm"
                    />
                  </div>
                  <h6
                    id={blogDomId('leftbarOverviewAuthorName')}
                    class="kt-blog__sidebar-author-name"
                  >
                    {siteConfig.value.authorName}
                  </h6>
                  <nav class="kt-blog__site-stats site-state">
                    <div class="kt-blog__site-stats-item kt-blog__site-stats-item--posts site-state-item site-state-posts">
                      <a>
                        <span class="kt-blog__site-stats-count site-state-item-count">
                          {props.articles.length}
                        </span>{' '}
                        <span class="kt-blog__site-stats-name site-state-item-name">文章</span>
                      </a>
                    </div>
                    <div class="kt-blog__site-stats-item kt-blog__site-stats-item--categories site-state-item site-state-categories">
                      <a
                        data-argon-taxonomy="categories"
                        onClick={() => eventBus.emit('blog:taxonomy:open', 'categories')}
                      >
                        <span class="kt-blog__site-stats-count site-state-item-count">
                          {props.categories.length}
                        </span>{' '}
                        <span class="kt-blog__site-stats-name site-state-item-name">分类</span>
                      </a>
                    </div>
                    <div class="kt-blog__site-stats-item kt-blog__site-stats-item--tags site-state-item site-state-tags">
                      <a
                        data-argon-taxonomy="tags"
                        onClick={() => eventBus.emit('blog:taxonomy:open', 'tags')}
                      >
                        <span class="kt-blog__site-stats-count site-state-item-count">
                          {props.tags.length}
                        </span>{' '}
                        <span class="kt-blog__site-stats-name site-state-item-name">标签</span>
                      </a>
                    </div>
                  </nav>
                  <div />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    )
  },
})

/**
 * 绑定文章目录的滚动与点击联动，并返回解除全部监听器的清理函数。
 * @param catalogRoot - 限制目录项查询范围的目录根元素。
 * @param articleRoot - 限制文章标题查询范围的正文根元素。
 * @param indexScrollBox - 承载文章目录并需要同步滚动的容器。
 * @returns 用于解除目录点击与滚动监听的清理函数。
 */
function mountArgonHeadIndex(
  catalogRoot: HTMLElement,
  articleRoot: HTMLElement,
  indexScrollBox: HTMLElement | null,
) {
  const nodes = collectArgonCatalogNodes(articleRoot)
  let manual = false
  let manualTimer: number | null = null
  let mouseHovered = false

  if (nodes.length === 0) {
    return () => undefined
  }

  catalogRoot.replaceChildren(renderArgonCatalog(nodes))

  /*
   * @param indexItem Catalog list item that should become active.
   */
  const setCurrent = (indexItem: HTMLLIElement | null) => {
    if (!indexItem || indexItem.classList.contains('current')) {
      return
    }

    catalogRoot.querySelectorAll('li.current').forEach((item) => item.classList.remove('current'))
    catalogRoot.querySelectorAll('ul.open').forEach((list) => list.classList.remove('open'))
    openCatalogSublist(indexItem.querySelector(':scope > .index-subItem-box'))
    openAncestorCatalogSublists(indexItem)
    catalogRoot.querySelectorAll<HTMLUListElement>('ul.index-subItem-box').forEach((list) => {
      if (!list.classList.contains('open')) {
        closeCatalogSublist(list)
      }
    })

    indexItem.classList.add('current')
    syncCatalogScroll(indexItem, indexScrollBox, mouseHovered)
  }

  /*
   * Updates the current catalog item from the current document scroll position.
   */
  const updateCurrentFromScroll = () => {
    if (manual) {
      return
    }

    updateArgonNodeTopHeights(nodes)
    const currentNode = searchArgonCatalogNode(nodes, 0, nodes.length - 1, window.scrollY)
    if (!currentNode) {
      return
    }

    setCurrent(findCatalogItemByHref(catalogRoot, blogDomAnchorFromId(currentNode.element.id)))
  }

  /*
   * @param event Delegated click event from the catalog root.
   */
  const handleCatalogClick = (event: MouseEvent) => {
    const link = (() => {
      if (event.target instanceof Element) {
        return event.target.closest<HTMLAnchorElement>('a.index-link')
      }
      return null
    })()
    if (!link || !catalogRoot.contains(link)) {
      return
    }

    event.preventDefault()
    manual = true
    if (manualTimer) {
      clearBlogDelay(manualTimer)
    }
    manualTimer = runAfterBlogDelay(() => {
      manual = false
      manualTimer = null
    }, BLOG_ANIMATION_TIMING_MS.catalogManualLock)
    setCurrent(link.parentElement as HTMLLIElement | null)
    scrollToArgonHeading(link.hash)
  }

  /*
   * Keeps Argon's hover guard: user-hovered catalog panels do not auto-scroll the side panel.
   */
  const handleMouseEnter = () => {
    mouseHovered = true
  }

  /*
   * Releases Argon's hover guard after the pointer leaves the scrollable leftbar panel.
   */
  const handleMouseLeave = () => {
    mouseHovered = false
  }

  catalogRoot.addEventListener('click', handleCatalogClick)
  indexScrollBox?.addEventListener('mouseenter', handleMouseEnter)
  indexScrollBox?.addEventListener('mouseleave', handleMouseLeave)
  window.addEventListener('scroll', updateCurrentFromScroll, { passive: true })
  updateCurrentFromScroll()

  return () => {
    if (manualTimer) {
      clearBlogDelay(manualTimer)
    }
    cancelWindowScrollAnimation()
    catalogRoot.removeEventListener('click', handleCatalogClick)
    indexScrollBox?.removeEventListener('mouseenter', handleMouseEnter)
    indexScrollBox?.removeEventListener('mouseleave', handleMouseLeave)
    window.removeEventListener('scroll', updateCurrentFromScroll)
  }
}

/**
 * 按文档顺序收集文章 h1 至 h6，为缺少标识的标题补 ID，并缓存层级与顶部位置。
 * @param articleRoot - 限制文章标题查询范围的正文根元素。
 * @returns 带标题层级、锚点与顶部位置的文章目录节点。
 */
function collectArgonCatalogNodes(articleRoot: HTMLElement) {
  return Array.from(articleRoot.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6')).map(
    (element, index) => {
      if (!element.id) {
        element.id = blogGeneratedHeadingId(index + 1)
      }

      return {
        children: [],
        element,
        level: Number(element.tagName.charAt(1)),
        parent: null,
        topHeight: getArgonHeadingTop(element),
      } satisfies ArgonCatalogNode
    },
  )
}

/*
 * @param nodes Flat heading node list in document order.
 * @returns Root `ul` matching the exact Argon catalog DOM shape.
 */
const renderArgonCatalog = (nodes: ArgonCatalogNode[]) => {
  const root = document.createElement('ul')
  buildArgonCatalogTree(nodes).forEach((node) => {
    root.append(renderArgonCatalogItem(node))
  })

  return root
}

/*
 * @param node Catalog tree node that maps to one article heading.
 * @returns Argon-compatible list item with nested sub-item boxes.
 */
const renderArgonCatalogItem = (node: ArgonCatalogNode) => {
  const item = document.createElement('li')
  const link = document.createElement('a')

  item.className = 'index-item'
  link.className = 'index-link'
  link.href = blogDomAnchorFromId(node.element.id)
  link.setAttribute('no-pjax', '')
  link.textContent = node.element.innerText || node.element.textContent || ''
  item.append(link)

  if (node.children.length > 0) {
    const childList = document.createElement('ul')
    childList.className = 'index-subItem-box'
    childList.style.display = 'none'
    node.children.forEach((child) => childList.append(renderArgonCatalogItem(child)))
    item.append(childList)
  }

  return item
}

/**
 * 按标题层级把文档顺序节点组织成父子目录树，并重建 children 与 parent 关系。
 * @param nodes - 待遍历、排序或组装的节点集合。
 * @returns 保持文档顺序并包含父子关系的文章目录树。
 */
function buildArgonCatalogTree(nodes: ArgonCatalogNode[]) {
  let current: ArgonCatalogNode | null = null
  const tree: ArgonCatalogNode[] = []

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index]!
    node.children = []
    node.parent = null

    if (current === null) {
      tree.push(node)
      current = node
      continue
    }

    if (current.level < node.level) {
      node.parent = current
      current.children.push(node)
      current = node
      continue
    }

    if (current.level === node.level) {
      node.parent = current.parent
      ;(current.parent?.children ?? tree).push(node)
      current = node
      continue
    }

    while (current !== null && current.level > node.level) {
      current = current.parent
    }
    if (current === null) {
      tree.push(node)
      current = node
      continue
    }
    index -= 1
  }

  return tree
}

/**
 * 刷新目录节点的标题顶部缓存；整体位移一致时只应用统一差值，否则逐项重算。
 * @param nodes - 待遍历、排序或组装的节点集合。
 */
function updateArgonNodeTopHeights(nodes: ArgonCatalogNode[]) {
  if (nodes.length === 0) {
    return
  }

  const first = nodes[0]!
  const last = nodes[nodes.length - 1]!
  const nextFirstTop = getArgonHeadingTop(first.element)
  const nextLastTop = getArgonHeadingTop(last.element)
  if (first.topHeight === nextFirstTop && last.topHeight === nextLastTop) {
    return
  }

  if (first.topHeight - nextFirstTop === last.topHeight - nextLastTop) {
    const delta = nextFirstTop - first.topHeight
    nodes.forEach((node) => {
      node.topHeight += delta
    })
    return
  }

  nodes.forEach((node) => {
    node.topHeight = getArgonHeadingTop(node.element)
  })
}

/**
 * 按滚动位置二分查找当前可见的 Argon 目录节点，空列表返回 null。
 * @param nodes - 待遍历、排序或组装的节点集合。
 * @param start - 开始扫描文本或字节的偏移量。
 * @param end - 目录节点二分查找的右侧索引边界。
 * @param scrollTop - 用于选择当前可见目录节点的页面滚动位置。
 * @returns 滚动位置对应的可见目录节点；空列表时为 null。
 */
function searchArgonCatalogNode(
  nodes: ArgonCatalogNode[],
  start: number,
  end: number,
  scrollTop: number,
): ArgonCatalogNode | null {
  if (nodes.length === 0) {
    return null
  }

  if (end - start <= 1) {
    if (nodes[end]!.topHeight < scrollTop) {
      return nodes[end]!
    }
    return nodes[start]!
  }

  if (start < end) {
    const middleIndex = Math.trunc((start + end) / 2)
    const middleValue = nodes[middleIndex]!.topHeight
    if (scrollTop < middleValue) {
      return searchArgonCatalogNode(nodes, start, middleIndex, scrollTop)
    }
    if (scrollTop > middleValue) {
      return searchArgonCatalogNode(nodes, middleIndex, end, scrollTop)
    }

    return nodes[middleIndex]!
  }

  return nodes[start] ?? null
}

/**
 * 把标题的视口顶部换算为文档坐标，并扣除 Argon 目录激活偏移。
 * @param element - 待读取或更新的 DOM 元素。
 * @returns 扣除目录激活偏移后的标题文档坐标。
 */
function getArgonHeadingTop(element: HTMLElement) {
  return (
    element.getBoundingClientRect().top +
    window.scrollY -
    BLOG_SCROLL_GEOMETRY.catalogActivationOffsetPx
  )
}

/**
 * 在目录根节点中查找 href 精确匹配的直接链接，并返回其 li 父节点；未命中时返回 null。
 * @param catalogRoot - 限制目录项查询范围的目录根元素。
 * @param href - 待规范化或导航的链接地址。
 * @returns 读取到的`CatalogItemByHref`；空值分支返回 null。
 */
function findCatalogItemByHref(catalogRoot: HTMLElement, href: string) {
  const link = Array.from(catalogRoot.querySelectorAll<HTMLAnchorElement>('a.index-link')).find(
    (candidate) => candidate.getAttribute('href') === href,
  )

  if (link?.parentElement instanceof HTMLLIElement) {
    return link.parentElement
  }
  return null
}

/**
 * 仅对目录 ul 添加展开标记，并驱动展开动画；无效节点保持不变。
 * @param list - 待筛选、匹配或汇总的列表。
 */
function openCatalogSublist(list: Element | null) {
  if (!(list instanceof HTMLUListElement)) {
    return
  }

  list.classList.add('open')
  slideCatalogList(list, true)
}

/**
 * 沿当前目录项的父链向上遍历，展开每个 index-subItem-box 祖先列表。
 * @param indexItem - 需要展开祖先目录的当前目录项。
 */
function openAncestorCatalogSublists(indexItem: HTMLLIElement) {
  let currentParent = indexItem.parentElement
  while (currentParent) {
    if (
      currentParent instanceof HTMLUListElement &&
      currentParent.classList.contains('index-subItem-box')
    ) {
      openCatalogSublist(currentParent)
    }
    currentParent = currentParent.parentElement
  }
}

/**
 * 移除目录子列表的展开标记，并驱动收起动画。
 * @param list - 待筛选、匹配或汇总的列表。
 */
function closeCatalogSublist(list: HTMLUListElement) {
  list.classList.remove('open')
  slideCatalogList(list, false)
}

/**
 * 先取消旧动画，再从当前高度平滑展开或折叠目录子列表，结束后清理临时样式。
 * @param list - 待筛选、匹配或汇总的列表。
 * @param shouldOpen - 指示`shouldOpen`是否生效的布尔标志。
 */
function slideCatalogList(list: HTMLUListElement, shouldOpen: boolean) {
  cancelCatalogListSlide(list)
  if (shouldOpen) {
    const startHeight = (() => {
      if (getComputedStyle(list).display === 'none') {
        return 0
      }
      return list.getBoundingClientRect().height
    })()
    list.style.display = 'block'
    const targetHeight = list.scrollHeight
    if (Math.abs(targetHeight - startHeight) < 1) {
      clearCatalogListSlideStyles(list)
      return
    }

    list.style.overflow = 'hidden'
    list.style.height = `${startHeight}px`
    animateCatalogListHeight(list, startHeight, targetHeight, () => {
      if (!list.classList.contains('open')) {
        return
      }
      list.style.display = 'block'
      clearCatalogListSlideStyles(list)
    })
    return
  }

  if (getComputedStyle(list).display === 'none') {
    list.style.display = 'none'
    return
  }

  const startHeight = list.getBoundingClientRect().height || list.scrollHeight
  list.style.height = `${startHeight}px`
  list.style.overflow = 'hidden'
  animateCatalogListHeight(list, startHeight, 0, () => {
    if (list.classList.contains('open')) {
      return
    }
    list.style.display = 'none'
    clearCatalogListSlideStyles(list)
  })
}

/**
 * 取消目录子列表已排队的动画帧与 Web Animation，避免新动画叠加旧状态。
 * @param list - 待筛选、匹配或汇总的列表。
 */
function cancelCatalogListSlide(list: HTMLUListElement) {
  const frame = catalogListSlideFrames.get(list)
  if (frame) {
    cancelBlogFrame(frame)
    catalogListSlideFrames.delete(list)
  }
  list.getAnimations().forEach((animation) => animation.cancel())
}

/**
 * 目录折叠动画结束后把临时高度与溢出样式移除，使列表恢复 CSS 自身布局。
 * @param list - 刚完成展开或收起动画的目录子列表。
 */
function clearCatalogListSlideStyles(list: HTMLUListElement) {
  list.style.height = ''
  list.style.overflow = ''
}

/**
 * 目录高度通过缓出曲线从起点推进到目标值，完成后释放帧记录并执行收尾回调。
 * @param list - 需要执行展开或收起过渡的目录子列表。
 * @param startHeight - 动画开始时的像素高度。
 * @param targetHeight - 动画结束时的像素高度。
 * @param onFinish - 最后一帧写入后执行的样式收尾回调。
 */
function animateCatalogListHeight(
  list: HTMLUListElement,
  startHeight: number,
  targetHeight: number,
  onFinish: () => void,
) {
  const distance = targetHeight - startHeight
  const startTime = performance.now()

  /*
   * @param now Animation timestamp from requestAnimationFrame.
   */
  const tick = (now: number) => {
    const progress = Math.min((now - startTime) / BLOG_ANIMATION_TIMING_MS.catalogNormal, 1)
    list.style.height = `${startHeight + distance * easeOutQuad(progress)}px`
    if (progress < 1) {
      catalogListSlideFrames.set(list, requestBlogFrame(tick))
      return
    }

    catalogListSlideFrames.delete(list)
    onFinish()
  }

  catalogListSlideFrames.set(list, requestBlogFrame(tick))
}

/**
 * 当活动目录项接近滚动容器上下边缘时自动调整视口，鼠标悬停期间保持用户位置。
 * @param indexItem - 需要展开祖先目录的当前目录项。
 * @param indexScrollBox - 承载文章目录并需要同步滚动的容器。
 * @param mouseHovered - 鼠标是否悬停在目录区域，以决定自动滚动是否暂停。
 */
function syncCatalogScroll(
  indexItem: HTMLLIElement,
  indexScrollBox: HTMLElement | null,
  mouseHovered: boolean,
) {
  if (!indexScrollBox || mouseHovered) {
    return
  }

  const itemBox = indexItem.getBoundingClientRect()
  const wrapperBox = indexScrollBox.getBoundingClientRect()
  const relativeOffsetTop = itemBox.top - wrapperBox.top
  const itemHeight = itemBox.height

  if (relativeOffsetTop < BLOG_SCROLL_GEOMETRY.catalogAutoScrollEdgePx + itemHeight) {
    let target =
      indexScrollBox.scrollTop +
      relativeOffsetTop -
      BLOG_SCROLL_GEOMETRY.catalogAutoScrollEdgePx -
      itemHeight
    if (target < BLOG_SCROLL_GEOMETRY.catalogAutoScrollResetPx) {
      target = 0
    }
    animateElementScrollTop(indexScrollBox, target)
  }

  if (relativeOffsetTop > indexScrollBox.clientHeight - BLOG_SCROLL_GEOMETRY.leftbarStickyGapPx) {
    animateElementScrollTop(
      indexScrollBox,
      indexScrollBox.scrollTop +
        relativeOffsetTop -
        indexScrollBox.clientHeight +
        BLOG_SCROLL_GEOMETRY.leftbarStickyGapPx +
        itemHeight,
    )
  }
}

/**
 * 当目录锚点能解析到文章标题时，页面平滑滚动到包含 Argon 顶部补偿的位置。
 * @param href - 以井号开头的文章标题锚点。
 */
function scrollToArgonHeading(href: string) {
  const target = getBlogElementById(href.slice(1))
  if (!target) {
    return
  }

  animateWindowScrollTo(getArgonHeadingTop(target) + BLOG_SCROLL_GEOMETRY.catalogScrollExtraPx)
}

/**
 * 元素滚动通过指数缓出推进到目标位置，新动画开始前会取消该元素的旧帧。
 * @param element - 需要调整 scrollTop 的目录滚动容器。
 * @param targetScrollTop - 过渡结束时的纵向滚动像素值。
 */
function animateElementScrollTop(element: HTMLElement, targetScrollTop: number) {
  const previousFrame = elementScrollFrames.get(element)
  if (previousFrame) {
    cancelBlogFrame(previousFrame)
  }
  const start = element.scrollTop
  const distance = targetScrollTop - start
  const startTime = performance.now()

  /*
   * @param now Animation timestamp from requestAnimationFrame.
   */
  const tick = (now: number) => {
    const progress = Math.min((now - startTime) / BLOG_ANIMATION_TIMING_MS.catalogNormal, 1)
    element.scrollTop = start + distance * easeOutExpo(progress)
    if (progress < 1) {
      elementScrollFrames.set(element, requestBlogFrame(tick))
      return
    }

    elementScrollFrames.delete(element)
  }

  elementScrollFrames.set(element, requestBlogFrame(tick))
}

/**
 * 页面窗口通过指数缓出滚动到目标位置，并保证同一时刻只有一个活动动画帧。
 * @param targetScrollTop - 过渡结束时页面的纵向滚动像素值。
 */
function animateWindowScrollTo(targetScrollTop: number) {
  cancelWindowScrollAnimation()
  const start = window.scrollY
  const distance = targetScrollTop - start
  const startTime = performance.now()

  /*
   * @param now Animation timestamp from requestAnimationFrame.
   */
  const tick = (now: number) => {
    const progress = Math.min((now - startTime) / BLOG_ANIMATION_TIMING_MS.catalogNormal, 1)
    window.scrollTo(0, start + distance * easeOutExpo(progress))
    if (progress < 1) {
      windowScrollFrame = requestBlogFrame(tick)
      return
    }

    windowScrollFrame = 0
  }

  windowScrollFrame = requestBlogFrame(tick)
}

/**
 * 取消当前窗口滚动动画帧，并清空活动帧标识。
 */
function cancelWindowScrollAnimation() {
  if (!windowScrollFrame) {
    return
  }

  cancelBlogFrame(windowScrollFrame)
  windowScrollFrame = 0
}
