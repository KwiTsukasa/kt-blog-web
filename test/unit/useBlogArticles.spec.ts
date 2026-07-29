import { afterEach, describe, expect, it, vi } from 'vitest';

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
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
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
      headings: [
        {
          id: 'header-id-1',
          level: 2,
          text: '标题',
        },
      ],
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

  it('keeps a local empty state when blog public list is unavailable', async () => {
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
    expect(blogArticles.articles.value).toEqual([]);
  });

  it('accepts an empty local Blog response without injecting static articles', async () => {
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

    expect(blogArticles.loadedFromApi.value).toBe(true);
    expect(blogArticles.articles.value).toEqual([]);
  });

  it('does not revive a captured article when both local Blog requests fail', async () => {
    mockFetch([
      {
        body: {
          code: 502,
          msg: '博客文章列表接口不可用',
        },
        status: 502,
      },
      {
        body: {
          code: 502,
          msg: '博客文章详情接口不可用',
        },
        status: 502,
      },
    ]);
    const { useBlogArticles } = await import('@/hooks/useBlogArticles');
    const blogArticles = useBlogArticles();

    const article = await blogArticles.loadArticle('qqbot-nas-access-record');

    expect(article).toBeUndefined();
    expect(blogArticles.articles.value).toEqual([]);
  });

  it('uses the previous blog cover when public API articles have no cover', async () => {
    mockFetch([
      {
        body: {
          code: 200,
          data: {
            list: [
              {
                ...publicArticle,
                cover: '',
              },
            ],
            total: 1,
          },
        },
        status: 200,
      },
    ]);
    const { useBlogArticles } = await import('@/hooks/useBlogArticles');
    const blogArticles = useBlogArticles();

    await blogArticles.loadArticles();

    expect(blogArticles.articles.value[0]?.cover).toBe('https://s3.kwitsukasa.top/images/bg-冬滚滚.png');
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
    expect(article?.headings).toEqual([
      {
        id: 'header-id-1',
        level: 1,
        text: '详情标题',
      },
    ]);
    expect(blogArticles.getArticleBySlug(decodedSlug)?.content).toEqual([
      '详情标题 详情正文',
    ]);
  });

  it('normalizes legacy endpoint overrides to local Blog contracts', async () => {
    vi.stubEnv(
      'VITE_BLOG_ARTICLE_LIST_URL',
      '/api/wordpress/article/public/list',
    );
    vi.stubEnv(
      'VITE_BLOG_ARTICLE_DETAIL_URL',
      'https://legacy.example.com/api/wordpress/article/public/detail',
    );
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
          data: publicArticle,
        },
        status: 200,
      },
    ]);
    const { useBlogArticles } = await import('@/hooks/useBlogArticles');
    const blogArticles = useBlogArticles();

    await blogArticles.loadArticle(encodedSlug);

    const requestedUrls = fetchMock.mock.calls.map(([url]) => new URL(`${url}`));
    expect(requestedUrls.map((url) => url.pathname)).toEqual([
      '/api/blog/article/public/list',
      '/api/blog/article/public/detail',
    ]);
    expect(requestedUrls.every((url) => url.origin === window.location.origin)).toBe(true);
    expect(requestedUrls.some((url) => url.pathname.startsWith('/api/wordpress'))).toBe(false);
  });

  it('preserves old slugs and wp-block HTML returned by the local Blog API', async () => {
    const contentHtml =
      '<h2 class="wp-block-heading" id="legacy-heading">旧文章</h2><pre class="wp-block-code"><code>const legacy = true;</code></pre>';
    mockFetch([
      {
        body: {
          code: 200,
          data: {
            list: [
              {
                ...publicArticle,
                contentHtml,
              },
            ],
            total: 1,
          },
        },
        status: 200,
      },
    ]);
    const { useBlogArticles } = await import('@/hooks/useBlogArticles');
    const blogArticles = useBlogArticles();

    await blogArticles.loadArticles();

    expect(blogArticles.articles.value[0]?.slug).toBe(decodedSlug);
    expect(blogArticles.articles.value[0]?.contentHtml).toBe(contentHtml);
    expect(blogArticles.articles.value[0]?.contentHtml).toContain('wp-block-heading');
    expect(blogArticles.articles.value[0]?.contentHtml).toContain('wp-block-code');
  });

  it('derives article catalog headings from public API html when heading metadata is absent', async () => {
    mockFetch([
      {
        body: {
          code: 200,
          data: {
            list: [
              {
                ...publicArticle,
                contentHtml: '<h2 id="intro">介绍</h2><p>正文</p><h3>细节</h3>',
              },
            ],
            total: 1,
          },
        },
        status: 200,
      },
    ]);
    const { useBlogArticles } = await import('@/hooks/useBlogArticles');
    const blogArticles = useBlogArticles();

    await blogArticles.loadArticles();

    expect(blogArticles.articles.value[0]?.headings).toEqual([
      {
        id: 'intro',
        level: 2,
        text: '介绍',
      },
      {
        id: 'header-id-2',
        level: 3,
        text: '细节',
      },
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
