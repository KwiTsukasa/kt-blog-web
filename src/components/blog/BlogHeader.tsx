import { SearchOutlined } from '@antdv-next/icons';
import { defineComponent, nextTick, type ComponentPublicInstance, type PropType, type Ref, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import { useBlogEventBus } from '@/hooks/useBlogEventBus';

import { BlogButton, BlogInput } from './antdvComponents';

const navItems = [
  { label: '首页', to: '/' },
  { label: '归档', to: '/archives' },
  { label: 'NAS', to: '/category/nas' },
  { label: 'Vue', to: '/category/vue' },
  { label: 'Node', to: '/category/node' },
];

export default defineComponent({
  name: 'BlogHeader',
  props: {
    toolbarRef: {
      type: Object as PropType<Ref<HTMLElement | null>>,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const eventBus = useBlogEventBus();
    const keyword = ref('');
    const navSearchOpen = ref(false);
    const navSearchInputRef = ref<any>(null);

    /**
     * @param target antdv-next Input 组件实例或原生 input 节点。
     */
    const focusInput = (target: any) => {
      target?.focus?.();
      target?.input?.focus?.();
    };

    /**
     * @param target 顶栏 nav DOM 节点，由 layout 传入 ref 统一给滚动副作用使用。
     */
    const setToolbarRef = (target: Element | ComponentPublicInstance | null) => {
      props.toolbarRef.value = target instanceof HTMLElement ? target : null;
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
      navSearchOpen.value = false;
    };

    return () => (
      <div class="kt-blog__header">
        <header class="kt-blog__header-global">
          <nav
            ref={setToolbarRef}
            class="kt-blog__header-navbar kt-blog__header-navbar--ontop"
          >
            <div class="kt-blog__header-container">
              <BlogButton class="kt-blog__header-toggle kt-blog__button" aria-expanded="false" aria-label="Toggle sidebar">
                <span class="kt-blog__header-toggle-icon" />
              </BlogButton>

              <div class="kt-blog__header-brand">
                <RouterLink class="kt-blog__header-title" to="/">
                  KwiTsukasa的小站
                </RouterLink>
              </div>

              <div class="kt-blog__header-collapse">
                <div class="kt-blog__header-collapse-head">
                  <div class="kt-blog__header-mobile-search">
                    <div class="kt-blog__input-group">
                      <div class="kt-blog__input-addon-wrap">
                        <span class="kt-blog__input-addon">
                          <SearchOutlined />
                        </span>
                      </div>
                      <BlogInput
                        class="kt-blog__header-mobile-search-input kt-blog__input"
                        placeholder="搜索什么..."
                        autocomplete="off"
                      />
                    </div>
                  </div>
                </div>

                <ul class="kt-blog__header-nav kt-blog__header-nav--hover">
                  {navItems.map((item) => (
                    <li key={item.label} class="kt-blog__header-nav-item">
                      <RouterLink class="kt-blog__header-nav-link" to={item.to}>
                        {item.label}
                      </RouterLink>
                    </li>
                  ))}
                </ul>

                <ul class="kt-blog__header-nav kt-blog__header-nav--end">
                  <li class="kt-blog__header-search-item">
                    <div
                      class={['kt-blog__header-search', navSearchOpen.value && 'kt-blog__header-search--open']}
                      onClick={() => {
                        navSearchOpen.value = true;
                        nextTick(() => focusInput(navSearchInputRef.value));
                      }}
                    >
                      <div class="kt-blog__input-group">
                        <div class="kt-blog__input-addon-wrap">
                          <span class="kt-blog__input-addon">
                            <SearchOutlined />
                          </span>
                        </div>
                        <BlogInput
                          ref={navSearchInputRef}
                          class="kt-blog__header-search-input kt-blog__input"
                          placeholder="搜索什么..."
                          autocomplete="off"
                          v-model:value={keyword.value}
                          onClick={(event: MouseEvent) => event.stopPropagation()}
                          onBlur={() => {
                            navSearchOpen.value = false;
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
                  </li>
                </ul>
              </div>

              <div class="kt-blog__header-menu-mask" />
              <BlogButton
                class="kt-blog__header-toggle kt-blog__header-mobile-search-toggle kt-blog__button"
                aria-expanded="false"
                aria-label="Toggle navigation"
                onClick={() => eventBus.emit('blog:search:open', undefined)}
              >
                <span class="kt-blog__header-toggle-icon kt-blog__header-toggle-icon--search" />
              </BlogButton>
            </div>
          </nav>
        </header>
      </div>
    );
  },
});
