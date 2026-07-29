type VbenResponse<T> = {
  code?: number;
  data?: T;
  msg?: string;
};

const BLOG_ARTICLE_LIST_URL = '/api/blog/article/public/list';
const BLOG_ARTICLE_DETAIL_URL = '/api/blog/article/public/detail';
const LOCAL_BLOG_ORIGIN = 'https://blog.local';

export type WordpressResolvedTerm = {
  count?: number;
  id?: number;
  name?: string;
  slug?: string;
};

export type WordpressArticleHeading = {
  id?: string;
  level?: number;
  text?: string;
};

export type WordpressPublicArticle = {
  authorName?: string;
  categoriesResolved?: WordpressResolvedTerm[];
  comment_status?: string;
  content?: string | { raw?: string; rendered?: string };
  contentHtml?: string;
  cover?: string;
  date?: string;
  excerpt?: string | { rendered?: string };
  excerptText?: string;
  headings?: WordpressArticleHeading[];
  id: number;
  link?: string;
  modified?: string;
  slug: string;
  tagsResolved?: WordpressResolvedTerm[];
  title?: string | { raw?: string; rendered?: string };
};

export type WordpressPublicArticleList = {
  list: WordpressPublicArticle[];
  total: number;
};

export type BlogArticleListParams = {
  pageNo?: number;
  pageSize?: number;
  search?: string;
};

export async function fetchBlogArticleList(params: BlogArticleListParams = {}) {
  return requestBlog<WordpressPublicArticleList>(
    resolveLocalBlogApiUrl(
      import.meta.env.VITE_BLOG_ARTICLE_LIST_URL,
      BLOG_ARTICLE_LIST_URL,
    ),
    {
      pageNo: params.pageNo ?? 1,
      pageSize: params.pageSize ?? 50,
      search: params.search,
    },
  );
}

export async function fetchBlogArticleDetail(slug: string) {
  return requestBlog<WordpressPublicArticle>(
    resolveLocalBlogApiUrl(
      import.meta.env.VITE_BLOG_ARTICLE_DETAIL_URL,
      BLOG_ARTICLE_DETAIL_URL,
    ),
    {
      slug,
    },
  );
}

export function resolveLocalBlogApiUrl(
  configuredUrl: string | undefined,
  fallbackUrl: string,
) {
  const candidate = configuredUrl;
  if (
    !candidate ||
    candidate !== candidate.trim() ||
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('#')
  ) {
    return fallbackUrl;
  }

  try {
    const queryIndex = candidate.indexOf('?');
    const rawPath =
      queryIndex >= 0 ? candidate.slice(0, queryIndex) : candidate;
    if (
      rawPath.includes('%') ||
      rawPath.includes('\\') ||
      rawPath.includes('//') ||
      /[\u0000-\u0020\u007f]/u.test(rawPath) ||
      /(?:^|\/)\.{1,2}(?:\/|$)/u.test(rawPath)
    ) {
      return fallbackUrl;
    }

    const target = new URL(candidate, LOCAL_BLOG_ORIGIN);
    if (
      target.origin !== LOCAL_BLOG_ORIGIN ||
      target.pathname !== rawPath ||
      !target.pathname.startsWith('/api/blog/') ||
      target.pathname.includes('//')
    ) {
      return fallbackUrl;
    }

    return `${target.pathname}${target.search}`;
  } catch {
    return fallbackUrl;
  }
}

async function requestBlog<T>(url: string, params: Record<string, unknown>) {
  const target = new URL(url, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    target.searchParams.set(key, `${value}`);
  });

  const response = await fetch(target.toString());
  if (!response.ok) {
    throw new Error(`博客文章接口请求失败：${response.status}`);
  }

  const payload = (await response.json()) as VbenResponse<T> | T;
  const data = 'data' in (payload as VbenResponse<T>) ? (payload as VbenResponse<T>).data : payload;

  if (!data) {
    throw new Error('博客文章接口没有返回数据');
  }

  return data as T;
}
