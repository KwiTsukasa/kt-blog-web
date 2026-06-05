import { CalendarOutlined } from '@antdv-next/icons';
import { computed, defineComponent } from 'vue';
import { RouterLink } from 'vue-router';

import BlogLayout from '@/components/blog/BlogLayout';
import { useBlogArticles } from '@/hooks/useBlogArticles';

export default defineComponent({
  name: 'BlogArchivePage',
  setup() {
    const { articles } = useBlogArticles();
    const groupedArticles = computed(() => {
      const groups = new Map<string, typeof articles.value>();
      articles.value.forEach((article) => {
        const key = article.date.slice(0, 7);
        groups.set(key, [...(groups.get(key) ?? []), article]);
      });

      return Array.from(groups.entries());
    });

    return () => (
      <BlogLayout
        mainClass="kt-blog__main--archive"
        pageTitle="归档时间轴"
        pageDescription="按月份回顾 KT 项目沉淀的文章记录。"
        pageMeta={`${articles.value.length} 篇文章`}
      >
        <article class="kt-blog__post kt-blog__post--full kt-blog__card">
          <div class="kt-blog__post-content kt-blog__post-content--full">
            <div class="kt-blog__timeline kt-blog__timeline--archive">
            {groupedArticles.value.map(([month, monthArticles]) => (
              <section key={month} class="kt-blog__timeline-group">
                <h3 class="kt-blog__timeline-month">
                  <CalendarOutlined />
                  <span>{month}</span>
                </h3>
                {monthArticles.map((article) => (
                  <div key={article.id} class="kt-blog__timeline-node">
                    <div class="kt-blog__timeline-time">{article.date.slice(5)}</div>
                    <div class="kt-blog__timeline-card kt-blog__card kt-blog__card--gradient-secondary">
                      <RouterLink to={`/post/${article.slug}`}>{article.title}</RouterLink>
                    </div>
                  </div>
                ))}
              </section>
            ))}
            </div>
          </div>
        </article>
      </BlogLayout>
    );
  },
});
