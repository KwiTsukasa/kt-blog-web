import { computed, defineComponent, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ArticleList from '@/components/blog/ArticleList';
import BlogLayout from '@/components/blog/BlogLayout';
import PageInfoCard from '@/components/blog/PageInfoCard';
import { BlogCheckbox } from '@/components/blog/antdvComponents';
import { blogSearchFilterId } from '@/factories/blogDomFactory';
import { useBlogArticles } from '@/hooks/useBlogArticles';

type SearchPostType = 'page' | 'post' | 'shuoshuo';

const defaultSearchPostTypes: SearchPostType[] = ['post', 'page'];
const searchPostTypeOptions: Array<{ label: string; value: SearchPostType }> = [
  { label: '文章', value: 'post' },
  { label: '页面', value: 'page' },
  { label: '说说', value: 'shuoshuo' },
];

export default defineComponent({
  name: 'BlogSearchPage',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const keyword = ref(String(route.query.q ?? ''));
    const { searchArticles } = useBlogArticles();
    const selectedPostTypes = computed(() => normalizeSearchPostTypes(route.query.post_type));
    const matchedArticles = computed(() => searchArticles(keyword.value));
    const resultArticles = computed(() =>
      selectedPostTypes.value.includes('post') ? matchedArticles.value : [],
    );

    /**
     * @param type Search result type toggled by the Argon filter checkbox.
     * @param checked Whether the user expects this result type to stay active.
     */
    const updateFilter = (type: SearchPostType, checked: boolean) => {
      const nextTypes = new Set(selectedPostTypes.value);
      if (checked) {
        nextTypes.add(type);
      } else {
        nextTypes.delete(type);
      }

      const postTypeQuery = serializeSearchPostTypes(Array.from(nextTypes));
      router.push({
        path: '/search',
        query: {
          q: keyword.value || undefined,
          ...(postTypeQuery === undefined ? {} : { post_type: postTypeQuery }),
        },
      });
    };

    watch(
      () => route.query.q,
      (value) => {
        keyword.value = String(value ?? '');
      },
    );
    watch(
      () => resultArticles.value.length,
      (count) => syncSearchBodyClass(count > 0),
      { immediate: true, flush: 'post' },
    );

    onBeforeUnmount(() => {
      document.body.classList.remove('search-results', 'search-no-results');
    });

    return () => (
      <BlogLayout
        mainClass="kt-blog__main--article-list kt-blog__main--search-result"
        pageTitle={keyword.value ? `${keyword.value} 的搜索结果` : '搜索'}
        pageDescription="搜索文章标题、摘要、分类、标签与正文内容。"
        pageMeta={`${resultArticles.value.length} 个结果`}
        v-slots={{
          pageInfo: () => (
            <PageInfoCard
              title={keyword.value ? keyword.value : '搜索'}
              description={keyword.value ? '的搜索结果' : '搜索文章标题、摘要、分类、标签与正文内容。'}
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
                        updateFilter(item.value, event.target.checked);
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
        {resultArticles.value.length > 0 ? (
          <ArticleList articles={resultArticles.value} />
        ) : (
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
        )}
      </BlogLayout>
    );
  },
});

/**
 * @param rawPostType WordPress `post_type` query value from the search route.
 * @returns Enabled result types; absent query mirrors live Argon's default post+page checkboxes.
 */
function normalizeSearchPostTypes(rawPostType: unknown): SearchPostType[] {
  if (!rawPostType) {
    return [...defaultSearchPostTypes];
  }

  const rawValues = Array.isArray(rawPostType) ? rawPostType : `${rawPostType}`.split(',');
  const normalizedValues = rawValues.filter((value): value is SearchPostType =>
    searchPostTypeOptions.some((option) => option.value === value),
  );

  return normalizedValues.length ? normalizedValues : [...defaultSearchPostTypes];
}

/**
 * @param postTypes Enabled result types after a checkbox change.
 * @returns Compact URL query value, or undefined when the selection equals live Argon defaults.
 */
function serializeSearchPostTypes(postTypes: SearchPostType[]) {
  const normalizedTypes = searchPostTypeOptions
    .map((option) => option.value)
    .filter((value) => postTypes.includes(value));
  const isDefault =
    normalizedTypes.length === defaultSearchPostTypes.length &&
    defaultSearchPostTypes.every((value) => normalizedTypes.includes(value));

  return isDefault ? undefined : normalizedTypes.join(',');
}

/**
 * @param hasResults Whether the current local search route has visible post results.
 */
function syncSearchBodyClass(hasResults: boolean) {
  document.body.classList.toggle('search-results', hasResults);
  document.body.classList.toggle('search-no-results', !hasResults);
}
