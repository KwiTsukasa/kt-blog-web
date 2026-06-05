import { onBeforeUnmount, onMounted, type PropType, watch } from 'vue';
import { defineComponent, ref } from 'vue';

import { type BlogTaxonomyModal, useBlogEventBus } from '@/hooks/useBlogEventBus';
import { useBlogArticles } from '@/hooks/useBlogArticles';
import { useArgonEffects } from '@/hooks/useArgonEffects';
import { useBlogTheme } from '@/hooks/useBlogTheme';

import BlogFloatActions from './BlogFloatActions';
import BlogHeader from './BlogHeader';
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
    const searchOpen = ref(false);
    const toolbarRef = ref<HTMLElement | null>(null);
    const bannerContainerRef = ref<HTMLElement | null>(null);
    const contentRef = ref<HTMLElement | null>(null);
    const leftbarPart1Ref = ref<HTMLElement | null>(null);
    const leftbarPart2Ref = ref<HTMLElement | null>(null);
    const eventBus = useBlogEventBus();
    const { articles, categories, tags } = useBlogArticles();
    const { siteConfig } = useBlogTheme();

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

    const openSearchModal = () => {
      searchOpen.value = true;
    };

    onMounted(() => {
      eventBus.on('blog:search:open', openSearchModal);
      eventBus.on('blog:taxonomy:open', openTaxonomyModal);
    });

    watch(
      () => siteConfig.value.title,
      (title) => {
        document.title = title;
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      eventBus.off('blog:search:open', openSearchModal);
      eventBus.off('blog:taxonomy:open', openTaxonomyModal);
    });

    return () => (
      <>
        <BlogHeader toolbarRef={toolbarRef} />
        <BlogSearchModal
          open={searchOpen.value}
          onClose={() => {
            searchOpen.value = false;
          }}
        />

        <section class="kt-blog__banner">
          <div
            ref={bannerContainerRef}
            class="kt-blog__banner-container"
            aria-hidden="true"
          />
        </section>

        <BlogFloatActions />

        <div ref={contentRef} class="kt-blog__content">
          {props.showPageInfo && slots.pageInfo ? (
            slots.pageInfo()
          ) : props.showPageInfo && props.pageTitle ? (
            <PageInfoCard
              title={props.pageTitle}
              description={props.pageDescription}
              meta={props.pageMeta}
            />
          ) : null}

          <div class="kt-blog__sidebar-mask" />
          <BlogSidebar
            categories={categories.value}
            tags={tags.value}
            articles={articles.value}
            part1Ref={leftbarPart1Ref}
            part2Ref={leftbarPart2Ref}
          />
          <BlogTaxonomyModals
            active={activeModal.value}
            categories={categories.value}
            tags={tags.value}
            onClose={() => {
              activeModal.value = null;
            }}
          />
          <BlogRightbar articles={articles.value} categories={categories.value} />

          <div class="kt-blog__primary">
            <main class={['kt-blog__main', props.mainClass]} role="main">
              {slots.default?.()}
              <footer class="kt-blog__footer kt-blog__card">
                <div class="kt-blog__footer-info">Theme Argon By solstice23</div>
              </footer>
            </main>
          </div>
        </div>
      </>
    );
  },
});
