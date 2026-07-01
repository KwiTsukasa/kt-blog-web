import { computed, onBeforeUnmount, onMounted, type PropType, watch } from 'vue';
import { defineComponent, ref } from 'vue';

import { blogDomId, createBlogElementRef } from '@/factories/blogDomFactory';
import { type BlogTaxonomyModal, useBlogEventBus } from '@/hooks/useBlogEventBus';
import { useBlogArticles } from '@/hooks/useBlogArticles';
import { useArgonEffects } from '@/hooks/useArgonEffects';
import { useBlogTheme } from '@/hooks/useBlogTheme';

import BlogFloatActions from './BlogFloatActions';
import BlogHeader from './BlogHeader';
import BlogLive2D from './BlogLive2D';
import BlogRightbar from './BlogRightbar';
import BlogSearchModal from './BlogSearchModal';
import BlogSidebar from './BlogSidebar';
import BlogTaxonomyModals from './BlogTaxonomyModals';
import PageInfoCard from './PageInfoCard';

export default defineComponent({
  name: 'BlogLayout',
  props: {
    pageTitle: {
      type: String,
      default: '',
    },
    pageDescription: {
      type: String,
      default: '',
    },
    pageMeta: {
      type: String,
      default: '',
    },
    mainClass: {
      type: String as PropType<string>,
      default: 'kt-blog__main--article-list kt-blog__main--home',
    },
    showPageInfo: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots }) {
    const activeModal = ref<BlogTaxonomyModal | null>(null);
    const mobileSidebarOpen = ref(false);
    const searchOpen = ref(false);
    const toolbarRef = createBlogElementRef<HTMLElement>();
    const bannerContainerRef = createBlogElementRef<HTMLElement>();
    const contentRef = createBlogElementRef<HTMLElement>();
    const leftbarPart1Ref = createBlogElementRef<HTMLElement>();
    const leftbarPart2Ref = createBlogElementRef<HTMLElement>();
    const eventBus = useBlogEventBus();
    const { articles, categories, tags } = useBlogArticles();
    const { siteConfig } = useBlogTheme();
    const documentTitle = computed(() =>
      props.pageTitle ? `${props.pageTitle} – ${siteConfig.value.title}` : siteConfig.value.title,
    );

    useArgonEffects({
      bannerContainerRef,
      contentRef,
      leftbarPart1Ref,
      leftbarPart2Ref,
      toolbarRef,
    });

    /**
     * @param modal 分类或标签弹窗类型，由 mitt 事件总线下发。
     */
    const openTaxonomyModal = (modal: BlogTaxonomyModal) => {
      activeModal.value = modal;
    };

    /**
     * 打开全局搜索弹窗，响应移动端搜索按钮或其他 Argon 入口事件。
     */
    const openSearchModal = () => {
      searchOpen.value = true;
    };

    /**
     * Toggles the mobile leftbar state and mirrors Argon's `html.leftbar-opened` class.
     */
    const toggleMobileSidebar = () => {
      mobileSidebarOpen.value = !mobileSidebarOpen.value;
    };

    /**
     * Closes the mobile leftbar when the mask is clicked.
     */
    const closeMobileSidebar = () => {
      mobileSidebarOpen.value = false;
    };

    onMounted(() => {
      eventBus.on('blog:search:open', openSearchModal);
      eventBus.on('blog:taxonomy:open', openTaxonomyModal);
    });

    watch(
      documentTitle,
      (title) => {
        document.title = title;
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      eventBus.off('blog:search:open', openSearchModal);
      eventBus.off('blog:taxonomy:open', openTaxonomyModal);
      document.documentElement.classList.remove('leftbar-opened');
    });

    watch(
      mobileSidebarOpen,
      (isOpen) => {
        document.documentElement.classList.toggle('leftbar-opened', isOpen);
      },
      { immediate: true },
    );

    return () => (
      <>
        <BlogHeader
          toolbarRef={toolbarRef}
          mobileSidebarOpen={mobileSidebarOpen.value}
          onToggleMobileSidebar={toggleMobileSidebar}
        />
        <BlogSearchModal
          open={searchOpen.value}
          onClose={() => {
            searchOpen.value = false;
          }}
        />
        <BlogTaxonomyModals
          active={activeModal.value}
          categories={categories.value}
          tags={tags.value}
          onClose={() => {
            activeModal.value = null;
          }}
        />

        <section id={blogDomId('banner')} class="kt-blog__banner banner section section-lg section-shaped">
          <div class="shape shape-primary" aria-hidden="true" />
          <div
            ref={bannerContainerRef}
            id={blogDomId('bannerContainer')}
            class="kt-blog__banner-container banner-container container text-center"
            aria-hidden="true"
          />
        </section>

        <BlogFloatActions />
        <BlogLive2D />

        <div id={blogDomId('content')} ref={contentRef} class="kt-blog__content site-content">
          {props.showPageInfo && slots.pageInfo ? (
            slots.pageInfo()
          ) : props.showPageInfo && props.pageTitle ? (
            <PageInfoCard
              title={props.pageTitle}
              description={props.pageDescription}
              meta={props.pageMeta}
            />
          ) : null}

          <div id={blogDomId('sidebarMask')} class="kt-blog__sidebar-mask" onClick={closeMobileSidebar} />
          <BlogSidebar
            categories={categories.value}
            tags={tags.value}
            articles={articles.value}
            part1Ref={leftbarPart1Ref}
            part2Ref={leftbarPart2Ref}
          />
          <BlogRightbar articles={articles.value} categories={categories.value} />

          <div id={blogDomId('primary')} class="kt-blog__primary content-area">
            <main id={blogDomId('main')} class={['kt-blog__main site-main', props.mainClass]} role="main">
              {slots.default?.()}
              <footer id={blogDomId('footer')} class="kt-blog__footer kt-blog__card site-footer card shadow-sm border-0">
                <div class="kt-blog__footer-info">Theme Argon By solstice23</div>
              </footer>
            </main>
          </div>
        </div>
      </>
    );
  },
});
