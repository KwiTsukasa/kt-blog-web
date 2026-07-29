import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadArticle = vi.fn();
const getArticleBySlug = vi.fn();
const articles = ref([
  {
    slug: 'article-a',
    title: '文章 A',
  },
]);

vi.mock('@antdv-next/icons', () => {
  const icon = defineComponent({
    name: 'IconStub',
    setup() {
      return () => h('span');
    },
  });

  return {
    CalendarOutlined: icon,
    CommentOutlined: icon,
    EyeOutlined: icon,
    ReadOutlined: icon,
    TagsOutlined: icon,
  };
});

vi.mock('@/components/blog/BlogLayout', () => ({
  default: defineComponent({
    name: 'BlogLayout',
    props: {
      pageTitle: String,
    },
    setup(props, { slots }) {
      return () => h('main', [props.pageTitle, slots.default?.()]);
    },
  }),
}));

vi.mock('@/components/blog/BlogShare', () => ({
  default: defineComponent({
    name: 'BlogShare',
    setup() {
      return () => h('div');
    },
  }),
}));

vi.mock('@/components/blog/antdvComponents', () => {
  const component = defineComponent({
    name: 'AntdvStub',
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    },
  });

  return {
    BlogForm: component,
    BlogInput: component,
    BlogTextArea: component,
  };
});

vi.mock('@/hooks/useArgonPostContentEffects', () => ({
  bindArgonPostContentEffects: vi.fn(() => vi.fn()),
}));

vi.mock('@/hooks/useBlogDomRefs', () => ({
  clearBlogPostRefs: vi.fn(),
  setBlogPostArticleRef: vi.fn(),
  setBlogPostCommentInputRef: vi.fn(),
  setBlogPostCommentRef: vi.fn(),
  setBlogPostContentRef: vi.fn(),
}));

vi.mock('vue-router', () => ({
  RouterLink: defineComponent({
    name: 'RouterLink',
    setup(_, { slots }) {
      return () => h('a', slots.default?.());
    },
  }),
  useRoute: () => ({
    params: {
      slug: 'missing-article-b',
    },
  }),
}));

vi.mock('@/hooks/useBlogArticles', () => ({
  useBlogArticles: () => ({
    articles,
    getArticleBySlug,
    getTagSlugByLabel: vi.fn(),
    loadArticle,
  }),
}));

import PostPage from '@/views/blog/PostPage';

describe('Blog PostPage', () => {
  beforeEach(() => {
    getArticleBySlug.mockReturnValue(undefined);
    loadArticle.mockResolvedValue(undefined);
  });

  it('does not render the first list article when the requested detail is unavailable', () => {
    const wrapper = mount(PostPage);

    expect(wrapper.text()).toContain('文章不存在');
    expect(wrapper.text()).toContain('没有找到文章');
    expect(wrapper.text()).not.toContain('文章 A');
    expect(loadArticle).toHaveBeenCalledWith('missing-article-b');
  });
});
