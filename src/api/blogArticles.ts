type VbenResponse<T> = {
  code?: number
  data?: T
  msg?: string
}

const BLOG_ARTICLE_LIST_URL = '/api/blog/article/public/list'
const BLOG_ARTICLE_DETAIL_URL = '/api/blog/article/public/detail'
const LOCAL_BLOG_ORIGIN = 'https://blog.local'

export type WordpressResolvedTerm = {
  count?: number
  id?: number
  name?: string
  slug?: string
}

export type WordpressArticleHeading = {
  id?: string
  level?: number
  text?: string
}

export type WordpressPublicArticle = {
  authorName?: string
  categoriesResolved?: WordpressResolvedTerm[]
  comment_status?: string
  content?: string | { raw?: string; rendered?: string }
  contentHtml?: string
  cover?: string
  date?: string
  excerpt?: string | { rendered?: string }
  excerptText?: string
  headings?: WordpressArticleHeading[]
  id: number
  link?: string
  modified?: string
  slug: string
  tagsResolved?: WordpressResolvedTerm[]
  title?: string | { raw?: string; rendered?: string }
}

export type WordpressPublicArticleList = {
  list: WordpressPublicArticle[]
  total: number
}

export type BlogArticleListParams = {
  pageNo?: number
  pageSize?: number
  search?: string
}

/**
 * 文章列表接口根据分页与可选搜索词查询公开博客数据，页码和页长缺失时使用稳定默认值。
 * @param params - 可选的页码、每页数量与全文搜索词。
 * @returns 博客文章列表及服务端统计的总条数。
 */
export async function fetchBlogArticleList(params: BlogArticleListParams = {}) {
  return requestBlog<WordpressPublicArticleList>(
    resolveLocalBlogApiUrl(import.meta.env.VITE_BLOG_ARTICLE_LIST_URL, BLOG_ARTICLE_LIST_URL),
    {
      pageNo: params.pageNo ?? 1,
      pageSize: params.pageSize ?? 50,
      search: params.search,
    },
  )
}

/**
 * 文章详情接口根据公开 slug 查询单篇博客内容并复用统一响应解包规则。
 * @param slug - WordPress 文章的公开 URL 标识。
 * @returns 与该 slug 对应的公开文章详情。
 */
export async function fetchBlogArticleDetail(slug: string) {
  return requestBlog<WordpressPublicArticle>(
    resolveLocalBlogApiUrl(import.meta.env.VITE_BLOG_ARTICLE_DETAIL_URL, BLOG_ARTICLE_DETAIL_URL),
    {
      slug,
    },
  )
}

/**
 * 仅接受同源、以斜杠开头且不含点目录或控制字符的博客 API 路径，否则回退默认地址。
 * @param configuredUrl - 配置中声明的博客主题接口地址。
 * @param fallbackUrl - 在对应分支原样返回给调用方的`fallbackUrl`。
 * @returns 通过同源校验的博客 API 路径；无效输入时为默认地址。
 */
export function resolveLocalBlogApiUrl(configuredUrl: string | undefined, fallbackUrl: string) {
  const candidate = configuredUrl
  if (
    !candidate ||
    candidate !== candidate.trim() ||
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('#')
  ) {
    return fallbackUrl
  }

  try {
    const queryIndex = candidate.indexOf('?')
    const rawPath = (() => {
      if (queryIndex >= 0) {
        return candidate.slice(0, queryIndex)
      }
      return candidate
    })()
    if (
      rawPath.includes('%') ||
      rawPath.includes('\\') ||
      rawPath.includes('//') ||
      /[\u0000-\u0020\u007f]/u.test(rawPath) ||
      /(?:^|\/)\.{1,2}(?:\/|$)/u.test(rawPath)
    ) {
      return fallbackUrl
    }

    const target = new URL(candidate, LOCAL_BLOG_ORIGIN)
    if (
      target.origin !== LOCAL_BLOG_ORIGIN ||
      target.pathname !== rawPath ||
      !target.pathname.startsWith('/api/blog/') ||
      target.pathname.includes('//')
    ) {
      return fallbackUrl
    }

    return `${target.pathname}${target.search}`
  } catch {
    return fallbackUrl
  }
}

/**
 * 博客请求会忽略空查询参数并兼容 Vben data 信封，确保调用方总是取得有效业务数据。
 * @param url - 相对于当前站点或完整的博客 API 地址。
 * @param params - 需要写入查询字符串的字段集合；空值字段不会发送。
 * @returns 从 Vben 信封解包或直接响应中取得的业务数据。
 * @throws HTTP 响应失败或成功响应缺少业务数据时抛出带原因的 Error。
 */
async function requestBlog<T>(url: string, params: Record<string, unknown>) {
  const target = new URL(url, window.location.origin)

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    target.searchParams.set(key, `${value}`)
  })

  const response = await fetch(target.toString())
  if (!response.ok) {
    throw new Error(`博客文章接口请求失败：${response.status}`)
  }

  const payload = (await response.json()) as VbenResponse<T> | T
  const data = (() => {
    if ('data' in (payload as VbenResponse<T>)) {
      return (payload as VbenResponse<T>).data
    }
    return payload
  })()

  if (!data) {
    throw new Error('博客文章接口没有返回数据')
  }

  return data as T
}
