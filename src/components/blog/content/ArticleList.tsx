import { Empty } from 'antdv-next'
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  TransitionGroup,
  type ComponentPublicInstance,
  type PropType,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'

import type { BlogArticle } from '@/data/blog'
import { getBlogScrollTop, setBlogScrollTop } from '@/hooks/useArgonEffects'

import ArticleCard from './ArticleCard'

export default defineComponent({
  name: 'ArticleList',
  props: {
    articles: {
      type: Array as PropType<BlogArticle[]>,
      required: true,
    },
    batchSize: {
      type: Number,
      default: 3,
    },
    initialCount: {
      type: Number,
      default: 7,
    },
  },
  setup(props) {
    const router = useRouter()
    const openingSlug = ref('')
    const openingOffset = ref(0)
    let openingTimer: ReturnType<typeof setTimeout> | undefined
    let scrollFrame = 0
    let disposed = false
    const openArticle = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return
      if (!(event.target instanceof Element)) return
      const title = event.target.closest<HTMLAnchorElement>('a.kt-blog__post-title')
      const card = title?.closest<HTMLElement>('.kt-blog__post--preview')
      const main = card?.closest<HTMLElement>('.kt-blog__main')
      const targetSlug = card?.dataset.articleSlug
      if (!title || !card || !main || !targetSlug || title.target === '_blank') return
      event.preventDefault()
      if (openingSlug.value) return

      openingOffset.value = main.getBoundingClientRect().top - card.getBoundingClientRect().top
      openingSlug.value = targetSlug
      const navigate = async () => {
        try {
          await router.push(`/post/${targetSlug}`)
        } finally {
          openingSlug.value = ''
        }
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setBlogScrollTop(0)
        void navigate()
        return
      }

      // 复用 Argon 的 450ms swing 回顶与 500ms 卡片移位，滚动源改为页面原生容器。
      const initialScroll = getBlogScrollTop()
      const startedAt = performance.now()
      const scrollToTop = (now: number) => {
        if (disposed) return
        const progress = Math.min((now - startedAt) / 450, 1)
        setBlogScrollTop((initialScroll * (1 + Math.cos(progress * Math.PI))) / 2)
        if (progress < 1) scrollFrame = requestAnimationFrame(scrollToTop)
      }
      scrollFrame = requestAnimationFrame(scrollToTop)
      openingTimer = setTimeout(() => {
        if (!disposed) void navigate()
      }, 500)
    }
    const loadMoreTarget = ref<HTMLElement | null>(null)
    const visibleCount = ref(0)
    let observer: IntersectionObserver | null = null

    const visibleArticles = computed(() => props.articles.slice(0, visibleCount.value))
    const hasMoreArticles = computed(() => visibleCount.value < props.articles.length)

    /*
     * 重新计算首屏文章数量；列表条件变化时收回到初始批次，避免搜索/分类页沿用旧滚动状态。
     */
    const resetVisibleCount = () => {
      visibleCount.value = Math.min(props.initialCount, props.articles.length)
    }

    /*
     * @param nextCount 本次追加的文章数量，默认按批次无感知追加。
     */
    const loadMoreArticles = (nextCount = props.batchSize) => {
      visibleCount.value = Math.min(props.articles.length, visibleCount.value + nextCount)
    }

    /*
     * 监听底部哨兵节点，提前一段距离追加下一批文章，替代可见分页按钮。
     */
    const observeLoadMoreTarget = () => {
      observer?.disconnect()
      observer = null

      if (!hasMoreArticles.value || !loadMoreTarget.value) {
        return
      }

      if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        visibleCount.value = props.articles.length
        return
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            loadMoreArticles()
          }
        },
        {
          rootMargin: '360px 0px',
          threshold: 0,
        },
      )
      observer.observe(loadMoreTarget.value)
    }

    /*
     * @param element Vue ref 回传的哨兵 DOM 或组件实例。
     */
    const setLoadMoreTarget = (element: Element | ComponentPublicInstance | null) => {
      const nextElement = (() => {
        if (typeof HTMLElement !== 'undefined' && element instanceof HTMLElement) {
          return element
        }
        return null
      })()
      if (loadMoreTarget.value === nextElement) {
        return
      }

      loadMoreTarget.value = nextElement
      nextTick(observeLoadMoreTarget)
    }

    watch(
      () => props.articles.map((article) => article.id).join('|'),
      () => {
        resetVisibleCount()
        nextTick(observeLoadMoreTarget)
      },
      {
        immediate: true,
      },
    )

    watch(hasMoreArticles, () => {
      nextTick(observeLoadMoreTarget)
    })

    onMounted(() => {
      nextTick(observeLoadMoreTarget)
    })

    onBeforeUnmount(() => {
      disposed = true
      clearTimeout(openingTimer)
      cancelAnimationFrame(scrollFrame)
      observer?.disconnect()
    })

    return () => (
      <>
        {(() => {
          if (props.articles.length > 0) {
            return (
              <div
                class={[
                  'kt-blog__post-transition',
                  openingSlug.value && 'kt-blog__post-transition--opening',
                ]}
                {...{ onClickCapture: openArticle }}
              >
                <TransitionGroup name="kt-blog__post-transition" tag="div">
                  {visibleArticles.value.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      opening={openingSlug.value === article.slug}
                      openingOffset={openingOffset.value}
                    />
                  ))}
                </TransitionGroup>
                {(() => {
                  if (hasMoreArticles.value) {
                    return (
                      <div
                        ref={setLoadMoreTarget}
                        class="kt-blog__post-load-sentinel"
                        aria-hidden="true"
                        data-loaded={visibleCount.value}
                        data-total={props.articles.length}
                      />
                    )
                  }
                  return null
                })()}
              </div>
            )
          }
          return (
            <div class="kt-blog__post-empty kt-blog__card">
              <Empty description="没有找到相关文章" />
            </div>
          )
        })()}
      </>
    )
  },
})
