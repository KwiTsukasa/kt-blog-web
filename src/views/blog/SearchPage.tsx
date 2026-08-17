import { computed, defineComponent, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ArticleList from '@/components/blog/content/ArticleList'
import BlogLayout from '@/components/blog/layout/BlogLayout'
import PageInfoCard from '@/components/blog/content/PageInfoCard'
import { BlogCheckbox } from '@/components/blog/ui/antdvComponents'
import { blogSearchFilterId } from '@/factories/blogDomFactory'
import { useBlogArticles } from '@/hooks/useBlogArticles'

type SearchPostType = 'page' | 'post' | 'shuoshuo'

const defaultSearchPostTypes: SearchPostType[] = ['post', 'page']
const searchPostTypeOptions: Array<{ label: string; value: SearchPostType }> = [
  { label: '文章', value: 'post' },
  { label: '页面', value: 'page' },
  { label: '说说', value: 'shuoshuo' },
]

export default defineComponent({
  name: 'BlogSearchPage',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const keyword = ref(String(route.query.q ?? ''))
    const { searchArticles } = useBlogArticles()
    const selectedPostTypes = computed(() => normalizeSearchPostTypes(route.query.post_type))
    const matchedArticles = computed(() => searchArticles(keyword.value))
    const resultArticles = computed(() => {
      if (selectedPostTypes.value.includes('post')) {
        return matchedArticles.value
      }
      return []
    })

    /*
     * @param type Search result type toggled by the Argon filter checkbox.
     * @param checked Whether the user expects this result type to stay active.
     */
    const updateFilter = (type: SearchPostType, checked: boolean) => {
      const nextTypes = new Set(selectedPostTypes.value)
      if (checked) {
        nextTypes.add(type)
      } else {
        nextTypes.delete(type)
      }

      const postTypeQuery = serializeSearchPostTypes(Array.from(nextTypes))
      router.push({
        path: '/search',
        query: {
          q: keyword.value || undefined,
          ...(() => {
            if (postTypeQuery === undefined) {
              return {}
            }
            return { post_type: postTypeQuery }
          })(),
        },
      })
    }

    watch(
      () => route.query.q,
      (value) => {
        keyword.value = String(value ?? '')
      },
    )
    watch(
      () => resultArticles.value.length,
      (count) => syncSearchBodyClass(count > 0),
      { immediate: true, flush: 'post' },
    )

    onBeforeUnmount(() => {
      document.body.classList.remove('search-results', 'search-no-results')
    })

    return () => (
      <BlogLayout
        mainClass="kt-blog__main--article-list kt-blog__main--search-result"
        pageTitle={(() => {
          if (keyword.value) {
            return `${keyword.value} 的搜索结果`
          }
          return '搜索'
        })()}
        pageDescription="搜索文章标题、摘要、分类、标签与正文内容。"
        pageMeta={`${resultArticles.value.length} 个结果`}
        v-slots={{
          pageInfo: () => (
            <PageInfoCard
              title={(() => {
                if (keyword.value) {
                  return keyword.value
                }
                return '搜索'
              })()}
              description={(() => {
                if (keyword.value) {
                  return '的搜索结果'
                }
                return '搜索文章标题、摘要、分类、标签与正文内容。'
              })()}
              meta={`${resultArticles.value.length} 个结果`}
              variant="search"
            >
              <div class="kt-blog__search-filters">
                <div class="kt-blog__search-filter-group">
                  {searchPostTypeOptions.map((item) => (
                    <BlogCheckbox
                      id={blogSearchFilterId(item.value)}
                      key={item.value}
                      checked={selectedPostTypes.value.includes(item.value)}
                      onChange={(event: { target: { checked: boolean } }) => {
                        updateFilter(item.value, event.target.checked)
                      }}
                    >
                      {item.label}
                    </BlogCheckbox>
                  ))}
                </div>
              </div>
            </PageInfoCard>
          ),
        }}
      >
        {(() => {
          if (resultArticles.value.length > 0) {
            return <ArticleList articles={resultArticles.value} />
          }
          return (
            <div class="kt-blog__search-no-results kt-blog__card">
              <div class="kt-blog__card-body">
                <h3>没有搜索结果</h3>
                <p>换个关键词试试 ?</p>
                <button
                  class="kt-blog__search-no-results-back"
                  type="button"
                  onClick={() => window.history.back()}
                >
                  返回上一页
                </button>
              </div>
            </div>
          )
        })()}
      </BlogLayout>
    )
  },
})

/**
 * 过滤并去重搜索请求支持的文章类型，空输入回退默认类型。
 * @param rawPostType - 接口返回、待规范化为文章类型列表的原始值。
 * @returns 过滤后的并去重搜索请求支持的文章类型，空输入回退默认类型。
 */
function normalizeSearchPostTypes(rawPostType: unknown): SearchPostType[] {
  if (!rawPostType) {
    return [...defaultSearchPostTypes]
  }

  const rawValues = (() => {
    if (Array.isArray(rawPostType)) {
      return rawPostType
    }
    return `${rawPostType}`.split(',')
  })()
  const normalizedValues = rawValues.filter((value): value is SearchPostType =>
    searchPostTypeOptions.some((option) => option.value === value),
  )

  if (normalizedValues.length) {
    return normalizedValues
  }
  return [...defaultSearchPostTypes]
}

/**
 * 把已规范化的文章类型序列化为搜索查询参数。
 * @param postTypes - 搜索结果中已经出现的文章类型列表。
 * @returns 搜索查询参数；未命中或提前结束时返回 undefined。
 */
function serializeSearchPostTypes(postTypes: SearchPostType[]) {
  const normalizedTypes = searchPostTypeOptions
    .map((option) => option.value)
    .filter((value) => postTypes.includes(value))
  const isDefault =
    normalizedTypes.length === defaultSearchPostTypes.length &&
    defaultSearchPostTypes.every((value) => normalizedTypes.includes(value))

  if (isDefault) {
    return undefined
  }
  return normalizedTypes.join(',')
}

/**
 * 搜索页根据结果存在性互斥切换 body 的有结果与无结果样式类。
 * @param hasResults - 当前查询是否至少返回一条文章。
 */
function syncSearchBodyClass(hasResults: boolean) {
  document.body.classList.toggle('search-results', hasResults)
  document.body.classList.toggle('search-no-results', !hasResults)
}
