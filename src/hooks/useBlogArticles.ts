import { computed, getCurrentInstance, onMounted, ref } from 'vue';

import {
  fetchBlogArticleDetail,
  fetchBlogArticleList,
  type WordpressPublicArticle,
} from '@/api/blogArticles';
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
} from '@/data/blog';
import { PREVIOUS_BLOG_BACKGROUND_IMAGE, resolveBlogStaticAsset } from '@/data/blogStaticAssets';
import { blogGeneratedHeadingId } from '@/factories/blogDomFactory';

const defaultCover = PREVIOUS_BLOG_BACKGROUND_IMAGE;
const colorPool = ['blue', 'purple', 'green', 'orange', 'geekblue', 'cyan', 'volcano', 'magenta'];
const blogArticles = ref<BlogArticle[]>([]);
const loading = ref(false);
const loadedFromApi = ref(false);
let loadPromise: Promise<void> | null = null;

export function useBlogArticles() {
  const articles = computed(() => blogArticles.value);
  const categories = computed(() => buildCategories(blogArticles.value));
  const tags = computed(() => buildTags(blogArticles.value));

  if (getCurrentInstance()) {
    onMounted(() => {
      void loadArticles();
    });
  }

  const getArticleBySlug = (slug: string) => {
    const normalizedSlug = decodeSlug(slug);

    return blogArticles.value.find((article) => article.slug === normalizedSlug);
  };
  const getCategoryBySlug = (slug: string) => {
    const normalizedSlug = decodeSlug(slug);

    return categories.value.find((category) => category.slug === normalizedSlug);
  };
  const getTagBySlug = (slug: string) => {
    const normalizedSlug = decodeSlug(slug);

    return tags.value.find((tag) => tag.slug === normalizedSlug);
  };
  const getTagSlugByLabel = (label: string) =>
    tags.value.find((tag) => tag.label === label)?.slug || toSlug(label);
  const getArticlesByCategory = (slug: string) => {
    const normalizedSlug = decodeSlug(slug);

    return blogArticles.value.filter((article) => isArticleInCategory(article, normalizedSlug));
  };
  const getArticlesByTag = (slug: string) => {
    const tag = getTagBySlug(slug);
    if (!tag) return [];

    return blogArticles.value.filter((article) => article.tags.includes(tag.label));
  };
  const searchArticles = (keyword: string) => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return blogArticles.value;

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
        .toLowerCase();

      return haystack.includes(normalizedKeyword);
    });
  };
  const getRelatedArticles = (source: BlogArticle) =>
    blogArticles.value
      .filter(
        (article) =>
          article.id !== source.id &&
          (hasSharedCategory(article, source) || article.tags.some((tag) => source.tags.includes(tag))),
      )
      .slice(0, 3);

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
  };
}

async function loadArticles() {
  if (loadedFromApi.value) return;
  if (loadPromise) return loadPromise;

  loading.value = true;
  loadPromise = fetchBlogArticleList()
    .then((result) => {
      blogArticles.value = result.list.map(normalizeWordpressArticle);
      loadedFromApi.value = true;
    })
    .catch(() => {
      blogArticles.value = [];
      loadedFromApi.value = false;
    })
    .finally(() => {
      loading.value = false;
      loadPromise = null;
    });

  return loadPromise;
}

async function loadArticle(slug: string) {
  const normalizedSlug = decodeSlug(slug);

  await loadArticles();

  const cachedArticle = blogArticles.value.find(
    (article) => article.slug === normalizedSlug,
  );
  if (cachedArticle?.contentHtml) return cachedArticle;

  try {
    const article = normalizeWordpressArticle(
      await fetchBlogArticleDetail(normalizedSlug),
    );
    const currentIndex = blogArticles.value.findIndex((item) => item.slug === article.slug);
    if (currentIndex >= 0) {
      blogArticles.value = blogArticles.value.map((item, index) =>
        index === currentIndex ? article : item,
      );
    } else {
      blogArticles.value = [article, ...blogArticles.value];
    }

    return article;
  } catch {
    return cachedArticle;
  }
}

/**
 * @param article KT API 返回的公开文章 DTO，包含已解析的分类与标签。
 * @returns 本地 Blog 文章模型，保留主分类和完整分类成员关系。
 */
function normalizeWordpressArticle(article: WordpressPublicArticle): BlogArticle {
  const categories = normalizeArticleCategories(article.categoriesResolved);
  const category = categories[0] || {
    name: '未分类',
    slug: 'uncategorized',
  };
  const contentHtml =
    article.contentHtml ||
    (typeof article.content === 'object' ? article.content.rendered || article.content.raw : article.content) ||
    '';
  const contentText = stripHtml(contentHtml);
  const excerpt =
    article.excerptText ||
    stripHtml(typeof article.excerpt === 'object' ? article.excerpt.rendered : article.excerpt) ||
    contentText.slice(0, 120);
  const words = Math.max(contentText.replace(/\s+/g, '').length, excerpt.length);
  const tags = (article.tagsResolved || [])
    .map((tag) => decodeHtml(tag.name || ''))
    .filter(Boolean);

  return {
    author: article.authorName || 'KwiTsukasa',
    categories: categories.map((item) => ({
      label: decodeHtml(item.name || '未分类'),
      slug: decodeSlug(item.slug || 'uncategorized'),
    })),
    category: decodeHtml(category.name || '未分类'),
    categorySlug: decodeSlug(category.slug || 'uncategorized'),
    comments: 0,
    content: contentText ? [contentText] : [],
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
  };
}

/**
 * @param headings 公开接口可选返回的标题目录。
 * @param contentHtml 接口未返回目录时作为解析来源的 WordPress 兼容 HTML。
 * @returns 用于判断 Argon 文章目录标签是否显示的标题列表。
 */
function normalizeArticleHeadings(
  headings: WordpressPublicArticle['headings'],
  contentHtml: string,
): BlogArticleHeading[] {
  if (headings?.length) {
    return headings.map((heading, index) => ({
      id: heading.id || blogGeneratedHeadingId(index + 1),
      level: normalizeHeadingLevel(heading.level),
      text: stripHtml(heading.text),
    })).filter((heading) => heading.text);
  }

  return extractArticleHeadingsFromHtml(contentHtml);
}

/**
 * @param contentHtml 公开文章接口返回的 WordPress 兼容 HTML。
 * @returns 从正文中按顺序解析的 h1 到 h6 标题，供详情页目录使用。
 */
function extractArticleHeadingsFromHtml(contentHtml: string): BlogArticleHeading[] {
  const parser = typeof DOMParser === 'undefined' ? null : new DOMParser();
  if (!parser) return [];

  const document = parser.parseFromString(contentHtml, 'text/html');

  return Array.from(document.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6'))
    .map((heading, index) => ({
      id: heading.id || blogGeneratedHeadingId(index + 1),
      level: normalizeHeadingLevel(Number(heading.tagName.slice(1))),
      text: stripHtml(heading.textContent),
    }))
    .filter((heading) => heading.text);
}

/**
 * @param value 接口元数据或 HTML 标签名提供的标题层级。
 * @returns 限定在目录模型可接受 h1 到 h6 范围内的安全层级。
 */
function normalizeHeadingLevel(value: unknown): BlogArticleHeading['level'] {
  const level = Number(value);
  if (level >= 1 && level <= 6) return level as BlogArticleHeading['level'];

  return 2;
}

/**
 * @param articles 需要统计 WordPress 兼容分类成员关系的本地文章列表。
 * @returns 按文章全部分类而非仅主分类计算数量的分类列表。
 */
function buildCategories(articles: BlogArticle[]): BlogCategory[] {
  const fallbackMap = new Map(fallbackCategories.map((category) => [category.slug, category]));
  const groups = new Map<string, BlogCategory>();

  articles.forEach((article) => {
    getArticleCategories(article).forEach((articleCategory) => {
      const existing = groups.get(articleCategory.slug);
      const fallback = fallbackMap.get(articleCategory.slug);

      groups.set(articleCategory.slug, {
        slug: articleCategory.slug,
        label: articleCategory.label,
        description: fallback?.description || `${articleCategory.label} 分类下的文章。`,
        color: fallback?.color || colorPool[groups.size % colorPool.length] || 'blue',
        count: (existing?.count || 0) + 1,
      });
    });
  });

  return Array.from(groups.values());
}

/**
 * @param categoriesResolved 公开文章接口返回的 WordPress 兼容分类条目。
 * @returns 按接口原始顺序保留且完成解码的非空分类候选。
 */
function normalizeArticleCategories(categoriesResolved: WordpressPublicArticle['categoriesResolved']) {
  return (categoriesResolved || [])
    .map((category) => ({
      name: decodeHtml(category.name || ''),
      slug: decodeSlug(category.slug || ''),
    }))
    .filter((category) => category.name && category.slug);
}

function buildTags(articles: BlogArticle[]): BlogTag[] {
  const fallbackMap = new Map(fallbackTags.map((tag) => [tag.label, tag]));
  const groups = new Map<string, BlogTag>();

  articles.forEach((article) => {
    article.tags.forEach((label) => {
      const existing = groups.get(label);
      const fallback = fallbackMap.get(label);

      groups.set(label, {
        slug: fallback?.slug || toSlug(label),
        label,
        color: fallback?.color || colorPool[groups.size % colorPool.length] || 'blue',
        count: (existing?.count || 0) + 1,
      });
    });
  });

  return Array.from(groups.values());
}

function getRenderedText(value: WordpressPublicArticle['title']) {
  if (typeof value === 'string') return decodeHtml(value);

  return stripHtml(value?.raw || value?.rendered);
}

function formatDate(value?: string) {
  if (!value) return '';

  return value.replace('T', ' ').slice(0, 16);
}

function stripHtml(value?: unknown) {
  return decodeHtml(`${value ?? ''}`)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function decodeSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toSlug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}
