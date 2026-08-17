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

import type { BlogArticle } from '@/data/blog'

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
      observer?.disconnect()
    })

    return () => (
      <>
        {(() => {
          if (props.articles.length > 0) {
            return (
              <div class="kt-blog__post-transition">
                <TransitionGroup name="kt-blog__post-transition" tag="div">
                  {visibleArticles.value.map((article) => (
                    <ArticleCard key={article.id} article={article} />
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
