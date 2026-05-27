import { SearchOutlined } from '@antdv-next/icons';
import { defineComponent, nextTick, type PropType, type Ref, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import type { BlogArticle, BlogCategory, BlogTag } from '@/data/blog';
import { useBlogEventBus } from '@/hooks/useBlogEventBus';

import { BlogButton, BlogInput } from './antdvComponents';

const menuItems = [
  { label: '首页', to: '/', icon: 'fa-home' },
  { label: '管理', to: '/category/node', icon: 'fa-user' },
];

export default defineComponent({
  name: 'BlogSidebar',
  props: {
    categories: {
      type: Array as PropType<BlogCategory[]>,
      required: true,
    },
    tags: {
      type: Array as PropType<BlogTag[]>,
      required: true,
    },
    articles: {
      type: Array as PropType<BlogArticle[]>,
      required: true,
    },
    part1Ref: {
      type: Object as PropType<Ref<HTMLElement | null>>,
      required: true,
    },
    part2Ref: {
      type: Object as PropType<Ref<HTMLElement | null>>,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const eventBus = useBlogEventBus();
    const keyword = ref('');
    const leftbarSearchOpen = ref(false);
    const leftbarSearchInputRef = ref<any>(null);

    /**
     * @param target antdv-next Input 组件实例或原生 input 节点。
     */
    const focusInput = (target: any) => {
      target?.focus?.();
      target?.input?.focus?.();
    };

    const submitSearch = () => {
      const query = keyword.value.trim();
      if (!query) {
        return;
      }

      router.push({
        name: 'BlogSearch',
        query: { q: query },
      });
    };

    return () => (
      <aside class="kt-blog__sidebar" role="complementary">
        <div ref={props.part1Ref} class="kt-blog__sidebar-panel kt-blog__sidebar-panel--menu kt-blog__card">
          <div class="kt-blog__sidebar-banner kt-blog__card-body">
            <span class="kt-blog__sidebar-banner-title">KwiTsukasa的小站</span>
          </div>

          <ul class="kt-blog__sidebar-menu">
            {menuItems.map((item, index) => (
              <li key={item.label} class={['kt-blog__sidebar-menu-item', index === 0 && 'kt-blog__sidebar-menu-item--current']}>
                <RouterLink to={item.to}>
                  <i class="kt-blog__sidebar-menu-icon" data-icon={item.icon} />
                  {item.label}
                </RouterLink>
              </li>
            ))}
          </ul>

          <div class={['kt-blog__sidebar-search kt-blog__card-body', leftbarSearchOpen.value && 'kt-blog__sidebar-search--open']}>
            <BlogButton
              class="kt-blog__sidebar-search-trigger kt-blog__button kt-blog__button--secondary kt-blog__button--small kt-blog__button--block"
              onClick={() => {
                leftbarSearchOpen.value = true;
                nextTick(() => focusInput(leftbarSearchInputRef.value));
              }}
            >
              <SearchOutlined />
              搜索
            </BlogButton>
            <BlogInput
              ref={leftbarSearchInputRef}
              placeholder="搜索什么..."
              class="kt-blog__sidebar-search-input kt-blog__input"
              autocomplete="off"
              v-model:value={keyword.value}
              onBlur={() => {
                leftbarSearchOpen.value = false;
              }}
              onKeydown={(event: KeyboardEvent) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  submitSearch();
                }
              }}
            />
          </div>
        </div>

        <div ref={props.part2Ref} class="kt-blog__sidebar-panel kt-blog__sidebar-panel--overview kt-blog__card">
          <div class="kt-blog__sidebar-overview kt-blog__card-body">
            <div class="kt-blog__sidebar-overview-content">
              <div class="kt-blog__sidebar-overview-panel kt-blog__sidebar-overview-panel--active">
                <div class="kt-blog__sidebar-author-image">
                  <div class="kt-blog__sidebar-author-avatar" />
                </div>
                <h6 class="kt-blog__sidebar-author-name">KwiTsukasa</h6>
                <nav class="kt-blog__site-stats">
                  <div class="kt-blog__site-stats-item kt-blog__site-stats-item--posts">
                    <RouterLink to="/archives">
                      <span class="kt-blog__site-stats-count">{props.articles.length}</span>
                      <span class="kt-blog__site-stats-name">文章</span>
                    </RouterLink>
                  </div>
                  <div class="kt-blog__site-stats-item kt-blog__site-stats-item--categories">
                    <a
                      onClick={() => eventBus.emit('blog:taxonomy:open', 'categories')}
                    >
                      <span class="kt-blog__site-stats-count">{props.categories.length}</span>
                      <span class="kt-blog__site-stats-name">分类</span>
                    </a>
                  </div>
                  <div class="kt-blog__site-stats-item kt-blog__site-stats-item--tags">
                    <a onClick={() => eventBus.emit('blog:taxonomy:open', 'tags')}>
                      <span class="kt-blog__site-stats-count">{props.tags.length}</span>
                      <span class="kt-blog__site-stats-name">标签</span>
                    </a>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  },
});
