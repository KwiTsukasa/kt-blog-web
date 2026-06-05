import { computed, getCurrentInstance, onMounted, ref } from 'vue';

import {
  fetchBlogArticleDetail,
  fetchBlogArticleList,
  type WordpressPublicArticle,
} from '@/api/blogArticles';
import {
  articles as fallbackArticles,
  categories as fallbackCategories,
  tags as fallbackTags,
  type BlogArticle,
  type BlogCategory,
  type BlogTag,
} from '@/data/blog';

const coverPool = [
  '/argon/theme/img-2-1200x1000.jpg',
  '/argon/theme/img-1-1200x1000.jpg',
  '/argon/theme/landing.jpg',
  '/argon/theme/promo-1.png',
];
const defaultCover = coverPool[0] || '/argon/theme/img-2-1200x1000.jpg';
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
  const getArticlesByCategory = (slug: string) => {
    const normalizedSlug = decodeSlug(slug);

    return blogArticles.value.filter((article) => article.categorySlug === normalizedSlug);
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
          (article.categorySlug === source.categorySlug ||
            article.tags.some((tag) => source.tags.includes(tag))),
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
      const nextArticles = result.list.map(normalizeWordpressArticle);
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

function normalizeWordpressArticle(article: WordpressPublicArticle): BlogArticle {
  const category = article.categoriesResolved?.[0] || {
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
    category: decodeHtml(category.name || '未分类'),
    categorySlug: decodeSlug(category.slug || 'uncategorized'),
    comments: 0,
    content: contentText ? [contentText] : [],
    contentHtml,
    cover: article.cover || coverPool[article.id % coverPool.length] || defaultCover,
    date: formatDate(article.date || article.modified),
    excerpt,
    id: article.id,
    readTime: `${Math.max(1, Math.ceil(words / 500))} 分钟`,
    slug: decodeSlug(article.slug),
    tags,
    title: getRenderedText(article.title) || '未命名文章',
    views: 0,
    words,
  };
}

function buildCategories(articles: BlogArticle[]): BlogCategory[] {
  const fallbackMap = new Map(fallbackCategories.map((category) => [category.slug, category]));
  const groups = new Map<string, BlogCategory>();

  articles.forEach((article) => {
    const existing = groups.get(article.categorySlug);
    const fallback = fallbackMap.get(article.categorySlug);

    groups.set(article.categorySlug, {
      slug: article.categorySlug,
      label: article.category,
      description: fallback?.description || `${article.category} 分类下的文章。`,
      color: fallback?.color || colorPool[groups.size % colorPool.length] || 'blue',
      count: (existing?.count || 0) + 1,
    });
  });

  return Array.from(groups.values());
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
