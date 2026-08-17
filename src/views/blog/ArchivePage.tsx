import { computed, defineComponent } from 'vue'
import { useRoute } from 'vue-router'

import ArticleList from '@/components/blog/content/ArticleList'
import BlogLayout from '@/components/blog/layout/BlogLayout'
import { useBlogArticles } from '@/hooks/useBlogArticles'

export default defineComponent({
  name: 'BlogArchivePage',
  setup() {
    const route = useRoute()
    const { articles } = useBlogArticles()
    const monthQuery = computed(() => String(route.query.month ?? ''))
    const archiveMonth = computed(() => normalizeArchiveMonth(monthQuery.value))
    const visibleArticles = computed(() => {
      if (!archiveMonth.value) {
        return articles.value
      }

      return articles.value.filter(
        (article) => getArticleArchiveMonth(article.date) === archiveMonth.value,
      )
    })
    const archiveTitle = computed(() => {
      if (archiveMonth.value) {
        return `月度归档： ${formatArchiveMonthTitle(archiveMonth.value)}`
      }
      return '归档时间轴'
    })

    return () => (
      <BlogLayout
        mainClass="kt-blog__main--archive"
        pageTitle={archiveTitle.value}
        pageDescription=""
        pageMeta={`${visibleArticles.value.length} 篇文章`}
      >
        <ArticleList articles={visibleArticles.value} />
      </BlogLayout>
    )
  },
})

/**
 * 把 YYYYMM 归档参数转换为 YYYY-MM；格式不符时返回空字符串。
 * @param rawMonth - 待规范化为 YYYY-MM 的归档月份参数。
 * @returns  YYYY-MM；没有可展示内容时返回空字符串。
 */
function normalizeArchiveMonth(rawMonth: string) {
  const compactMonth = rawMonth.trim()
  if (!/^\d{6}$/.test(compactMonth)) {
    return ''
  }

  return `${compactMonth.slice(0, 4)}-${compactMonth.slice(4, 6)}`
}

/**
 * 从文章日期取四位年与月份并补齐两位月，格式不匹配时返回空串。
 * @param articleDate - 待提取归档年月的文章日期文本。
 * @returns 读取到的`ArticleArchiveMonth`；没有可展示内容时返回空字符串。
 */
function getArticleArchiveMonth(articleDate: string) {
  const matched = /^(\d{4})-(\d{1,2})/.exec(articleDate)
  if (!matched) return ''

  const [, year, month] = matched

  return `${year}-${month?.padStart(2, '0')}`
}

/**
 * 把 YYYY-MM 归档键格式化为中文年月标题。
 * @param normalizedMonth - 已规范化、待格式化为中文年月的归档键。
 * @returns 中文年月标题。
 */
function formatArchiveMonthTitle(normalizedMonth: string) {
  const [year, month] = normalizedMonth.split('-')

  return `${year} 年 ${Number(month)} 月`
}
