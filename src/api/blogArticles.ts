type VbenResponse<T> = {
  code?: number;
  data?: T;
  msg?: string;
};

export type WordpressResolvedTerm = {
  count?: number;
  id?: number;
  name?: string;
  slug?: string;
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
  return requestWordpress<WordpressPublicArticleList>(
    import.meta.env.VITE_BLOG_ARTICLE_LIST_URL ||
      '/api/blog/article/public/list',
    {
      pageNo: params.pageNo ?? 1,
      pageSize: params.pageSize ?? 50,
      search: params.search,
    },
  );
}

export async function fetchBlogArticleDetail(slug: string) {
  return requestWordpress<WordpressPublicArticle>(
    import.meta.env.VITE_BLOG_ARTICLE_DETAIL_URL ||
      '/api/blog/article/public/detail',
    {
      slug,
    },
  );
}

async function requestWordpress<T>(url: string, params: Record<string, unknown>) {
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
