import { SearchOutlined } from '@antdv-next/icons';
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
} from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import { getArticleCatalogHeadings, type BlogArticle, type BlogCategory, type BlogTag } from '@/data/blog';
import {
  BLOG_ANIMATION_TIMING_MS,
  BLOG_SCROLL_GEOMETRY,
  cancelBlogFrame,
  clearBlogDelay,
  easeOutExpo,
  easeOutQuad,
  requestBlogFrame,
  runAfterBlogDelay,
} from '@/factories/blogAnimationFactory';
import {
  blogDomAnchor,
  blogDomAnchorFromId,
  blogDomId,
  blogGeneratedHeadingId,
  createBlogElementRef,
  createBlogFocusableRef,
  getBlogElementById,
  toBlogHTMLElement,
} from '@/factories/blogDomFactory';
import { useBlogDomRefs } from '@/hooks/useBlogDomRefs';
import { useBlogEventBus } from '@/hooks/useBlogEventBus';
import { useBlogTheme } from '@/hooks/useBlogTheme';

import { BlogButton, BlogInput } from './antdvComponents';

interface ArgonCatalogNode {
  children: ArgonCatalogNode[];
  element: HTMLHeadingElement;
  level: number;
  parent: ArgonCatalogNode | null;
  topHeight: number;
}

const catalogListSlideFrames = new WeakMap<HTMLUListElement, number>();
const elementScrollFrames = new WeakMap<HTMLElement, number>();
let windowScrollFrame = 0;

type SidebarTabKey = 'catalog' | 'overview';

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
    const route = useRoute();
    const router = useRouter();
    const eventBus = useBlogEventBus();
    const { postContentRef } = useBlogDomRefs();
    const { siteConfig } = useBlogTheme();
    const activeTab = ref<SidebarTabKey>('catalog');
    const visiblePaneTab = ref<SidebarTabKey>('catalog');
    const shownPaneTab = ref<SidebarTabKey | null>('catalog');
    const keyword = ref('');
    const leftbarSearchOpen = ref(false);
    const leftbarSearchInputRef = createBlogFocusableRef<any>();
    const catalogRef = createBlogElementRef<HTMLElement>();
    const currentArticle = computed(() => props.articles.find((item) => item.slug === String(route.params.slug ?? '')));
    const shouldShowPostCatalogTabs = computed(
      () => route.name === 'BlogPost' && getArticleCatalogHeadings(currentArticle.value).length > 0,
    );
    let catalogGeneration = 0;
    let cleanupCatalog: (() => void) | null = null;
    let tabFadeFrame = 0;

    /**
     * Cancels a queued tab fade frame when the route changes or the sidebar unmounts.
     */
    const cancelTabFadeFrame = () => {
      if (!tabFadeFrame) {
        return;
      }

      cancelBlogFrame(tabFadeFrame);
      tabFadeFrame = 0;
    };

    /**
     * Switches tab panes without animation for route resets where Argon lands directly on the default tab.
     *
     * @param tab Tab pane that should be displayed and fully shown immediately.
     */
    const setSidebarTabImmediately = (tab: SidebarTabKey) => {
      cancelTabFadeFrame();
      activeTab.value = tab;
      visiblePaneTab.value = tab;
      shownPaneTab.value = tab;
    };

    /**
     * Switches tab panes with Bootstrap's fade timing: display the pane first, then add `show` next frame.
     *
     * @param tab Tab pane requested by the user through the Argon-compatible tab controls.
     */
    const activateSidebarTabWithFade = (tab: SidebarTabKey) => {
      if (activeTab.value === tab && visiblePaneTab.value === tab && shownPaneTab.value === tab) {
        return;
      }

      cancelTabFadeFrame();
      activeTab.value = tab;
      visiblePaneTab.value = tab;
      shownPaneTab.value = null;
      tabFadeFrame = requestBlogFrame(() => {
        tabFadeFrame = 0;
        shownPaneTab.value = tab;
      });
    };

    /**
     * Restores Argon's post sidebar default: post pages open on catalog, non-post pages keep overview.
     *
     * @param hasCatalog Whether the current route renders a single post with heading anchors.
     */
    const resetSidebarTabForRoute = (hasCatalog: boolean) => {
      setSidebarTabImmediately(hasCatalog ? 'catalog' : 'overview');
    };

    /**
     * Activates the post catalog tab without letting Argon's hash-like tab anchor change the current route.
     *
     * @param event Browser click event emitted by the tab control; prevented because tab state is Vue-owned.
     */
    const showCatalogTab = (event: MouseEvent) => {
      event.preventDefault();
      activateSidebarTabWithFade('catalog');
    };

    /**
     * Activates the site overview tab without turning the Bootstrap-compatible href into navigation.
     *
     * @param event Browser click event emitted by the tab control; prevented because tab state is Vue-owned.
     */
    const showOverviewTab = (event: MouseEvent) => {
      event.preventDefault();
      activateSidebarTabWithFade('overview');
    };

    /**
     * Registers the catalog root so the Argon headIndex-compatible runtime can render into the leftbar container.
     *
     * @param target Catalog root element from Vue's ref callback; null when unmounted.
     */
    const registerCatalogRef = (target: Element | ComponentPublicInstance | null) => {
      catalogRef.value = toBlogHTMLElement(target);
    };

    /**
     * Destroys the current catalog runtime and clears generated DOM so stale post headings cannot leak routes.
     */
    const destroyArgonCatalog = () => {
      catalogGeneration += 1;
      cleanupCatalog?.();
      cleanupCatalog = null;
      if (catalogRef.value) {
        catalogRef.value.innerHTML = '';
      }
    };

    /**
     * Rebuilds the catalog from real post headings after Vue has rendered the post body.
     *
     * @param hasCatalog Whether the current route should expose Argon's post catalog tab.
     */
    const rebuildArgonCatalog = (hasCatalog: boolean) => {
      const generation = catalogGeneration + 1;
      catalogGeneration = generation;
      cleanupCatalog?.();
      cleanupCatalog = null;
      if (catalogRef.value) {
        catalogRef.value.innerHTML = '';
      }
      if (!hasCatalog) {
        return;
      }

      nextTick(() => {
        if (generation !== catalogGeneration || !catalogRef.value || !postContentRef.value || !shouldShowPostCatalogTabs.value) {
          return;
        }

        cleanupCatalog = mountArgonHeadIndex(catalogRef.value, postContentRef.value, props.part2Ref.value);
      });
    };

    watch(
      [shouldShowPostCatalogTabs, () => currentArticle.value?.id, () => currentArticle.value?.contentHtml, postContentRef],
      ([hasCatalog]) => {
        resetSidebarTabForRoute(hasCatalog);
        rebuildArgonCatalog(hasCatalog);
      },
      { flush: 'post', immediate: true },
    );

    onBeforeUnmount(() => {
      cancelTabFadeFrame();
      destroyArgonCatalog();
    });

    /**
     * @param target antdv-next Input 组件实例或原生 input 节点。
     */
    const focusInput = (target: any) => {
      target?.focus?.();
      target?.input?.focus?.();
    };

    /**
     * 使用左栏搜索框内容进入本地搜索结果页，对齐 WordPress `?s=` 的用户路径。
     */
    const submitSearch = () => {
      const query = keyword.value.trim();
      if (!query) {
        return;
      }

      router.push({
        name: 'BlogSearch',
        query: { q: query },
      });
    };

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
              <li
                key={item.label}
                class="kt-blog__sidebar-menu-item leftbar-menu-item"
              >
                {item.external ? (
                  <a href={item.href}>
                    <i
                      aria-hidden="true"
                      class={['kt-blog__sidebar-menu-icon', 'fa-solid', item.icon || 'fa-circle']}
                      data-icon={item.icon || 'fa-circle'}
                    />
                    {item.label}
                  </a>
                ) : (
                  <RouterLink activeClass="" exactActiveClass="" to={item.href}>
                    <i
                      aria-hidden="true"
                      class={['kt-blog__sidebar-menu-icon', 'fa-solid', item.icon || 'fa-circle']}
                      data-icon={item.icon || 'fa-circle'}
                    />
                    {item.label}
                  </RouterLink>
                )}
              </li>
            ))}
          </ul>

          <div class={['kt-blog__sidebar-search kt-blog__card-body', leftbarSearchOpen.value && 'kt-blog__sidebar-search--open']}>
            <BlogButton
              id={blogDomId('leftbarSearchContainer')}
              class="kt-blog__sidebar-search-trigger kt-blog__button kt-blog__button--secondary kt-blog__button--small kt-blog__button--block"
              onClick={() => {
                leftbarSearchOpen.value = true;
                nextTick(() => focusInput(leftbarSearchInputRef.value));
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
                leftbarSearchOpen.value = false;
              }}
              onKeydown={(event: KeyboardEvent) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  submitSearch();
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
          <div id={blogDomId('leftbarPart2Inner')} class="kt-blog__sidebar-overview kt-blog__card-body card-body">
            <div class={['kt-blog__sidebar-tabs nav-wrapper', !shouldShowPostCatalogTabs.value && 'kt-blog__sidebar-tabs--single']}>
              <ul class="kt-blog__sidebar-tab-list nav nav-pills nav-fill" role="tablist">
                {shouldShowPostCatalogTabs.value ? (
                  <li class="kt-blog__sidebar-tab-item nav-item sidebar-tab-switcher">
                    <BlogButton
                      id={blogDomId('leftbarCatalogTabButton')}
                      class={[
                        'kt-blog__sidebar-tab',
                        activeTab.value === 'catalog' && 'kt-blog__sidebar-tab--active active show',
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
                ) : null}
                <li class="kt-blog__sidebar-tab-item nav-item sidebar-tab-switcher">
                  <BlogButton
                    id={blogDomId('leftbarOverviewTabButton')}
                    class={[
                      'kt-blog__sidebar-tab',
                      (!shouldShowPostCatalogTabs.value || activeTab.value === 'overview') &&
                        'kt-blog__sidebar-tab--active active show',
                    ]}
                    aria-controls={blogDomId('leftbarOverviewTab')}
                    aria-selected={String(!shouldShowPostCatalogTabs.value || activeTab.value === 'overview')}
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
                {shouldShowPostCatalogTabs.value ? (
                  <div
                    id={blogDomId('leftbarCatalogTab')}
                    class={[
                      'kt-blog__sidebar-overview-panel kt-blog__sidebar-catalog-panel tab-pane fade',
                      visiblePaneTab.value === 'catalog' && 'active',
                      shownPaneTab.value === 'catalog' && 'show',
                    ]}
                    role="tabpanel"
                  >
                    <div id={blogDomId('leftbarCatalog')} ref={registerCatalogRef} class="kt-blog__sidebar-catalog" />
                  </div>
                ) : null}
                <div
                  id={blogDomId('leftbarOverviewTab')}
                  class={[
                    'kt-blog__sidebar-overview-panel tab-pane fade text-center',
                    (!shouldShowPostCatalogTabs.value || visiblePaneTab.value === 'overview') && 'active',
                    (!shouldShowPostCatalogTabs.value || shownPaneTab.value === 'overview') && 'show',
                  ]}
                  role="tabpanel"
                >
                  <div class="kt-blog__sidebar-author-image">
                    <div id={blogDomId('leftbarOverviewAuthorImage')} class="kt-blog__sidebar-author-avatar rounded-circle shadow-sm" />
                  </div>
                  <h6 id={blogDomId('leftbarOverviewAuthorName')} class="kt-blog__sidebar-author-name">{siteConfig.value.authorName}</h6>
                  <nav class="kt-blog__site-stats site-state">
                    <div class="kt-blog__site-stats-item kt-blog__site-stats-item--posts site-state-item site-state-posts">
                      <a>
                        <span class="kt-blog__site-stats-count site-state-item-count">{props.articles.length}</span>{' '}
                        <span class="kt-blog__site-stats-name site-state-item-name">文章</span>
                      </a>
                    </div>
                    <div class="kt-blog__site-stats-item kt-blog__site-stats-item--categories site-state-item site-state-categories">
                      <a
                        data-argon-taxonomy="categories"
                        onClick={() => eventBus.emit('blog:taxonomy:open', 'categories')}
                      >
                        <span class="kt-blog__site-stats-count site-state-item-count">{props.categories.length}</span>{' '}
                        <span class="kt-blog__site-stats-name site-state-item-name">分类</span>
                      </a>
                    </div>
                    <div class="kt-blog__site-stats-item kt-blog__site-stats-item--tags site-state-item site-state-tags">
                      <a data-argon-taxonomy="tags" onClick={() => eventBus.emit('blog:taxonomy:open', 'tags')}>
                        <span class="kt-blog__site-stats-count site-state-item-count">{props.tags.length}</span>{' '}
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
    );
  },
});

/**
 * Mounts an Argon `headIndex` compatible catalog runtime for one article page.
 *
 * @param catalogRoot Leftbar catalog root that receives generated index HTML.
 * @param articleRoot Rendered `#post_content` element containing real WordPress headings.
 * @param indexScrollBox Scrollable leftbar panel used when the active catalog item leaves view.
 * @returns Cleanup callback that removes event listeners, timers, animations, and generated DOM ownership.
 */
function mountArgonHeadIndex(catalogRoot: HTMLElement, articleRoot: HTMLElement, indexScrollBox: HTMLElement | null) {
  const nodes = collectArgonCatalogNodes(articleRoot);
  let manual = false;
  let manualTimer: number | null = null;
  let mouseHovered = false;

  if (nodes.length === 0) {
    return () => undefined;
  }

  catalogRoot.replaceChildren(renderArgonCatalog(nodes));

  /**
   * @param indexItem Catalog list item that should become active.
   */
  const setCurrent = (indexItem: HTMLLIElement | null) => {
    if (!indexItem || indexItem.classList.contains('current')) {
      return;
    }

    catalogRoot.querySelectorAll('li.current').forEach((item) => item.classList.remove('current'));
    catalogRoot.querySelectorAll('ul.open').forEach((list) => list.classList.remove('open'));
    openCatalogSublist(indexItem.querySelector(':scope > .index-subItem-box'));
    openAncestorCatalogSublists(indexItem);
    catalogRoot
      .querySelectorAll<HTMLUListElement>('ul.index-subItem-box')
      .forEach((list) => {
        if (!list.classList.contains('open')) {
          closeCatalogSublist(list);
        }
      });

    indexItem.classList.add('current');
    syncCatalogScroll(indexItem, indexScrollBox, mouseHovered);
  };

  /**
   * Updates the current catalog item from the current document scroll position.
   */
  const updateCurrentFromScroll = () => {
    if (manual) {
      return;
    }

    updateArgonNodeTopHeights(nodes);
    const currentNode = searchArgonCatalogNode(nodes, 0, nodes.length - 1, window.scrollY);
    if (!currentNode) {
      return;
    }

    setCurrent(findCatalogItemByHref(catalogRoot, blogDomAnchorFromId(currentNode.element.id)));
  };

  /**
   * @param event Delegated click event from the catalog root.
   */
  const handleCatalogClick = (event: MouseEvent) => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a.index-link') : null;
    if (!link || !catalogRoot.contains(link)) {
      return;
    }

    event.preventDefault();
    manual = true;
    if (manualTimer) {
      clearBlogDelay(manualTimer);
    }
    manualTimer = runAfterBlogDelay(() => {
      manual = false;
      manualTimer = null;
    }, BLOG_ANIMATION_TIMING_MS.catalogManualLock);
    setCurrent(link.parentElement as HTMLLIElement | null);
    scrollToArgonHeading(link.hash);
  };

  /**
   * Keeps Argon's hover guard: user-hovered catalog panels do not auto-scroll the side panel.
   */
  const handleMouseEnter = () => {
    mouseHovered = true;
  };

  /**
   * Releases Argon's hover guard after the pointer leaves the scrollable leftbar panel.
   */
  const handleMouseLeave = () => {
    mouseHovered = false;
  };

  catalogRoot.addEventListener('click', handleCatalogClick);
  indexScrollBox?.addEventListener('mouseenter', handleMouseEnter);
  indexScrollBox?.addEventListener('mouseleave', handleMouseLeave);
  window.addEventListener('scroll', updateCurrentFromScroll, { passive: true });
  updateCurrentFromScroll();

  return () => {
    if (manualTimer) {
      clearBlogDelay(manualTimer);
    }
    cancelWindowScrollAnimation();
    catalogRoot.removeEventListener('click', handleCatalogClick);
    indexScrollBox?.removeEventListener('mouseenter', handleMouseEnter);
    indexScrollBox?.removeEventListener('mouseleave', handleMouseLeave);
    window.removeEventListener('scroll', updateCurrentFromScroll);
  };
}

/**
 * @param articleRoot Rendered WordPress post body whose headings need indexing.
 * @returns Heading nodes with Argon's generated id, heading level, and cached top height.
 */
function collectArgonCatalogNodes(articleRoot: HTMLElement) {
  return Array.from(articleRoot.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6')).map((element, index) => {
    if (!element.id) {
      element.id = blogGeneratedHeadingId(index + 1);
    }

    return {
      children: [],
      element,
      level: Number(element.tagName.charAt(1)),
      parent: null,
      topHeight: getArgonHeadingTop(element),
    } satisfies ArgonCatalogNode;
  });
}

/**
 * @param nodes Flat heading node list in document order.
 * @returns Root `ul` matching the exact Argon catalog DOM shape.
 */
const renderArgonCatalog = (nodes: ArgonCatalogNode[]) => {
  const root = document.createElement('ul');
  buildArgonCatalogTree(nodes).forEach((node) => {
    root.append(renderArgonCatalogItem(node));
  });

  return root;
};

/**
 * @param node Catalog tree node that maps to one article heading.
 * @returns Argon-compatible list item with nested sub-item boxes.
 */
const renderArgonCatalogItem = (node: ArgonCatalogNode) => {
  const item = document.createElement('li');
  const link = document.createElement('a');

  item.className = 'index-item';
  link.className = 'index-link';
  link.href = blogDomAnchorFromId(node.element.id);
  link.setAttribute('no-pjax', '');
  link.textContent = node.element.innerText || node.element.textContent || '';
  item.append(link);

  if (node.children.length > 0) {
    const childList = document.createElement('ul');
    childList.className = 'index-subItem-box';
    childList.style.display = 'none';
    node.children.forEach((child) => childList.append(renderArgonCatalogItem(child)));
    item.append(childList);
  }

  return item;
};

/**
 * @param nodes Flat heading node list in document order.
 * @returns Nested tree using the same heading-level parent rules as Argon's `headIndex`.
 */
function buildArgonCatalogTree(nodes: ArgonCatalogNode[]) {
  let current: ArgonCatalogNode | null = null;
  const tree: ArgonCatalogNode[] = [];

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index]!;
    node.children = [];
    node.parent = null;

    if (current === null) {
      tree.push(node);
      current = node;
      continue;
    }

    if (current.level < node.level) {
      node.parent = current;
      current.children.push(node);
      current = node;
      continue;
    }

    if (current.level === node.level) {
      node.parent = current.parent;
      (current.parent?.children ?? tree).push(node);
      current = node;
      continue;
    }

    while (current !== null && current.level > node.level) {
      current = current.parent;
    }
    if (current === null) {
      tree.push(node);
      current = node;
      continue;
    }
    index -= 1;
  }

  return tree;
}

/**
 * @param nodes Flat heading node list with cached top heights.
 */
function updateArgonNodeTopHeights(nodes: ArgonCatalogNode[]) {
  if (nodes.length === 0) {
    return;
  }

  const first = nodes[0]!;
  const last = nodes[nodes.length - 1]!;
  const nextFirstTop = getArgonHeadingTop(first.element);
  const nextLastTop = getArgonHeadingTop(last.element);
  if (first.topHeight === nextFirstTop && last.topHeight === nextLastTop) {
    return;
  }

  if (first.topHeight - nextFirstTop === last.topHeight - nextLastTop) {
    const delta = nextFirstTop - first.topHeight;
    nodes.forEach((node) => {
      node.topHeight += delta;
    });
    return;
  }

  nodes.forEach((node) => {
    node.topHeight = getArgonHeadingTop(node.element);
  });
}

/**
 * @param nodes Flat heading node list.
 * @param start Left bound for Argon's binary search.
 * @param end Right bound for Argon's binary search.
 * @param scrollTop Current document scroll top.
 * @returns Heading node that should be marked current.
 */
function searchArgonCatalogNode(nodes: ArgonCatalogNode[], start: number, end: number, scrollTop: number): ArgonCatalogNode | null {
  if (nodes.length === 0) {
    return null;
  }

  if (end - start <= 1) {
    return nodes[end]!.topHeight < scrollTop ? nodes[end]! : nodes[start]!;
  }

  if (start < end) {
    const middleIndex = Math.trunc((start + end) / 2);
    const middleValue = nodes[middleIndex]!.topHeight;
    if (scrollTop < middleValue) {
      return searchArgonCatalogNode(nodes, start, middleIndex, scrollTop);
    }
    if (scrollTop > middleValue) {
      return searchArgonCatalogNode(nodes, middleIndex, end, scrollTop);
    }

    return nodes[middleIndex]!;
  }

  return nodes[start] ?? null;
}

/**
 * @param element Heading element whose top position should match Argon's configured catalog activation offset.
 * @returns Top position in document coordinates minus the Argon catalog offset.
 */
function getArgonHeadingTop(element: HTMLElement) {
  return element.getBoundingClientRect().top + window.scrollY - BLOG_SCROLL_GEOMETRY.catalogActivationOffsetPx;
}

/**
 * @param catalogRoot Catalog root that owns all generated links.
 * @param href Heading href to find without depending on CSS escaping support.
 * @returns Catalog list item for the heading href.
 */
function findCatalogItemByHref(catalogRoot: HTMLElement, href: string) {
  const link = Array.from(catalogRoot.querySelectorAll<HTMLAnchorElement>('a.index-link')).find(
    (candidate) => candidate.getAttribute('href') === href,
  );

  return link?.parentElement instanceof HTMLLIElement ? link.parentElement : null;
}

/**
 * @param list Child catalog list that should become visible.
 */
function openCatalogSublist(list: Element | null) {
  if (!(list instanceof HTMLUListElement)) {
    return;
  }

  list.classList.add('open');
  slideCatalogList(list, true);
}

/**
 * @param indexItem Catalog item whose ancestor `index-subItem-box` lists should stay visible.
 */
function openAncestorCatalogSublists(indexItem: HTMLLIElement) {
  let currentParent = indexItem.parentElement;
  while (currentParent) {
    if (currentParent instanceof HTMLUListElement && currentParent.classList.contains('index-subItem-box')) {
      openCatalogSublist(currentParent);
    }
    currentParent = currentParent.parentElement;
  }
}

/**
 * @param list Child catalog list that should be hidden.
 */
function closeCatalogSublist(list: HTMLUListElement) {
  list.classList.remove('open');
  slideCatalogList(list, false);
}

/**
 * @param list Catalog child list to show or hide.
 * @param shouldOpen Whether the list should end as `display: block`.
 */
function slideCatalogList(list: HTMLUListElement, shouldOpen: boolean) {
  cancelCatalogListSlide(list);
  if (shouldOpen) {
    const startHeight = getComputedStyle(list).display === 'none' ? 0 : list.getBoundingClientRect().height;
    list.style.display = 'block';
    const targetHeight = list.scrollHeight;
    if (Math.abs(targetHeight - startHeight) < 1) {
      clearCatalogListSlideStyles(list);
      return;
    }

    list.style.overflow = 'hidden';
    list.style.height = `${startHeight}px`;
    animateCatalogListHeight(list, startHeight, targetHeight, () => {
      if (!list.classList.contains('open')) {
        return;
      }
      list.style.display = 'block';
      clearCatalogListSlideStyles(list);
    });
    return;
  }

  if (getComputedStyle(list).display === 'none') {
    list.style.display = 'none';
    return;
  }

  const startHeight = list.getBoundingClientRect().height || list.scrollHeight;
  list.style.height = `${startHeight}px`;
  list.style.overflow = 'hidden';
  animateCatalogListHeight(list, startHeight, 0, () => {
    if (list.classList.contains('open')) {
      return;
    }
    list.style.display = 'none';
    clearCatalogListSlideStyles(list);
  });
}

/**
 * @param list Catalog child list whose queued slide animation should stop like jQuery `.stop()`.
 */
function cancelCatalogListSlide(list: HTMLUListElement) {
  const frame = catalogListSlideFrames.get(list);
  if (frame) {
    cancelBlogFrame(frame);
    catalogListSlideFrames.delete(list);
  }
  list.getAnimations().forEach((animation) => animation.cancel());
}

/**
 * @param list Catalog child list whose transient slide styles should be cleared after an Argon slide finishes.
 */
function clearCatalogListSlideStyles(list: HTMLUListElement) {
  list.style.height = '';
  list.style.overflow = '';
}

/**
 * @param list Catalog child list being animated by a jQuery `slideDown/slideUp` equivalent.
 * @param startHeight Current visible height in pixels.
 * @param targetHeight Final visible height in pixels.
 * @param onFinish Guarded completion callback that applies final display state.
 */
function animateCatalogListHeight(list: HTMLUListElement, startHeight: number, targetHeight: number, onFinish: () => void) {
  const distance = targetHeight - startHeight;
  const startTime = performance.now();

  /**
   * @param now Animation timestamp from requestAnimationFrame.
   */
  const tick = (now: number) => {
    const progress = Math.min((now - startTime) / BLOG_ANIMATION_TIMING_MS.catalogNormal, 1);
    list.style.height = `${startHeight + distance * easeOutQuad(progress)}px`;
    if (progress < 1) {
      catalogListSlideFrames.set(list, requestBlogFrame(tick));
      return;
    }

    catalogListSlideFrames.delete(list);
    onFinish();
  };

  catalogListSlideFrames.set(list, requestBlogFrame(tick));
}

/**
 * @param indexItem Current catalog item.
 * @param indexScrollBox Scrollable leftbar panel that may need auto-scrolling.
 * @param mouseHovered Whether the user is manually hovering the sidebar.
 */
function syncCatalogScroll(indexItem: HTMLLIElement, indexScrollBox: HTMLElement | null, mouseHovered: boolean) {
  if (!indexScrollBox || mouseHovered) {
    return;
  }

  const itemBox = indexItem.getBoundingClientRect();
  const wrapperBox = indexScrollBox.getBoundingClientRect();
  const relativeOffsetTop = itemBox.top - wrapperBox.top;
  const itemHeight = itemBox.height;

  if (relativeOffsetTop < BLOG_SCROLL_GEOMETRY.catalogAutoScrollEdgePx + itemHeight) {
    let target = indexScrollBox.scrollTop + relativeOffsetTop - BLOG_SCROLL_GEOMETRY.catalogAutoScrollEdgePx - itemHeight;
    if (target < BLOG_SCROLL_GEOMETRY.catalogAutoScrollResetPx) {
      target = 0;
    }
    animateElementScrollTop(indexScrollBox, target);
  }

  if (relativeOffsetTop > indexScrollBox.clientHeight - BLOG_SCROLL_GEOMETRY.leftbarStickyGapPx) {
    animateElementScrollTop(
      indexScrollBox,
      indexScrollBox.scrollTop + relativeOffsetTop - indexScrollBox.clientHeight + BLOG_SCROLL_GEOMETRY.leftbarStickyGapPx + itemHeight,
    );
  }
}

/**
 * @param href Heading hash from a catalog link.
 */
function scrollToArgonHeading(href: string) {
  const target = getBlogElementById(href.slice(1));
  if (!target) {
    return;
  }

  animateWindowScrollTo(getArgonHeadingTop(target) + BLOG_SCROLL_GEOMETRY.catalogScrollExtraPx);
}

/**
 * @param element Scrollable element to animate.
 * @param targetScrollTop Target scrollTop value.
 */
function animateElementScrollTop(element: HTMLElement, targetScrollTop: number) {
  const previousFrame = elementScrollFrames.get(element);
  if (previousFrame) {
    cancelBlogFrame(previousFrame);
  }
  const start = element.scrollTop;
  const distance = targetScrollTop - start;
  const startTime = performance.now();

  /**
   * @param now Animation timestamp from requestAnimationFrame.
   */
  const tick = (now: number) => {
    const progress = Math.min((now - startTime) / BLOG_ANIMATION_TIMING_MS.catalogNormal, 1);
    element.scrollTop = start + distance * easeOutExpo(progress);
    if (progress < 1) {
      elementScrollFrames.set(element, requestBlogFrame(tick));
      return;
    }

    elementScrollFrames.delete(element);
  };

  elementScrollFrames.set(element, requestBlogFrame(tick));
}

/**
 * @param targetScrollTop Document scroll top value.
 */
function animateWindowScrollTo(targetScrollTop: number) {
  cancelWindowScrollAnimation();
  const start = window.scrollY;
  const distance = targetScrollTop - start;
  const startTime = performance.now();

  /**
   * @param now Animation timestamp from requestAnimationFrame.
   */
  const tick = (now: number) => {
    const progress = Math.min((now - startTime) / BLOG_ANIMATION_TIMING_MS.catalogNormal, 1);
    window.scrollTo(0, start + distance * easeOutExpo(progress));
    if (progress < 1) {
      windowScrollFrame = requestBlogFrame(tick);
      return;
    }

    windowScrollFrame = 0;
  };

  windowScrollFrame = requestBlogFrame(tick);
}

/**
 * Cancels the active document scroll animation so repeated catalog clicks behave like jQuery `.stop().animate()`.
 */
function cancelWindowScrollAnimation() {
  if (!windowScrollFrame) {
    return;
  }

  cancelBlogFrame(windowScrollFrame);
  windowScrollFrame = 0;
}
