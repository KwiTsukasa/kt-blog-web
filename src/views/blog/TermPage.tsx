import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';

import ArticleList from '@/components/blog/ArticleList';
import BlogLayout from '@/components/blog/BlogLayout';
import {
  getArticlesByCategory,
  getArticlesByTag,
  getCategoryBySlug,
  getTagBySlug,
} from '@/data/blog';

export default defineComponent({
  name: 'BlogTermPage',
  setup() {
    const route = useRoute();
    const mode = computed(() => String(route.meta.termMode ?? 'category'));
    const slug = computed(() => String(route.params.slug ?? ''));
    const category = computed(() => getCategoryBySlug(slug.value));
    const tag = computed(() => getTagBySlug(slug.value));
    const termArticles = computed(() =>
      mode.value === 'tag' ? getArticlesByTag(slug.value) : getArticlesByCategory(slug.value),
    );
    const title = computed(() =>
      mode.value === 'tag' ? `标签：${tag.value?.label ?? slug.value}` : `分类：${category.value?.label ?? slug.value}`,
    );
    const description = computed(() =>
      mode.value === 'tag'
        ? `与 ${tag.value?.label ?? slug.value} 相关的文章。`
        : category.value?.description ?? '当前分类下的文章列表。',
    );

    return () => (
      <BlogLayout
        mainClass="kt-blog__main--article-list"
        pageTitle={title.value}
        pageDescription={description.value}
        pageMeta={`${termArticles.value.length} 篇文章`}
      >
        <ArticleList articles={termArticles.value} />
      </BlogLayout>
    );
  },
});
