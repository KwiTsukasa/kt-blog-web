import mitt from 'mitt';

export type BlogTaxonomyModal = 'categories' | 'tags';

type BlogEventMap = {
  'blog:search:open': undefined;
  'blog:taxonomy:open': BlogTaxonomyModal;
};

const blogEventBus = mitt<BlogEventMap>();

/**
 * 返回博客搜索与分类标签弹窗共用的 mitt 事件总线。
 * @returns 博客搜索与分类标签弹窗共用的 mitt 事件总线。
 */
export function useBlogEventBus() {
  return blogEventBus;
}
