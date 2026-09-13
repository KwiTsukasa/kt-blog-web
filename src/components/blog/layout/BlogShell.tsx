import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import wordmarkUrl from '@/assets/kwitsukasa-wordmark.svg'
import { blogDomId } from '@/factories/blogDomFactory'
import { useBlogArticles } from '@/hooks/useBlogArticles'
import { useBlogDomRefs } from '@/hooks/useBlogDomRefs'
import { type BlogTaxonomyModal, useBlogEventBus } from '@/hooks/useBlogEventBus'

import BlogSearchModal from '../dialogs/BlogSearchModal'
import BlogTaxonomyModals from '../dialogs/BlogTaxonomyModals'
import BlogFloatActions from './BlogFloatActions'
import BlogHeader from './BlogHeader'

export default defineComponent({
  name: 'BlogShell',
  setup(_, { slots }) {
    const route = useRoute()
    const { pageScrollRef, toolbarRef, bannerContainerRef } = useBlogDomRefs()
    const { categories, tags } = useBlogArticles()
    const eventBus = useBlogEventBus()
    const activeModal = ref<BlogTaxonomyModal | null>(null)
    const mobileSidebarOpen = ref(false)
    const searchOpen = ref(false)

    const openTaxonomyModal = (modal: BlogTaxonomyModal) => {
      activeModal.value = modal
    }
    const openSearchModal = () => {
      searchOpen.value = true
    }
    const toggleMobileSidebar = () => {
      mobileSidebarOpen.value = !mobileSidebarOpen.value
    }
    const closeMobileSidebar = () => {
      mobileSidebarOpen.value = false
    }

    watch(
      () => route.fullPath,
      async () => {
        mobileSidebarOpen.value = false
        searchOpen.value = false
        activeModal.value = null
        await nextTick()
        pageScrollRef.value?.scrollTo({ top: 0, behavior: 'instant' })
      },
    )
    watch(
      mobileSidebarOpen,
      (isOpen) => {
        document.documentElement.classList.toggle('leftbar-opened', isOpen)
      },
      { immediate: true },
    )
    onMounted(() => {
      eventBus.on('blog:sidebar:close', closeMobileSidebar)
      eventBus.on('blog:search:open', openSearchModal)
      eventBus.on('blog:taxonomy:open', openTaxonomyModal)
    })
    onBeforeUnmount(() => {
      eventBus.off('blog:sidebar:close', closeMobileSidebar)
      eventBus.off('blog:search:open', openSearchModal)
      eventBus.off('blog:taxonomy:open', openTaxonomyModal)
      document.documentElement.classList.remove('leftbar-opened')
    })

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
            searchOpen.value = false
          }}
        />
        <BlogTaxonomyModals
          active={activeModal.value}
          categories={categories.value}
          tags={tags.value}
          onClose={() => {
            activeModal.value = null
          }}
        />

        <div class="kt-blog__background" aria-hidden="true" />
        <BlogFloatActions />
        <div
          ref={pageScrollRef}
          class="kt-blog__page-scroll"
          tabindex={0}
          role="region"
          aria-label="正文浏览区域"
        >
          <section
            id={blogDomId('banner')}
            class="kt-blog__banner banner section section-lg section-shaped"
          >
            <div class="shape shape-primary" aria-hidden="true" />
            <div
              ref={bannerContainerRef}
              id={blogDomId('bannerContainer')}
              class="kt-blog__banner-container banner-container container text-center"
            >
              <div class="kt-blog__banner-title">
                <img
                  class="kt-blog__banner-wordmark"
                  src={wordmarkUrl}
                  alt="KwiTsukasa"
                  draggable={false}
                  width="317"
                  height="40"
                />
              </div>
            </div>
          </section>

          {slots.default?.()}
        </div>
      </>
    )
  },
})
