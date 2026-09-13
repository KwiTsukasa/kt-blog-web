import { computed, defineComponent, type PropType, watch } from 'vue'

import { blogDomId, createBlogElementRef } from '@/factories/blogDomFactory'
import { useArgonEffects } from '@/hooks/useArgonEffects'
import { useBlogArticles } from '@/hooks/useBlogArticles'
import { useBlogDomRefs } from '@/hooks/useBlogDomRefs'
import { useBlogEventBus } from '@/hooks/useBlogEventBus'
import { useBlogTheme } from '@/hooks/useBlogTheme'

import PageInfoCard from '../content/PageInfoCard'
import BlogRightbar from './BlogRightbar'
import BlogSidebar from './BlogSidebar'

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
    const { toolbarRef, bannerContainerRef } = useBlogDomRefs()
    const eventBus = useBlogEventBus()
    const contentRef = createBlogElementRef<HTMLElement>()
    const leftbarPart1Ref = createBlogElementRef<HTMLElement>()
    const leftbarPart2Ref = createBlogElementRef<HTMLElement>()
    const { articles, categories, tags } = useBlogArticles()
    const { siteConfig } = useBlogTheme()
    const documentTitle = computed(() => {
      if (props.pageTitle) {
        return `${props.pageTitle} – ${siteConfig.value.title}`
      }
      return siteConfig.value.title
    })

    useArgonEffects({
      bannerContainerRef,
      contentRef,
      leftbarPart1Ref,
      leftbarPart2Ref,
      toolbarRef,
    })

    watch(
      documentTitle,
      (title) => {
        document.title = title
      },
      { immediate: true },
    )

    return () => (
      <div id={blogDomId('content')} ref={contentRef} class="kt-blog__content site-content">
        {(() => {
          if (props.showPageInfo && slots.pageInfo) {
            return slots.pageInfo()
          }
          if (props.showPageInfo && props.pageTitle) {
            return (
              <PageInfoCard
                title={props.pageTitle}
                description={props.pageDescription}
                meta={props.pageMeta}
              />
            )
          }
          return null
        })()}

        <div
          id={blogDomId('sidebarMask')}
          class="kt-blog__sidebar-mask"
          onClick={() => eventBus.emit('blog:sidebar:close')}
        />
        <BlogSidebar
          categories={categories.value}
          tags={tags.value}
          articles={articles.value}
          part1Ref={leftbarPart1Ref}
          part2Ref={leftbarPart2Ref}
        />
        <BlogRightbar articles={articles.value} categories={categories.value} />

        <div id={blogDomId('primary')} class="kt-blog__primary content-area">
          <main
            id={blogDomId('main')}
            class={['kt-blog__main site-main', props.mainClass]}
            role="main"
          >
            {slots.default?.()}
            <footer
              id={blogDomId('footer')}
              class="kt-blog__footer kt-blog__card site-footer card shadow-sm border-0"
            >
              <div class="kt-blog__footer-info">Theme Argon By solstice23</div>
            </footer>
          </main>
        </div>
      </div>
    )
  },
})
