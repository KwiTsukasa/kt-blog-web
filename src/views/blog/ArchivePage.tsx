import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';

import ArticleList from '@/components/blog/ArticleList';
import BlogLayout from '@/components/blog/BlogLayout';
import { useBlogArticles } from '@/hooks/useBlogArticles';

export default defineComponent({
  name: 'BlogArchivePage',
  setup() {
    const route = useRoute();
    const { articles } = useBlogArticles();
    const monthQuery = computed(() => String(route.query.month ?? ''));
    const archiveMonth = computed(() => normalizeArchiveMonth(monthQuery.value));
    const visibleArticles = computed(() => {
      if (!archiveMonth.value) {
        return articles.value;
      }

      return articles.value.filter((article) => getArticleArchiveMonth(article.date) === archiveMonth.value);
    });
    const archiveTitle = computed(() =>
      archiveMonth.value ? `月度归档： ${formatArchiveMonthTitle(archiveMonth.value)}` : '归档时间轴',
    );

    return () => (
      <BlogLayout
        mainClass="kt-blog__main--archive"
        pageTitle={archiveTitle.value}
        pageDescription=""
        pageMeta={`${visibleArticles.value.length} 篇文章`}
      >
        <ArticleList articles={visibleArticles.value} />
      </BlogLayout>
    );
  },
});

/**
 * @param rawMonth WordPress `m=YYYYMM` 等价参数，来自本地 `/archives?month=...`。
 * @returns 用于和文章 `YYYY-MM-DD` 字符串比较的 `YYYY-MM` 月份。
 */
function normalizeArchiveMonth(rawMonth: string) {
  const compactMonth = rawMonth.trim();
  if (!/^\d{6}$/.test(compactMonth)) {
    return '';
  }

  return `${compactMonth.slice(0, 4)}-${compactMonth.slice(4, 6)}`;
}

/**
 * @param articleDate Local article datetime whose leading year/month may be zero-padded or not.
 * @returns Normalized `YYYY-MM` key used by WordPress-style month archives.
 */
function getArticleArchiveMonth(articleDate: string) {
  const matched = /^(\d{4})-(\d{1,2})/.exec(articleDate);
  if (!matched) return '';

  const [, year, month] = matched;

  return `${year}-${month?.padStart(2, '0')}`;
}

/**
 * @param normalizedMonth 已归一化的 `YYYY-MM` 月份字符串。
 * @returns 对齐 WordPress Argon 月份归档标题的中文展示文本。
 */
function formatArchiveMonthTitle(normalizedMonth: string) {
  const [year, month] = normalizedMonth.split('-');

  return `${year} 年 ${Number(month)} 月`;
}
