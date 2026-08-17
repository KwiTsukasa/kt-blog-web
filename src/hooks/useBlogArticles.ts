import { computed, getCurrentInstance, onMounted, ref } from 'vue'

import {
  fetchBlogArticleDetail,
  fetchBlogArticleList,
  type WordpressPublicArticle,
} from '@/api/blogArticles'
import {
  categories as fallbackCategories,
  getArticleCategories,
  hasSharedCategory,
  isArticleInCategory,
  tags as fallbackTags,
  type BlogArticle,
  type BlogArticleHeading,
  type BlogCategory,
  type BlogTag,
} from '@/data/blog'
import { PREVIOUS_BLOG_BACKGROUND_IMAGE, resolveBlogStaticAsset } from '@/data/blogStaticAssets'
import { blogGeneratedHeadingId } from '@/factories/blogDomFactory'

const defaultCover = PREVIOUS_BLOG_BACKGROUND_IMAGE
const colorPool = ['blue', 'purple', 'green', 'orange', 'geekblue', 'cyan', 'volcano', 'magenta']
const blogArticles = ref<BlogArticle[]>([])
const loading = ref(false)
const loadedFromApi = ref(false)
let loadPromise: Promise<void> | null = null

/**
 * 提供文章、分类与标签的响应式列表及查询方法。
 * @returns 文章、分类与标签的响应式列表及查询方法，包含 `articles`、`categories`、`getArticleBySlug`、`getArticlesByCategory`、`getArticlesByTag` 等字段。
 */
export function useBlogArticles() {
  const articles = computed(() => blogArticles.value)
  const categories = computed(() => buildCategories(blogArticles.value))
  const tags = computed(() => buildTags(blogArticles.value))

  if (getCurrentInstance()) {
    onMounted(() => {
      void loadArticles()
    })
  }

  const getArticleBySlug = (slug: string) => {
    const normalizedSlug = decodeSlug(slug)

    return blogArticles.value.find((article) => article.slug === normalizedSlug)
  }
  const getCategoryBySlug = (slug: string) => {
    const normalizedSlug = decodeSlug(slug)

    return categories.value.find((category) => category.slug === normalizedSlug)
  }
  const getTagBySlug = (slug: string) => {
    const normalizedSlug = decodeSlug(slug)

    return tags.value.find((tag) => tag.slug === normalizedSlug)
  }
  const getTagSlugByLabel = (label: string) =>
    tags.value.find((tag) => tag.label === label)?.slug || toSlug(label)
  const getArticlesByCategory = (slug: string) => {
    const normalizedSlug = decodeSlug(slug)

    return blogArticles.value.filter((article) => isArticleInCategory(article, normalizedSlug))
  }
  const getArticlesByTag = (slug: string) => {
    const tag = getTagBySlug(slug)
    if (!tag) return []

    return blogArticles.value.filter((article) => article.tags.includes(tag.label))
  }
  const searchArticles = (keyword: string) => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    if (!normalizedKeyword) return blogArticles.value

    return blogArticles.value.filter((article) => {
      const haystack = [
        article.title,
        article.excerpt,
        article.category,
        ...getArticleCategories(article).map((category) => category.label),
        ...article.tags,
        ...article.content,
        stripHtml(article.contentHtml),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedKeyword)
    })
  }
  const getRelatedArticles = (source: BlogArticle) =>
    blogArticles.value
      .filter(
        (article) =>
          article.id !== source.id &&
          (hasSharedCategory(article, source) ||
            article.tags.some((tag) => source.tags.includes(tag))),
      )
      .slice(0, 3)

  return {
    articles,
    categories,
    getArticleBySlug,
    getArticlesByCategory,
    getArticlesByTag,
    getCategoryBySlug,
    getRelatedArticles,
    getTagBySlug,
    getTagSlugByLabel,
    loadArticle,
    loadArticles,
    loading,
    searchArticles,
    tags,
    loadedFromApi,
  }
}

/**
 * 避免重复请求文章列表；首次加载时规范化结果并同步加载状态，失败时清空列表。
 * @returns Promise 兑现为读取到的`Articles`；未命中或提前结束时返回 undefined。
 */
async function loadArticles() {
  if (loadedFromApi.value) return
  if (loadPromise) return loadPromise

  loading.value = true
  loadPromise = fetchBlogArticleList()
    .then((result) => {
      blogArticles.value = result.list.map(normalizeWordpressArticle)
      loadedFromApi.value = true
    })
    .catch(() => {
      blogArticles.value = []
      loadedFromApi.value = false
    })
    .finally(() => {
      loading.value = false
      loadPromise = null
    })

  return loadPromise
}

/**
 * 优先复用含正文的已缓存文章，否则请求详情并更新列表；请求失败时保留缓存条目。
 * @param slug - 用于匹配文章分类或资源的 slug。
 * @returns Promise 兑现为读取到的文章。
 */
async function loadArticle(slug: string) {
  const normalizedSlug = decodeSlug(slug)

  await loadArticles()

  const cachedArticle = blogArticles.value.find((article) => article.slug === normalizedSlug)
  if (cachedArticle?.contentHtml) return cachedArticle

  try {
    const article = normalizeWordpressArticle(await fetchBlogArticleDetail(normalizedSlug))
    const currentIndex = blogArticles.value.findIndex((item) => item.slug === article.slug)
    if (currentIndex >= 0) {
      blogArticles.value = blogArticles.value.map((item, index) => {
        if (index === currentIndex) {
          return article
        }
        return item
      })
    } else {
      blogArticles.value = [article, ...blogArticles.value]
    }

    return article
  } catch {
    return cachedArticle
  }
}

/**
 * 把公开文章 DTO 解码为本地文章模型，并补齐分类、摘要、阅读时间、封面与目录默认值。
 * @param article - 待读取分类、标题或正文的文章记录。
 * @returns 本地文章模型，包含 `author`、`categories`、`category`、`categorySlug`、`comments` 等字段。
 */
function normalizeWordpressArticle(article: WordpressPublicArticle): BlogArticle {
  const categories = normalizeArticleCategories(article.categoriesResolved)
  const category = categories[0] || {
    name: '未分类',
    slug: 'uncategorized',
  }
  const contentHtml =
    article.contentHtml ||
    (() => {
      if (typeof article.content === 'object') {
        return article.content.rendered || article.content.raw
      }
      return article.content
    })() ||
    ''
  const contentText = stripHtml(contentHtml)
  const excerpt =
    article.excerptText ||
    stripHtml(
      (() => {
        if (typeof article.excerpt === 'object') {
          return article.excerpt.rendered
        }
        return article.excerpt
      })(),
    ) ||
    contentText.slice(0, 120)
  const words = Math.max(contentText.replace(/\s+/g, '').length, excerpt.length)
  const tags = (article.tagsResolved || []).map((tag) => decodeHtml(tag.name || '')).filter(Boolean)

  return {
    author: article.authorName || 'KwiTsukasa',
    categories: categories.map((item) => ({
      label: decodeHtml(item.name || '未分类'),
      slug: decodeSlug(item.slug || 'uncategorized'),
    })),
    category: decodeHtml(category.name || '未分类'),
    categorySlug: decodeSlug(category.slug || 'uncategorized'),
    comments: 0,
    content: (() => {
      if (contentText) {
        return [contentText]
      }
      return []
    })(),
    contentHtml,
    cover: resolveBlogStaticAsset(article.cover, defaultCover),
    date: formatDate(article.date || article.modified),
    excerpt,
    headings: normalizeArticleHeadings(article.headings, contentHtml),
    id: article.id,
    readTime: `${Math.max(1, Math.ceil(words / 500))} 分钟`,
    slug: decodeSlug(article.slug),
    tags,
    title: getRenderedText(article.title) || '未命名文章',
    views: 0,
    words,
  }
}

/**
 * 优先规范化接口目录；接口未提供时从文章 HTML 提取 h1 至 h6。
 * @param headings - 待规范化层级、锚点与标题文本的文章目录列表。
 * @param contentHtml - 待解析标题结构的文章 HTML。
 * @returns 规范化后的接口目录，或从正文提取的 h1 至 h6 标题列表。
 */
function normalizeArticleHeadings(
  headings: WordpressPublicArticle['headings'],
  contentHtml: string,
): BlogArticleHeading[] {
  if (headings?.length) {
    return headings
      .map((heading, index) => ({
        id: heading.id || blogGeneratedHeadingId(index + 1),
        level: normalizeHeadingLevel(heading.level),
        text: stripHtml(heading.text),
      }))
      .filter((heading) => heading.text)
  }

  return extractArticleHeadingsFromHtml(contentHtml)
}

/**
 * 按文档顺序提取文章 HTML 中的 h1 至 h6；运行环境没有 DOMParser 时返回空数组。
 * @param contentHtml - 待解析标题结构的文章 HTML。
 * @returns 按文档顺序提取的文章标题列表；无法解析 DOM 时为空数组。
 */
function extractArticleHeadingsFromHtml(contentHtml: string): BlogArticleHeading[] {
  const parser = (() => {
    if (typeof DOMParser === 'undefined') {
      return null
    }
    return new DOMParser()
  })()
  if (!parser) return []

  const document = parser.parseFromString(contentHtml, 'text/html')

  return Array.from(document.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6'))
    .map((heading, index) => ({
      id: heading.id || blogGeneratedHeadingId(index + 1),
      level: normalizeHeadingLevel(Number(heading.tagName.slice(1))),
      text: stripHtml(heading.textContent),
    }))
    .filter((heading) => heading.text)
}

/**
 * 把标题层级限制在 1 至 6，越界或无法转换时回退二级标题。
 * @param value - 待校验、转换或写入的原始值。
 * @returns 限制在 1 至 6 的标题层级；无效时为 2。
 */
function normalizeHeadingLevel(value: unknown): BlogArticleHeading['level'] {
  const level = Number(value)
  if (level >= 1 && level <= 6) return level as BlogArticleHeading['level']

  return 2
}

/**
 * 按文章的全部分类聚合计数，并用预置分类补齐说明与颜色。
 * @param articles - 待筛选、归档或建立关联的文章集合。
 * @returns 聚合文章数量并补齐说明与颜色的分类列表。
 */
function buildCategories(articles: BlogArticle[]): BlogCategory[] {
  const fallbackMap = new Map(fallbackCategories.map((category) => [category.slug, category]))
  const groups = new Map<string, BlogCategory>()

  articles.forEach((article) => {
    getArticleCategories(article).forEach((articleCategory) => {
      const existing = groups.get(articleCategory.slug)
      const fallback = fallbackMap.get(articleCategory.slug)

      groups.set(articleCategory.slug, {
        slug: articleCategory.slug,
        label: articleCategory.label,
        description: fallback?.description || `${articleCategory.label} 分类下的文章。`,
        color: fallback?.color || colorPool[groups.size % colorPool.length] || 'blue',
        count: (existing?.count || 0) + 1,
      })
    })
  })

  return Array.from(groups.values())
}

/**
 * 按接口顺序解码分类名称与 slug，并过滤任一字段为空的分类。
 * @param categoriesResolved - 接口已解析的文章分类；缺失时按空列表处理。
 * @returns 按接口顺序解码并过滤空字段的文章分类列表。
 */
function normalizeArticleCategories(
  categoriesResolved: WordpressPublicArticle['categoriesResolved'],
) {
  return (categoriesResolved || [])
    .map((category) => ({
      name: decodeHtml(category.name || ''),
      slug: decodeSlug(category.slug || ''),
    }))
    .filter((category) => category.name && category.slug)
}

/**
 * 按文章标签文本聚合出现次数，并优先复用预置 slug 与颜色，否则生成稳定兜底值。
 * @param articles - 待筛选、归档或建立关联的文章集合。
 * @returns 稳定兜底值。
 */
function buildTags(articles: BlogArticle[]): BlogTag[] {
  const fallbackMap = new Map(fallbackTags.map((tag) => [tag.label, tag]))
  const groups = new Map<string, BlogTag>()

  articles.forEach((article) => {
    article.tags.forEach((label) => {
      const existing = groups.get(label)
      const fallback = fallbackMap.get(label)

      groups.set(label, {
        slug: fallback?.slug || toSlug(label),
        label,
        color: fallback?.color || colorPool[groups.size % colorPool.length] || 'blue',
        count: (existing?.count || 0) + 1,
      })
    })
  })

  return Array.from(groups.values())
}

/**
 * 对字符串执行 HTML 实体解码；对 WordPress 文本对象选择 raw 或 rendered 字段并移除标签。
 * @param value - 待校验、转换或写入的原始值。
 * @returns 读取到的`RenderedText`。
 */
function getRenderedText(value: WordpressPublicArticle['title']) {
  if (typeof value === 'string') return decodeHtml(value)

  return stripHtml(value?.raw || value?.rendered)
}

/**
 * 格式化日期；返回精确到分钟的文章日期文本；缺失时为空字符串。
 * @param value - 待校验、转换或写入的原始值；省略时按 undefined 的缺省分支处理。
 * @returns 精确到分钟的文章日期文本；缺失时为空字符串。
 */
function formatDate(value?: string) {
  if (!value) return ''

  return value.replace('T', ' ').slice(0, 16)
}

/**
 * 先还原常用 HTML 实体，再移除注释与标签并折叠空白，得到可展示的纯文本。
 * @param value - 待校验、转换或写入的原始值；省略时按 undefined 的缺省分支处理。
 * @returns 规范化后的HTML。
 */
function stripHtml(value?: unknown) {
  return decodeHtml(`${value ?? ''}`)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 把文章文本中的常用引号、&、尖括号 HTML 实体还原为字符。
 * @param value - 待校验、转换或写入的原始值。
 * @returns 解析后的HTML。
 */
function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

/**
 * 解码文章 slug 中的 URL 转义，遇到非法编码时保留原文本。
 * @param value - 待校验、转换或写入的原始值。
 * @returns 解码后的文章 slug 中的 URL 转义，遇到非法编码时保留原文本。
 */
function decodeSlug(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * 裁剪并小写标签文本，再把连续空白替换为连字符以生成本地 slug。
 * @param value - 待校验、转换或写入的原始值。
 * @returns 裁剪后的并小写标签文本，再把连续空白替换为连字符以生成本地 slug。
 */
function toSlug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-')
}
