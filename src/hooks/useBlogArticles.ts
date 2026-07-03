import { computed, getCurrentInstance, onMounted, ref } from 'vue';

import {
  fetchBlogArticleDetail,
  fetchBlogArticleList,
  type WordpressPublicArticle,
} from '@/api/blogArticles';
import {
  articles as fallbackArticles,
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
const blogArticles = ref<BlogArticle[]>(fallbackArticles);
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
  /**
   * @param slug Category slug from a local WordPress-equivalent term route.
   * @returns Articles that belong to the category, including secondary WordPress categories.
   */
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

/**
 * Loads the public WordPress article list and keeps the static capture when the API has no usable rows.
 *
 * The production Blog API can be reachable before WordPress article data is migrated. An empty successful
 * response is therefore treated as an unavailable content source so the Argon mirror keeps rendering the
 * captured WordPress article set instead of turning every route into an empty state.
 */
async function loadArticles() {
  if (loadedFromApi.value) return;
  if (loadPromise) return loadPromise;

  loading.value = true;
  loadPromise = fetchBlogArticleList()
    .then((result) => {
      const nextArticles = result.list.map(normalizeWordpressArticle);
      if (!nextArticles.length) {
        blogArticles.value = fallbackArticles;
        loadedFromApi.value = false;
        return;
      }
      blogArticles.value = nextArticles;
      loadedFromApi.value = true;
    })
    .catch(() => {
      blogArticles.value = fallbackArticles;
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
    return (
      cachedArticle ||
      fallbackArticles.find((article) => article.slug === normalizedSlug)
    );
  }
}

/**
 * @param article Public WordPress article DTO from KT API, including resolved terms when available.
 * @returns Local Blog article model with a primary category plus full WordPress category membership.
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
 * @param headings Optional heading outline supplied directly by the public API.
 * @param contentHtml Rendered WordPress HTML used as the source of truth when the API omits headings.
 * @returns Heading outline used only to decide whether Argon's article/sidebar catalog tab should be visible.
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
 * @param contentHtml Rendered WordPress article HTML returned by the public article API.
 * @returns Ordered h1-h6 headings parsed from the article body so post pages can expose the catalog tab.
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
 * @param value Heading level from API metadata or a parsed HTML tag name.
 * @returns Safe heading level constrained to the h1-h6 range accepted by the catalog model.
 */
function normalizeHeadingLevel(value: unknown): BlogArticleHeading['level'] {
  const level = Number(value);
  if (level >= 1 && level <= 6) return level as BlogArticleHeading['level'];

  return 2;
}

/**
 * @param articles Local article list whose WordPress category memberships should be counted.
 * @returns Category list with counts based on all article category terms, not only the primary term.
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
 * @param categoriesResolved WordPress category terms from the public article API.
 * @returns Non-empty decoded category candidates in the same order WordPress returned them.
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
