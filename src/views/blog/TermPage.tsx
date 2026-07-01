import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';

import ArticleList from '@/components/blog/ArticleList';
import BlogLayout from '@/components/blog/BlogLayout';
import PageInfoCard from '@/components/blog/PageInfoCard';
import { useBlogArticles } from '@/hooks/useBlogArticles';

export default defineComponent({
  name: 'BlogTermPage',
  setup() {
    const route = useRoute();
    const {
      getArticlesByCategory,
      getArticlesByTag,
      getCategoryBySlug,
      getTagBySlug,
    } = useBlogArticles();
    const mode = computed(() => String(route.meta.termMode ?? 'category'));
    const slug = computed(() => String(route.params.slug ?? ''));
    const category = computed(() => getCategoryBySlug(slug.value));
    const tag = computed(() => getTagBySlug(slug.value));
    const termArticles = computed(() =>
      mode.value === 'tag' ? getArticlesByTag(slug.value) : getArticlesByCategory(slug.value),
    );
    const termLabel = computed(() => (mode.value === 'tag' ? tag.value?.label : category.value?.label) ?? slug.value);
    const pageInfoTitle = computed(() =>
      mode.value === 'tag' ? `标签： ${termLabel.value}` : `分类： ${termLabel.value}`,
    );

    return () => (
      <BlogLayout
        mainClass="kt-blog__main--article-list"
        pageTitle={termLabel.value}
        pageDescription=""
        pageMeta={`${termArticles.value.length} 篇文章`}
        v-slots={{
          pageInfo: () => (
            <PageInfoCard
              title={pageInfoTitle.value}
              meta={`${termArticles.value.length} 篇文章`}
            />
          ),
        }}
      >
        <ArticleList articles={termArticles.value} />
      </BlogLayout>
    );
  },
});
