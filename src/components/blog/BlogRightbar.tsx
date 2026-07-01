import { defineComponent, type PropType } from 'vue';
import { RouterLink } from 'vue-router';

import type { BlogArticle, BlogCategory } from '@/data/blog';
import { blogDomId } from '@/factories/blogDomFactory';

export default defineComponent({
  name: 'BlogRightbar',
  props: {
    articles: {
      type: Array as PropType<BlogArticle[]>,
      required: true,
    },
    categories: {
      type: Array as PropType<BlogCategory[]>,
      required: true,
    },
  },
  setup(props) {
    const archiveMonths = collectArchiveMonths(props.articles);
    const visibleCategories = [...props.categories].sort((left, right) => left.label.localeCompare(right.label));

    return () => (
      <aside id={blogDomId('rightbar')} class="kt-blog__rightbar rightbar widget-area" role="complementary">
        <div class="kt-blog__rightbar-widget kt-blog__card">
          <h2 class="kt-blog__rightbar-title">近期文章</h2>
          <ul class="kt-blog__rightbar-list">
            {props.articles.slice(0, 5).map((article) => (
              <li key={article.slug} class="kt-blog__rightbar-list-item">
                <RouterLink to={`/post/${article.slug}`}>{article.title}</RouterLink>
              </li>
            ))}
          </ul>
        </div>

        <div class="kt-blog__rightbar-widget kt-blog__card">
          <h2 class="kt-blog__rightbar-title">近期评论</h2>
          <div class="kt-blog__rightbar-empty-comment">您尚未收到任何评论。</div>
        </div>

        <div class="kt-blog__rightbar-widget kt-blog__card">
          <h2 class="kt-blog__rightbar-title">归档</h2>
          <ul class="kt-blog__rightbar-list">
            {archiveMonths.map((month) => (
              <li key={month.value} class="kt-blog__rightbar-list-item">
                <RouterLink to={{ path: '/archives', query: { month: month.value } }}>{month.label}</RouterLink>
              </li>
            ))}
          </ul>
        </div>

        <div class="kt-blog__rightbar-widget kt-blog__card">
          <h2 class="kt-blog__rightbar-title">分类</h2>
          <ul class="kt-blog__rightbar-list kt-blog__rightbar-list--categories">
            {visibleCategories.map((category) => (
              <li key={category.slug} class="kt-blog__rightbar-category">
                <RouterLink to={`/category/${category.slug}`}>{category.label}</RouterLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    );
  },
});

/**
 * @param articles Public article records whose dates determine the rightbar archive links.
 * @returns Unique WordPress-style month entries with both visible label and local route query value.
 */
function collectArchiveMonths(articles: BlogArticle[]) {
  const months = new Map<string, string>();
  articles.forEach((article) => {
    const matched = /^(\d{4})-(\d{1,2})/.exec(article.date);
    if (!matched) return;

    const [, year, month] = matched;
    if (!year || !month) return;

    const value = `${year}${month.padStart(2, '0')}`;
    months.set(value, `${year} 年 ${Number(month)} 月`);
  });

  return Array.from(months, ([value, label]) => ({ label, value }));
}
