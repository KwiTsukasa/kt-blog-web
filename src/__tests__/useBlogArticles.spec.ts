import { afterEach, describe, expect, it, vi } from 'vitest';

import { articles as fallbackArticles } from '@/data/blog';

type FetchMock = ReturnType<typeof vi.fn>;

const encodedSlug = '%e6%b5%8b%e8%af%95-milkdown';
const decodedSlug = '测试-milkdown';

const publicArticle = {
  authorName: '作者',
  categoriesResolved: [
    {
      count: 2,
      id: 10,
      name: '技术',
      slug: 'tech',
    },
  ],
  comment_status: 'open',
  contentHtml: '<h2>标题</h2><p>正文 &amp; Milkdown</p>',
  cover: 'https://img.demo/cover.jpg',
  date: '2026-06-05T10:20:30',
  excerptText: '摘要',
  id: 100,
  slug: encodedSlug,
  tagsResolved: [
    {
      count: 1,
      id: 20,
      name: 'Milkdown',
      slug: 'milkdown',
    },
  ],
  title: {
    rendered: 'Milkdown &amp; Markdown',
  },
};

describe('useBlogArticles', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('loads and normalizes public blog articles for Blog Web views', async () => {
    const fetchMock = mockFetch([
      {
        body: {
          code: 200,
          data: {
            list: [publicArticle],
            total: 1,
          },
        },
        status: 200,
      },
    ]);
    const { useBlogArticles } = await import('@/hooks/useBlogArticles');
    const blogArticles = useBlogArticles();

    await blogArticles.loadArticles();

    const [article] = blogArticles.articles.value;
    const listRequest = fetchMock.mock.calls[0]?.[0];
    expect(listRequest).toBeDefined();
    const requestUrl = new URL(`${listRequest}`);

    expect(requestUrl.pathname).toBe('/api/blog/article/public/list');
    expect(requestUrl.searchParams.get('pageNo')).toBe('1');
    expect(requestUrl.searchParams.get('pageSize')).toBe('50');
    expect(article).toMatchObject({
      author: '作者',
      category: '技术',
      categorySlug: 'tech',
      content: ['标题 正文 & Milkdown'],
      contentHtml: '<h2>标题</h2><p>正文 &amp; Milkdown</p>',
      cover: 'https://img.demo/cover.jpg',
      date: '2026-06-05 10:20',
      excerpt: '摘要',
      readTime: '1 分钟',
      slug: decodedSlug,
      tags: ['Milkdown'],
      title: 'Milkdown & Markdown',
    });
    expect(blogArticles.categories.value).toEqual([
      {
        color: 'blue',
        count: 1,
        description: '技术 分类下的文章。',
        label: '技术',
        slug: 'tech',
      },
    ]);
    expect(blogArticles.tags.value).toEqual([
      {
        color: 'blue',
        count: 1,
        label: 'Milkdown',
        slug: 'milkdown',
      },
    ]);
    expect(blogArticles.searchArticles('正文')[0]?.slug).toBe(decodedSlug);
    expect(blogArticles.loadedFromApi.value).toBe(true);
  });

  it('falls back to static articles when blog public list is unavailable', async () => {
    mockFetch([
      {
        body: {
          code: 502,
          msg: '博客文章接口不可用',
        },
        status: 502,
      },
    ]);
    const { useBlogArticles } = await import('@/hooks/useBlogArticles');
    const blogArticles = useBlogArticles();

    await blogArticles.loadArticles();

    expect(blogArticles.loadedFromApi.value).toBe(false);
    expect(blogArticles.articles.value).toEqual(fallbackArticles);
  });

  it('falls back to static articles when blog public list is reachable but has no articles', async () => {
    mockFetch([
      {
        body: {
          code: 200,
          data: {
            list: [],
            total: 0,
          },
        },
        status: 200,
      },
    ]);
    const { useBlogArticles } = await import('@/hooks/useBlogArticles');
    const blogArticles = useBlogArticles();

    await blogArticles.loadArticles();

    expect(blogArticles.loadedFromApi.value).toBe(false);
    expect(blogArticles.articles.value).toEqual(fallbackArticles);
  });

  it('fetches public article detail when cached list data does not include html content', async () => {
    const fetchMock = mockFetch([
      {
        body: {
          code: 200,
          data: {
            list: [
              {
                ...publicArticle,
                contentHtml: '',
              },
            ],
            total: 1,
          },
        },
        status: 200,
      },
      {
        body: {
          code: 200,
          data: {
            ...publicArticle,
            contentHtml: '<h1>详情标题</h1><p>详情正文</p>',
          },
        },
        status: 200,
      },
    ]);
    const { useBlogArticles } = await import('@/hooks/useBlogArticles');
    const blogArticles = useBlogArticles();

    const article = await blogArticles.loadArticle(encodedSlug);
    const detailRequest = fetchMock.mock.calls[1]?.[0];
    expect(detailRequest).toBeDefined();
    const detailUrl = new URL(`${detailRequest}`);

    expect(detailUrl.pathname).toBe('/api/blog/article/public/detail');
    expect(detailUrl.searchParams.get('slug')).toBe(decodedSlug);
    expect(article?.contentHtml).toBe('<h1>详情标题</h1><p>详情正文</p>');
    expect(blogArticles.getArticleBySlug(decodedSlug)?.content).toEqual([
      '详情标题 详情正文',
    ]);
  });
});

function mockFetch(
  responses: Array<{
    body: unknown;
    status: number;
  }>,
) {
  const fetchMock: FetchMock = vi.fn(async () => {
    const response = responses.shift();

    if (!response) {
      throw new Error('没有更多 mock response');
    }

    return new Response(JSON.stringify(response.body), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: response.status,
    });
  });

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}
