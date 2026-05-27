import { SearchOutlined } from '@antdv-next/icons';
import { computed, defineComponent, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ArticleList from '@/components/blog/ArticleList';
import BlogLayout from '@/components/blog/BlogLayout';
import PageInfoCard from '@/components/blog/PageInfoCard';
import { BlogButton, BlogCheckbox, BlogForm, BlogInput } from '@/components/blog/antdvComponents';
import { searchArticles } from '@/data/blog';

export default defineComponent({
  name: 'BlogSearchPage',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const keyword = ref(String(route.query.q ?? ''));
    const filters = ref(['post', 'page']);
    const resultArticles = computed(() => searchArticles(keyword.value));

    watch(
      () => route.query.q,
      (value) => {
        keyword.value = String(value ?? '');
      },
    );

    const submitSearch = () => {
      router.push({
        name: 'BlogSearch',
        query: { q: keyword.value.trim() },
      });
    };

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
            >
              <div class="kt-blog__search-filters">
                <div class="kt-blog__search-filter-group">
                  {[
                    { label: '文章', value: 'post' },
                    { label: '页面', value: 'page' },
                    { label: '说说', value: 'shuoshuo' },
                  ].map((item) => (
                    <BlogCheckbox
                      key={item.value}
                      checked={filters.value.includes(item.value)}
                      onChange={(event: { target: { checked: boolean } }) => {
                        const nextValues = filters.value.filter((value) => value !== item.value);
                        if (event.target.checked) {
                          nextValues.push(item.value);
                        }
                        filters.value = nextValues;
                      }}
                    >
                      {item.label}
                    </BlogCheckbox>
                  ))}
                </div>
              </div>
              <BlogForm
                class="kt-blog__page-search-form"
                onFinish={submitSearch}
              >
                <div class="kt-blog__input-group">
                  <div class="kt-blog__input-addon-wrap">
                    <span class="kt-blog__input-addon">
                      <SearchOutlined />
                    </span>
                  </div>
                  <BlogInput
                    name="s"
                    class="kt-blog__input"
                    placeholder="搜索什么..."
                    autocomplete="off"
                    v-model:value={keyword.value}
                  />
                </div>
                <BlogButton class="kt-blog__button kt-blog__button--primary" htmlType="submit">
                  搜索
                </BlogButton>
              </BlogForm>
            </PageInfoCard>
          ),
        }}
      >
        <ArticleList articles={resultArticles.value} />
      </BlogLayout>
    );
  },
});
